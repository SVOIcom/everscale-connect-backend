/**
 * @name Everscale connection provider
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */


import Contract from "./Contract.mjs";
import {ProviderRpcClient, hasEverscaleProvider} from './everscale-inpage-provider/dist/index.js';
import {ABIS_URLS, STATUS_UPDATE_INTERVAL} from "../../constants.mjs";
import loadEverWeb from "../EverWebLoader.mjs";
import cache from "../../misc/cache.mjs";

let ever = null;

const NETWORKS = {
    main: 'alwaysonlineevermainnode.svoi.dev',
    test: 'lim01.main.everos.dev'
};

const REVERSE_NETWORKS = {
    'main.ton.dev': 'main',
    'main2.ton.dev': 'main',
    'main3.ton.dev': 'main',
    'alwaysonlineevermainnode.svoi.dev': 'main',
    'net.ton.dev': 'test',

    'Mainnet (GQL 3)': 'main',
    'Mainnet (GQL 2)': 'main',
    'Mainnet (GQL 1)': 'main',
    'Mainnet (GQL)': 'main',
    'Mainnet (ADNL)': 'main',
    'Testnet': 'test',
    'fld.ton.dev': 'test',
    'lim01.main.everos.dev': 'test'

}

const NETWORKS_COMPILABILITY = {

    'Mainnet (GQL 3)': 'alwaysonlineevermainnode.svoi.dev',
    'Mainnet (GQL 2)': 'alwaysonlineevermainnode.svoi.dev',
    'Mainnet (GQL 1)': 'alwaysonlineevermainnode.svoi.dev',
    'Mainnet (ADNL)': 'alwaysonlineevermainnode.svoi.dev',
    'Testnet': 'lim01.main.everos.dev',
    'testnet': 'lim01.main.everos.dev',
    'fld.ton.dev': 'lim01.main.everos.dev',
    'lim01.main.everos.dev': 'lim01.main.everos.dev',
    'mainnet': 'alwaysonlineevermainnode.svoi.dev'

}

const EXPLORERS = {
    test: 'net.ever.live',
    main: 'main.ever.live',
    local: 'main.ever.live',
}


/**
 * CrystalWallet provider class
 */
class EVERWallet extends EventEmitter3 {
    constructor(options = {
        network: 'main',
        networkServer: '',
    }) {

        super();

        ever =  new ProviderRpcClient();


        this.options = options;
        this.provider = null;
        this.ever = null
        this.networkServer = options.networkServer;
        this.pubkey = null;

        this.walletContract = null;
        this.walletBalance = 0;
        this.lastWalletAdderss = null

        this.network = options.network;

        this.walletName = 'EVERWallet';

    }

