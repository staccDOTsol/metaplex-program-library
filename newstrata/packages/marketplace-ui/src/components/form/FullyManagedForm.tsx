import { NFT_STORAGE_API_KEY } from "../../constants";
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Image,
  Text,
  Switch,
  useRadioGroup,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import { NATIVE_MINT } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import { MarketplaceSdk } from "@strata-foundation/marketplace-sdk";
import {
  useCollective,
  useProvider,
  usePublicKey,
  useTokenMetadata,
} from "@strata-foundation/react";
import {
  ICurveConfig,
  TimeCurveConfig,
  TimeDecayExponentialCurveConfig,
} from "@strata-foundation/spl-token-bonding";
import {
  ITokenBondingSettings,
  SplTokenCollective,
} from "@strata-foundation/spl-token-collective";
import { useRouter } from "next/router";
import React from "react";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { useMarketplaceSdk } from "../..//contexts/marketplaceSdkContext";
import { route, routes } from "../../utils/routes";
import { FormControlWithError } from "./FormControlWithError";
import { MintSelect } from "./MintSelect";
import { IMetadataFormProps, TokenMetadataInputs } from "./TokenMetadataInputs";
import { Disclosures, disclosuresSchema, IDisclosures } from "./Disclosures";
import { RadioCardWithAffordance } from "./RadioCard";
import { RoyaltiesInputs } from "./RoyaltiesInputs";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { MdLabel } from "react-icons/md";
import { FanoutClient, MembershipModel } from "../../hydra";
import { getOrCreateAssociatedTokenAccount } from "../../hydra/spl-token/src";
import type { Wallet } from '@saberhq/solana-contrib'
import type { WalletContextState } from '@solana/wallet-adapter-react'

export const asWallet = (wallet: WalletContextState): Wallet => {
  return {
    signTransaction: wallet.signTransaction!,
    signAllTransactions: wallet.signAllTransactions!,
    publicKey: wallet.publicKey!,
  }
}

type CurveType = "aggressive" | "stable" | "utility";
interface IFullyManagedForm extends IMetadataFormProps {
  mint: string;
  mint2: string;
  symbol: string;
  price: string;
  curveType: CurveType;
  isSocial: boolean;
  startingPrice: number;
  isAntiBot: boolean;
  sellBaseRoyaltyPercentage: string;
  buyBaseRoyaltyPercentage: string;
  sellTargetRoyaltyPercentage: string;
  buyTargetRoyaltyPercentage: string;
  disclosures: IDisclosures;
}

const validationSchema = yup.object({
  mint: yup.string().required(),
  mint2: yup.string().required(),
  name: yup.string().required().min(2)
});

async function createFullyManaged(
  marketplaceSdk: MarketplaceSdk,
  values: IFullyManagedForm
): Promise<any> {
  const mint = new PublicKey(values.mint);
  const mint2 = new PublicKey(values.mint2);
  const tokenCollectiveSdk = marketplaceSdk.tokenCollectiveSdk;
  const tokenBondingSdk = tokenCollectiveSdk.splTokenBondingProgram;
  const authorityWallet = tokenBondingSdk.provider.wallet
  const connection = tokenBondingSdk.provider.connection
  const fanoutSdk = new FanoutClient(connection, (authorityWallet));

await fanoutSdk.initializeFanout({
    authority: authorityWallet,
    totalShares: 0,
    name: values.name,
    membershipModel: MembershipModel.Token,
    mint,
    randomMint: mint2
  },parseInt(values.price.toString()), 
  parseInt(values.sellBaseRoyaltyPercentage.toString()), 
    parseInt(values.sellTargetRoyaltyPercentage.toString()),  
      parseInt(values.buyBaseRoyaltyPercentage.toString()), 
        parseInt(values.buyTargetRoyaltyPercentage.toString()))


  return "hehe"
}

