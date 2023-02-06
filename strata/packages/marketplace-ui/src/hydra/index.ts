

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Decimal } from 'decimal.js'
import { AccountFetcher, ORCA_WHIRLPOOL_PROGRAM_ID,
  PDAUtil,
  TickArrayUtil,
  TickUtil,
  toTx,
  WhirlpoolContext,
  WhirlpoolData,
  WhirlpoolIx} from '@orca-so/whirlpools-sdk'
  import {Instruction, MathUtil}from '@orca-so/common-sdk'
  import { PriceMath } from '@orca-so/whirlpools-sdk';
  import  { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress }  from './spl-token/token0.2.0'
import { AnchorProvider, BorshAccountsCoder } from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  AccountInfo,
  Connection,
  Finality,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  Signer,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
} from '@solana/web3.js';
import { ProgramError } from './systemErrors';
import {
  createProcessDistributeTokenInstruction,
  createProcessInitForMintInstruction,
  createProcessInitInstruction,
  createProcessSetForTokenMemberStakeInstruction,
  createProcessSetTokenMemberStakeInstruction,
  createOpenPositionInstruction,
  createIncreaseLiquidityInstruction,
  createProcessSignMetadataInstruction,
  createProcessTransferSharesInstruction,
  createProcessUnstakeInstruction,
} from './generated/instructions';
import { MembershipModel } from './generated/types';
import { Fanout } from './generated/accounts';
import { Key, PROGRAM_ADDRESS as TM_PROGRAM_ADDRESS } from '@metaplex-foundation/mpl-token-metadata';
import bs58 from 'bs58';
import { chunks } from './utils';
import { createAssociatedTokenAccount, createMint, Mint, createAccount } from '../token0.2.0';
import { getTokenAccount, NodeWallet } from '@project-serum/common';
import { ASSOCIATED_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { deriveAssociatedTokenAddress } from '@orca-so/sdk';
export * from './generated/types';
export * from './generated/accounts';
export * from './generated/errors';
const whirlpoolsConfigKeypair = Keypair.generate()
let ORCA_WHIRLPOOLS_CONFIG = whirlpoolsConfigKeypair.publicKey
interface InitializeFanoutArgs {
  authority: Wallet;
  name: string;
  membershipModel: MembershipModel;
  totalShares: number;
  mint?: PublicKey;
  randomMint?: PublicKey
}

interface InitializeFanoutForMintArgs {
  fanout: PublicKey;
  mint: PublicKey;
  mintTokenAccount?: PublicKey;
  membershipMint?: PublicKey
}

interface AddMemberArgs {
  shares: number;
  fanout: PublicKey;
  fanoutNativeAccount?: PublicKey;
  membershipKey: PublicKey;
}

interface StakeMemberArgs {
  payerKey: Wallet;
  shares: number;
  fanout: PublicKey;
  fanoutAuthority?: PublicKey;
  membershipMint?: PublicKey;
  membershipMintTokenAccount?: PublicKey;
  fanoutNativeAccount?: PublicKey;
  member: PublicKey;
  payer: PublicKey;
}

interface SignMetadataArgs {
  fanout: PublicKey;
  authority?: PublicKey;
  holdingAccount?: PublicKey;
  metadata: PublicKey;
}

interface UnstakeMemberArgs {
  fanout: PublicKey;
  membershipMint?: PublicKey;
  membershipMintTokenAccount?: PublicKey;
  fanoutNativeAccount?: PublicKey;
  member: PublicKey;
  payer: PublicKey;
}

interface DistributeMemberArgs {
  distributeForMint: boolean;
  member: PublicKey;
  membershipKey?: PublicKey;
  fanout: PublicKey;
  fanoutMint?: PublicKey;
  payer: PublicKey;
}

interface DistributeTokenMemberArgs {
  distributeForMint: boolean;
  member: PublicKey;
  membershipMint: PublicKey;
  fanout: PublicKey;
  fanoutMint?: PublicKey;
  membershipMintTokenAccount?: PublicKey;
  payer: PublicKey;
}

interface DistributeClockTokenMemberArgs {
  distributeForMint: boolean;
  hydra: PublicKey;
  member: PublicKey;
  membershipMint: PublicKey;
  fanout: PublicKey;
  fanoutMint?: PublicKey;
  membershipMintTokenAccount?: PublicKey;
  payer: PublicKey;
}

interface DistributeAllArgs {
  fanout: PublicKey;
  mint: PublicKey;
  payer: PublicKey;
}

interface TransferSharesArgs {
  fanout: PublicKey;
  fromMember: PublicKey;
  toMember: PublicKey;
  shares: number;
}

interface RemoveMemberArgs {
  fanout: PublicKey;
  member: PublicKey;
  destination: PublicKey;
}

const MPL_TM_BUF = new PublicKey(TM_PROGRAM_ADDRESS).toBuffer();
const MPL_TM_PREFIX = 'metadata';

export interface TransactionResult {
  RpcResponseAndContext: RpcResponseAndContext<SignatureResult>;
  TransactionSignature: TransactionSignature;
}

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;

  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;

  publicKey: PublicKey;
}

export class FanoutClient {
  connection: Connection;
  wallet: Wallet;

  static ID = new PublicKey('5G76ijPLinxx8tZai4hYkhoBkb2QidrX9BuJiEpuJhs7');

  static async init(connection: Connection, wallet: Wallet): Promise<FanoutClient> {
    return new FanoutClient(connection, wallet);
  }

  constructor(connection: Connection, wallet: Wallet) {
    this.connection = connection;
    this.wallet = wallet;
  }

  async fetch<T>(key: PublicKey, type: any): Promise<T> {
    const a = await this.connection.getAccountInfo(key);
    return type.fromAccountInfo(a)[0] as T;
  }

  async getAccountInfo(key: PublicKey): Promise<AccountInfo<Buffer>> {
    const a = await this.connection.getAccountInfo(key);
    if (!a) {
      throw Error('Account not found');
    }
    return a;
  }

