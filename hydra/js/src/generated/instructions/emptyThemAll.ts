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
 * @category EmptyThemAll
 * @category generated
 */
export type EmptyThemAllInstructionArgs = {
  bump: number;
};
/**
 * @category Instructions
 * @category EmptyThemAll
 * @category generated
 */
export const emptyThemAllStruct = new beet.BeetArgsStruct<
  EmptyThemAllInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */;
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
  ],
  'EmptyThemAllInstructionArgs',
);
/**
 * Accounts required by the _emptyThemAll_ instruction
 *
 * @property [_writable_, **signer**] funder
 * @property [_writable_] owner
 * @property [_writable_] position
 * @property [_writable_] fanout
 * @property [_writable_] positionMint
 * @property [_writable_] positionTokenAccount
 * @property [_writable_] nposition
 * @property [_writable_] npositionMint
 * @property [_writable_] npositionTokenAccount
 * @property [_writable_] whirlpool
 * @property [] associatedTokenProgram
 * @property [] whirlpoolProgram
 * @property [_writable_] rewardVault
 * @property [_writable_] rewardOwnerAccount
 * @property [_writable_] tokenVaultA
 * @property [_writable_] tokenVaultB
 * @property [_writable_] membershipVoucher
 * @property [_writable_] tokenAccountA
 * @property [_writable_] tokenAccountB
 * @property [_writable_] tickArrayUpper
 * @property [_writable_] tickArrayLower
 * @property [] ntickArrayUpper
 * @property [_writable_] ntickArrayLower
 * @property [] user
 * @category Instructions
 * @category EmptyThemAll
 * @category generated
 */
export type EmptyThemAllInstructionAccounts = {
  funder: web3.PublicKey;
  owner: web3.PublicKey;
  position: web3.PublicKey;
  fanout: web3.PublicKey;
  positionMint: web3.PublicKey;
  positionTokenAccount: web3.PublicKey;
  nposition: web3.PublicKey;
  npositionMint: web3.PublicKey;
  npositionTokenAccount: web3.PublicKey;
  whirlpool: web3.PublicKey;
  tokenProgram?: web3.PublicKey;
  associatedTokenProgram: web3.PublicKey;
  whirlpoolProgram: web3.PublicKey;
  rewardVault: web3.PublicKey;
  rewardOwnerAccount: web3.PublicKey;
  tokenVaultA: web3.PublicKey;
  tokenVaultB: web3.PublicKey;
  membershipVoucher: web3.PublicKey;
  tokenAccountA: web3.PublicKey;
  tokenAccountB: web3.PublicKey;
  tickArrayUpper: web3.PublicKey;
  tickArrayLower: web3.PublicKey;
  ntickArrayUpper: web3.PublicKey;
  ntickArrayLower: web3.PublicKey;
  user: web3.PublicKey;
  systemProgram?: web3.PublicKey;
  rent?: web3.PublicKey;
  anchorRemainingAccounts?: web3.AccountMeta[];
};

export const emptyThemAllInstructionDiscriminator = [229, 174, 241, 178, 173, 157, 253, 20];

/**
 * Creates a _EmptyThemAll_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category EmptyThemAll
 * @category generated
 */
export function createEmptyThemAllInstruction(
  accounts: EmptyThemAllInstructionAccounts,
  args: EmptyThemAllInstructionArgs,
  programId = new web3.PublicKey('4FaasgwTwZnDjzWnduUF3Jsw4zrxBhBMNHRATEAKHWU6'),
) {
  const [data] = emptyThemAllStruct.serialize({
    instructionDiscriminator: emptyThemAllInstructionDiscriminator,
    ...args,
  });
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.funder,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.owner,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.position,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.fanout,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.positionMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.positionTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nposition,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.npositionMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.npositionTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.whirlpool,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.associatedTokenProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.whirlpoolProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rewardVault,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.rewardOwnerAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenVaultA,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenVaultB,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.membershipVoucher,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenAccountA,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenAccountB,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tickArrayUpper,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tickArrayLower,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.ntickArrayUpper,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.ntickArrayLower,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.user,
      isWritable: false,
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
