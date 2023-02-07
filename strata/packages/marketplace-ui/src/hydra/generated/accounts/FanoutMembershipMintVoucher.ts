/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';

/**
 * Arguments used to create {@link FanoutMembershipMintVoucher}
 * @category Accounts
 * @category generated
 */
export type FanoutMembershipMintVoucherArgs = {
  fanout: web3.PublicKey;
  fanoutMint: web3.PublicKey;
  lastInflow: beet.bignum;
  bumpSeed: number;
};

export const fanoutMembershipMintVoucherDiscriminator = [185, 33, 118, 173, 147, 114, 126, 181];
/**
 * Holds the data for the {@link FanoutMembershipMintVoucher} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class FanoutMembershipMintVoucher implements FanoutMembershipMintVoucherArgs {
  private constructor(
    readonly fanout: web3.PublicKey,
    readonly fanoutMint: web3.PublicKey,
    readonly lastInflow: beet.bignum,
    readonly bumpSeed: number,
  ) {}

  /**
   * Creates a {@link FanoutMembershipMintVoucher} instance from the provided args.
   */
  static fromArgs(args: FanoutMembershipMintVoucherArgs) {
    return new FanoutMembershipMintVoucher(
      args.fanout,
      args.fanoutMint,
      args.lastInflow,
      args.bumpSeed,
    );
  }

  /**
   * Deserializes the {@link FanoutMembershipMintVoucher} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [FanoutMembershipMintVoucher, number] {
    return FanoutMembershipMintVoucher.deserialize(accountInfo.data, offset);
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link FanoutMembershipMintVoucher} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<FanoutMembershipMintVoucher> {
    const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
    if (accountInfo == null) {
      throw new Error(`Unable to find FanoutMembershipMintVoucher account at ${address}`);
    }
    return FanoutMembershipMintVoucher.fromAccountInfo(accountInfo, 0)[0];
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey('91TwXG4wTqJSm6GU8yn2AfBaTqvRi8XPurpkHHNVU7z4'),
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, fanoutMembershipMintVoucherBeet);
  }

  /**
   * Deserializes the {@link FanoutMembershipMintVoucher} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [FanoutMembershipMintVoucher, number] {
    return fanoutMembershipMintVoucherBeet.deserialize(buf, offset);
  }

  /**
   * Serializes the {@link FanoutMembershipMintVoucher} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return fanoutMembershipMintVoucherBeet.serialize({
      accountDiscriminator: fanoutMembershipMintVoucherDiscriminator,
      ...this,
    });
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link FanoutMembershipMintVoucher}
   */
  static get byteSize() {
    return fanoutMembershipMintVoucherBeet.byteSize;
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link FanoutMembershipMintVoucher} data from rent
   *
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      FanoutMembershipMintVoucher.byteSize,
      commitment,
    );
  }

  /**
   * Determines if the provided {@link Buffer} has the correct byte size to
   * hold {@link FanoutMembershipMintVoucher} data.
   */
  static hasCorrectByteSize(buf: Buffer, offset = 0) {
    return buf.byteLength - offset === FanoutMembershipMintVoucher.byteSize;
  }

  /**
   * Returns a readable version of {@link FanoutMembershipMintVoucher} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      fanout: this.fanout.toBase58(),
      fanoutMint: this.fanoutMint.toBase58(),
      lastInflow: (() => {
        const x = <{ toNumber: () => number }>this.lastInflow;
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber();
          } catch (_) {
            return x;
          }
        }
        return x;
      })(),
      bumpSeed: this.bumpSeed,
    };
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const fanoutMembershipMintVoucherBeet = new beet.BeetStruct<
  FanoutMembershipMintVoucher,
  FanoutMembershipMintVoucherArgs & {
    accountDiscriminator: number[] /* size: 8 */;
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['fanout', beetSolana.publicKey],
    ['fanoutMint', beetSolana.publicKey],
    ['lastInflow', beet.u64],
    ['bumpSeed', beet.u8],
  ],
  FanoutMembershipMintVoucher.fromArgs,
  'FanoutMembershipMintVoucher',
);
