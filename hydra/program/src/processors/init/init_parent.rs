use crate::error::HydraError;
use crate::state::{Fanout, MembershipModel};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use whirlpools::program::Whirlpool as wpid;
use whirlpools::{FeeTier, Whirlpool, WhirlpoolBumps, WhirlpoolsConfig};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InitializeFanoutArgs {
    pub bump_seed: u8,
    pub native_account_bump_seed: u8,
    pub name: String,
    pub total_shares: u64,
    pub bumps: WhirlpoolBumps,
    pub tick_spacing: u16,
    pub initial_sqrt_price: u128,
    pub fee_rate: u16,
}

#[derive(Accounts)]
#[instruction(args: InitializeFanoutArgs)]
pub struct InitializeFanout<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
    init,
    space = 300,
    seeds = [b"fanout-config", args.name.as_bytes()],
    bump,
    payer = authority
    )]
    pub fanout: Account<'info, Fanout>,
    #[account(
    init,
    space = 1,
    seeds = [b"fanout-native-account", fanout.key().as_ref()],
    bump,
    payer = authority
    )
    ]
    /// CHECK: Native Account
    pub holding_account: UncheckedAccount<'info>,
    pub config: Box<Account<'info, WhirlpoolsConfig>>,
    pub whirlpool: Box<Account<'info, Whirlpool>>,
    pub token_vault_a: Box<Account<'info, TokenAccount>>,
    pub token_vault_b: Box<Account<'info, TokenAccount>>,
    pub fee_tier: Box<Account<'info, FeeTier>>,
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub whirlie_quote: Account<'info, Mint>,
    #[account(mut)]
    pub membership_mint: Account<'info, Mint>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub whirlpool_program: Program<'info, wpid>,
}
pub fn init(
    ctx: Context<InitializeFanout>,
    args: InitializeFanoutArgs,
    model: MembershipModel,
) -> Result<()> {
    let membership_mint = &ctx.accounts.membership_mint;
    let fanout = &mut ctx.accounts.fanout;
    fanout.authority = ctx.accounts.authority.to_account_info().key();
    fanout.account_key = ctx.accounts.holding_account.to_account_info().key();
    fanout.name = args.name;
    fanout.total_shares = args.total_shares;
    fanout.total_available_shares = args.total_shares;
    fanout.total_inflow = 0;
    fanout.last_snapshot_amount = fanout.total_inflow;
    fanout.bump_seed = args.bump_seed;
    fanout.membership_model = model;
    fanout.membership_mint = if membership_mint.key() == spl_token_2022::native_mint::id() {
        None
    } else {
        Some(membership_mint.key())
    };
    match fanout.membership_model {
        MembershipModel::Wallet | MembershipModel::NFT => {
            fanout.membership_mint = None;
            fanout.total_staked_shares = None;
        }
        MembershipModel::Token => {
            fanout.total_shares = membership_mint.supply;
            fanout.total_available_shares = 0;
            if fanout.membership_mint.is_none() {
                return Err(HydraError::MintAccountRequired.into());
            }
            let mint = &ctx.accounts.membership_mint;
            fanout.total_staked_shares = Some(0);
            if !mint.is_initialized {
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let accounts = anchor_spl::token::InitializeMint {
                    mint: mint.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                };
                let cpi_ctx = CpiContext::new(cpi_program, accounts);
                anchor_spl::token::initialize_mint(
                    cpi_ctx,
                    0,
                    &ctx.accounts.authority.to_account_info().key(),
                    Some(&ctx.accounts.authority.to_account_info().key()),
                )?;
            }

            let cpi_program = ctx.accounts.whirlpool_program.to_account_info();
            let accounts1 = whirlpools::cpi::accounts::InitializeConfig {
                config: ctx.accounts.config.to_account_info(),
                funder: ctx.accounts.authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            };

            let cpi_ctx1 = CpiContext::new(cpi_program.clone(), accounts1);
            whirlpools::cpi::initialize_config(
                cpi_ctx1,
                ctx.accounts.authority.key(),
                ctx.accounts.authority.key(),
                ctx.accounts.authority.key(),
                args.fee_rate,
            )?;
            let accounts = whirlpools::cpi::accounts::InitializePool {
                whirlpool: ctx.accounts.whirlpool.to_account_info(),
                whirlpools_config: ctx.accounts.config.to_account_info(),
                token_mint_a: ctx.accounts.membership_mint.to_account_info(),
                token_mint_b: ctx.accounts.whirlie_quote.to_account_info(),
                token_vault_a: ctx.accounts.token_vault_a.to_account_info(),
                token_vault_b: ctx.accounts.token_vault_b.to_account_info(),
                funder: ctx.accounts.authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
                fee_tier: ctx.accounts.fee_tier.to_account_info(),
            };
            let cpi_ctx = CpiContext::new(cpi_program.clone(), accounts);
            whirlpools::cpi::initialize_pool(
                cpi_ctx,
                args.bumps,
                args.tick_spacing,
                args.initial_sqrt_price,
            )?;
        }
    };

    Ok(())
}
