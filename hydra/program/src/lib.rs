pub mod error;
pub mod processors;

pub mod state;
pub mod utils;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use processors::*;
use state::{MembershipModel, Fanout, FanoutMembershipVoucher,};
use whirlpools::program::Whirlpool as wpid;
use whirlpools::{Position, TickArray};
use whirlpools::state::Whirlpool;
declare_id!("91TwXG4wTqJSm6GU8yn2AfBaTqvRi8XPurpkHHNVU7z4");
#[program]
pub mod hydra {


    use super::*;

    pub fn process_init(
        ctx: Context<InitializeFanout>,
        args: InitializeFanoutArgs,
        model: MembershipModel,
        whirlpool: Pubkey,
         whirlpool2: Pubkey,
         whirlpool3: Pubkey,
         whirlpool4: Pubkey,
                                       // 
    ) -> Result<()> {
        init(ctx, args, model, whirlpool,whirlpool2,whirlpool3,whirlpool4)
    }

    pub fn process_init_for_mint(
        ctx: Context<InitializeFanoutForMint>,
        bump_seed: u8,
        whirlpool: Pubkey,
        whirlpool2: Pubkey,
        whirlpool3: Pubkey,
        whirlpool4: Pubkey,
    ) -> Result<()> {
        init_for_mint(ctx, bump_seed, whirlpool,whirlpool2,whirlpool3,whirlpool4)
    }

    pub fn process_set_token_member_stake(
        ctx: Context<SetTokenMemberStake>,
        shares: u64,
    ) -> Result<()> {
        set_token_member_stake(ctx, shares)
    }

    pub fn process_set_for_token_member_stake(
        ctx: Context<SetForTokenMemberStake>,
        shares: u64,
    ) -> Result<()> {
        set_for_token_member_stake(ctx, shares)
    }

    pub fn process_distribute_token(
        ctx: Context<DistributeTokenMember>,
        distribute_for_mint: bool,
    ) -> Result<()> {
        distribute_for_token(ctx, distribute_for_mint)
    }


    pub fn process_transfer_shares(ctx: Context<TransferShares>, shares: u64) -> Result<()> {
        transfer_shares(ctx, shares)
    }

    pub fn process_unstake(ctx: Context<UnStakeTokenMember>) -> Result<()> {
        unstake(ctx)
    }

