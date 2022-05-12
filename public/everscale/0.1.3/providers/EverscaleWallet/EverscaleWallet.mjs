/**
 * @name Everscale connection provider
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */

import Contract from "./Contract.mjs";
import utils from "../../utils.mjs";

import {NETWORKS, REVERSE_NETWORKS, EXPLORERS, SAFE_MULTISIG_ABI, STATUS_UPDATE_INTERVAL, ABIS_URLS} from "../../constants.mjs";
import loadEverWeb from "../EverWebLoader.mjs";

/**
 * extraTON provider class
 */
class EverscaleWallet extends EventEmitter3 {
    constructor(options = {provider: window.freeton}) {


        try {
            if(!window.TONClient.setWasmOptions) {
                window.TONClient.setWasmOptions = () => {
                    console.log('MODULE WITHOUT WASM OPTIONS');
                };
            }
        } catch (e) {

        }


        super();
        this.options = options;
        this.provider = null;
        this.ton = null
        this.networkServer = null;
        this.pubkey = null;

        this.walletContract = null;
        this.walletBalance = 0;

        this.network = 'main';

    }

    /**
     * Initialize extraTON provider
     * @returns {Promise<ExtraTon>}
     */
    async start() {

        //Simple wait for tonwallet initialization
        await utils.wait(100);
        for (let i = 0; i < 5; i++) {
            if(window.getTONWeb) {
                break;
            }
            await utils.wait(1000);
        }

        //Detect is extraTON exists
        if(!window.getTONWeb) {
            throw new Error("TONWallet extension not found");
        }

        this.provider = await window.getTONWeb();

        //Check extraTON connection
        try {
            await this.provider.extension.getVersion();
        } catch (e) {
            console.error(e);
            throw new Error("Can't access to Everscale Wallet");
        }

        //Load TONClient
        await loadEverWeb();
        this.ton = new tonclientWeb.TonClient({
            network: {
                server_address: (await this.provider.network.get()).network.url
            }
        });

        try {
            this.provider = await window.getTONWeb();
        } catch (e) {

            console.log('Cant update tonWeb', e);
        }

        //Changes watchdog timer
        const syncNetwork = async () => {

            //Watch for network changed
            let networkServer = (await this.provider.network.get()).network.url;
            if(this.networkServer !== networkServer) {
                if(this.networkServer !== null) {
                    this.emit('networkChanged', networkServer, this.networkServer, this,);
                }

                this.network = REVERSE_NETWORKS[networkServer];
                if(!this.network) {
                    this.network = networkServer;
                }
                this.networkServer = networkServer;

                this.ever = new tonclientWeb.TonClient({
                    network: {
                        server_address: this.networkServer
                    }
                });
            }

            //Watch for account changed
            let pubkey = (await this.getKeypair()).public
            if(this.pubkey !== pubkey) {
                if(this.pubkey !== null) {
                    this.emit('pubkeyChanged', pubkey, this,);
                }
                this.pubkey = pubkey;
            }

            //Watch for wallet balance changed
            let wallet = await this.getWallet()
            let newBalance = wallet.balance;
            //console.log(this.walletBalance, newBalance);
            if(this.walletBalance !== newBalance) {
                this.emit('balanceChanged', newBalance, wallet, this,);
                this.walletBalance = newBalance;
            }

        };
        this.watchdogTimer = setInterval(syncNetwork, STATUS_UPDATE_INTERVAL);
        await syncNetwork();

        return this;
    }

    /**
     * Accept account
     * @param publicKey
     * @param seed
     * @param seedLength
     * @param seedDict
     * @returns {Promise<void>}
     */
    async acceptAccount(publicKey, seed, seedLength, seedDict) {
        throw new Error('Accept account unsupported by TonWallet provider');
    }

    /**
     * Request permissions
     * @param permissions
     * @returns {Promise<boolean>}
     */
    async requestPermissions(permissions = []) {
        //No permissions required
        return true;
    }

    /**
     * Unauthorize connection
     * @returns {Promise<*>}
     */
    async revokePermissions() {
        return true;
    }


    /**
     * Get raw extraTON provider
     * @returns {*}
     */
    getProvider() {
        return this.provider;
    }

