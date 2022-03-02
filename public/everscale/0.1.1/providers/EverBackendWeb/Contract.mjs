/**
 * @name Everscale connection provider
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */

import jQuery from "../jQuery.mjs";
import {BACKEND_PROVIDER_API_URL} from "../../constants.mjs";


/**
 * Contract class
 */
class Contract {
    constructor(abi, address, ever, parent) {
        //this.provider = provider;
        this.parent = parent;
        this.abi = abi;
        this.address = address;
        //this.contract = new freeton.Contract(provider, abi, address);

        this.ever = ever;


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

    get ton() {
        console.log('Using ton parameter is deprecated. Use ever instead.');
        return this.ever;
    }

    set ton(value) {
        console.log('Using ton parameter is deprecated. Use ever instead.');
        this.ever = value;
    }

    /**
     * Get current provider
     * @returns {*}
     */
    getProvider() {
        return this.ever;
    }

    /**
     * Get TON client
     * @returns {TONClient}
     */
    getTONClient() {
        return this.ton;
    }

    /**
     * Get EVER client
     * @returns {null}
     */
    getEVERClient() {
        return this.ever;
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
        throw new Error('Not implemented');
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
     * Run method locally
     * @param {string} method
     * @param {array|object} args
     * @returns {Promise<*>}
     */
    async getMethod(method, args = {}) {
        let $ = jQuery;
        //console.log('New jquery', $);
        let postResult = await $.post(BACKEND_PROVIDER_API_URL + 'runLocal/' +
            this.parent.networkServer + "/" + this.address + '/' + method, {
                abi: JSON.stringify(this.abi),
                input: args
            }
        );

        if(postResult.status === 'error') {
            throw JSON.parse(postResult.encodedError)
        }

        return postResult.result;
    }

    /**
     * Deploy method
     * @param {string} method
     * @param {undefined|array|object} args
     * @returns {Promise<*>}
     */
    async deployMethod(method, args = {}) {
        throw 'Deploy method not supported by EverscaleBackendProvider';
    }

    /**
     * Get call payload
     * @param method
     * @param args
     * @returns {Promise<*>}
     */
    async deployPayload(method, args = {}) {

        if(this.parent.crystalWalletPayloadFormat) {
            return {
                abi: JSON.stringify(this.abi),
                method: method,
                params: args
            }
        }


        let $ = jQuery;
        //console.log('New jquery', $);
        let postResult = await $.post(BACKEND_PROVIDER_API_URL + 'payload/' +
            this.parent.networkServer + '/' + method, {
                abi: JSON.stringify(this.abi),
                input: args
            }
        );

        if(postResult.status === 'error') {
            throw JSON.parse(postResult.encodedError)
        }

        return postResult.result;
    }

}

export default Contract;