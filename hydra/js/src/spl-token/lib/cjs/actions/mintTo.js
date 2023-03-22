"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintTo = void 0;
const web3_js_1 = require("@solana/web3.js");
const constants_js_1 = require("../constants.js");
const mintTo_js_1 = require("../instructions/mintTo.js");
const internal_js_1 = require("./internal.js");
/**
 * Mint tokens to an account
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           Mint for the account
 * @param destination    Address of the account to mint to
 * @param authority      Minting authority
 * @param amount         Amount to mint
 * @param multiSigners   Signing accounts if `authority` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
function mintTo(connection, payer, mint, destination, authority, amount, multiSigners = [], confirmOptions, programId = constants_js_1.TOKEN_PROGRAM_ID) {
    return __awaiter(this, void 0, void 0, function* () {
        const [authorityPublicKey, signers] = (0, internal_js_1.getSigners)(authority, multiSigners);
        const transaction = new web3_js_1.Transaction().add((0, mintTo_js_1.createMintToInstruction)(mint, destination, authorityPublicKey, amount, multiSigners, programId));
        return yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer, ...signers], confirmOptions);
    });
}
exports.mintTo = mintTo;
//# sourceMappingURL=mintTo.js.map