/*
  _______          _____                _     _
 |__   __|        |  __ \              (_)   | |
    | | ___  _ __ | |__) | __ _____   ___  __| | ___ _ __
    | |/ _ \| '_ \|  ___/ '__/ _ \ \ / / |/ _` |/ _ \ '__|
    | | (_) | | | | |   | | | (_) \ V /| | (_| |  __/ |
    |_|\___/|_| |_|_|   |_|  \___/ \_/ |_|\__,_|\___|_|
 */
/**
 * @name FreeTON connection provider
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */
/**
 * Contract class
 */

import  {default as everscaleUtils} from '../../everscaleUtils.mjs';

class Contract {
    constructor(abi, address, ton, parent) {
        //this.provider = provider;
        this.parent = parent;
        this.abi = abi;
        this.address = address;
        //this.contract = new freeton.Contract(provider, abi, address);
        this.ton = ton;


        let that = this;

        //Setup methods
        for (let {name} of abi.functions) {
            if(name === 'constructor') {
                continue;
            }
            this[name] = async function (args = undefined) {
                return await that.getMethod(name, args);
            }

            //Make method deployable
            this[name].deploy = async function (args = undefined) {
                return await that.deployMethod(name, args);
            }

            this[name].payload = async function (args = undefined) {
                return await that.deployPayload(name, args);
            }
        }
    }

    /**
     * Get current provider
     * @returns {*}
     */
    getProvider() {
        return this.ton;
    }

    /**
     * Get TON client
     * @returns {TONClient}
     */
    getTONClient() {
        return this.ton;
    }

    /**
     * Get raw contract object
     * @returns {*}
     */
    getProviderContract() {
        return this.contract;
    }

    /**
     * Return account info for contract
     * @returns {Promise<*>}
     */
    async getAccount() {
        return await this.ton.contracts.getAccount(this.address);
    }

    /**
     * Return balance for contract
     * @returns {Promise<number>}
     */
    async getBalance() {
        let account = await this.getAccount();
        let balance = Number(account.balance);
        return balance;
    }

    /**
     * Run local contract method
     * @param abi
     * @param address
     * @param functionName
     * @param input
     * @returns {Promise<any>}
     * @private
     */
    async _runLocal(abi, address, functionName, input = {}) {
        return await everscaleUtils.runLocal(this.ton, abi, address, functionName, input);
    }

    /**
     * Create method call payload
     * @param abi
     * @param functionName
     * @param input
     * @param signer
     * @returns {Promise<*>}
     * @private
     */
    async _encodeCallBody(abi, functionName, input = {}, signer = {type: 'None'}) {
        return await everscaleUtils.encodeCallBody(this.ton, abi, functionName, input, signer);
    }

    /**
     * Run method locally
     * @param {string} method
     * @param {array|object} args
     * @returns {Promise<*>}
     */
    async getMethod(method, args = {}) {
        return await this._runLocal(this.abi, this.address, method, args);
    }


    /**
     * Get call payload
     * @param method
     * @param args
     * @returns {Promise<*>}
     */
    async deployPayload(method, args = {}) {
        return await this._encodeCallBody(this.abi, method, args);
    }


    /**
     * Deploy method
     * @param {string} method
     * @param {undefined|array|object} args
     * @returns {Promise<*>}
     */
    async deployMethod(method, args = {}) {
        throw new Error('Not implemented yet');

        let params = {
            address: this.address,
            abi: this.abi,
            functionName: method,
            input: args,
            keyPair: await this.parent.account.getKeys('Deploy method ' + method)
        };
        //console.log('DEPLOY METHOD', params);
        let message = await this.ton.contracts.createRunMessage(params);
        let transaction = await this.ton.contracts.sendMessage(message.message);
        //console.log('TX', transaction);

        let result = await this.ton.contracts.waitForRunTransaction(message, transaction);

        result.tx = transaction;

        return result;
    }

}

export default Contract;