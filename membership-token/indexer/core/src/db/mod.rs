pub mod models;
pub mod schema;

use super::schema::signatures::dsl::*;
use diesel::{pg::PgConnection, prelude::*};
use dotenv::{dotenv, Error};
use models::NewSignature;
use solana_client::rpc_response::RpcConfirmedTransactionStatusWithSignature;
use std::env;

pub struct Db {
    connection: PgConnection,
}

impl Db {
    #[must_use]
    pub fn new() -> Self {
        Db {
            connection: establish_connection(),
        }
    }

    pub fn store_signatures_in_queue(
        &self,
        sgns: Vec<RpcConfirmedTransactionStatusWithSignature>,
    ) -> Result<(), Error> {
        for transaction_status in sgns.iter() {
            let new_signature = NewSignature {
                signature: &transaction_status.signature,
                slot: transaction_status.slot as i32,
                err: &format_or_empty(transaction_status.err.as_ref()),
                memo: &format_or_empty(transaction_status.memo.as_ref()),
                block_time: transaction_status.block_time.unwrap_or_default() as i32,
                confirmation_status: &format_or_empty(
                    transaction_status.confirmation_status.as_ref(),
                ),
            };

            diesel::insert_into(signatures)
                .values(&new_signature)
                .execute(&self.connection)
                .unwrap();
        }
        Ok(())
    }
}

impl Default for Db {
    fn default() -> Self {
        Self::new()
    }
}

fn establish_connection() -> PgConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connetcing to {}", database_url))
}

fn format_or_empty<T: std::fmt::Debug>(val: Option<T>) -> String {
    if val.is_some() {
        format!("{:?}", val.as_ref().unwrap())
    } else {
        String::from("")
    }
}
