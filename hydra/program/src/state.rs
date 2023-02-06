use anchor_lang::prelude::*;
use std::default::Default;

pub const HOLDING_ACCOUNT_SIZE: usize = 1;


#[account]
#[derive(Default)]
pub struct Whirlpool {
    pub whirlpools_config: Pubkey, // 32
    pub whirlpool_bump: [u8; 1],   // 1

    pub tick_spacing: u16,          // 2
    pub tick_spacing_seed: [u8; 2], // 2

    // Stored as hundredths of a basis point
    // u16::MAX corresponds to ~6.5%
    pub fee_rate: u16, // 2

    // Portion of fee rate taken stored as basis points
    pub protocol_fee_rate: u16, // 2

    // Maximum amount that can be held by Solana account
    pub liquidity: u128, // 16

    // MAX/MIN at Q32.64, but using Q64.64 for rounder bytes
    // Q64.64
    pub sqrt_price: u128,        // 16
    pub tick_current_index: i32, // 4

    pub protocol_fee_owed_a: u64, // 8
    pub protocol_fee_owed_b: u64, // 8

    pub token_mint_a: Pubkey,  // 32
    pub token_vault_a: Pubkey, // 32

    // Q64.64
    pub fee_growth_global_a: u128, // 16

    pub token_mint_b: Pubkey,  // 32
    pub token_vault_b: Pubkey, // 32

    // Q64.64
    pub fee_growth_global_b: u128, // 16

    pub reward_last_updated_timestamp: u64, // 8

    pub reward_infos: [WhirlpoolRewardInfo; NUM_REWARDS], // 384
}

// Number of rewards supported by Whirlpools
pub const NUM_REWARDS: usize = 3;

/// Stores the state relevant for tracking liquidity mining rewards at the `Whirlpool` level.
/// These values are used in conjunction with `PositionRewardInfo`, `Tick.reward_growths_outside`,
/// and `Whirlpool.reward_last_updated_timestamp` to determine how many rewards are earned by open
/// positions.
#[derive(Copy, Clone, AnchorSerialize, AnchorDeserialize, Default, Debug, PartialEq)]
pub struct WhirlpoolRewardInfo {
    /// Reward token mint.
    pub mint: Pubkey,
    /// Reward vault token account.
    pub vault: Pubkey,
    /// Authority account that has permission to initialize the reward and set emissions.
    pub authority: Pubkey,
    /// Q64.64 number that indicates how many tokens per second are earned per unit of liquidity.
    pub emissions_per_second_x64: u128,
    /// Q64.64 number that tracks the total tokens earned per unit of liquidity since the reward
    /// emissions were turned on.
    pub growth_global_x64: u128,
}

impl WhirlpoolRewardInfo {
    /// Creates a new `WhirlpoolRewardInfo` with the authority set
    pub fn new(authority: Pubkey) -> Self {
        Self {
            authority,
            ..Default::default()
        }
    }

    /// Returns true if this reward is initialized.
    /// Once initialized, a reward cannot transition back to uninitialized.
    pub fn initialized(&self) -> bool {
        self.mint.ne(&Pubkey::default())
    }