    pub fn check_position(ctx: Context<CheckPosition>, tick_spacing: i32) -> Result<()> {
        let whirlpool = &ctx.accounts.whirlpool;
        let position = &ctx.accounts.position;
        let user = &mut ctx.accounts.user;

        let tick_lower_index = &whirlpool.tick_current_index
            - &whirlpool.tick_current_index % tick_spacing
            - tick_spacing * 2;
        let tick_upper_index = &whirlpool.tick_current_index
            - &whirlpool.tick_current_index % tick_spacing
            + tick_spacing * 2;
        let tlip = position.tick_lower_index;
        let tuip = position.tick_upper_index;
        // on start we init, hab a mint. we hab other mints lined up.
        if tlip != tick_lower_index || tuip != tick_upper_index {
            // we burn an nft, create a new one. set our current thread
            // old nft.. we burn it
            user.empty = true;
            user.rewards = true;
            user.fees = true;

            user.open = true;
            drop(user);
            // wish us the luck...
        }
        Ok(())
    }
    pub fn open_position(ctx: Context<OpenPositions>, bump: u8, tick_spacing: i32, position_bump: u8) -> Result<()> {
        let whirlpool = &ctx.accounts.whirlpool;

        let tick_lower_index = &whirlpool.tick_current_index
            - &whirlpool.tick_current_index % tick_spacing
            - tick_spacing * 2;
        let tick_upper_index = &whirlpool.tick_current_index
            - &whirlpool.tick_current_index % tick_spacing
            + tick_spacing * 2;
        msg!(&tick_lower_index.to_string().to_owned());
        msg!(&tick_upper_index.to_string().to_owned());
        let whirlpool = &ctx.accounts.whirlpool;

        let nposition = &ctx.accounts.position;
        let nposition_mint = &ctx.accounts.position_mint;
        let nposition_token_account = &ctx.accounts.position_token_account;

        let tick_lower_index = &whirlpool.tick_current_index
            - &whirlpool.tick_current_index % whirlpool.tick_spacing as i32
            - whirlpool.tick_spacing as i32 * 2;
        let tick_upper_index = &whirlpool.tick_current_index
            - &whirlpool.tick_current_index % whirlpool.tick_spacing as i32
            + whirlpool.tick_spacing as i32 * 2;
        msg!(&tick_lower_index.to_string().to_owned());
        msg!(&tick_upper_index.to_string().to_owned());
        let seeds = [b"fanout-membership", ctx.accounts.membership_voucher.fanout.as_ref(), 
        ctx.accounts.membership_voucher.membership_key.as_ref(),
        &[ctx.accounts.membership_voucher.bump_seed],
        ];
        whirlpools::cpi::open_position(
            CpiContext::new_with_signer(
                ctx.accounts.whirlpool_program.to_account_info(),
                whirlpools::cpi::accounts::OpenPosition {
                    associated_token_program: ctx
                        .accounts
                        .associated_token_program
                        .to_account_info(),
                    funder: ctx.accounts.funder.to_account_info(),
                    owner : ctx.accounts.membership_voucher.to_account_info(),
                    position: nposition.to_account_info(),
                    position_mint: nposition_mint.to_account_info(),
                    position_token_account: nposition_token_account.to_account_info(),
                    whirlpool: whirlpool.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },&[&seeds],
            ),
            whirlpools::OpenPositionBumps {
                position_bump: bump,
            },
            tick_lower_index,
            tick_upper_index,
        )?;
        Ok(())
    }
    pub fn increase_liquidity(
        ctx: Context<IncreaseLiq>,
        _bump: u8,
        _tick_spacing: i32,
        shares: u64
    ) -> Result<()> {
        let nposition = &ctx.accounts.position;
        let nposition_token_account = &ctx.accounts.position_token_account;
        let seeds = [b"fanout-membership", ctx.accounts.membership_voucher.fanout.as_ref(), 
        ctx.accounts.membership_voucher.membership_key.as_ref(),
        &[ctx.accounts.membership_voucher.bump_seed],
        ];
        let whirlpool = &ctx.accounts.whirlpool;
        whirlpools::cpi::increase_liquidity(
            CpiContext::new_with_signer(
                ctx.accounts.whirlpool_program.to_account_info(),
                whirlpools::cpi::accounts::IncreaseLiquidity {
                    position_authority: ctx.accounts.position_authority.to_account_info(),

                    token_owner_account_a: ctx.accounts.token_owner_account_a.to_account_info(),

                    token_owner_account_b: ctx.accounts.token_owner_account_b.to_account_info(),
                    token_vault_a: ctx.accounts.token_vault_a.to_account_info(),
                    token_vault_b: ctx.accounts.token_vault_b.to_account_info(),

                    tick_array_lower: ctx.accounts.tick_array_lower.to_account_info(),
                    tick_array_upper: ctx.accounts.tick_array_upper.to_account_info(),
                    position: nposition.to_account_info(),
                    position_token_account: nposition_token_account.to_account_info(),
                    whirlpool: whirlpool.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                },
               &[&seeds],
            ),
            shares.into(),
            shares.into(),
            0,
        )?;
        Ok(())
    }
    pub fn empty_them_all(ctx: Context<EmptyThemAll>, _bump: u8) -> Result<()> {
        let whirlpool = &ctx.accounts.whirlpool;
        if true {
            let position = &ctx.accounts.position;
            let position_token_account = &ctx.accounts.position_token_account;
            let seeds = [b"fanout-membership", ctx.accounts.membership_voucher.fanout.as_ref(), 
        ctx.accounts.membership_voucher.membership_key.as_ref(),
        &[ctx.accounts.membership_voucher.bump_seed],
        ];
            whirlpools::cpi::decrease_liquidity(
                CpiContext::new_with_signer(
                    ctx.accounts.whirlpool_program.to_account_info(),
                    whirlpools::cpi::accounts::DecreaseLiquidity {
                        position_authority: ctx.accounts.membership_voucher.to_account_info(),

                        token_owner_account_a: ctx.accounts.token_account_a.to_account_info(),

                        token_owner_account_b: ctx.accounts.token_account_b.to_account_info(),
                        token_vault_a: ctx.accounts.token_vault_a.to_account_info(),
                        token_vault_b: ctx.accounts.token_vault_b.to_account_info(),

                        tick_array_lower: ctx.accounts.tick_array_lower.to_account_info(),
                        tick_array_upper: ctx.accounts.tick_array_upper.to_account_info(),
                        position: position.to_account_info(),
                        position_token_account: position_token_account.to_account_info(),
                        whirlpool: whirlpool.to_account_info(),
                        token_program: ctx.accounts.token_program.to_account_info(),
                    },
               &[&seeds],
                ),
                position.liquidity,
                0,
                0,
            )?;

            let position = &ctx.accounts.position;
            let position_token_account = &ctx.accounts.position_token_account;
            
            let whirlpool = &ctx.accounts.whirlpool;
            whirlpools::cpi::collect_reward(
                CpiContext::new_with_signer(
                    ctx.accounts.whirlpool_program.to_account_info(),
                    whirlpools::cpi::accounts::CollectReward {
                        position_authority: ctx.accounts.membership_voucher.to_account_info(),
                        position: position.to_account_info(),
                        reward_owner_account: ctx.accounts.reward_owner_account.to_account_info(),
                        reward_vault: ctx.accounts.reward_vault.to_account_info(),
                        position_token_account: position_token_account.to_account_info(),
                        token_program: ctx.accounts.token_program.to_account_info(),
                        whirlpool: whirlpool.to_account_info(),
                    },&[&seeds]),
                

                0,
            )?;

            whirlpools::cpi::collect_fees(CpiContext::new_with_signer(
                ctx.accounts.whirlpool_program.to_account_info(),
                whirlpools::cpi::accounts::CollectFees {
                    position_authority: ctx.accounts.membership_voucher.to_account_info(),
                    position: position.to_account_info(),
                    position_token_account: position_token_account.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),

                    token_owner_account_a: ctx.accounts.token_account_a.to_account_info(),

                    token_owner_account_b: ctx.accounts.token_account_b.to_account_info(),
                    token_vault_a: ctx.accounts.token_vault_a.to_account_info(),
                    token_vault_b: ctx.accounts.token_vault_b.to_account_info(),
                    whirlpool: whirlpool.to_account_info(),
                },
            &[&seeds]),
     )?;
        }

