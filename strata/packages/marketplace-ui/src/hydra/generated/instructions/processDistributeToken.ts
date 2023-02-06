/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token';
import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';

/**
 * @category Instructions
 * @category ProcessDistributeToken
 * @category generated
 */
export type ProcessDistributeTokenInstructionArgs = {
  distributeForMint: boolean;
};
/**
 * @category Instructions
 * @category ProcessDistributeToken
 * @category generated
 */
export const processDistributeTokenStruct = new beet.BeetArgsStruct<
  ProcessDistributeTokenInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */;
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['distributeForMint', beet.bool],
  ],
  'ProcessDistributeTokenInstructionArgs',
);
/**
 * Accounts required by the _processDistributeToken_ instruction
 *
 * @property [**signer**] payer
 * @property [_writable_] member
 * @property [_writable_] membershipMintTokenAccount
 * @property [_writable_] membershipVoucher
 * @property [_writable_] fanout
 * @property [_writable_] holdingAccount
 * @property [_writable_] fanoutForMint
 * @property [_writable_] fanoutForMintMembershipVoucher
 * @property [] fanoutMint
 * @property [_writable_] fanoutMintMemberTokenAccount
 * @property [_writable_] membershipMint
 * @property [_writable_] memberStakeAccount
 * @category Instructions
 * @category ProcessDistributeToken
 * @category generated
 */
export type ProcessDistributeTokenInstructionAccounts = {
  payer: web3.PublicKey;
  member: web3.PublicKey;
  membershipMintTokenAccount: web3.PublicKey;
  membershipVoucher: web3.PublicKey;
  fanout: web3.PublicKey;
  holdingAccount: web3.PublicKey;
  fanoutForMint: web3.PublicKey;
  fanoutForMintMembershipVoucher: web3.PublicKey;
  fanoutMint: web3.PublicKey;
  fanoutMintMemberTokenAccount: web3.PublicKey;
  systemProgram?: web3.PublicKey;
  rent?: web3.PublicKey;
  tokenProgram?: web3.PublicKey;
  membershipMint: web3.PublicKey;
  memberStakeAccount: web3.PublicKey;
  anchorRemainingAccounts?: web3.AccountMeta[];
};

export const processDistributeTokenInstructionDiscriminator = [126, 105, 46, 135, 28, 36, 117, 212];

/**
 * Creates a _ProcessDistributeToken_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category ProcessDistributeToken
 * @category generated
 */
export function createProcessDistributeTokenInstruction(
  accounts: ProcessDistributeTokenInstructionAccounts,
  args: ProcessDistributeTokenInstructionArgs,
  programId = new web3.PublicKey('5G76ijPLinxx8tZai4hYkhoBkb2QidrX9BuJiEpuJhs7'),
) {
  const [data] = processDistributeTokenStruct.serialize({
    instructionDiscriminator: processDistributeTokenInstructionDiscriminator,
    ...args,
  });
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.payer,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.member,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.membershipMintTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.membershipVoucher,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.fanout,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.holdingAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.fanoutForMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.fanoutForMintMembershipVoucher,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.fanoutMint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.fanoutMintMemberTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.membershipMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.memberStakeAccount,
      isWritable: true,
      isSigner: false,
    },
  ];

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc);
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  });
  return ix;
}