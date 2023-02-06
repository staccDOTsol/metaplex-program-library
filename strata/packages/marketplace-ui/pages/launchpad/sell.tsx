import React, { FC, useEffect, useState } from "react";
import '../../src/components/bufferFill';
import Image from "next/image";
import { useRouter } from "next/router";
import {
  Box,
  Flex,
  Stack,
  Text,
  useRadioGroup,
  useClipboard,
  HStack,
  VStack,
  Input,
  Button,
} from "@chakra-ui/react";
import { LaunchpadLayout } from "../../src/components/launchpad";
import { RadioCardWithAffordance } from "../../src/components/form/RadioCard";
import { route, routes } from "../../src/utils/routes";
import { useProvider, useStrataSdks } from "@strata-foundation/react";
import { Fanout, FanoutClient } from "../../src/hydra";
import { Wallet } from "@project-serum/anchor";
import { AccountFetcher, WhirlpoolData } from "@orca-so/whirlpools-sdk";
import { GetProgramAccountsConfig, PublicKey, Transaction } from "@solana/web3.js";

export enum SellTokenOption {
  PriceDiscovery = "PriceDiscovery",
  FixedPrice = "FixedPrice",
}

export const SellToken: FC = () => {
  const { tokenBondingSdk, loading } = useStrataSdks() 
  const router = useRouter();
  const { provider } = useProvider()
  const [staking, setStaking] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOption2, setSelectedOption2] = useState<string | null>(null);
  const mint = router.query["mint"] as string | undefined;
  const { hasCopied, onCopy } = useClipboard(mint || "");
  const [names, setNames] = useState<string[]>([])
  useEffect(() =>{
    console.log(selectedOption)
    console.log(138)
    let connection = provider?.connection 
      async function dabadoo(){
        if (connection && selectedOption){

      // @ts-ignore
    let fanoutSdk = new FanoutClient(connection, (provider.wallet));
    const fetcher = new AccountFetcher(connection);
  
      let fo = fanout ??  await fanoutSdk.fetch<Fanout>(new PublicKey(selectedOption as string), Fanout)
      if (fo){
      console.log(fo)
      let toptions = jaries 
      if (!fanout){
        setFanout2(new PublicKey(selectedOption as string))
        }
      setFanout(fo)
      
      let pool: WhirlpoolData | null = await fetcher.getPool(fo.whirlpool) as WhirlpoolData;
      console.log(pool)
        const pool2: WhirlpoolData| null = await fetcher.getPool(fo.whirlpool2);
        console.log(pool2)
        const pool3: WhirlpoolData| null = await fetcher.getPool(fo.whirlpool3);
        console.log(pool3)
        const pool4: WhirlpoolData| null = await fetcher.getPool(fo.whirlpool4);
        console.log(pool4)

        let liqs = 0;
      const pools = [pool, pool2, pool3, pool4]
      for (var p of pools){
        if (p != null){
        liqs+=p.liquidity.toNumber()
        }
      }
      if (!names.includes(fo.whirlpool.toBase58())){
        let tnames = names
        tnames.push(fo.whirlpool.toBase58())
        setNames(tnames)
      toptions.push({value: fo.whirlpool.toBase58(),
        heading: "Pool 1 liq: " +pool.liquidity.toNumber(),
        illustration: "/price-discovery.svg",
        helpText: fo.whirlpool2.toBase58()})
        toptions.push({value: fo.whirlpool2.toBase58(),
          // @ts-ignore
          heading: "Pool 2 liq: " + pool2.liquidity.toNumber(),
          illustration: "/price-discovery.svg",
          helpText: fo.whirlpool3.toBase58()})
          toptions.push({value: fo.whirlpool3.toBase58(),
            // @ts-ignore
            heading: "Pool 3! liq: " +pool3.liquidity.toNumber(),
            illustration: "/price-discovery.svg",
            helpText: fo.whirlpool4.toBase58()})
            toptions.push({value: fo.whirlpool4.toBase58(),
              // @ts-ignore
              heading: "Pool 4! liq: " + pool4.liquidity.toNumber(),
              illustration: "/price-discovery.svg",
              helpText: fo.whirlpool.toBase58()})
          console.log({value: SellTokenOption.PriceDiscovery,
            heading: fo.name,
            illustration: "/price-discovery.svg",
            helpText: liqs.toString() + ' liq on ' + pool.tokenMintA.toBase58().substring(0,3) +'...'+ pool.tokenMintA.toBase58().substring(pool.tokenMintA.toBase58().length-3,pool.tokenMintA.toBase58().length) 
            + ' / ' +  pool.tokenMintB.toBase58().substring(0,3) +'...'+ pool.tokenMintB.toBase58().substring(pool.tokenMintB.toBase58().length-3,pool.tokenMintB.toBase58().length) 
              })

              console.log(toptions)
      setJaries(toptions )
     await setGroup2(getRootProps2())
      if (selectedOption2){
console.log(selectedOption2)
  pool =    (await fetcher.getPool(new PublicKey(selectedOption2 as string)) as WhirlpoolData)
 setPool(new PublicKey(selectedOption2 as string))
 setJaries2( "Enter how much liquidity (in " + pool.tokenMintA.toBase58() + " to stake! Upon staking the progrma automagically rebalances the orca positions so that you're always earning the net-best yield you can!" )
      }
            }
          }
    
  }
  }
  dabadoo()
  }, [selectedOption])

  async function ooggaa(){
    let connection = provider?.connection 
    if (connection){
      // @ts-ignore
    let fanoutSdk = new FanoutClient(connection, (provider.wallet));
    let gpaconfig : GetProgramAccountsConfig = await Fanout.gpaBuilder().config
    let gpas = await connection?.getProgramAccounts(FanoutClient.ID,gpaconfig)
    const fetcher = new AccountFetcher(connection);
    for (var gpa of gpas){
      try {
      let fo = await fanoutSdk.fetch<Fanout>(new PublicKey(gpa.pubkey), Fanout)
      console.log(fo)
      let toptions = options 
      const pool: WhirlpoolData | null = await fetcher.getPool(fo.whirlpool) as WhirlpoolData;
      console.log(pool)
        const pool2: WhirlpoolData| null = await fetcher.getPool(fo.whirlpool2);
        console.log(pool2)
        const pool3: WhirlpoolData| null = await fetcher.getPool(fo.whirlpool3);
        console.log(pool3)
        const pool4: WhirlpoolData| null = await fetcher.getPool(fo.whirlpool4);
        console.log(pool4)

        let liqs = 0;
      const pools = [pool, pool2, pool3, pool4]
      for (var p of pools){
        if (p != null){
        liqs+=p.liquidity.toNumber()
        }
      }
      if (!names.includes(fo.name)){
        let tnames = names
        tnames.push(fo.name)
        setNames(tnames)
        toptions.push({value: gpa.pubkey.toBase58(),
          heading: fo.name,
          illustration: "/price-discovery.svg",
          helpText: liqs.toString() + ' liq on ' + pool.tokenMintA.toBase58().substring(0,3) +'...'+ pool.tokenMintA.toBase58().substring(pool.tokenMintA.toBase58().length-3,pool.tokenMintA.toBase58().length) 
          + ' / ' +  pool.tokenMintB.toBase58().substring(0,3) +'...'+ pool.tokenMintB.toBase58().substring(pool.tokenMintB.toBase58().length-3,pool.tokenMintB.toBase58().length) 
          
           })
          console.log({value: SellTokenOption.PriceDiscovery,
            heading: fo.name,
            illustration: "/price-discovery.svg",
            helpText: liqs.toString() + ' liq on ' + pool.tokenMintA.toBase58().substring(0,3) +'...'+ pool.tokenMintA.toBase58().substring(pool.tokenMintA.toBase58().length-3,pool.tokenMintA.toBase58().length) 
            + ' / ' +  pool.tokenMintB.toBase58().substring(0,3) +'...'+ pool.tokenMintB.toBase58().substring(pool.tokenMintB.toBase58().length-3,pool.tokenMintB.toBase58().length) 
              })
              console.log(toptions)
      setOptions(toptions )
      setGroup(getRootProps())
    }
      } catch (err){
        console.log(err)
      }
    }
  }
  }
  if (!loading && tokenBondingSdk){
    ooggaa()
  }
  const [pool, setPool] = useState<PublicKey>()
  const [fanout2, setFanout2] = useState<PublicKey>()
  const [fanout, setFanout] = useState<Fanout>()
  const [jaries2, setJaries2] = useState<string>()
  // @ts-ignore
  const [jaries, setJaries] = useState<any[]>([ /*
*/
])
  // @ts-ignore
  const [options, setOptions] = useState<any[]>([ /*
    {
      value: SellTokenOption.PriceDiscovery,
      heading: "Price Discovery",
      illustration: "/price-discovery.svg",
      helpText:
        "Set a price range and let demand dictate the price. This helps to avoid bots.",
    },
    {
      value: SellTokenOption.FixedPrice,
      heading: "Fixed Price",
      illustration: "/fixed-price.svg",
      helpText: "Sell this token for a predetermined price.",
    }, */
  ]);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "options",
    onChange: setSelectedOption,
  });

  const [group, setGroup] = useState<any>(getRootProps());

  const { getRootProps: getRootProps2, getRadioProps: getRadioProps2 } = useRadioGroup({
    name: "jaries",
    onChange: setSelectedOption2,
  });

  const [group2, setGroup2] = useState<any>(getRootProps2());

