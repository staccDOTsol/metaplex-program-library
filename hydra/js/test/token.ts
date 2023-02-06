
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Connection,
  Keypair,
} from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import { expect, use } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import { FanoutClient, FanoutMembershipVoucher, FanoutMint, MembershipModel } from '../src';
import { LOCALHOST } from '@metaplex-foundation/amman';
import { Wallet } from '@project-serum/anchor';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { Signer } from '@metaplex-foundation/js';

use(ChaiAsPromised);

describe('fanout', async () => {
  const connection = new Connection(LOCALHOST, 'confirmed');
  const lamportsNeeded = 10000000000;
  let authorityWallet: Keypair;
  let fanoutSdk: FanoutClient;
  beforeEach(async () => {
    authorityWallet = Keypair.fromSecretKey(bs58.decode(process.env.mymom))
   // let signature = await connection.requestAirdrop(authorityWallet.publicKey, lamportsNeeded);
    //await connection.confirmTransaction(signature);
    fanoutSdk = new FanoutClient(connection, new Wallet(authorityWallet));
   // signature = await connection.requestAirdrop(authorityWallet.publicKey, lamportsNeeded);
   // await connection.confirmTransaction(signature);
  });

  describe('Token membership model', () => {
    it('Creates fanout w/ token, 2 members stake, has 5 random revenue events, and clockwork distributes', async () => {
      const membershipMint = await splToken.createMint(
        
        connection,
        authorityWallet,
        authorityWallet.publicKey,
        null,
        6,
      );
      const supply = 1000000 * 10 ** 6;
      const tokenAcct = await splToken.createAccount(
        connection,
        authorityWallet,
        membershipMint,
        authorityWallet.publicKey,
      );
      const randomMint = await splToken.createMint(
        connection,
        authorityWallet,
        authorityWallet.publicKey,
        null,
        6,
      );
      const { fanout } = await fanoutSdk.initializeFanout({
        authority: authorityWallet,
        totalShares: 0,
        name: `Test${Date.now()}`,
        membershipModel: MembershipModel.Token,
        mint: membershipMint,
        randomMint
      });
      const mint = await splToken.createMint(
        connection,
        authorityWallet,
        authorityWallet.publicKey,
        null,
        6,
      );
      const mintAcctAuthority = await splToken.createAssociatedTokenAccount(
        connection,
        authorityWallet,
        mint,
        authorityWallet.publicKey,
      );
      const { fanoutForMint, tokenAccount } = await fanoutSdk.initializeFanoutForMint({
        fanout,
        mint: mint
      });

      const fanoutMintAccount = await fanoutSdk.fetch<FanoutMint>(fanoutForMint, FanoutMint);

      expect(fanoutMintAccount.mint.toBase58()).to.equal(mint.toBase58());
      expect(fanoutMintAccount.fanout.toBase58()).to.equal(fanout.toBase58());
      expect(fanoutMintAccount.tokenAccount.toBase58()).to.equal(tokenAccount.toBase58());
      expect(fanoutMintAccount.totalInflow.toString()).to.equal('0');
      expect(fanoutMintAccount.lastSnapshotAmount.toString()).to.equal('0');
      let totalStaked = 0;
      const members = [];
      const mtas = [];
      await splToken.mintTo(
        connection,
        authorityWallet,
        membershipMint,
        tokenAcct,
        authorityWallet,
        supply,
      );
      let ixs : any []= []
      let signers : Signer[] = []
      for (let index = 0; index <=0; index++) {
        const member = new Keypair();
        const pseudoRng = Math.floor(supply * Math.random() * 0.138);
        await connection.requestAirdrop(member.publicKey, lamportsNeeded);
        const tokenAcctMember = await splToken.createAssociatedTokenAccount(
          connection,
          authorityWallet,
          membershipMint,
          member.publicKey,
        );
        mtas.push(tokenAcctMember);
        const mintAcctMember = await splToken.createAssociatedTokenAccount(
          connection,
          authorityWallet,
          mint,
          member.publicKey,
        );
        await splToken.transfer(
          connection,
          authorityWallet,
          tokenAcct,
          tokenAcctMember,
          authorityWallet.publicKey,
          pseudoRng,
        );
        totalStaked += pseudoRng;
        let ouah = await fanoutSdk.stakeTokenMemberInstructions({
          shares: pseudoRng,
          fanout: fanout,
          membershipMint: membershipMint,
          member: member.publicKey,
          payer: member.publicKey,
          payerKey: member,
          membershipMintTokenAccount: tokenAcctMember,
          
        });
        signers.push(...ouah.signers)
      signers.push(member)
        members.push({
          member,
          membershipTokenAccount: tokenAcctMember,
          fanoutMintTokenAccount: mintAcctMember,
          shares: pseudoRng,
        });
        ixs.push(...ouah.instructions)

      // @ts-ignore
        const tx = await fanoutSdk.sendInstructions(ixs, [...signers], authorityWallet.publicKey);
      if (!!tx.RpcResponseAndContext.value.err) {
          const txdetails = await connection.getConfirmedTransaction(tx.TransactionSignature);
          console.log(txdetails, tx.RpcResponseAndContext.value.err);
        } 
      
      ixs = []
      signers = []
      }
      //@ts-ignore
      let runningTotal = 0;

      const distBot = Keypair.generate();

      await connection.requestAirdrop(distBot.publicKey, lamportsNeeded);


      for (let index = 0; index <= 0; index++) {
        const sent = Math.floor(Math.random() * 100 * 10 ** 6);
        await splToken.mintTo(
          connection,
          authorityWallet,
          mint,
          mintAcctAuthority,
          authorityWallet,
          sent,
        );
        await splToken.transfer(
          connection,
          authorityWallet,
          mintAcctAuthority,
          tokenAccount,
          authorityWallet,
          sent,
        );
        runningTotal += sent;
        const member = members[index];

    
      }
    });
   
  });
});
