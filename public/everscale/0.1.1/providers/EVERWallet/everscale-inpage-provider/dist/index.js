"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderNotInitializedException = exports.ProviderNotFoundException = exports.ProviderRpcClient = exports.hasEverscaleProvider = exports.mergeTransactions = exports.AddressLiteral = exports.Address = exports.Subscriber = void 0;
const models_1 = require("./models");
const utils_1 = require("./utils");
const subscriber = __importStar(require("./stream"));
const contract = __importStar(require("./contract"));
__exportStar(require("./api"), exports);
__exportStar(require("./models"), exports);
__exportStar(require("./contract"), exports);
var stream_1 = require("./stream");
Object.defineProperty(exports, "Subscriber", { enumerable: true, get: function () { return stream_1.Subscriber; } });
var utils_2 = require("./utils");
Object.defineProperty(exports, "Address", { enumerable: true, get: function () { return utils_2.Address; } });
Object.defineProperty(exports, "AddressLiteral", { enumerable: true, get: function () { return utils_2.AddressLiteral; } });
Object.defineProperty(exports, "mergeTransactions", { enumerable: true, get: function () { return utils_2.mergeTransactions; } });
let ensurePageLoaded;
if (document.readyState == 'complete') {
    ensurePageLoaded = Promise.resolve();
}
else {
    ensurePageLoaded = new Promise((resolve) => {
        window.addEventListener('load', () => {
            resolve();
        });
    });
}
/**
 * @category Provider
 */
async function hasEverscaleProvider() {
    await ensurePageLoaded;
    return window.__hasEverscaleProvider === true ||
        window.hasTonProvider === true;
}
exports.hasEverscaleProvider = hasEverscaleProvider;
/**
 * @category Provider
 */
