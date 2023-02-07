
const axios = require('axios')
const mints = {}
const fs = require('fs')
const url2 = "https://api.helius.xyz/v0/transactions/?api-key=8913a285-a5ef-4c35-8d80-03fb276eff2f"
const parseTransactions = async (transactions) => {
  const { data } = await axios.post(url2, { transactions})
  for (var d of data){
    let tokenTransfers = d.tokenTransfers
    for (var tf of tokenTransfers){
            if (!Object.keys(mints).includes(tf.mint)){
                mints[tf.mint] = 0
            }
            mints[tf.mint]+=tf.tokenAmount
        }
    }
}
const url = 'https://api.helius.xyz/v1/raw-transactions?api-key=8913a285-a5ef-4c35-8d80-03fb276eff2f';

// Query for transactions that happened in the last week for these two monkes.
// Leverages pagination to repeatedly call the API until we get all transactions.
const accounts = [
  '9tKE7Mbmj4mxDjWatikzGAtkoWosiiZX9y6J4Hfm2R8H'
];
const getAllTransactions = async () => {
    const transactions = [];
    let paginationToken;
    while (true) {
        const { data } = await axios.post(url, {
            query: {
                accounts: accounts,
               
            },
            options: {
                limit: 5,
                paginationToken: paginationToken,
            },
        });
        console.log(`Got batch of ${data.result.length} transactions!`);
        for (var tx of data.result){
            parseTransactions(tx.transaction.signatures)
        }
        fs.writeFileSync('./volumes.json', JSON.stringify(mints))
        if (data.paginationToken) {
            paginationToken = data.paginationToken;
            console.log(`Proceeding to next page with token ${paginationToken}.`);
        } else {
            console.log('Finished getting all transactions.');
            break;
        }
    }

    console.log(`Got ${transactions.length} transactions in total!`);
    return transactions;
};
getAllTransactions();
