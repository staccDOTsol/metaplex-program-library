use super::schema::signatures;

#[derive(Insertable)]
#[table_name = "signatures"]
pub struct NewSignature<'a> {
    pub signature: &'a str,
    pub slot: i32,
    pub err: &'a str,
    pub memo: &'a str,
    pub block_time: i32,
    pub confirmation_status: &'a str,
}

#[derive(Queryable)]
pub struct Signatere {
    pub id: i32,
    pub signature: String,
    pub slot: i32,
    pub err: String,
    pub memo: String,
    pub block_time: i32,
    pub confirmation_status: String,
}