  async getMembers({ fanout }: { fanout: PublicKey }): Promise<PublicKey[]> {
    const name = 'fanoutMembershipVoucher';
    const descriminator = BorshAccountsCoder.accountDiscriminator(name);
    const filters = [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(Buffer.concat([descriminator, fanout.toBuffer()])),
        },
      },
    ];
    const members = await this.connection.getProgramAccounts(FanoutClient.ID, {
      // Get the membership key
      dataSlice: {
        length: 32,
        offset: 8 + 32 + 8 + 8 + 1,
      },
      filters,
    });

    return members.map((mem) => new PublicKey(mem.account.data));
  }

  async executeBig<Output>(
    command: Promise<any>,
    payer: PublicKey = this.wallet.publicKey,
    finality?: Finality,
  ): Promise<Output> {
    const { instructions, signers, output } = await command;
    if (instructions.length > 0) {
      // @ts-ignore
      await sendMultipleInstructions(
        new Map(),
        new AnchorProvider(this.connection, this.wallet, {}),
        instructions,
        signers,
        payer || this.wallet.publicKey,
        finality,
      );
    }
    return output;
  }

  async sendInstructions(
    instructions: TransactionInstruction[],
    signers: Signer[],
    payer?: PublicKey,
  ): Promise<TransactionResult> {
    let tx = new Transaction();
    tx.feePayer = payer || this.wallet.publicKey;
    tx.add(...instructions);
    tx.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
    console.log(signers)
    if (signers?.length > 0) {
      await tx.sign(...signers);
 tx = await this.wallet.signTransaction(tx);
    } else {
      console.log(...tx.instructions)
      tx = await this.wallet.signTransaction(tx);
    }
    try {
      const sig = await this.connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: true,
      });
      return {
        RpcResponseAndContext: await this.connection.confirmTransaction(
          sig,
          this.connection.commitment,
        ),
        TransactionSignature: sig,
      };
    } catch (e) {
      const wrappedE = ProgramError.parse(e);
      throw wrappedE == null ? e : wrappedE;
    }
  }

  private async throwingSend(
    instructions: TransactionInstruction[],
    signers: Signer[],
    payer?: PublicKey,
  ): Promise<TransactionResult> {
    const res = await this.sendInstructions(instructions, signers, payer || this.wallet.publicKey);
    if (res.RpcResponseAndContext.value.err != null) {
      console.log(await this.connection.getConfirmedTransaction(res.TransactionSignature));
      throw new Error(JSON.stringify(res.RpcResponseAndContext.value.err));
    }
    return res;
  }

  static async fanoutKey(
    name: string,
    programId: PublicKey = FanoutClient.ID,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('fanout-config'), Buffer.from(name)],
      programId,
    );
  }

  static async fanoutForMintKey(
    fanout: PublicKey,
    mint: PublicKey,
    programId: PublicKey = FanoutClient.ID,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('fanout-config'), fanout.toBuffer(), mint.toBuffer()],
      programId,
    );
  }

  static async membershipVoucher(
    fanout: PublicKey,
    membershipKey: PublicKey,
    programId: PublicKey = FanoutClient.ID,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('fanout-membership'), fanout.toBytes(), membershipKey.toBytes()],
      programId,
    );
  }

  static async mintMembershipVoucher(
    fanoutForMintConfig: PublicKey,
    membershipKey: PublicKey,
    fanoutMint: PublicKey,
    programId: PublicKey = FanoutClient.ID,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [
        Buffer.from('fanout-membership'),
        fanoutForMintConfig.toBuffer(),
        membershipKey.toBuffer(),
        fanoutMint.toBuffer(),
      ],
      programId,
    );
  }

  static async freezeAuthority(
    mint: PublicKey,
    programId: PublicKey = FanoutClient.ID,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('freeze-authority'), mint.toBuffer()],
      programId,
    );
  }

  static async nativeAccount(
    fanoutAccountKey: PublicKey,
    programId: PublicKey = FanoutClient.ID,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('fanout-native-account'), fanoutAccountKey.toBuffer()],
      programId,
    );
  }

  async initializeFanoutInstructions(
    opts: InitializeFanoutArgs, price: number, fee1: number, fee2: number, fee3: number, fee4: number
  ): Promise<any> {
    const [fanoutConfig, fanoutConfigBumpSeed] = await FanoutClient.fanoutKey(opts.name);
    const [holdingAccount, holdingAccountBumpSeed] = await FanoutClient.nativeAccount(fanoutConfig);
    
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    let membershipMint = NATIVE_MINT;
    if (opts.membershipModel == MembershipModel.Token) {
      if (!opts.randomMint) {
        throw new Error('Missing mint account for token based membership model');
      }
      membershipMint = opts.randomMint;
    }
    console.log(fanoutConfig)

    const tokenAccountForMint =
    (await getAssociatedTokenAddress(
      opts.randomMint,
      fanoutConfig,true
    ));


    const provider = new AnchorProvider(this.connection, this.wallet, {})
    // @ts-ignore
    const ctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);
  instructions.push(
    createAssociatedTokenAccountInstruction(
       this.wallet.publicKey,
          tokenAccountForMint,
          fanoutConfig,opts.mint
    ),
  )
    const whirlpoolBumps = {
      whirlpoolBump: 255// whirlpoolPda.bump,
    };
    console.log(123)
    
    const whirlpool = Keypair.generate()
    
    const whirlpoolPda = PDAUtil.getWhirlpool  (
      ORCA_WHIRLPOOL_PROGRAM_ID,
      ORCA_WHIRLPOOLS_CONFIG,
      opts.mint,
      opts.randomMint,
      8
    );
    
    
    const feeTierKey = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID,
      ORCA_WHIRLPOOLS_CONFIG, 8).publicKey;
      const feeTierPda = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID,
        ORCA_WHIRLPOOLS_CONFIG, 8);
console.log(123)
let authorityWallet = Keypair.generate();
//let signature = await this.connection.requestAirdrop(authorityWallet.publicKey, LAMPORTS_PER_SOL);
//await this.connection.confirmTransaction(signature);
const tokenVaultA = Keypair.generate()
console.log(123)

const tokenVaultB = Keypair.generate()
console.log(feeTierKey.toBase58())
console.log(whirlpool.publicKey.toBase58())
console.log(123)
console.log(price)
// Current SOL/USDC price
const desiredMarketPrice = new Decimal(price);
console.log(desiredMarketPrice)
// Invert due to token mint ordering
const actualPrice = new Decimal(1).div(desiredMarketPrice);
// Shift by 64 bits
const initSqrtPrice = MathUtil.toX64(actualPrice); 

const tokenVaultAKeypair = Keypair.generate();
const tokenVaultBKeypair = Keypair.generate();

console.log(this.wallet.publicKey.toBase58())
console.log(321)

try {
let ix3 = (await WhirlpoolIx.initializeConfigIx(ctx.program, {
  whirlpoolsConfigKeypair,
  feeAuthority: this.wallet.publicKey,
  collectProtocolFeesAuthority:this.wallet.publicKey,
  rewardEmissionsSuperAuthority:this.wallet.publicKey,
  defaultProtocolFeeRate: 138,
  funder:this.wallet.publicKey}))
  instructions.push(...ix3.instructions)
  signers.push(...ix3.signers)
} catch (err){

}
console.log(321)
try {
let ix2 = (await WhirlpoolIx.initializeFeeTierIx(ctx.program, {
  whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
  feeTierPda: feeTierPda,
  tickSpacing: 8,
  defaultFeeRate: fee1,
  feeAuthority: this.wallet.publicKey,
  funder: this.wallet.publicKey}))

  instructions.push(...ix2.instructions)
  signers.push(...ix2.signers)
} catch (err){
  
}
console.log(321)
let ix = (await WhirlpoolIx.initializePoolIx(ctx.program, {
  initSqrtPrice,
  tickSpacing: 8, 
  tokenMintA:opts.mint,
  tokenMintB: opts.randomMint,
  tokenVaultAKeypair,
  tokenVaultBKeypair,
  whirlpoolPda,
  whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
  feeTierKey: feeTierKey,
  funder: this.wallet.publicKey,
}))
instructions.push(...ix.instructions)
signers.push(...ix.signers)
console.log(321)
console.log(321)
console.log(1233)
const fetcher = new AccountFetcher(this.connection);
let whirlpools: any = []
let fees = [fee2, fee3, fee4]
for (var abc123 = 4 ; abc123 <= 6; abc123++){

const whirlpool = Keypair.generate()
const whirlpoolPda = PDAUtil.getWhirlpool  (
  ORCA_WHIRLPOOL_PROGRAM_ID,
  ORCA_WHIRLPOOLS_CONFIG,
  opts.mint,
  opts.randomMint,
  2 ** abc123
);
whirlpools.push(whirlpoolPda.publicKey)


const feeTierKey = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID,
  ORCA_WHIRLPOOLS_CONFIG, 
  2 ** abc123).publicKey;
  const feeTierPda = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID,
    ORCA_WHIRLPOOLS_CONFIG, 
    2 ** abc123);
