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
 * @category ProcessSetTokenMemberStake
 * @category generated
 */
export type ProcessSetTokenMemberStakeInstructionArgs = {
  shares: beet.bignum;
};
/**
 * @category Instructions
 * @category ProcessSetTokenMemberStake
 * @category generated
 */
export const processSetTokenMemberStakeStruct = new beet.BeetArgsStruct<
  ProcessSetTokenMemberStakeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */;
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['shares', beet.u64],
  ],
  'ProcessSetTokenMemberStakeInstructionArgs',
);
/**
 * Accounts required by the _processSetTokenMemberStake_ instruction
 *
 * @property [_writable_, **signer**] member
 * @property [_writable_] fanout
 * @property [_writable_] membershipVoucher
 * @property [_writable_] membershipMint
 * @property [_writable_] membershipMintTokenAccount
 * @property [_writable_] memberStakeAccount
 * @category Instructions
 * @category ProcessSetTokenMemberStake
 * @category generated
 */
export type ProcessSetTokenMemberStakeInstructionAccounts = {
  member: web3.PublicKey;
  fanout: web3.PublicKey;
  membershipVoucher: web3.PublicKey;
  membershipMint: web3.PublicKey;
  membershipMintTokenAccount: web3.PublicKey;
  memberStakeAccount: web3.PublicKey;
  systemProgram?: web3.PublicKey;
  tokenProgram?: web3.PublicKey;
  anchorRemainingAccounts?: web3.AccountMeta[];
};

export const processSetTokenMemberStakeInstructionDiscriminator = [
  167, 29, 12, 30, 44, 193, 249, 142,
];

/**
 * Creates a _ProcessSetTokenMemberStake_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category ProcessSetTokenMemberStake
 * @category generated
 */
export function createProcessSetTokenMemberStakeInstruction(
  accounts: ProcessSetTokenMemberStakeInstructionAccounts,
  args: ProcessSetTokenMemberStakeInstructionArgs,
  programId = new web3.PublicKey('91TwXG4wTqJSm6GU8yn2AfBaTqvRi8XPurpkHHNVU7z4'),
) {
  const [data] = processSetTokenMemberStakeStruct.serialize({
    instructionDiscriminator: processSetTokenMemberStakeInstructionDiscriminator,
    ...args,
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
