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
 * @category ProcessUnstake
 * @category generated
 */
export const processUnstakeStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */;
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'ProcessUnstakeInstructionArgs',
);
/**
 * Accounts required by the _processUnstake_ instruction
 *
 * @property [_writable_, **signer**] member
 * @property [_writable_] fanout
 * @property [_writable_] membershipVoucher
 * @property [_writable_] membershipMint
 * @property [_writable_] membershipMintTokenAccount
 * @property [_writable_] memberStakeAccount
 * @property [] instructions
 * @category Instructions
 * @category ProcessUnstake
 * @category generated
 */
export type ProcessUnstakeInstructionAccounts = {
  member: web3.PublicKey;
  fanout: web3.PublicKey;
  membershipVoucher: web3.PublicKey;
  membershipMint: web3.PublicKey;
  membershipMintTokenAccount: web3.PublicKey;
  memberStakeAccount: web3.PublicKey;
  systemProgram?: web3.PublicKey;
  tokenProgram?: web3.PublicKey;
  instructions: web3.PublicKey;
  anchorRemainingAccounts?: web3.AccountMeta[];
};

export const processUnstakeInstructionDiscriminator = [217, 160, 136, 174, 149, 62, 79, 133];

/**
 * Creates a _ProcessUnstake_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category ProcessUnstake
 * @category generated
 */
export function createProcessUnstakeInstruction(
  accounts: ProcessUnstakeInstructionAccounts,
  programId = new web3.PublicKey('hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg'),
) {
  const [data] = processUnstakeStruct.serialize({
    instructionDiscriminator: processUnstakeInstructionDiscriminator,
  });
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.member,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.fanout,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.membershipVoucher,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.membershipMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.membershipMintTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.memberStakeAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.instructions,
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