console.log(123)
let authorityWallet = Keypair.generate();
//let signature = await this.connection.requestAirdrop(authorityWallet.publicKey, LAMPORTS_PER_SOL);
//await this.connection.confirmTransaction(signature);
const tokenVaultA = Keypair.generate()
console.log(123)

const tokenVaultB = Keypair.generate()
console.log(feeTierKey.toBase58())
console.log(whirlpool.publicKey.toBase58())
console.log(123)

// Current SOL/USDC price
const desiredMarketPrice = new Decimal(price);
// Invert due to token mint ordering
const actualPrice = new Decimal(1).div(desiredMarketPrice);
// Shift by 64 bits
const initSqrtPrice = MathUtil.toX64(actualPrice); 

const tokenVaultAKeypair = Keypair.generate();
const tokenVaultBKeypair = Keypair.generate();
try {
let ix2 = (await WhirlpoolIx.initializeFeeTierIx(ctx.program, {
  whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
  feeTierPda: feeTierPda,
  tickSpacing: 
  2 ** abc123,
  defaultFeeRate: fees[abc123-4],
  feeAuthority: this.wallet.publicKey,
  funder: this.wallet.publicKey}))

  instructions.push(...ix2.instructions)
  signers.push(...ix2.signers)
} catch (err){
  
}
let ix = (await WhirlpoolIx.initializePoolIx(ctx.program, {
  initSqrtPrice,
  tickSpacing: 
  2 ** abc123,
  tokenMintA:opts.mint,
  tokenMintB: opts.randomMint,
  tokenVaultAKeypair,
  tokenVaultBKeypair,
  whirlpoolPda,
  whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
  feeTierKey: feeTierKey,
  funder: this.wallet.publicKey,
}))

instructions.push(...ix.instructions)
signers.push(...ix.signers)
}
console.log(opts.mint.toBase58())
console.log(opts.mint.toBase58())
console.log(opts.mint.toBase58())
console.log(opts.mint.toBase58())
console.log(opts)
console.log(membershipMint.toBase58())

    instructions.push(
      createProcessInitInstruction(
        {
          mintHoldingAccount:tokenAccountForMint,
            authority: this.wallet.publicKey,
            fanout: fanoutConfig,
            holdingAccount: holdingAccount,
            membershipMint: membershipMint
        },
        {
          args: {
            bumpSeed: fanoutConfigBumpSeed,
            nativeAccountBumpSeed: holdingAccountBumpSeed,
            totalShares: opts.totalShares,
            name: opts.name
          },
          model: opts.membershipModel,
          whirlpool: whirlpoolPda.publicKey,
          whirlpool2: whirlpools[0],
          whirlpool3:  whirlpools[1],
          whirlpool4: whirlpools[2]
        },
      )
    );
    console.log(123)
    console.log(333)
    console.log(...signers)
    return {
      output: {
        fanout: fanoutConfig,
        nativeAccount: holdingAccount,
      },
      instructions,
      signers,
    };
  }

  async initializeFanoutForMintInstructions(
    opts: InitializeFanoutForMintArgs, price: number, fee1: number, fee2: number, fee3: number, fee4: number
  ): Promise<any> {
    const [fanoutMintConfig, fanoutConfigBumpSeed] = await FanoutClient.fanoutForMintKey(
      opts.fanout,
      opts.mint,
    );
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    const tokenAccountForMint =
      opts.mintTokenAccount ||
      (await getAssociatedTokenAddress(
        opts.mint,
        opts.fanout,true
      ));


      const provider = new AnchorProvider(this.connection, this.wallet, {})
      // @ts-ignore
      const ctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);
    instructions.push(
      createAssociatedTokenAccountInstruction(
         this.wallet.publicKey,
            tokenAccountForMint,
            opts.fanout,opts.mint
      ),
    );

    const whirlpoolBumps = {
      whirlpoolBump: 255// whirlpoolPda.bump,
    };
    console.log(123)
    console.log(ORCA_WHIRLPOOL_PROGRAM_ID,
      ORCA_WHIRLPOOLS_CONFIG,
      opts.membershipMint,
      opts.mint,
      8)
    const whirlpool = Keypair.generate()
    const whirlpoolPda = PDAUtil.getWhirlpool  (
      ORCA_WHIRLPOOL_PROGRAM_ID,
      ORCA_WHIRLPOOLS_CONFIG,
      opts.membershipMint,
      opts.mint,
      8
    );
    
    
    const feeTierKey = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID,
      ORCA_WHIRLPOOLS_CONFIG, 8).publicKey;
      const feeTierPda = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID,
        ORCA_WHIRLPOOLS_CONFIG, 8);
console.log(123)
let authorityWallet = Keypair.generate();
//let signature = await this.connection.requestAirdrop(authorityWallet.publicKey, LAMPORTS_PER_SOL);
//await this.connection.confirmTransaction(signature);
const tokenVaultA = Keypair.generate()
console.log(123)

const tokenVaultB = Keypair.generate()
console.log(feeTierKey.toBase58())
console.log(whirlpool.publicKey.toBase58())
console.log(123)

// Current SOL/USDC price
const desiredMarketPrice = new Decimal(price);
// Invert due to token mint ordering
const actualPrice = new Decimal(1).div(desiredMarketPrice);
// Shift by 64 bits
const initSqrtPrice = MathUtil.toX64(actualPrice); 

const tokenVaultAKeypair = Keypair.generate();
const tokenVaultBKeypair = Keypair.generate();
console.log(this.wallet.publicKey.toBase58())

let ix = (await WhirlpoolIx.initializePoolIx(ctx.program, {
  initSqrtPrice,
  tickSpacing: 8,
  tokenMintA:opts.membershipMint,
  tokenMintB: opts.mint,
  tokenVaultAKeypair,
  tokenVaultBKeypair,
  whirlpoolPda,
  whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
  feeTierKey: feeTierKey,
  funder: this.wallet.publicKey,
}))
instructions.push(...ix.instructions)
signers.push(...ix.signers)
const fetcher = new AccountFetcher(this.connection);
let whirlpools: any = []
 
let fees: any = [fee2, fee3, fee4]
for (var abc123 = 4 ; abc123 <= 6; abc123++){

const whirlpool = Keypair.generate()
const whirlpoolPda = PDAUtil.getWhirlpool  (
  ORCA_WHIRLPOOL_PROGRAM_ID,
  ORCA_WHIRLPOOLS_CONFIG,
  opts.membershipMint,
  opts.mint,
  2 ** abc123
);
whirlpools.push(whirlpoolPda.publicKey)


const feeTierKey = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID,
  ORCA_WHIRLPOOLS_CONFIG, 
  2 ** abc123).publicKey;
  const feeTierPda = PDAUtil.getFeeTier(ORCA_WHIRLPOOL_PROGRAM_ID,
    ORCA_WHIRLPOOLS_CONFIG, 
    2 ** abc123);
