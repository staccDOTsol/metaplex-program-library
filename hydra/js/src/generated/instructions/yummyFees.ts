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
 * @category YummyFees
 * @category generated
 */
export const yummyFeesStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */;
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'YummyFeesInstructionArgs',
);
/**
 * Accounts required by the _yummyFees_ instruction
 *
 * @property [_writable_, **signer**] funder
 * @property [_writable_] owner
 * @property [_writable_] position
 * @property [_writable_] positionMint
 * @property [_writable_] positionTokenAccount
 * @property [_writable_] whirlpool
 * @property [] associatedTokenProgram
 * @property [] whirlpoolProgram
 * @property [_writable_] tokenVaultA
 * @property [_writable_] tokenVaultB
 * @property [_writable_] tokenAccountA
 * @property [_writable_] tokenAccountB
 * @property [] user
 * @category Instructions
 * @category YummyFees
 * @category generated
 */
export type YummyFeesInstructionAccounts = {
  funder: web3.PublicKey;
  owner: web3.PublicKey;
  position: web3.PublicKey;
  positionMint: web3.PublicKey;
  positionTokenAccount: web3.PublicKey;
  whirlpool: web3.PublicKey;
  tokenProgram?: web3.PublicKey;
  associatedTokenProgram: web3.PublicKey;
  whirlpoolProgram: web3.PublicKey;
  tokenVaultA: web3.PublicKey;
  tokenVaultB: web3.PublicKey;
  tokenAccountA: web3.PublicKey;
  tokenAccountB: web3.PublicKey;
  user: web3.PublicKey;
  anchorRemainingAccounts?: web3.AccountMeta[];
};

export const yummyFeesInstructionDiscriminator = [4, 170, 13, 142, 201, 217, 169, 161];

/**
 * Creates a _YummyFees_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category YummyFees
 * @category generated
 */
export function createYummyFeesInstruction(
  accounts: YummyFeesInstructionAccounts,
  programId = new web3.PublicKey('4FaasgwTwZnDjzWnduUF3Jsw4zrxBhBMNHRATEAKHWU6'),
) {
  const [data] = yummyFeesStruct.serialize({
    instructionDiscriminator: yummyFeesInstructionDiscriminator,
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
      pubkey: accounts.user,
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