        Ok(())
    }
    pub fn close_position(ctx: Context<ClosePositions>, _bump: u8) -> Result<()> {
        let user = &mut ctx.accounts.user;
        let seeds = [b"fanout-membership", ctx.accounts.membership_voucher.fanout.as_ref(), 
        ctx.accounts.membership_voucher.membership_key.as_ref(),
        &[ctx.accounts.membership_voucher.bump_seed],
        ];
        if true {
            let position = &ctx.accounts.position;
            let position_mint = &ctx.accounts.position_mint;
            let position_token_account = &ctx.accounts.position_token_account;

            whirlpools::cpi::close_position(CpiContext::new_with_signer(
                ctx.accounts.whirlpool_program.to_account_info(),
                whirlpools::cpi::accounts::ClosePosition {
                    position_authority: ctx.accounts.membership_voucher.to_account_info(),
                    receiver: ctx.accounts.owner.to_account_info(),
                    position: position.to_account_info(),
                    position_mint: position_mint.to_account_info(),
                    position_token_account: position_token_account.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                },
                &[&seeds]
            ))?;

            user.empty = false;
            drop(user);
        }

        Ok(())
    }
}
#[derive(Accounts)]
#[instruction(bump: u8, position_bump: u8)]
pub struct OpenPositions<'info> {
    #[account(mut)]
    pub funder: Signer<'info>,
    /// CHECK:
    pub owner: UncheckedAccount<'info>,

    #[account(mut,
      seeds = [b"position".as_ref(), position_mint.key().as_ref()],
      bump = position_bump,
    )]
    pub position: UncheckedAccount<'info>,

    #[account(mut
    )]
    pub position_mint: UncheckedAccount<'info>,

    #[account(mut
    )]
    pub position_token_account: UncheckedAccount<'info>,

    pub whirlpool: Box<Account<'info, Whirlpool>>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub whirlpool_program: Program<'info, wpid>,
    #[account(mut)]
        pub membership_voucher: Account<'info, FanoutMembershipVoucher>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct IncreaseLiq<'info> {
    #[account(mut)]
    pub whirlpool: Account<'info, Whirlpool>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// CHECK:
    pub position_authority: UncheckedAccount<'info>,

    #[account(mut, has_one = whirlpool)]
    pub position: Account<'info, Position>,
    #[account(
        constraint = position_token_account.mint == position.position_mint,
        constraint = position_token_account.amount == 1
    )]
    pub position_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = token_owner_account_a.mint == whirlpool.token_mint_a)]
    pub token_owner_account_a: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint = token_owner_account_b.mint == whirlpool.token_mint_b)]
    pub token_owner_account_b: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = token_vault_a.key() == whirlpool.token_vault_a)]
    pub token_vault_a: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint = token_vault_b.key() == whirlpool.token_vault_b)]
    pub token_vault_b: Box<Account<'info, TokenAccount>>,

    #[account(mut, has_one = whirlpool)]
    pub tick_array_lower: AccountLoader<'info, TickArray>,
    #[account(mut, has_one = whirlpool)]
    pub tick_array_upper: AccountLoader<'info, TickArray>,

   
    pub system_program: Program<'info, System>,
    pub whirlpool_program: Program<'info, wpid>,

        pub membership_voucher: Account<'info, FanoutMembershipVoucher>,
}
#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct ClosePositions<'info> {
    #[account(mut)]
    /// CHECK: orca check
    pub funder: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK:
    pub owner: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: checked in orca
    pub position: Box<Account<'info, Position>>,

    #[account(mut)]
    /// CHECK:
    pub fanout: Account<'info, Fanout>,
    #[account(mut)]

    /// CHECK:
    pub position_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    /// CHECK:
    pub position_token_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub whirlpool: Box<Account<'info, Whirlpool>>,
    
    #[account(mut)]
        pub membership_voucher: Account<'info, FanoutMembershipVoucher>,
  
   
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub whirlpool_program: Program<'info, wpid>,
    #[account(seeds=[STATE_SEED,
        &whirlpool.key().to_bytes(), &owner.key().to_bytes()
           ], bump)]
    pub user: Box<Account<'info, UserState>>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct EmptyThemAll<'info> {
    #[account(mut)]
    /// CHECK: orca check
    pub funder: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK:
    pub owner: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: checked in orca
    pub position: Box<Account<'info, Position>>,

    #[account(mut)]
    /// CHECK:
    pub fanout: Account<'info, Fanout>,
    #[account(mut)]

    /// CHECK:
    pub position_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    /// CHECK:
    pub position_token_account: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK:
    pub nposition: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK:
    pub nposition_mint: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK:
    pub nposition_token_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub whirlpool: Box<Account<'info, Whirlpool>>,

   
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub whirlpool_program: Program<'info, wpid>,

    #[account(mut)]
    pub reward_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub reward_owner_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub token_vault_a: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub token_vault_b: Box<Account<'info, TokenAccount>>,
  
    #[account(mut)]
        pub membership_voucher: Account<'info, FanoutMembershipVoucher>,
    #[account(
    mut,
    constraint = token_account_a.owner == membership_voucher.key(),
    )]
    pub token_account_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_account_b: Box<Account<'info, TokenAccount>>,
    #[account(mut)]

    /// CHECK:
    pub tick_array_upper: UncheckedAccount<'info>,
    #[account(mut)]

    /// CHECK:
    pub tick_array_lower: UncheckedAccount<'info>,
    /// CHECK:
    pub ntick_array_upper: UncheckedAccount<'info>,
    #[account(mut)]

    /// CHECK:
    pub ntick_array_lower: UncheckedAccount<'info>,
    #[account(seeds=[STATE_SEED,
        &whirlpool.key().to_bytes(), &owner.key().to_bytes()
           ], bump)]
    pub user: Box<Account<'info, UserState>>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}


#[derive(Accounts)]
pub struct CheckPosition<'info> {
    #[account(mut)]
    /// CHECK:
    pub owner: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: checked in orca
    pub position: Box<Account<'info, Position>>,

    #[account(mut)]
    pub whirlpool: Box<Account<'info, Whirlpool>>,

    #[account(seeds=[STATE_SEED,
        &whirlpool.key().to_bytes(), &owner.key().to_bytes()
           ], bump)]
    pub user: Box<Account<'info, UserState>>,
}

const STATE_SEED: &[u8] = b"rockon";

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub whirlpool: Box<Account<'info, Whirlpool>>,
    #[account(init, payer=owner, space=69,seeds=[STATE_SEED,
 &whirlpool.key().to_bytes(), &owner.key().to_bytes()
    ], bump)]
    pub user: Box<Account<'info, UserState>>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct UserState {
    pub open: bool,
    pub empty: bool,
    pub rewards: bool,
    pub fees: bool,
}