console.log(123)
let authorityWallet = Keypair.generate();
//let signature = await this.connection.requestAirdrop(authorityWallet.publicKey, LAMPORTS_PER_SOL);
//await this.connection.confirmTransaction(signature);
const tokenVaultA = Keypair.generate()
console.log(123)

const tokenVaultB = Keypair.generate()
console.log(feeTierKey.toBase58())
console.log(whirlpool.publicKey.toBase58())
console.log(123)

// Current SOL/USDC price
const desiredMarketPrice = new Decimal(price);
// Invert due to token mint ordering
const actualPrice = new Decimal(1).div(desiredMarketPrice);
// Shift by 64 bits
const initSqrtPrice = MathUtil.toX64(actualPrice); 

const tokenVaultAKeypair = Keypair.generate();
const tokenVaultBKeypair = Keypair.generate();
try {
let ix2 = (await WhirlpoolIx.initializeFeeTierIx(ctx.program, {
  whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
  feeTierPda: feeTierPda,
  tickSpacing: 
  2 ** abc123,
  defaultFeeRate: fees[abc123-4],
  feeAuthority: this.wallet.publicKey,
  funder: this.wallet.publicKey}))

  instructions.push(...ix2.instructions)
  signers.push(...ix2.signers)
} catch (err){
  
}
let ix = (await WhirlpoolIx.initializePoolIx(ctx.program, {
  initSqrtPrice,
  tickSpacing: 
  2 ** abc123,
  tokenMintA:opts.membershipMint,
  tokenMintB: opts.mint,
  tokenVaultAKeypair,
  tokenVaultBKeypair,
  whirlpoolPda,
  whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
  feeTierKey: feeTierKey,
  funder: this.wallet.publicKey,
}))

}
const pool: WhirlpoolData = await fetcher.getPool(whirlpoolPda.publicKey);
console.log(pool)
    instructions.push(
      createProcessInitForMintInstruction(
        {
          authority: this.wallet.publicKey,
          mintHoldingAccount: tokenAccountForMint,
          fanout: opts.fanout,
          mint: opts.mint,
          fanoutForMint: fanoutMintConfig,
          membershipMint: opts.membershipMint
        },
        {
          bumpSeed: fanoutConfigBumpSeed,
          whirlpool: whirlpoolPda.publicKey,
          whirlpool2: whirlpools[0],
          whirlpool3: whirlpools[1],
          whirlpool4: whirlpools[2]
        },
      ),
    );

    return {
      output: {
        tokenAccount: tokenAccountForMint,
        fanoutForMint: fanoutMintConfig,
      },
      instructions,
      signers,
    };
  }

  async addMemberWalletInstructions(
    opts: AddMemberArgs,
  ): Promise<any> {
    const [membershipAccount] = await FanoutClient.membershipVoucher(
      opts.fanout,
      opts.membershipKey,
    );
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    instructions.push(
    
    );

    return {
      output: {
        membershipAccount,
      },
      instructions,
      signers,
    };
  }

  async addMemberNftInstructions(
    opts: AddMemberArgs,
  ): Promise<any> {
    const [membershipAccount, _vb] = await FanoutClient.membershipVoucher(
      opts.fanout,
      opts.membershipKey,
    );
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    const [metadata, _md] = await PublicKey.findProgramAddress(
      [Buffer.from(MPL_TM_PREFIX), MPL_TM_BUF, opts.membershipKey.toBuffer()],
      new PublicKey(TM_PROGRAM_ADDRESS),
    );
    instructions.push(
     
    );

    return {
      output: {
        membershipAccount,
      },
      instructions,
      signers,
    };
  }

  async unstakeTokenMemberInstructions(opts: UnstakeMemberArgs): Promise<any> {
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    let mint = opts.membershipMint;
    if (!mint) {
      const data = await this.fetch<Fanout>(opts.fanout, Fanout);
      mint = data.membershipMint as PublicKey;
    }
    const [voucher, _vbump] = await FanoutClient.membershipVoucher(opts.fanout, opts.member);
    const stakeAccount = await getAssociatedTokenAddress(
      mint,
      voucher,true
    );
    const membershipMintTokenAccount =
      opts.membershipMintTokenAccount ||
      (await getAssociatedTokenAddress(
        mint,
        opts.member,true
      ));
    instructions.push(
      createProcessUnstakeInstruction({
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        fanout: opts.fanout,
        member: opts.member,
        memberStakeAccount: stakeAccount,
        membershipVoucher: voucher,
        membershipMint: mint,
        membershipMintTokenAccount: membershipMintTokenAccount,
      }),
    );
    return {
      output: {
        membershipVoucher: voucher,
        membershipMintTokenAccount,
        stakeAccount,
      },
      instructions,
      signers,
    };
  }

  async stakeForTokenMemberInstructions(opts: StakeMemberArgs): Promise<any> {
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    let mint = opts.membershipMint;
    let auth = opts.fanoutAuthority;
    if (!mint || !auth) {
      const data = await this.fetch<Fanout>(opts.fanout, Fanout);
      mint = data.membershipMint as PublicKey;
      auth = data.authority as PublicKey;
    }
    const [voucher, _vbump] = await FanoutClient.membershipVoucher(opts.fanout, opts.member);
    const stakeAccount = await getAssociatedTokenAddress(
      mint,
      voucher,true
    );
    const membershipMintTokenAccount =
      opts.membershipMintTokenAccount ||
      (await getAssociatedTokenAddress(
        mint,
        auth,true
      ));
    try {
      await this.connection.getTokenAccountBalance(stakeAccount);
    } catch (e) {
      instructions.push(
        await createAssociatedTokenAccountInstruction(
        
          opts.payer,
          stakeAccount,
          voucher,
          mint,
        ),
      );
    }
    try {
      await this.connection.getTokenAccountBalance(membershipMintTokenAccount);
    } catch (e) {
      throw new Error('Membership mint token account for authority must be initialized');
    }
    instructions.push(
      createProcessSetTokenMemberStakeInstruction(
        {
          member: opts.member,
          fanout: opts.fanout,
          membershipVoucher: voucher,
          membershipMint: mint,
          membershipMintTokenAccount: membershipMintTokenAccount,
          memberStakeAccount: stakeAccount,
        },
        {
          shares: opts.shares,
        },
      ),
    );
    return {
      output: {
        membershipVoucher: voucher,
        membershipMintTokenAccount,
        stakeAccount,
      },
      instructions,
      signers,
    };
  }

  async stakeTokenMemberInstructions(opts: StakeMemberArgs, pool123: PublicKey): Promise<any > {
    let signers: Signer[] =[] 
    let instructions: TransactionInstruction[] = [];
    let mint = opts.membershipMint;
    if (!mint) {
      const data = await this.fetch<Fanout>(opts.fanout, Fanout);
      mint = data.membershipMint as PublicKey;
    }
    const [voucher, _vbump] = await FanoutClient.membershipVoucher(opts.fanout, opts.member);
    const stakeAccount = await getAssociatedTokenAddress(
      mint,
      voucher,
      true,
    );
    const membershipMintTokenAccount =
      opts.membershipMintTokenAccount ||
      (await getAssociatedTokenAddress(
        mint,
        opts.member,
        true,
      ));
    try {
      await this.connection.getTokenAccountBalance(stakeAccount);
    } catch (e) {
      instructions.push(
        await createAssociatedTokenAccountInstruction(
        
          opts.payer,
          stakeAccount,
          voucher,
          mint,
        ),
      );
    }
    try {
      await this.connection.getTokenAccountBalance(membershipMintTokenAccount);
    } catch (e) {
      throw new Error('Membership mint token account for member must be initialized');
    }

    instructions.push(
      createProcessSetTokenMemberStakeInstruction(
        {
          fanout: opts.fanout,
          member: opts.member,
          memberStakeAccount: stakeAccount,
          membershipVoucher: voucher,
          membershipMint: mint,
          membershipMintTokenAccount: membershipMintTokenAccount,
        },
        {
          shares: opts.shares,
        },
      ),
    );
    
    const fetcher2= new AccountFetcher(this.connection);
    let apool = pool123
        let pool = await fetcher2.getPool(apool)
        ORCA_WHIRLPOOLS_CONFIG = pool.whirlpoolsConfig
    const lalab = await getAssociatedTokenAddress(
      pool.tokenMintB,
      opts.member,
      true,
    );const lalaa = await getAssociatedTokenAddress(
      pool.tokenMintA,
      opts.member,
      true,
    );
const poolData = pool
    const tickLower = TickUtil.getInitializableTickIndex(pool.tickCurrentIndex-poolData.tickSpacing , 
    poolData.tickSpacing * 2)
  const tickUpper = TickUtil.getInitializableTickIndex(
    pool.tickCurrentIndex+poolData.tickSpacing ,
  poolData.tickSpacing  * 2
  );
  
const ntickPdas =TickArrayUtil.getTickArrayPDAs(tickLower-poolData.tickSpacing*2, poolData.tickSpacing,3,
   ORCA_WHIRLPOOL_PROGRAM_ID,pool123,false)// .getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolPda.publicKey, tickUpper);
const ntickPdas2 =TickArrayUtil.getTickArrayPDAs(tickUpper+poolData.tickSpacing*2, poolData.tickSpacing,3,
   ORCA_WHIRLPOOL_PROGRAM_ID,pool123,false)// .getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolPda.publicKey, tickUpper);

const tickPdas =ntickPdas//.getTickArrayPDAs(position.tickLowerIndex-poolData.tickSpacing, poolData.tickSpacing,1, ORCA_WHIRLPOOL_PROGRAM_ID,new PublicKey(p),false)// .getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolPda.publicKey, tickUpper);
const tickPdas2 =ntickPdas2 //TickArrayUtil.getTickArrayPDAs(position.tickUpperIndex+poolData.tickSpacing, poolData.tickSpacing,1, ORCA_WHIRLPOOL_PROGRAM_ID,new PublicKey(p),false)// .getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolPda.publicKey, tickUpper);

let tokenvaulta = await (pool.tokenVaultA)
let tokenvaultb = await (pool.tokenVaultB)
let positionPk = Keypair.generate()
let positionMint = positionPk.publicKey ;
signers.push(positionPk)


const provider = new AnchorProvider(this.connection, this.wallet, {})
let position =
  PDAUtil.getPosition(ORCA_WHIRLPOOL_PROGRAM_ID, positionMint).publicKey
  let positionTokenAccount = await deriveAssociatedTokenAddress(opts.member, positionMint);
    // @ts-ignore

  const ctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);

