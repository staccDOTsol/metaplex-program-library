use crate::{error::HydraError};
use crate::utils::validation::assert_ata;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::{Fanout, FanoutMint};



#[derive(Accounts)]
#[instruction(bump_seed: u8)]
pub struct InitializeFanoutForMint<'info> {
    #[account(mut)]
    /// CHECK: unchecked yo
    pub authority: Signer<'info>,
    #[account(
    mut,
    seeds = [b"fanout-config", fanout.name.as_bytes()],
    bump = fanout.bump_seed,
    )]
    pub fanout: Account<'info, Fanout>,
    #[account(
    init,
    payer= authority,
    space = 300,
    seeds = [b"fanout-config", fanout.key().as_ref(), mint.key().as_ref()],
    bump
    )]
    pub fanout_for_mint:  Box<Account<'info, FanoutMint>>,
    #[account(mut,seeds = [b"authority"], bump,
    constraint = jarezi_account.key() == fanout.jarezi_key)]
    /// CHECK: jarezi
    pub jarezi_account: UncheckedAccount<'info>,
    #[account(
    mut,
    constraint = mint_jarezi_holding_account.owner == jarezi_account.key(),
    constraint = mint_jarezi_holding_account.delegate.is_none(),
    constraint = mint_jarezi_holding_account.close_authority.is_none(),
    constraint = mint_jarezi_holding_account.mint == mint.key(),
    )
    ]
    pub mint_jarezi_holding_account: Box<Account<'info, TokenAccount>>,
    #[account(
    mut,
    constraint = mint_holding_account.owner == fanout.key(),
    constraint = mint_holding_account.delegate.is_none(),
    constraint = mint_holding_account.close_authority.is_none(),
    constraint = mint_holding_account.mint == mint.key(),
    )
    ]
    pub mint_holding_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub membership_mint: Account<'info, Mint>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
   
    pub token_program: Program<'info, Token>,
    pub mint: Account<'info, Mint>
}

pub fn init_for_mint(ctx: Context<InitializeFanoutForMint>, bump_seed: u8,
     whirlpool: Pubkey,
     whirlpool2: Pubkey,
     whirlpool3: Pubkey, whirlpool4: Pubkey) -> Result<()> {
    
        let fanout_mint = &mut ctx.accounts.fanout_for_mint;
        let jarezi_account = &ctx.accounts.jarezi_account;
        let mint_jarezi_holding_account = &ctx.accounts.mint_jarezi_holding_account;
    let fanout = &ctx.accounts.fanout;
    let mint_holding_account = &ctx.accounts.mint_holding_account;
    fanout_mint.fanout = fanout.to_account_info().key();
    fanout_mint.total_inflow = mint_holding_account.amount;
    fanout_mint.last_snapshot_amount = mint_holding_account.amount;
    fanout_mint.bump_seed = bump_seed;
    fanout_mint.mint = ctx.accounts.mint.to_account_info().key();
    assert_ata(
        &mint_holding_account.to_account_info(),
        &fanout.key(),
        &ctx.accounts.mint.key(),
        Some(HydraError::HoldingAccountMustBeAnATA.into()),
    )?;
    assert_ata(
        &mint_jarezi_holding_account.to_account_info(),
        &jarezi_account.key(),
        &ctx.accounts.mint.key(),
        Some(HydraError::HoldingAccountMustBeAnATA.into()),
    )?;
    fanout_mint.token_account = mint_holding_account.to_account_info().key();


    fanout_mint.whirlpool = whirlpool;

    fanout_mint.whirlpool2 = whirlpool2;

    fanout_mint.whirlpool3 = whirlpool3;

    fanout_mint.whirlpool4 = whirlpool4;

    Ok(())
}