    /**
     * Initialize CrystalWallet provider
     * @returns {Promise<ExtraTon>}
     */
    async start() {

        //Detect is EverWallet exists
        if(!(await hasEverscaleProvider())) {
            throw new Error('EverWallet extension not found');
        }
        await ever.ensureInitialized();

        this.provider = ever

        //  await this.revokePermissions();

        // await this._getPermissions();

        // console.log((await ton.getProviderState()));

        this.networkServer = await this._getCurrentNetwork();


        //Load TONClient
        await loadEverWeb();

        this.ever = new tonclientWeb.TonClient({
            network: {
                server_address: this.networkServer
            }
        });

        this.network = REVERSE_NETWORKS[this.networkServer];

        //Changes watchdog timer
        const syncNetwork = async () => {
            //console.log("checkNetwork-")

            //Watch for network changed
            let networkServer = (await this._getCurrentNetwork());
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
                        server_address: NETWORKS_COMPILABILITY[this.networkServer]
                    }
                });

                //console.log("checkNetwork+")
            }

            //Watch for account changed
            let pubkey = (await this.getKeypair()).public
            if(this.pubkey !== pubkey) {
                if(this.pubkey !== null) {
                    this.emit('pubkeyChanged', pubkey, this,);
                }
                this.pubkey = pubkey;
            }

            //Watch for vallet address changed
            let WalletAdderss = (await this.getWallet()).address
            if(this.lastWalletAdderss !== WalletAdderss) {
                if(this.lastWalletAdderss !== null) {
                    this.emit('addressChanged', pubkey, this,);
                }
                this.lastWalletAdderss = WalletAdderss;
            }

            //Watch for wallet balance changed
            let wallet = await this.getWallet()
            let newBalance = wallet.balance;
            //console.log(this.walletBalance, newBalance);
            if(this.walletBalance !== newBalance) {
                this.emit('balanceChanged', newBalance, wallet, this,);
                this.walletBalance = newBalance;

                //console.log("balance_changed")
            }

        };
        this.watchdogTimer = setInterval(syncNetwork, STATUS_UPDATE_INTERVAL);
        await syncNetwork();

        return this;

    }

    /**
     * Request permissions
     * @param permissions
     * @returns {Promise<*>}
     */
    async requestPermissions(permissions = ['basic', 'tonClient', 'accountInteraction']) {
        if(!(await hasEverscaleProvider())) {
            throw new Error('EverWallet extension not found');
        }
        await ever.ensureInitialized();
        return await this._getPermissions(permissions);
    }

    /**
     * Request account permissions
     * @param permissions
     * @returns {Promise<{address: string, publicKey: string, contractType: WalletContractType}>}
     */
    async _getPermissions(permissions = ['basic', 'tonClient', 'accountInteraction']) {
        let {accountInteraction} = await ever.rawApi.requestPermissions({
            permissions: permissions
        });
        if(accountInteraction == null) {
            throw new Error('Insufficient permissions')
        }


        return accountInteraction
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
        return this.ever;
    }

    getEVERClient() {
        return this.ever;
    }

    /**
     * Get keypair as possible
     * @returns {Promise<{public: *, secret: null}>}
     */
    async getKeypair() {

        let publicKey = (await this.provider.getProviderState()).permissions.accountInteraction.publicKey

        return {public: publicKey, secret: null};
    }

    /**
     * Get wallet object
     * @returns {Promise<{}>}
     */
    async getWallet() {

        let wallet = {}
        wallet.address = (await this.provider.getProviderState()).permissions.accountInteraction.address._address;

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
     * Get current network from provider
     * @returns {Promise<string>}
     * @private
     */
    async _getCurrentNetwork() {
        return NETWORKS_COMPILABILITY[(await this.provider.getProviderState()).selectedConnection];
    }

    /**
     * Return network
     * @returns {Promise<*>}
     */
    async getNetwork() {
        return {server: this.networkServer, explorer: EXPLORERS[this.network]};
    }


    /**
     * Unauthorize connection
     * @returns {Promise<void>}
     */
    async revokePermissions() {
        return await ever.rawApi.disconnect();
    }

    /**
     * Create contract instance by ABI
     * @param {object} abi
     * @param {string} address
     * @returns {Promise<Contract>}
     */
    async initContract(abi, address) {
        return new Contract(abi, address, this.ever, this);
    }

    /**
     * Load contract ABI by URL or abi
     * @param {string|object} abiJson
     * @param {string} address
     * @returns {Promise<Contract>}
     */
    async loadContract(abiJson, address) {
        let cacheKey = String(abiJson) + address;

        let cached = await cache.get(cacheKey);
        if(cached) {
            return cached;
        }

        if(typeof abiJson === 'string') {
            let url = abiJson;
            let cachedAbi = await cache.get(url);
            if(cachedAbi) {
                abiJson = cachedAbi;
            } else {
                abiJson = await ((await fetch(abiJson))).json();
                await cache.set(url, abiJson);
            }

        }

        let contract = this.initContract(abiJson, address);

        await cache.set(cacheKey, contract);

        return contract;
    }

    /**
     * Make wallet transfer
     * @param to
     * @param amount
     * @param payload
     * @param bounce //bool
     * @returns {Promise<*>}
     */
    async walletTransfer(to, amount, payload = '', bounce = true) {

        let walletAddress = (await this.getWallet()).address;

        let sendObj = {
            sender: (walletAddress),
            recipient: (to),
            amount: String(amount),
            bounce: bounce,
            //payload: payload

        };

        if(payload) {
            sendObj.payload = payload;
        }

        const {transaction} = await this.provider.rawApi.sendMessage(sendObj);

        return transaction
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
        throw new Error('Accept account unsupported by CrystalWallet provider');
    }

    /**
     * Return extension icon
     * @returns {string}
     */
    getIconUrl() {
        return 'https://raw.githubusercontent.com/broxus/ton-wallet-crystal-browser-extension/master/src/popup/icons/icon128.png'
    }


    /**
     * Sign data
     * @param publicKey
     * @param data
     * @returns {Promise<*>}
     */
    async signDataRaw(publicKey, data = ''){
        return await this.provider.signDataRaw({publicKey: publicKey, data: data});
    }

    /**
     * Pack into cell
     * @param data
     * @returns {Promise<*>}
     */
    async packIntoCell(data){
        return await this.provider.packIntoCell(data);
    }

    /**
     * Unpack from cell
     * @param data
     * @returns {Promise<*>}
     */
    async unpackFromCell(data){
        return await this.provider.unpackFromCell(data);
    }

    /**
     * Verify signed data
     * @param data
     * @returns {Promise<*>}
     */
    async verifySignature(data){
        return await this.provider.verifySignature(data);
    }

    /**
     * Query collection
     * @param {object} query
     * @returns {Promise<*>}
     */
    async queryCollection(query) {
        return await this.ever.net.query_collection(query);
    }

}


export default EVERWallet;