console.log(group)
  const handleOnNext = async () => {
    if (selectedOption === SellTokenOption.PriceDiscovery)
      router.push(route(routes.newLbc, { mint }), undefined, { shallow: true });

    if (selectedOption === SellTokenOption.FixedPrice)
      router.push(route(routes.newFixedPrice, { mint }), undefined, {
        shallow: true,
      });
  };

  return (
    <LaunchpadLayout
      heading="Just look at 'em?"
      subHeading="Please select one below:"
      backVisible
      nextDisabled={true}
      onNext={handleOnNext}
    >
      <>
        {mint && (
          <Flex w="full" justifyContent="center">
            <Box
              bg="white"
              position="relative"
              rounded="lg"
              borderWidth="1px"
              borderColor="white"
              _hover={{ borderColor: "orange.500" }}
              py={4}
              px={2}
              w="100%"
              maxW="492px"
              onClick={onCopy}
              cursor="pointer"
            >
              <Stack direction="row" spacing={6}>
                <Image
                  src="/sell-token-now.svg"
                  height="60px"
                  width="100%"
                  alt="Token Created"
                />
                <Stack flexGrow={1} spacing={0}>
                  <Text fontWeight="bold" fontSize="sm">
                    Token Succesfully Created!
                  </Text>
                  <Text color="gray.500" fontSize="xs">
                    If you would like to launch this token at a future date,
                    please take note of the mint address.
                  </Text>
                  <Text color="gray.500" fontSize="xs" pt={2}>
                    Check your wallet for the token. In wallets that don’t
                    support the Metaplex metadata standard v2, it may show in
                    collectibles.
                  </Text>
                  <Stack spacing={0} pt={2}>
                    <Text fontWeight="semibold" fontSize="xs">
                      Mint Address:
                      {hasCopied && (
                        <>
                          {" "}
                          <Text as="span" color="orange.500">
                            (Copied)
                          </Text>{" "}
                        </>
                      )}
                      <Text color="gray.500">{mint}</Text>
                    </Text>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Flex>
        )}
        {options.length > 0  && 
        <Stack
          {...group}
          direction={{ base: "column", md: "row" }}
          justifyContent="center"
          alignItems={{ base: "center", md: "normal" }}
        >
          {options.length > 0 && options.map(({ value, heading, illustration, helpText }) => {
            console.log(options)
            const radio = getRadioProps({ value });

            return (
              <RadioCardWithAffordance
                key={value}
                helpText={helpText}
                {...radio}
              >
                <Flex
                  h="full"
                  direction={{ base: "row", md: "column" }}
                  textAlign={{ base: "left", md: "center" }}
                >
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    flexShrink={0}
                  >
                    <Image
                      src={illustration}
                      alt={`${value}-illustration`}
                      height="70px"
                      width="100%"
                    />
                  </Flex>
                  <Flex
                    flexGrow={1}
                    h="full"
                    direction="column"
                    alignItems={{ base: "start", md: "center" }}
                    justifyContent={{ base: "center", md: "initial" }}
                  >
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      pt={{ base: 0, md: 4 }}
                    >
                      {heading}
                    </Text>
                    <Flex
                      w="full"
                      flexGrow={{ base: 0, md: 1 }}
                      alignItems={{ base: "start", md: "center" }}
                    >
                      <Text fontSize="xs" color="gray.500">
                        {helpText}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </RadioCardWithAffordance>
            );
          })}
        </Stack>}
      
        <HStack
>
          {jaries.map(({ value, heading, illustration, helpText }) => {
            console.log(jaries)
            const radio = getRadioProps({ value });

            return (
              <RadioCardWithAffordance
                key={value}
                helpText={helpText}
                {...radio}
              >
                <Flex
                  h="full"
                  direction={{ base: "row", md: "column" }}
                  textAlign={{ base: "left", md: "center" }}
                >
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    flexShrink={0}
                  >
                   
                  </Flex>
                  <Flex
                    flexGrow={1}
                    h="full"
                    direction="column"
                    alignItems={{ base: "start", md: "center" }}
                    justifyContent={{ base: "center", md: "initial" }}
                  >
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      pt={{ base: 0, md: 4 }}
                    >
                      {heading }
                    </Text>
                    <Flex
                      w="full"
                      flexGrow={{ base: 0, md: 1 }}
                      alignItems={{ base: "start", md: "center" }}
                    >
                      <Text fontSize="xs" color="gray.500">
                        {helpText.substring(0,3) +'...'+ helpText.substring(helpText.length-3,helpText.length)}
                      </Text>
                    </Flex>
                  </Flex>

        <Flex
                  h="full"
                  direction={{ base: "row", md: "column" }}
                  textAlign={{ base: "left", md: "center" }}
                >
                  
                  <Flex
                    flexGrow={1}
                    h="full"
                    direction="column"
                    alignItems={{ base: "start", md: "center" }}
                    justifyContent={{ base: "center", md: "initial" }}
                  >
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      pt={{ base: 0, md: 4 }}
                    >
                      {selectedOption2 } .. in lamports for now cuz I cannot be bothered
                    </Text>
                    <Input onChange={(s)=>setStaking(parseInt(s.target.value))} type="text"></Input>
                    <Button                 onClick={ async function (e){

    // @ts-ignore
    setPool(new PublicKey(e.target.innerText))
   let connection = provider?.connection 
   console.log(fanout)
   console.log(pool)
   if (provider && fanout && pool){

    // @ts-ignore
  let fanoutSdk = new FanoutClient(connection, (provider.wallet));
   
    let ouah = await fanoutSdk.stakeTokenMember({
      shares: staking as number,
      fanout: fanout2 as PublicKey,
      membershipMint: fanout.membershipMint as PublicKey,
      member: provider.wallet.publicKey,
      payer: provider.wallet.publicKey,
      payerKey: provider.wallet,
      membershipMintTokenAccount: (await fanoutSdk.connection.getTokenAccountsByOwner(provider.wallet.publicKey, {mint:  fanout.membershipMint as PublicKey})).value[0].pubkey,
      // @ts-ignore
    }, pool);
    

  }
}} style={{fontSize:"0px"}}>{value}</Button>
                    </Flex></Flex>
                </Flex>
              </RadioCardWithAffordance>
            );
          })}
        </HStack>
      </>
    </LaunchpadLayout>
  );
};

export default SellToken;
