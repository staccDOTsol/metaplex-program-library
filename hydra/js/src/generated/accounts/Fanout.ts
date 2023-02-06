/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
import { MembershipModel, membershipModelBeet } from '../types/MembershipModel';

/**
 * Arguments used to create {@link Fanout}
 * @category Accounts
 * @category generated
 */
export type FanoutArgs = {
  authority: web3.PublicKey;
  name: string;
  accountKey: web3.PublicKey;
  totalShares: beet.bignum;
  totalMembers: beet.bignum;
  totalInflow: beet.bignum;
  lastSnapshotAmount: beet.bignum;
  bumpSeed: number;
  accountOwnerBumpSeed: number;
  totalAvailableShares: beet.bignum;
  membershipModel: MembershipModel;
  membershipMint: beet.COption<web3.PublicKey>;
  totalStakedShares: beet.COption<beet.bignum>;
  whirlpool: web3.PublicKey;
  whirlpool2: web3.PublicKey;
  whirlpool3: web3.PublicKey;
  whirlpool4: web3.PublicKey;
};

export const fanoutDiscriminator = [164, 101, 210, 92, 222, 14, 75, 156];
/**
 * Holds the data for the {@link Fanout} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class Fanout implements FanoutArgs {
  private constructor(
    readonly authority: web3.PublicKey,
    readonly name: string,
    readonly accountKey: web3.PublicKey,
    readonly totalShares: beet.bignum,
    readonly totalMembers: beet.bignum,
    readonly totalInflow: beet.bignum,
    readonly lastSnapshotAmount: beet.bignum,
    readonly bumpSeed: number,
    readonly accountOwnerBumpSeed: number,
    readonly totalAvailableShares: beet.bignum,
    readonly membershipModel: MembershipModel,
    readonly membershipMint: beet.COption<web3.PublicKey>,
    readonly totalStakedShares: beet.COption<beet.bignum>,
    readonly whirlpool: web3.PublicKey,
    readonly whirlpool2: web3.PublicKey,
    readonly whirlpool3: web3.PublicKey,
    readonly whirlpool4: web3.PublicKey,
  ) {}

  /**
   * Creates a {@link Fanout} instance from the provided args.
   */
  static fromArgs(args: FanoutArgs) {
    return new Fanout(
      args.authority,
      args.name,
      args.accountKey,
      args.totalShares,
      args.totalMembers,
      args.totalInflow,
      args.lastSnapshotAmount,
      args.bumpSeed,
      args.accountOwnerBumpSeed,
      args.totalAvailableShares,
      args.membershipModel,
      args.membershipMint,
      args.totalStakedShares,
      args.whirlpool,
      args.whirlpool2,
      args.whirlpool3,
      args.whirlpool4,
    );
  }

  /**
   * Deserializes the {@link Fanout} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset = 0): [Fanout, number] {
    return Fanout.deserialize(accountInfo.data, offset);
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link Fanout} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<Fanout> {
    const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
    if (accountInfo == null) {
      throw new Error(`Unable to find Fanout account at ${address}`);
    }
    return Fanout.fromAccountInfo(accountInfo, 0)[0];
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey('4FaasgwTwZnDjzWnduUF3Jsw4zrxBhBMNHRATEAKHWU6'),
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, fanoutBeet);
  }

  /**
   * Deserializes the {@link Fanout} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [Fanout, number] {
    return fanoutBeet.deserialize(buf, offset);
  }

  /**
   * Serializes the {@link Fanout} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return fanoutBeet.serialize({
      accountDiscriminator: fanoutDiscriminator,
      ...this,
    });
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link Fanout} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: FanoutArgs) {
    const instance = Fanout.fromArgs(args);
    return fanoutBeet.toFixedFromValue({
      accountDiscriminator: fanoutDiscriminator,
      ...instance,
    }).byteSize;
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link Fanout} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: FanoutArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(Fanout.byteSize(args), commitment);
  }

  /**
   * Returns a readable version of {@link Fanout} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      authority: this.authority.toBase58(),
      name: this.name,
      accountKey: this.accountKey.toBase58(),
      totalShares: (() => {
        const x = <{ toNumber: () => number }>this.totalShares;
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber();
          } catch (_) {
            return x;
          }
        }
        return x;
      })(),
      totalMembers: (() => {
        const x = <{ toNumber: () => number }>this.totalMembers;
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber();
          } catch (_) {
            return x;
          }
        }
        return x;
      })(),
      totalInflow: (() => {
        const x = <{ toNumber: () => number }>this.totalInflow;
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber();
          } catch (_) {
            return x;
          }
        }
        return x;
      })(),
      lastSnapshotAmount: (() => {
        const x = <{ toNumber: () => number }>this.lastSnapshotAmount;
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
      accountOwnerBumpSeed: this.accountOwnerBumpSeed,
      totalAvailableShares: (() => {
        const x = <{ toNumber: () => number }>this.totalAvailableShares;
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber();
          } catch (_) {
            return x;
          }
        }
        return x;
      })(),
      membershipModel: 'MembershipModel.' + MembershipModel[this.membershipModel],
      membershipMint: this.membershipMint,
      totalStakedShares: this.totalStakedShares,
      whirlpool: this.whirlpool.toBase58(),
      whirlpool2: this.whirlpool2.toBase58(),
      whirlpool3: this.whirlpool3.toBase58(),
      whirlpool4: this.whirlpool4.toBase58(),
    };
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const fanoutBeet = new beet.FixableBeetStruct<
  Fanout,
  FanoutArgs & {
    accountDiscriminator: number[] /* size: 8 */;
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['authority', beetSolana.publicKey],
    ['name', beet.utf8String],
    ['accountKey', beetSolana.publicKey],
    ['totalShares', beet.u64],
    ['totalMembers', beet.u64],
    ['totalInflow', beet.u64],
    ['lastSnapshotAmount', beet.u64],
    ['bumpSeed', beet.u8],
    ['accountOwnerBumpSeed', beet.u8],
    ['totalAvailableShares', beet.u64],
    ['membershipModel', membershipModelBeet],
    ['membershipMint', beet.coption(beetSolana.publicKey)],
    ['totalStakedShares', beet.coption(beet.u64)],
    ['whirlpool', beetSolana.publicKey],
    ['whirlpool2', beetSolana.publicKey],
    ['whirlpool3', beetSolana.publicKey],
    ['whirlpool4', beetSolana.publicKey],
  ],
  Fanout.fromArgs,
  'Fanout',
);