console.log(123123123)

console.log(123123123)

  
     let whirlpool = pool123
    
   
    console.log(5555555)
    console.log(positionMint.toBase58())
    console.log(positionMint.toBase58())
    console.log(positionMint.toBase58())
    console.log(positionMint.toBase58())
    const fetcher = new AccountFetcher(this.connection);

    const tickArrayPda = PDAUtil.getTickArray(
      ctx.program.programId,
      pool123,
      tickLower
    );
    
    // Check if tick array exists
    const ta = await fetcher.getTickArray(tickArrayPda.publicKey, true);
    // Exit if it exists
    if (!ta) {
      // Construct Init Tick Array Ix
    const tx = toTx(ctx, WhirlpoolIx.initTickArrayIx(ctx.program, {
      startTick: tickLower,
      tickArrayPda,
      whirlpool:pool123,
      funder: ctx.wallet.publicKey,
    }));
    const ta = await fetcher.getTickArray(tickArrayPda.publicKey, true);
    if (!ta) {
    /*
   let sig =  await tx.buildAndExecute();
   console.log(sig)
   await this.connection.confirmTransaction(sig, 'finalized')
   console.log(sig)*/
    }
    }
    const tickArrayPda2 = PDAUtil.getTickArray(
      ctx.program.programId,
      pool123,
      tickUpper
    );
    
    instructions.push(
      createOpenPositionInstruction(
        {
  funder: opts.member,
  owner: voucher,
  fanout: opts.fanout,
  position,
  positionMint,
  positionTokenAccount,
  whirlpool:pool123,
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
  rent:SYSVAR_RENT_PUBKEY,
  associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
  whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
  tokenVaultA: tokenvaulta,
  tokenVaultB: tokenvaultb,
  membershipVoucher: voucher,
  tokenAccountA: stakeAccount,
  tokenAccountB: lalab,
  tickArrayUpper: tickPdas2[0].publicKey,
  tickArrayLower: tickPdas[0].publicKey },
        {
          bump: (await fetcher.getPool(whirlpool)).whirlpoolBump[0],
          tickSpacing:  (await fetcher.getPool(whirlpool)).tickSpacing
        },
      ),
    );


    instructions.push(
      createIncreaseLiquidityInstruction(
        {
  funder: opts.member,
  owner: voucher,
  fanout: opts.fanout,
  position,
  positionMint,
  positionTokenAccount,
  whirlpool:pool123,
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
  rent:SYSVAR_RENT_PUBKEY,
  associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
  whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
  tokenVaultA: tokenvaulta,
  tokenVaultB: tokenvaultb,
  membershipVoucher: voucher,
  tokenAccountA: stakeAccount,
  tokenAccountB: lalab,
  tickArrayUpper: tickPdas2[0].publicKey,
  tickArrayLower: tickPdas[0].publicKey },
        {
          bump: (await fetcher.getPool(whirlpool)).whirlpoolBump[0],
          tickSpacing:  (await fetcher.getPool(whirlpool)).tickSpacing, shares:opts.shares
        },
      ),
    );
    for (var abc123 = 0 ;abc123<=2;abc123++){
/*
    let pool = await fetcher.getPool(pools[abc123])

console.log(pool)
    const tickLower = TickUtil.getInitializableTickIndex(pool.tickCurrentIndex-poolData.tickSpacing , 
    poolData.tickSpacing * 2)
  const tickUpper = TickUtil.getInitializableTickIndex(
    pool.tickCurrentIndex+poolData.tickSpacing ,
  poolData.tickSpacing  * 2
  );
  
const ntickPdas =TickArrayUtil.getTickArrayPDAs(tickLower-poolData.tickSpacing, poolData.tickSpacing,1, ORCA_WHIRLPOOL_PROGRAM_ID,pools[abc123],false)// .getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolPda.publicKey, tickUpper);
const ntickPdas2 =TickArrayUtil.getTickArrayPDAs(tickUpper+poolData.tickSpacing, poolData.tickSpacing,1, ORCA_WHIRLPOOL_PROGRAM_ID,pools[abc123],false)// .getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolPda.publicKey, tickUpper);

const tickPdas =ntickPdas//.getTickArrayPDAs(position.tickLowerIndex-poolData.tickSpacing, poolData.tickSpacing,1, ORCA_WHIRLPOOL_PROGRAM_ID,new PublicKey(p),false)// .getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolPda.publicKey, tickUpper);
const tickPdas2 =ntickPdas2 //TickArrayUtil.getTickArrayPDAs(position.tickUpperIndex+poolData.tickSpacing, poolData.tickSpacing,1, ORCA_WHIRLPOOL_PROGRAM_ID,new PublicKey(p),false)// .getTickArray(ORCA_WHIRLPOOL_PROGRAM_ID, whirlpoolPda.publicKey, tickUpper);

let tokenvaulta = await (pool.tokenVaultA)
let tokenvaultb = await (pool.tokenVaultB)
let positionPk = Keypair.generate()
let positionMint = positionPk.publicKey ;
signers.push(positionPk)

let position =
  PDAUtil.getPosition(ORCA_WHIRLPOOL_PROGRAM_ID, positionMint).publicKey
  let positionTokenAccount = await deriveAssociatedTokenAddress(voucher, positionMint);
     try {

try {
  let ix2 = (await WhirlpoolIx.initTickArrayIx(ctx.program, {
    whirlpool: pools[abc123],
    tickArrayPda: tickPdas[0],
    startTick: tickLower,
    funder: this.wallet.publicKey}))
  
  let tx2 = toTx(ctx, ix2)
  let sig2 = await tx2.buildAndExecute();
  await this.connection.confirmTransaction(sig2)

   ix2 = (await WhirlpoolIx.initTickArrayIx(ctx.program, {
    whirlpool: pools[abc123],
    tickArrayPda: tickPdas2[0],
    startTick: tickUpper,
    funder: this.wallet.publicKey}))
  
   tx2 = toTx(ctx, ix2)
   sig2 = await tx2.buildAndExecute();
  console.log(sig2)
  await this.connection.confirmTransaction(sig2)
     }
     catch (err){

     }
     const fetcher = new AccountFetcher(this.connection);
     let whirlpool = (pools[abc123])
let stuff =    {
  funder: opts.member,
  membershipVoucher: voucher,
  owner: opts.fanout,
  position,
  positionMint,
  positionTokenAccount,
  whirlpool,
  whirlpool2: (await this.fetch<Fanout>(opts.fanout, Fanout)).whirlpool2,
  whirlpool3: (await this.fetch<Fanout>(opts.fanout, Fanout)).whirlpool3,
  whirlpool4: (await this.fetch<Fanout>(opts.fanout, Fanout)).whirlpool4,
  associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
  whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
  tokenVaultA: tokenvaulta,
  tokenVaultB: tokenvaultb,
  tokenAccountA: stakeAccount,
  tokenAccountB: lala,
  tickArrayUpper: tickPdas2[0].publicKey,
  tickArrayLower: tickPdas[0].publicKey
} 
for (var acc of Object.values(stuff)){
  console.log(stuff.toBase58())
}
    instructions.push(
      createOpenPositionInstruction(
        {
  funder: opts.member,
  membershipVoucher: voucher,
  owner: opts.fanout,
  position,
  positionMint,
  positionTokenAccount,
  whirlpool,
  whirlpool2: (await this.fetch<Fanout>(opts.fanout, Fanout)).whirlpool2,
  whirlpool3: (await this.fetch<Fanout>(opts.fanout, Fanout)).whirlpool3,
  whirlpool4: (await this.fetch<Fanout>(opts.fanout, Fanout)).whirlpool4,
  associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
  whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
  tokenVaultA: tokenvaulta,
  tokenVaultB: tokenvaultb,
  tokenAccountA: stakeAccount,
  tokenAccountB: lala,
  tickArrayUpper: tickPdas2[0].publicKey,
  tickArrayLower: tickPdas[0].publicKey },
        {
          bump: (await fetcher.getPool(whirlpool)).whirlpoolBump,
          tickSpacing:  (await fetcher.getPool(whirlpool)).tickSpacing
        },
      ),
    );
      }
      catch (err){

      }*/
    }
   
    return {
      output: {
        membershipVoucher: voucher,
        membershipMintTokenAccount,
        stakeAccount,
      },
      instructions,
      signers,
    };
  }

  async signMetadataInstructions(opts: SignMetadataArgs): Promise<any> {
    let authority = opts.authority,
      holdingAccount = opts.holdingAccount;
    if (!authority || !holdingAccount) {
      const fanoutObj = await this.fetch<Fanout>(opts.fanout, Fanout);
      authority = fanoutObj.authority as PublicKey;
      holdingAccount = fanoutObj.accountKey as PublicKey;
    }
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    instructions.push(
      createProcessSignMetadataInstruction({
        fanout: opts.fanout,
        authority: authority,
        holdingAccount: holdingAccount,
        metadata: opts.metadata,
        tokenMetadataProgram: new PublicKey(TM_PROGRAM_ADDRESS),
      }),
    );
    return {
      output: {},
      instructions,
      signers,
    };
  }

  async distributeTokenMemberInstructions(opts: DistributeTokenMemberArgs): Promise<any > {
    const instructions: TransactionInstruction[] = [];
    const fanoutMint = opts.fanoutMint || NATIVE_MINT;
    let holdingAccount;
    const [fanoutForMint] = await FanoutClient.fanoutForMintKey(opts.fanout, fanoutMint);
    const fanoutMintMemberTokenAccount = await getAssociatedTokenAddress(
      fanoutMint,
      opts.member,
      true,
    );
    const [fanoutForMintMembershipVoucher] = await FanoutClient.mintMembershipVoucher(
      fanoutForMint,
      opts.member,
      fanoutMint,
    );

    if (opts.distributeForMint) {
      holdingAccount = await getAssociatedTokenAddress(
        fanoutMint,
        opts.fanout,
        true,
      );
      try {
        await this.connection.getTokenAccountBalance(fanoutMintMemberTokenAccount);
      } catch (e) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
         
            opts.payer,
            fanoutMintMemberTokenAccount,
            opts.member,
            fanoutMint,
          ),
        );
      }
    } else {
      const [nativeAccount, _nativeAccountBump] = await FanoutClient.nativeAccount(opts.fanout);
      holdingAccount = nativeAccount;
    }
    const [membershipVoucher] = await FanoutClient.membershipVoucher(opts.fanout, opts.member);
    const stakeAccount = await getAssociatedTokenAddress(
      opts.membershipMint,
      membershipVoucher,
      true,
    );
    const membershipMintTokenAccount =
      opts.membershipMintTokenAccount ||
      (await getAssociatedTokenAddress(
        opts.membershipMint,
        opts.member,
        true,
      ));
      
    try {
      await this.connection.getTokenAccountBalance(stakeAccount);
    } catch (e) {
      instructions.push(
        await createAssociatedTokenAccountInstruction(
        
          opts.payer,
          stakeAccount,
          membershipVoucher,
          opts.membershipMint,
        ),
      );
    }
    instructions.push(
      createProcessDistributeTokenInstruction(
        {
          memberStakeAccount: stakeAccount,
          membershipMint: opts.membershipMint,
          fanoutForMint: fanoutForMint,
          fanoutMint: fanoutMint,
          membershipVoucher: membershipVoucher,
          fanoutForMintMembershipVoucher,
          holdingAccount,
          membershipMintTokenAccount: membershipMintTokenAccount,
          fanoutMintMemberTokenAccount,
          payer: opts.payer,
          member: opts.member,
          fanout: opts.fanout,
        },
        {
          distributeForMint: opts.distributeForMint,
        },
      ),
    );

    return {
      output: {
        membershipVoucher,
        fanoutForMintMembershipVoucher,
        holdingAccount,
      },
      instructions,
      signers: [],
    };
  }

  async distributeClockTokenMemberInstructions(opts: DistributeClockTokenMemberArgs): Promise<any> {
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    const fanoutMint = opts.fanoutMint || NATIVE_MINT;
    let holdingAccount;
    const [fanoutForMint] = await FanoutClient.fanoutForMintKey(opts.fanout, fanoutMint);
    const fanoutMintMemberTokenAccount = await getAssociatedTokenAddress(
      fanoutMint,
      opts.member,
      true,
    );
    const [fanoutForMintMembershipVoucher] = await FanoutClient.mintMembershipVoucher(
      fanoutForMint,
      opts.member,
      fanoutMint,
    );

    if (opts.distributeForMint) {
      holdingAccount = await getAssociatedTokenAddress(
        fanoutMint,
        opts.fanout,
        true,
      );
      try {
        await this.connection.getTokenAccountBalance(fanoutMintMemberTokenAccount);
      } catch (e) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
         
            opts.payer,
            fanoutMintMemberTokenAccount,
            opts.member,
            fanoutMint,
          ),
        );
      }
    } else {
      const [nativeAccount, _nativeAccountBump] = await FanoutClient.nativeAccount(opts.fanout);
      holdingAccount = nativeAccount;
    }
    const [membershipVoucher] = await FanoutClient.membershipVoucher(opts.fanout, opts.member);
    const stakeAccount = await getAssociatedTokenAddress(
      opts.membershipMint,
      membershipVoucher,
      true,
    );
    const membershipMintTokenAccount =
      opts.membershipMintTokenAccount ||
      (await getAssociatedTokenAddress(
        opts.membershipMint,
        opts.member,
        true,
      ));
    try {
      await this.connection.getTokenAccountBalance(stakeAccount);
    } catch (e) {
      instructions.push(
        await createAssociatedTokenAccountInstruction(
 
          opts.payer,
          stakeAccount,
          membershipVoucher,
          opts.membershipMint,
        ),
      );
    }
    const payerTokenAccount =
      (await getAssociatedTokenAddress(
        opts.membershipMint,
        opts.hydra,
        true,
      ));


    return {
      output: {
        membershipVoucher,
        fanoutForMintMembershipVoucher,
        holdingAccount,
      },
      instructions,
      signers,
    };
  }

  async distributeAllInstructions({
    fanout,
    mint,
    payer,
  }: DistributeAllArgs): Promise<any> {
    const fanoutAcct = await Fanout.fromAccountAddress(this.connection, fanout);
    const members = await this.getMembers({ fanout });

    const instructions = await Promise.all(
      members.map(async (member) => {
        switch (fanoutAcct.membershipModel) {
          case MembershipModel.Token:
            return this.distributeTokenMemberInstructions({
              distributeForMint: !mint.equals(NATIVE_MINT),
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              membershipMint: fanoutAcct.membershipMint!,
              fanout,
              member,
              fanoutMint: mint,
              payer: payer,
            });
          case MembershipModel.Wallet:
            return this.distributeWalletMemberInstructions({
              distributeForMint: !mint.equals(NATIVE_MINT),
              member,
              fanout,
              fanoutMint: mint,
              payer: payer,
            });
          case MembershipModel.NFT:
            const account = (await this.connection.getTokenLargestAccounts(member)).value[0]
              .address;
              // @ts-ignore
            const wallet = (await getTokenAccount(this.provider, account)).owner;
            return this.distributeNftMemberInstructions({
              distributeForMint: !mint.equals(NATIVE_MINT),
              fanout,
              fanoutMint: mint,
              membershipKey: member,
              member: wallet,
              payer: payer,
            });
        }
      }),
    );

    // 3 at a time
    const grouped: any[][] = chunks(instructions, 3);

    return {
      instructions: grouped.map((i) => i.map((o) => o.instructions).flat()),
      signers: grouped.map((i) => i.map((o) => o.signers).flat()),
      output: null,
    };
  }

  async distributeAll(opts: DistributeAllArgs): Promise<null> {
    return this.executeBig(this.distributeAllInstructions(opts), opts.payer);
  }

  async distributeNftMemberInstructions(opts: DistributeMemberArgs): Promise<any> {
    if (!opts.membershipKey) {
      throw new Error('No membership key');
    }
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    const fanoutMint = opts.fanoutMint || NATIVE_MINT;
    let holdingAccount;
    const [fanoutForMint] = await FanoutClient.fanoutForMintKey(opts.fanout, fanoutMint);

    const [fanoutForMintMembershipVoucher] = await FanoutClient.mintMembershipVoucher(
      fanoutForMint,
      opts.membershipKey,
      fanoutMint,
    );
    const fanoutMintMemberTokenAccount = await getAssociatedTokenAddress(
      fanoutMint,
      opts.member,
      true,
    );
    if (opts.distributeForMint) {
      holdingAccount = await getAssociatedTokenAddress(
        fanoutMint,
        opts.fanout,
        true,
      );
      try {
        await this.connection.getTokenAccountBalance(fanoutMintMemberTokenAccount);
      } catch (e) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            opts.payer,
            fanoutMintMemberTokenAccount,
            opts.member,fanoutMint
          ),
        );
      }
    } else {
      const [nativeAccount, _nativeAccountBump] = await FanoutClient.nativeAccount(opts.fanout);
      holdingAccount = nativeAccount;
    }
    const membershipKeyTokenAccount = await getAssociatedTokenAddress(
      opts.membershipKey,
      opts.member,
      true,
    );
    const [membershipVoucher] = await FanoutClient.membershipVoucher(
      opts.fanout,
      opts.membershipKey,
    );
    instructions.push(
     
    );

    return {
      output: {
        membershipVoucher,
        fanoutForMintMembershipVoucher,
        holdingAccount,
      },
      instructions,
      signers,
    };
  }

  async distributeWalletMemberInstructions(opts: DistributeMemberArgs): Promise<any> {
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    const fanoutMint = opts.fanoutMint || NATIVE_MINT;
    let holdingAccount;
    const [fanoutForMint] = await FanoutClient.fanoutForMintKey(opts.fanout, fanoutMint);
    const [fanoutForMintMembershipVoucher] = await FanoutClient.mintMembershipVoucher(
      fanoutForMint,
      opts.member,
      fanoutMint,
    );
    const fanoutMintMemberTokenAccount = await getAssociatedTokenAddress(
      fanoutMint,
      opts.member,
      true,
    );
    if (opts.distributeForMint) {
      holdingAccount = await getAssociatedTokenAddress(
        fanoutMint,
        opts.fanout,
        true,
      );
      try {
        await this.connection.getTokenAccountBalance(fanoutMintMemberTokenAccount);
      } catch (e) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
              opts.payer,
            fanoutMintMemberTokenAccount,
            opts.member,fanoutMint
          ),
        );
      }
    } else {
      const [nativeAccount, _nativeAccountBump] = await FanoutClient.nativeAccount(opts.fanout);
      holdingAccount = nativeAccount;
    }
    const [membershipVoucher] = await FanoutClient.membershipVoucher(opts.fanout, opts.member);
    instructions.push(
      
    );

    return {
      output: {
        membershipVoucher,
        fanoutForMintMembershipVoucher,
        holdingAccount,
      },
      instructions,
      signers,
    };
  }

  async transferSharesInstructions(opts: TransferSharesArgs): Promise<any> {
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    const [fromMembershipAccount] = await FanoutClient.membershipVoucher(
      opts.fanout,
      opts.fromMember,
    );
    const [toMembershipAccount] = await FanoutClient.membershipVoucher(opts.fanout, opts.toMember);
    instructions.push(
      createProcessTransferSharesInstruction(
        {
          fromMember: opts.fromMember,
          toMember: opts.toMember,
          authority: this.wallet.publicKey,
          fanout: opts.fanout,
          fromMembershipAccount,
          toMembershipAccount,
        },
        {
          shares: opts.shares,
        },
      ),
    );
    return {
      output: {},
      instructions,
      signers,
    };
  }

  async removeMemberInstructions(opts: RemoveMemberArgs): Promise<any> {
    const instructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    const [voucher] = await FanoutClient.membershipVoucher(opts.fanout, opts.member);

    instructions.push(
    
    );
    return {
      output: {},
      instructions,
      signers,
    };
  }

  async initializeFanout(
    opts: InitializeFanoutArgs, price:number, fee1:number, fee2:number, fee3:number, fee4:number
  ): Promise<{ fanout: PublicKey; nativeAccount: PublicKey }> {
    const { instructions, signers, output } = await this.initializeFanoutInstructions(opts, price, fee1, fee2, fee3, fee4);
    const provider = new AnchorProvider(this.connection, this.wallet, {})
// @ts-ignore
  const ctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);

  instructions.push(...instructions)
  signers.push(...signers)

  await        this.initializeFanoutForMint({
    fanout: output.fanout,
    mint: opts.randomMint,
    membershipMint: opts.mint}, price, fee1, fee2, fee3, fee4)
    return output;
  }

  async initializeFanoutForMint(
    opts: InitializeFanoutForMintArgs, price:number, fee1:number, fee2:number, fee3:number, fee4:number
  ): Promise<{ fanoutForMint: PublicKey; tokenAccount: PublicKey }> {
    const { instructions, signers, output } = await this.initializeFanoutForMintInstructions(opts, price, fee1, fee2, fee3, fee4);
    console.log(...instructions)
    for( var abcaa of instructions){
      for (var abc of abcaa.keys){
      if (abc.isSigner){try {
        console.log(abc)
        console.log(abc.pubkey.toBase58())
      } catch (err){
        abc.pubkey = abc.pubkey.publicKey
        console.log(abc.pubkey.toBase58())
      }}
      }
    }
    await this.throwingSend(instructions, signers, this.wallet.publicKey);
    return output;
  }

  async addMemberNft(opts: AddMemberArgs): Promise<any> {
    const { instructions, signers, output } = await this.addMemberNftInstructions(opts);
    await this.throwingSend(instructions, signers, this.wallet.publicKey);
    return output;
  }

  async addMemberWallet(opts: AddMemberArgs): Promise<{ membershipAccount: PublicKey }> {
    const { instructions, signers, output } = await this.addMemberWalletInstructions(opts);
    await this.throwingSend(instructions, signers, this.wallet.publicKey);
    return output;
  }

  async stakeTokenMember(opts: StakeMemberArgs, pool: PublicKey) {
    // @ts-ignore
  var { instructions, signers, output } = await this.stakeTokenMemberInstructions(opts, pool);
    console.log(...signers)
    console.log('hhhheheheheheheheh')
    await this.throwingSend(instructions, [...signers,opts.payerKey], this.wallet.publicKey);
    console.log(...instructions)
    return output;
  }

  async stakeForTokenMember(opts: StakeMemberArgs) {
    const { instructions, signers, output } = await this.stakeForTokenMemberInstructions(opts);
    await this.throwingSend(instructions, [...signers,opts.payerKey, this.wallet], this.wallet.publicKey);
    return output;
  }

  async signMetadata(opts: SignMetadataArgs) {
    const { instructions, signers, output } = await this.signMetadataInstructions(opts);
    await this.throwingSend(instructions, signers, this.wallet.publicKey);
    return output;
  }

  async removeMember(opts: RemoveMemberArgs) {
    const {
      instructions: remove_ix,
      signers: remove_signers,
      output,
    } = await this.removeMemberInstructions(opts);
    await this.throwingSend([...remove_ix], [...remove_signers], this.wallet.publicKey);
    return output;
  }

  async transferShares(opts: TransferSharesArgs) {
    const data = await this.fetch<Fanout>(opts.fanout, Fanout);
    const {
      instructions: transfer_ix,
      signers: transfer_signers,
      output,
    } = await this.transferSharesInstructions(opts);
    if (
      data.membershipModel != MembershipModel.Wallet &&
      data.membershipModel != MembershipModel.NFT
    ) {
      throw Error('Transfer is only supported in NFT and Wallet fanouts');
    }
    await this.throwingSend([...transfer_ix], [...transfer_signers], this.wallet.publicKey);
    return output;
  }

  async unstakeTokenMember(opts: UnstakeMemberArgs) {
    const { fanout, member, payer } = opts;
    if (!opts.membershipMint) {
      const data = await this.fetch<Fanout>(opts.fanout, Fanout);
      opts.membershipMint = data.membershipMint as PublicKey;
    }
    const {
      instructions: unstake_ix,
      signers: unstake_signers,
      output,
    } = await this.unstakeTokenMemberInstructions(opts);
    const { instructions: dist_ix, signers: dist_signers } =
      await this.distributeTokenMemberInstructions({
        distributeForMint: false,
        fanout,
        member,
        membershipMint: opts.membershipMint,
        payer,
      });
    await this.throwingSend(
      [...dist_ix, ...unstake_ix],
      [...unstake_signers, ...dist_signers],
      this.wallet.publicKey,
    );
    return output;
  }

  async distributeNft(opts: DistributeMemberArgs): Promise<{
    membershipVoucher: PublicKey;
    fanoutForMintMembershipVoucher?: PublicKey;
    holdingAccount: PublicKey;
  }> {
    const { instructions, signers, output } = await this.distributeNftMemberInstructions(opts);
    await this.throwingSend(instructions, signers, this.wallet.publicKey);
    return output;
  }

  async distributeWallet(opts: DistributeMemberArgs): Promise<{
    membershipVoucher: PublicKey;
    fanoutForMintMembershipVoucher?: PublicKey;
    holdingAccount: PublicKey;
  }> {
    const { instructions, signers, output } = await this.distributeWalletMemberInstructions(opts);
    await this.throwingSend(instructions, signers, this.wallet.publicKey);
    return output;
  }

  async distributeToken(opts: DistributeTokenMemberArgs): Promise<{
    membershipVoucher: PublicKey;
    fanoutForMintMembershipVoucher?: PublicKey;
    holdingAccount: PublicKey;
  }> {
    const { instructions, signers, output } = await this.distributeTokenMemberInstructions(opts);
    await this.throwingSend(instructions, signers, this.wallet.publicKey);
    return output;
  }
}