    /**
     * Get TON client
     * @returns {TONClient}
     */
    getTONClient() {
        return this.ton;
    }

    /**
     * Return network
     * @returns {Promise<*>}
     */
    async getNetwork() {
        return {server: this.networkServer, explorer: EXPLORERS[this.network]};
    }

    /**
     * Get keypair as possible
     * @returns {Promise<{public: *, secret: null}>}
     */
    async getKeypair() {
        let publicKey = (await this.provider.accounts.getAccount()).public;
        return {public: publicKey, secret: null};
    }

    /**
     * Return user TON wallet if exists
     * @returns {Promise<*>}
     */
    async getWallet() {
        //let wallet = (await this.provider.getSigner()).wallet;
        let wallet = (await this.provider.accounts.getWalletInfo());
        //Wallet exists
        if(wallet.address) {

            if(!this.walletContract) {
                this.walletContract = await this.loadContract(ABIS_URLS.SAFE_MULTISIG, wallet.address);
            }
            //Load user wallet (potentially compatible with SafeMiltisig)
            wallet.contract = this.walletContract;
            wallet.balance = await this.walletContract.getBalance();
        }
        return wallet;
    }

    /**
     * Make wallet transfer
     * @param to
     * @param amount
     * @param payload
     * @param bounce
     * @returns {Promise<*>}
     */
    async walletTransfer(to, amount, payload = '', bounce = true) {
        return await this.provider.accounts.walletTransfer((await this.getKeypair()).public, (await this.getWallet()).address, to, amount, payload, bounce);
    }

    /**
     * Create contract instance by ABI
     * @param {object} abi
     * @param {string} address
     * @returns {Promise<Contract>}
     */
    async initContract(abi, address) {
        return new Contract(abi, address, this.ton, this);
    }

    /**
     * Load contract ABI by URL or abi
     * @param {string|object} abiJson
     * @param {string} address
     * @returns {Promise<Contract>}
     */
    async loadContract(abiJson, address) {
        if(typeof abiJson === 'string') {
            abiJson = await ((await fetch(abiJson))).json();
        }

        return this.initContract(abiJson, address)
    }

    /**
     * Create contract instance by JSON
     * @param {string|object} contractJson
     * @param {number|string} networkId
     * @returns {Promise<Contract>}
     */
    async loadContractFrom(contractJson, networkId = "1") {
        networkId = String(networkId);
        if(typeof contractJson === 'string') {
            contractJson = await ((await fetch(contractJson))).json();
        }
        const Contract = contractJson;

        return await this.initContract(Contract.abi, Contract.networks[networkId].address);
    }

    /**
     * Send TON with message
     * @param {string} dest
     * @param {string|number} amount
     * @param {string} pubkey
     * @returns {Promise<*>}
     */
    async sendTONWithPubkey(dest, amount, pubkey) {

        let transferBody = utils.createPubkeyTVMCELL(pubkey);
        return await (await this.getWallet()).transfer(dest, amount, false, transferBody);
    }

    /**
     * Return extension icon
     * @returns {string}
     */
    getIconUrl() {
        return 'https://github.com/SVOIcom/browser-extension/raw/main/icons/128.png'
    }

    /**
     * Sign data
     * @param publicKey
     * @param data
     * @returns {Promise<*>}
     */
    async signDataRaw(publicKey, data = ''){
        return await this.provider.accounts.signDataRaw(publicKey, data);
    }

    /**
     * Pack into cell
     * @param data
     * @returns {Promise<*>}
     */
    async packIntoCell(data){
        return await this.provider.everscale.packIntoCell(data);
    }

    /**
     * Unpack from cell
     * @param data
     * @returns {Promise<*>}
     */
    async unpackFromCell(data){
        return await this.provider.everscale.unpackFromCell(data);
    }

    /**
     * Verify signed data
     * @param data
     * @returns {Promise<*>}
     */
    async verifySignature(data){
        return await this.provider.everscale.verifySignature(data);
    }

    async gqlQuery(query, variables = {}) {

    }

    /**
     * Query collection
     * @param {object} query
     * @returns {Promise<*>}
     */
    async queryCollection(query){
        return await this.ton.net.query_collection(query);
    }

}

export default EverscaleWallet;