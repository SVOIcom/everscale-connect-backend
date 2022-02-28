"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueId = exports.mergeTransactions = exports.AddressLiteral = exports.Address = void 0;
/**
 * @category Utils
 */
class Address {
    constructor(address) {
        this._address = address;
    }
    toString() {
        return this._address;
    }
    equals(other) {
        if (other instanceof Address) {
            return this._address == other._address;
        }
        else {
            return this._address == other;
        }
    }
}
exports.Address = Address;
/**
 * @category Utils
 */
class AddressLiteral extends Address {
    constructor(address) {
        super(address);
    }
}
exports.AddressLiteral = AddressLiteral;
/**
 * Modifies knownTransactions array, merging it with new transactions.
 * All arrays are assumed to be sorted by descending logical time.
 *
 * > Note! This method does not remove duplicates.
 *
 * @param knownTransactions
 * @param newTransactions
 * @param info
 *
 * @category Utils
 */
function mergeTransactions(knownTransactions, newTransactions, info) {
    if (info.batchType == 'old') {
        knownTransactions.push(...newTransactions);
        return knownTransactions;
    }
    if (knownTransactions.length === 0) {
        knownTransactions.push(...newTransactions);
        return knownTransactions;
    }
    // Example:
    // known lts: [N, N-1, N-2, N-3, (!) N-10,...]
    // new lts: [N-4, N-5]
    // batch info: { minLt: N-5, maxLt: N-4, batchType: 'new' }
    // 1. Skip indices until known transaction lt is greater than the biggest in the batch
    let i = 0;
    while (i < knownTransactions.length &&
        knownTransactions[i].id.lt.localeCompare(info.maxLt) >= 0) {
        ++i;
    }
    // 2. Insert new transactions
    knownTransactions.splice(i, 0, ...newTransactions);
    return knownTransactions;
}
exports.mergeTransactions = mergeTransactions;
const MAX = 4294967295;
let idCounter = Math.floor(Math.random() * MAX);
function getUniqueId() {
    idCounter = (idCounter + 1) % MAX;
    return idCounter;
}
exports.getUniqueId = getUniqueId;
