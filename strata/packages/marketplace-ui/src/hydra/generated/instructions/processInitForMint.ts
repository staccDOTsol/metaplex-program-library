/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';

/**
 * @category Instructions
 * @category ProcessInitForMint
 * @category generated
 */
export type ProcessInitForMintInstructionArgs = {
  bumpSeed: number;
  whirlpool: web3.PublicKey;
  whirlpool2: web3.PublicKey;
  whirlpool3: web3.PublicKey;
  whirlpool4: web3.PublicKey;
};
/**
 * @category Instructions
 * @category ProcessInitForMint
 * @category generated
 */
export const processInitForMintStruct = new beet.BeetArgsStruct<
  ProcessInitForMintInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */;
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bumpSeed', beet.u8],
    ['whirlpool', beetSolana.publicKey],
    ['whirlpool2', beetSolana.publicKey],
    ['whirlpool3', beetSolana.publicKey],
    ['whirlpool4', beetSolana.publicKey],
  ],
  'ProcessInitForMintInstructionArgs',
);
/**
 * Accounts required by the _processInitForMint_ instruction
 *
 * @property [_writable_, **signer**] authority
 * @property [_writable_] fanout
 * @property [_writable_] fanoutForMint
 * @property [_writable_] mintHoldingAccount
 * @property [_writable_] membershipMint
 * @property [] mint
 * @category Instructions
 * @category ProcessInitForMint
 * @category generated
 */
export type ProcessInitForMintInstructionAccounts = {
  authority: web3.PublicKey;
  fanout: web3.PublicKey;
  fanoutForMint: web3.PublicKey;
  mintHoldingAccount: web3.PublicKey;
  membershipMint: web3.PublicKey;
  rent?: web3.PublicKey;
  systemProgram?: web3.PublicKey;
  tokenProgram?: web3.PublicKey;
  mint: web3.PublicKey;
  anchorRemainingAccounts?: web3.AccountMeta[];
};

export const processInitForMintInstructionDiscriminator = [140, 150, 232, 195, 93, 219, 35, 170];

/**
 * Creates a _ProcessInitForMint_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category ProcessInitForMint
 * @category generated
 */
export function createProcessInitForMintInstruction(
  accounts: ProcessInitForMintInstructionAccounts,
  args: ProcessInitForMintInstructionArgs,
  programId = new web3.PublicKey('5G76ijPLinxx8tZai4hYkhoBkb2QidrX9BuJiEpuJhs7'),
) {
  const [data] = processInitForMintStruct.serialize({
    instructionDiscriminator: processInitForMintInstructionDiscriminator,
    ...args,
  });
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.authority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.fanout,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.fanoutForMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.mintHoldingAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.membershipMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
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
      pubkey: accounts.mint,
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