export const FullyManagedForm: React.FC = () => {
  const formProps = useForm<IFullyManagedForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = formProps;
  const { connected, publicKey } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const { awaitingApproval } = useProvider();
  const { execute, loading, error } = useAsyncCallback(createFullyManaged);
  const { marketplaceSdk } = useMarketplaceSdk();
  const router = useRouter();

  const onSubmit = async (values: IFullyManagedForm) => {
    const mintKey = await execute(marketplaceSdk!, values);
    console.log(mintKey)
    router.push(
      route(routes.sell)
    );
  };

  const { name = "", symbol = "", isSocial, mint, curveType } = watch();
  const mintKey = usePublicKey(mint);
  const { result: collectiveKey } = useAsync(
    async (mint: string | undefined) =>
      mint ? SplTokenCollective.collectiveKey(new PublicKey(mint)) : undefined,
    [mint]
  );
  const { info: collective } = useCollective(collectiveKey && collectiveKey[0]);
  const tokenBondingSettings = collective?.config
    .claimedTokenBondingSettings as ITokenBondingSettings | undefined;
  const {
    metadata: baseMetadata,
    error: baseMetadataError,
    loading: baseMetadataLoading,
  } = useTokenMetadata(mintKey);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "curveType",
    onChange: (option) => setValue("curveType", option as CurveType),
  });

  const group = getRootProps();

  const curveOptions = [
    {
      value: "aggressive",
      heading: "Aggressive",
      illustration: "/aggressive.svg",
      helpText:
        "A curve with high price sensitivity. The price raises quickly when people buy, and lowers quickly when they sell. This is best suited for speculative use cases.",
    },
    {
      value: "stable",
      heading: "Stable",
      illustration: "/stable.svg",
      helpText:
        "A curve with medium price sensitivity. This curve changes price at a constant rate, achieving a balance between aggressive and utility curves.",
    },
    {
      value: "utility",
      heading: "Utility",
      illustration: "/utility.svg",
      helpText:
        "A curve with a price sensitivity that starts high and lowers with purchases. This curve is best suited for utility use cases, as it rewards early adopters and scales the supply so that the token can be exchanged for goods/services.",
    },
  ];

  return (
    <Flex position="relative">
      {!connected && (
        <Flex
          position="absolute"
          w="full"
          h="full"
          zIndex="1"
          flexDirection="column"
        >
          <Flex justifyContent="center">
            <Button
              colorScheme="orange"
              variant="outline"
              onClick={() => setVisible(!visible)}
            >
              Connect Wallet
            </Button>
          </Flex>
          <Flex w="full" h="full" bg="white" opacity="0.6" />
        </Flex>
      )}
      <FormProvider {...formProps}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={8} mt={!connected ? 12 : 0}>
            <TokenMetadataInputs entityName="token" />
            <label  ><h1>Your Membership Mint</h1>people will stake this to yield from your whirliehydronka...</label>
            <MintSelect
                  value={watch("mint2")}
                  onChange={(s) => setValue("mint2", s)}
                />
                 <label  ><h1>Your Initial Quote</h1>people will trade this in your first orca whirlpool under your own config...</label>
            <MintSelect
                  value={watch("mint")}
                  onChange={(s) => setValue("mint", s)}
                />
                <label>Enter the four values for fees - in orca terms so 3000 is 3% - %on your whirliepools that exist for the membership mint and selected quote...</label>
                <label>1.</label> <Input type="text" 
                onChange={(s) => setValue("sellBaseRoyaltyPercentage", s.target.value)}></Input>
                <label>2.</label> <Input type="text" 
                onChange={(s) => setValue("buyBaseRoyaltyPercentage",  s.target.value)}></Input>
                <label>3.</label> <Input type="text" 
                onChange={(s) => setValue("sellTargetRoyaltyPercentage",  s.target.value)}></Input>
                <label>4.</label> <Input type="text" 
                onChange={(s) => setValue("buyTargetRoyaltyPercentage",  s.target.value)}></Input>
 <label>Market price in your membership token divided by quote - for e.g. sol/usdc at time of writing is $30 or so except do it in lamports cuz I cannot be bothered yet</label> <Input type="text" 
                onChange={(s) => setValue("price",  s.target.value)}></Input>

            {error && (
              <Alert status="error">
                <Alert status="error">{error.toString()}</Alert>
              </Alert>
            )}

            <Button
              type="submit"
              alignSelf="flex-end"
              colorScheme="primary"
              isLoading={isSubmitting || loading}
              loadingText={awaitingApproval ? "Awaiting Approval" : "Loading"}
            >
              Create Token
            </Button>
          </VStack>
        </form>
      </FormProvider>
    </Flex>
  );
};