    /// Maps all reward data to only the reward growth accumulators
    pub fn to_reward_growths(
        reward_infos: &[WhirlpoolRewardInfo; NUM_REWARDS],
    ) -> [u128; NUM_REWARDS] {
        let mut reward_growths = [0u128; NUM_REWARDS];
        for i in 0..NUM_REWARDS {
            reward_growths[i] = reward_infos[i].growth_global_x64;
        }
        reward_growths
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct WhirlpoolBumps {
    pub whirlpool_bump: u8,
}

#[test]
fn test_whirlpool_reward_info_not_initialized() {
    let reward_info = WhirlpoolRewardInfo::default();
    assert_eq!(reward_info.initialized(), false);
}

#[test]
fn test_whirlpool_reward_info_initialized() {
    let reward_info = &mut WhirlpoolRewardInfo::default();
    reward_info.mint = Pubkey::new_unique();
    assert_eq!(reward_info.initialized(), true);
}

#[cfg(test)]
pub mod whirlpool_builder {
    use super::{Whirlpool, WhirlpoolRewardInfo, NUM_REWARDS};

    #[derive(Default)]
    pub struct WhirlpoolBuilder {
        liquidity: u128,
        tick_spacing: u16,
        tick_current_index: i32,
        sqrt_price: u128,
        fee_rate: u16,
        protocol_fee_rate: u16,
        fee_growth_global_a: u128,
        fee_growth_global_b: u128,
        reward_last_updated_timestamp: u64,
        reward_infos: [WhirlpoolRewardInfo; NUM_REWARDS],
    }

    impl WhirlpoolBuilder {
        pub fn new() -> Self {
            Self {
                reward_infos: [WhirlpoolRewardInfo::default(); NUM_REWARDS],
                ..Default::default()
            }
        }

        pub fn liquidity(mut self, liquidity: u128) -> Self {
            self.liquidity = liquidity;
            self
        }

        pub fn reward_last_updated_timestamp(mut self, reward_last_updated_timestamp: u64) -> Self {
            self.reward_last_updated_timestamp = reward_last_updated_timestamp;
            self
        }

        pub fn reward_info(mut self, index: usize, reward_info: WhirlpoolRewardInfo) -> Self {
            self.reward_infos[index] = reward_info;
            self
        }

        pub fn reward_infos(mut self, reward_infos: [WhirlpoolRewardInfo; NUM_REWARDS]) -> Self {
            self.reward_infos = reward_infos;
            self
        }

        pub fn tick_spacing(mut self, tick_spacing: u16) -> Self {
            self.tick_spacing = tick_spacing;
            self
        }

        pub fn tick_current_index(mut self, tick_current_index: i32) -> Self {
            self.tick_current_index = tick_current_index;
            self
        }

        pub fn sqrt_price(mut self, sqrt_price: u128) -> Self {
            self.sqrt_price = sqrt_price;
            self
        }

        pub fn fee_growth_global_a(mut self, fee_growth_global_a: u128) -> Self {
            self.fee_growth_global_a = fee_growth_global_a;
            self
        }

        pub fn fee_growth_global_b(mut self, fee_growth_global_b: u128) -> Self {
            self.fee_growth_global_b = fee_growth_global_b;
            self
        }

        pub fn fee_rate(mut self, fee_rate: u16) -> Self {
            self.fee_rate = fee_rate;
            self
        }

        pub fn protocol_fee_rate(mut self, protocol_fee_rate: u16) -> Self {
            self.protocol_fee_rate = protocol_fee_rate;
            self
        }

        pub fn build(self) -> Whirlpool {
            Whirlpool {
                liquidity: self.liquidity,
                reward_last_updated_timestamp: self.reward_last_updated_timestamp,
                reward_infos: self.reward_infos,
                tick_current_index: self.tick_current_index,
                sqrt_price: self.sqrt_price,
                tick_spacing: self.tick_spacing,
                fee_growth_global_a: self.fee_growth_global_a,
                fee_growth_global_b: self.fee_growth_global_b,
                fee_rate: self.fee_rate,
                protocol_fee_rate: self.protocol_fee_rate,
                ..Default::default()
            }
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum MembershipModel {
    Wallet = 0,
    Token = 1,
    NFT = 2,
}

impl Default for MembershipModel {
    fn default() -> Self {
        MembershipModel::Wallet
    }
}

#[account]
#[derive(Default)]
pub struct Fanout {
    pub authority: Pubkey,                 //32
    pub name: String,                      //50
    pub account_key: Pubkey,               //32
    pub total_shares: u64,                 //8
    pub total_members: u64,                //8
    pub total_inflow: u64,                 //8
    pub last_snapshot_amount: u64,         //8
    pub bump_seed: u8,                     //1
    pub account_owner_bump_seed: u8,       //1
    pub total_available_shares: u64,       //8
    pub membership_model: MembershipModel, //1
    pub membership_mint: Option<Pubkey>,   //32
    pub total_staked_shares: Option<u64>,  //4
    pub whirlpool: Pubkey,
    pub whirlpool2: Pubkey,
    pub whirlpool3: Pubkey,
    pub whirlpool4: Pubkey,
                                   // 
}

#[account]
#[derive(Default)]
pub struct FanoutMint {
    pub mint: Pubkey,              //32
    pub fanout: Pubkey,            //32
    pub token_account: Pubkey,     //32
    pub total_inflow: u64,         //8
    pub last_snapshot_amount: u64, //8
    pub bump_seed: u8,             //1
    pub whirlpool: Pubkey,
    pub whirlpool2: Pubkey,
    pub whirlpool3: Pubkey,
    pub whirlpool4: Pubkey,
                                   // +50 padding
}

pub const FANOUT_MEMBERSHIP_VOUCHER_SIZE: usize = 32 + 8 + 8 + 1 + 32 + 8 + 64;
#[account]
#[derive(Default, Debug)]
pub struct FanoutMembershipVoucher {
    pub fanout: Pubkey,
    pub total_inflow: u64,
    pub last_inflow: u64,
    pub bump_seed: u8,
    pub membership_key: Pubkey,
    pub shares: u64,
}

pub const FANOUT_MINT_MEMBERSHIP_VOUCHER_SIZE: usize = 32 + 32 + 8 + 1 + 32;
#[account]
#[derive(Default)]
pub struct FanoutMembershipMintVoucher {
    pub fanout: Pubkey,
    pub fanout_mint: Pubkey,
    pub last_inflow: u64,
    pub bump_seed: u8,
}