class ProviderRpcClient {
    constructor(properties = {}) {
        this._subscriptions = {};
        this._contractSubscriptions = {};
        const self = this;
        // Create contract proxy type
        class ProviderContract extends contract.Contract {
            constructor(abi, address) {
                super(self, abi, address);
            }
        }
        this.Contract = ProviderContract;
        // Create subscriber proxy type
        class ProviderSubscriber extends subscriber.Subscriber {
            constructor() {
                super(self);
            }
        }
        this.Subscriber = ProviderSubscriber;
        this._properties = properties;
        // Wrap provider requests
        this._api = new Proxy({}, {
            get: (_object, method) => (params) => {
                if (this._provider != null) {
                    return this._provider.request({ method, params: params });
                }
                else {
                    throw new ProviderNotInitializedException();
                }
            },
        });
        // Initialize provider with injected object by default
        this._provider = window.__ever || window.ton;
        if (this._provider != null) {
            // Provider as already injected
            this._mainInitializationPromise = Promise.resolve();
        }
        else {
            // Wait until page is loaded and initialization complete
            this._mainInitializationPromise = hasEverscaleProvider().then((hasProvider) => new Promise((resolve, reject) => {
                if (!hasProvider) {
                    // Fully loaded page doesn't even contain provider flag
                    reject(new ProviderNotFoundException());
                    return;
                }
                // Wait injected provider initialization otherwise
                this._provider = window.__ever || window.ton;
                if (this._provider != null) {
                    resolve();
                }
                else {
                    const eventName = window.__hasEverscaleProvider === true ? 'ever#initialized' : 'ton#initialized';
                    window.addEventListener(eventName, (_data) => {
                        this._provider = window.__ever || window.ton;
                        resolve();
                    });
                }
            }));
        }
        // Will only register handlers for successfully loaded injected provider
        this._mainInitializationPromise.then(() => {
            if (this._provider != null) {
                this._registerEventHandlers(this._provider);
            }
        });
    }
    /**
     * Checks whether this page has injected Everscale provider
     */
    async hasProvider() {
        return hasEverscaleProvider();
    }
    /**
     * Waits until provider api will be available. Calls `fallback` if no provider was found
     *
     * @throws ProviderNotFoundException when no provider found
     */
    async ensureInitialized() {
        try {
            await this._mainInitializationPromise;
        }
        catch (e) {
            if (this._properties.fallback == null) {
                throw e;
            }
            if (this._additionalInitializationPromise == null) {
                this._additionalInitializationPromise = this._properties.fallback().then(async (provider) => {
                    this._provider = provider;
                    this._registerEventHandlers(this._provider);
                });
            }
            await this._additionalInitializationPromise;
        }
    }
    /**
     * Whether provider api is ready
     */
    get isInitialized() {
        return this._provider != null;
    }
    /**
     * Raw provider
     */
    get raw() {
        if (this._provider != null) {
            return this._provider;
        }
        else {
            throw new ProviderNotInitializedException();
        }
    }
    /**
     * Raw provider api
     */
    get rawApi() {
        return this._api;
    }
    /**
     * Creates typed contract wrapper.
     *
     * @param abi Readonly object (must be declared with `as const`)
     * @param address Default contract address
     *
     * @deprecated `new ever.Contract(abi, address)` should be used instead
     */
    createContract(abi, address) {
        return new this.Contract(abi, address);
    }
    /**
     * Creates subscriptions group
     *
     * @deprecated `new ever.Subscriber()` should be used instead
     */
    createSubscriber() {
        return new this.Subscriber();
    }
    /**
     * Requests new permissions for current origin.
     * Shows an approval window to the user.
     * Will overwrite already existing permissions
     *
     * ---
     * Required permissions: none
     */
    async requestPermissions(args) {
        const result = await this._api.requestPermissions({
            permissions: args.permissions,
        });
        return (0, models_1.parsePermissions)(result);
    }
    /**
     * Updates `accountInteraction` permission value
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async changeAccount() {
        await this._api.changeAccount();
    }
    /**
     * Removes all permissions for current origin and stops all subscriptions
     */
    async disconnect() {
        await this._api.disconnect();
    }
    async subscribe(eventName, params) {
        class SubscriptionImpl {
            constructor(_subscribe, _unsubscribe) {
                this._subscribe = _subscribe;
                this._unsubscribe = _unsubscribe;
                this._listeners = {
                    ['data']: [],
                    ['subscribed']: [],
                    ['unsubscribed']: [],
                };
            }
            on(eventName, listener) {
                this._listeners[eventName].push(listener);
                return this;
            }
            async subscribe() {
                await this._subscribe(this);
                for (const handler of this._listeners['subscribed']) {
                    handler();
                }
            }
            async unsubscribe() {
                await this._unsubscribe();
                for (const handler of this._listeners['unsubscribed']) {
                    handler();
                }
            }
            notify(data) {
                for (const handler of this._listeners['data']) {
                    handler(data);
                }
            }
        }
        let existingSubscriptions = this._getEventSubscriptions(eventName);
        const id = (0, utils_1.getUniqueId)();
        switch (eventName) {
            case 'connected':
            case 'disconnected':
            case 'networkChanged':
            case 'permissionsChanged':
            case 'loggedOut': {
                const subscription = new SubscriptionImpl(async (subscription) => {
                    if (existingSubscriptions[id] != null) {
                        return;
                    }
                    existingSubscriptions[id] = (data) => {
                        subscription.notify(data);
                    };
                }, async () => {
                    delete existingSubscriptions[id];
                });
                await subscription.subscribe();
                return subscription;
            }
            case 'transactionsFound':
            case 'contractStateChanged': {
                const address = params.address.toString();
                const subscription = new SubscriptionImpl(async (subscription) => {
                    if (existingSubscriptions[id] != null) {
                        return;
                    }
                    existingSubscriptions[id] = ((data) => {
                        if (data.address.toString() == address) {
                            subscription.notify(data);
                        }
                    });
                    let contractSubscriptions = this._contractSubscriptions[address];
                    if (contractSubscriptions == null) {
                        contractSubscriptions = {};
                        this._contractSubscriptions[address] = contractSubscriptions;
                    }
                    contractSubscriptions[id] = {
                        state: eventName == 'contractStateChanged',
                        transactions: eventName == 'transactionsFound',
                    };
                    const { total, withoutExcluded, } = foldSubscriptions(Object.values(contractSubscriptions), contractSubscriptions[id]);
                    try {
                        if (total.transactions != withoutExcluded.transactions || total.state != withoutExcluded.state) {
                            await this.rawApi.subscribe({ address, subscriptions: total });
                        }
                    }
                    catch (e) {
                        delete existingSubscriptions[id];
                        delete contractSubscriptions[id];
                        throw e;
                    }
                }, async () => {
                    delete existingSubscriptions[id];
                    const contractSubscriptions = this._contractSubscriptions[address];
                    if (contractSubscriptions == null) {
                        return;
                    }
                    const updates = contractSubscriptions[id];
                    const { total, withoutExcluded } = foldSubscriptions(Object.values(contractSubscriptions), updates);
                    delete contractSubscriptions[id];
                    if (!withoutExcluded.transactions && !withoutExcluded.state) {
                        await this.rawApi.unsubscribe({ address });
                    }
                    else if (total.transactions != withoutExcluded.transactions || total.state != withoutExcluded.state) {
                        await this.rawApi.subscribe({ address, subscriptions: withoutExcluded });
                    }
                });
                await subscription.subscribe();
                return subscription;
            }
            default: {
                throw new Error(`Unknown event ${eventName}`);
            }
        }
    }
    /**
     * Returns provider api state
     *
     * ---
     * Required permissions: none
     */
    async getProviderState() {
        const state = await this._api.getProviderState();
        return {
            ...state,
            permissions: (0, models_1.parsePermissions)(state.permissions),
        };
    }
    /**
     * Requests contract data
     *
     * ---
     * Required permissions: `basic`
     */
    async getFullContractState(args) {
        return await this._api.getFullContractState({
            address: args.address.toString(),
        });
    }
    /**
     * Requests accounts with specified code hash
     *
     * ---
     * Required permissions: `basic`
     */
    async getAccountsByCodeHash(args) {
        const { accounts, continuation } = await this._api.getAccountsByCodeHash({
            ...args,
        });
        return {
            accounts: accounts.map((address) => new utils_1.Address(address)),
            continuation,
        };
    }
    /**
     * Requests contract transactions
     *
     * ---
     * Required permissions: `basic`
     */
    async getTransactions(args) {
        const { transactions, continuation, info } = await this._api.getTransactions({
            ...args,
            address: args.address.toString(),
        });
        return {
            transactions: transactions.map(models_1.parseTransaction),
            continuation,
            info,
        };
    }
    /**
     * Searches transaction by hash
     *
     * ---
     * Required permissions: `basic`
     */
    async getTransaction(args) {
        const { transaction } = await this._api.getTransaction({
            ...args,
        });
        return {
            transaction: transaction ? (0, models_1.parseTransaction)(transaction) : undefined,
        };
    }
    /**
     * Calculates contract address from code and init params
     *
     * ---
     * Required permissions: `basic`
     */
    async getExpectedAddress(abi, args) {
        const { address } = await this._api.getExpectedAddress({
            abi: JSON.stringify(abi),
            ...args,
            initParams: (0, models_1.serializeTokensObject)(args.initParams),
        });
        return new utils_1.Address(address);
    }
    /**
     * Computes hash of base64 encoded BOC
     *
     * ---
     * Required permissions: `basic`
     */
    async getBocHash(boc) {
        return await this._api.getBocHash({
            boc,
        }).then(({ hash }) => hash);
    }
    /**
     * Creates base64 encoded BOC
     *
     * ---
     * Required permissions: `basic`
     */
    async packIntoCell(args) {
        return await this._api.packIntoCell({
            structure: args.structure,
            data: (0, models_1.serializeTokensObject)(args.data),
        });
    }
    /**
     * Decodes base64 encoded BOC
     *
     * ---
     * Required permissions: `basic`
     */
    async unpackFromCell(args) {
        const { data } = await this._api.unpackFromCell({
            ...args,
            structure: args.structure,
        });
        return {
            data: (0, models_1.parseTokensObject)(args.structure, data),
        };
    }
    /**
     * Extracts public key from raw account state
     *
     * **NOTE:** can only be used on contracts which are deployed and has `pubkey` header
     *
     * ---
     * Required permissions: `basic`
     */
    async extractPublicKey(boc) {
        const { publicKey } = await this._api.extractPublicKey({
            boc,
        });
        return publicKey;
    }
    /**
     * Converts base64 encoded contract code into tvc with default init data
     *
     * ---
     * Required permissions: `basic`
     */
    async codeToTvc(code) {
        const { tvc } = await this._api.codeToTvc({
            code,
        });
        return tvc;
    }
    /**
     * Splits base64 encoded state init into code and data
     *
     * ---
     * Required permissions: `basic`
     */
    async splitTvc(tvc) {
        return await this._api.splitTvc({
            tvc,
        });
    }
    /**
     * Adds asset to the selected account
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async addAsset(args) {
        let params;
        switch (args.type) {
            case 'tip3_token': {
                params = {
                    rootContract: args.params.rootContract.toString(),
                };
                break;
            }
            default:
                throw new Error('Unknown asset type');
        }
        return await this._api.addAsset({
            account: args.account.toString(),
            type: args.type,
            params,
        });
    }
    async verifySignature(args) {
        return await this._api.verifySignature(args);
    }
    /**
     * Signs arbitrary data.
     *
     * NOTE: hashes data before signing. Use `signDataRaw` to sign without hash.
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async signData(args) {
        return await this._api.signData(args);
    }
    /**
     * Signs arbitrary data without hashing it
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async signDataRaw(args) {
        return await this._api.signDataRaw(args);
    }
    /**
     * Encrypts arbitrary data with specified algorithm for each specified recipient
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async encryptData(args) {
        const { encryptedData } = await this._api.encryptData(args);
        return encryptedData;
    }
    /**
     * Decrypts encrypted data. Returns base64 encoded data
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    async decryptData(encryptedData) {
        const { data } = await this._api.decryptData({ encryptedData });
        return data;
    }
    /**
     * Sends internal message from user account.
     * Shows an approval window to the user.
     *
     * ---
     * Required permissions: `accountInteraction`
     */
    async sendMessage(args) {
        const { transaction } = await this._api.sendMessage({
            ...args,
            sender: args.sender.toString(),
            recipient: args.recipient.toString(),
            payload: args.payload ? ({
                abi: args.payload.abi,
                method: args.payload.method,
                params: (0, models_1.serializeTokensObject)(args.payload.params),
            }) : undefined,
        });
        return {
            transaction: (0, models_1.parseTransaction)(transaction),
        };
    }
    _registerEventHandlers(provider) {
        const knownEvents = {
            'connected': (data) => data,
            'disconnected': (data) => data,
            'transactionsFound': (data) => ({
                address: new utils_1.Address(data.address),
                transactions: data.transactions.map(models_1.parseTransaction),
                info: data.info,
            }),
            'contractStateChanged': (data) => ({
                address: new utils_1.Address(data.address),
                state: data.state,
            }),
            'networkChanged': data => data,
            'permissionsChanged': (data) => ({
                permissions: (0, models_1.parsePermissions)(data.permissions),
            }),
            'loggedOut': data => data,
        };
        for (const [eventName, extractor] of Object.entries(knownEvents)) {
            provider.addListener(eventName, (data) => {
                const handlers = this._subscriptions[eventName];
                if (handlers == null) {
                    return;
                }
                const parsed = extractor(data);
                for (const handler of Object.values(handlers)) {
                    handler(parsed);
                }
            });
        }
    }
    _getEventSubscriptions(eventName) {
        let existingSubscriptions = this._subscriptions[eventName];
        if (existingSubscriptions == null) {
            existingSubscriptions = {};
            this._subscriptions[eventName] = existingSubscriptions;
        }
        return existingSubscriptions;
    }
}
exports.ProviderRpcClient = ProviderRpcClient;
/**
 * @category Provider
 */
class ProviderNotFoundException extends Error {
    constructor() {
        super('Everscale provider was not found');
    }
}
exports.ProviderNotFoundException = ProviderNotFoundException;
/**
 * @category Provider
 */
class ProviderNotInitializedException extends Error {
    constructor() {
        super('Everscale provider was not initialized yet');
    }
}
exports.ProviderNotInitializedException = ProviderNotInitializedException;
function foldSubscriptions(subscriptions, except) {
    const total = { state: false, transactions: false };
    const withoutExcluded = Object.assign({}, total);
    for (const item of subscriptions) {
        if (withoutExcluded.transactions && withoutExcluded.state) {
            break;
        }
        total.state || (total.state = item.state);
        total.transactions || (total.transactions = item.transactions);
        if (item != except) {
            withoutExcluded.state || (withoutExcluded.state = item.state);
            withoutExcluded.transactions || (withoutExcluded.transactions = item.transactions);
        }
    }
    return { total, withoutExcluded };
}
