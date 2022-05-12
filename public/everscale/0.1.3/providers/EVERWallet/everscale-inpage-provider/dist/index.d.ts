import { ProviderApiRequestParams, ProviderApiResponse, ProviderEvent, ProviderEventData, ProviderMethod, RawProviderApiRequestParams, RawProviderApiResponse, RawProviderEventData, RawProviderRequest } from './api';
import { AssetType, AssetTypeParams, EncryptedData, MergeInputObjectsArray, MergeOutputObjectsArray, ReadonlyAbiParam } from './models';
import { Address } from './utils';
import * as subscriber from './stream';
import * as contract from './contract';
export * from './api';
export * from './models';
export * from './contract';
export { Stream, Subscriber } from './stream';
export { Address, AddressLiteral, UniqueArray, mergeTransactions } from './utils';
/**
 * @category Provider
 */
export interface Provider {
    request<T extends ProviderMethod>(data: RawProviderRequest<T>): Promise<RawProviderApiResponse<T>>;
    addListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
    removeListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
    on<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
    once<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
    prependListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
    prependOnceListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
}
/**
 * @category Provider
 */
export declare type ProviderProperties = {
    /***
     * Provider factory which will be called if injected provider was not found.
     * Can be used for initialization of the standalone Everscale client
     */
    fallback?: () => Promise<Provider>;
};
/**
 * @category Provider
 */
export declare function hasEverscaleProvider(): Promise<boolean>;
/**
 * @category Provider
 */
export declare class ProviderRpcClient {
    private readonly _properties;
    private readonly _api;
    private readonly _mainInitializationPromise;
    private _additionalInitializationPromise?;
    private readonly _subscriptions;
    private readonly _contractSubscriptions;
    private _provider?;
    Contract: new <Abi>(abi: Abi, address: Address) => contract.Contract<Abi>;
    Subscriber: new () => subscriber.Subscriber;
    constructor(properties?: ProviderProperties);
    /**
     * Checks whether this page has injected Everscale provider
     */
    hasProvider(): Promise<boolean>;
    /**
     * Waits until provider api will be available. Calls `fallback` if no provider was found
     *
     * @throws ProviderNotFoundException when no provider found
     */
    ensureInitialized(): Promise<void>;
    /**
     * Whether provider api is ready
     */
    get isInitialized(): boolean;
    /**
     * Raw provider
     */
    get raw(): Provider;
    /**
     * Raw provider api
     */
    get rawApi(): RawProviderApiMethods;
    /**
     * Creates typed contract wrapper.
     *
     * @param abi Readonly object (must be declared with `as const`)
     * @param address Default contract address
     *
     * @deprecated `new ever.Contract(abi, address)` should be used instead
     */
    createContract<Abi>(abi: Abi, address: Address): contract.Contract<Abi>;
    /**
     * Creates subscriptions group
     *
     * @deprecated `new ever.Subscriber()` should be used instead
     */
    createSubscriber(): subscriber.Subscriber;
    /**
     * Requests new permissions for current origin.
     * Shows an approval window to the user.
     * Will overwrite already existing permissions
     *
     * ---
     * Required permissions: none
     */
    requestPermissions(args: ProviderApiRequestParams<'requestPermissions'>): Promise<ProviderApiResponse<'requestPermissions'>>;
    /**
     * Updates `accountInteraction` permission value
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    changeAccount(): Promise<void>;
    /**
     * Removes all permissions for current origin and stops all subscriptions
     */
    disconnect(): Promise<void>;
    /**
     * Called every time contract state changes
     */
    subscribe(eventName: 'contractStateChanged', params: {
        address: Address;
    }): Promise<Subscription<'contractStateChanged'>>;
    /**
     * Called on each new transactions batch, received on subscription
     */
    subscribe(eventName: 'transactionsFound', params: {
        address: Address;
    }): Promise<Subscription<'transactionsFound'>>;
    /**
     * Called every time when provider connection is established
     */
    subscribe(eventName: 'connected'): Promise<Subscription<'connected'>>;
    /**
     * Called when inpage provider disconnects from extension
     */
    subscribe(eventName: 'disconnected'): Promise<Subscription<'disconnected'>>;
    /**
     * Called each time the user changes network
     */
    subscribe(eventName: 'networkChanged'): Promise<Subscription<'networkChanged'>>;
    /**
     * Called when permissions are changed.
     * Mostly when account has been removed from the current `accountInteraction` permission,
     * or disconnect method was called
     */
    subscribe(eventName: 'permissionsChanged'): Promise<Subscription<'permissionsChanged'>>;
    /**
     * Called when the user logs out of the extension
     */
    subscribe(eventName: 'loggedOut'): Promise<Subscription<'loggedOut'>>;
    /**
     * Returns provider api state
     *
     * ---
     * Required permissions: none
     */
    getProviderState(): Promise<ProviderApiResponse<'getProviderState'>>;
    /**
     * Requests contract data
     *
     * ---
     * Required permissions: `basic`
     */
    getFullContractState(args: ProviderApiRequestParams<'getFullContractState'>): Promise<ProviderApiResponse<'getFullContractState'>>;
    /**
     * Requests accounts with specified code hash
     *
     * ---
     * Required permissions: `basic`
     */
    getAccountsByCodeHash(args: ProviderApiRequestParams<'getAccountsByCodeHash'>): Promise<ProviderApiResponse<'getAccountsByCodeHash'>>;
    /**
     * Requests contract transactions
     *
     * ---
     * Required permissions: `basic`
     */
    getTransactions(args: ProviderApiRequestParams<'getTransactions'>): Promise<ProviderApiResponse<'getTransactions'>>;
    /**
     * Searches transaction by hash
     *
     * ---
     * Required permissions: `basic`
     */
    getTransaction(args: ProviderApiRequestParams<'getTransaction'>): Promise<ProviderApiResponse<'getTransaction'>>;
    /**
     * Calculates contract address from code and init params
     *
     * ---
     * Required permissions: `basic`
     */
    getExpectedAddress<Abi>(abi: Abi, args: GetExpectedAddressParams<Abi>): Promise<Address>;
    /**
     * Computes hash of base64 encoded BOC
     *
     * ---
     * Required permissions: `basic`
     */
    getBocHash(boc: string): Promise<string>;
    /**
     * Creates base64 encoded BOC
     *
     * ---
     * Required permissions: `basic`
     */
    packIntoCell<P extends readonly ReadonlyAbiParam[]>(args: {
        structure: P;
        data: MergeInputObjectsArray<P>;
    }): Promise<ProviderApiResponse<'packIntoCell'>>;
    /**
     * Decodes base64 encoded BOC
     *
     * ---
     * Required permissions: `basic`
     */
    unpackFromCell<P extends readonly ReadonlyAbiParam[]>(args: {
        structure: P;
        boc: string;
        allowPartial: boolean;
    }): Promise<{
        data: MergeOutputObjectsArray<P>;
    }>;
    /**
     * Extracts public key from raw account state
     *
     * **NOTE:** can only be used on contracts which are deployed and has `pubkey` header
     *
     * ---
     * Required permissions: `basic`
     */
    extractPublicKey(boc: string): Promise<string>;
    /**
     * Converts base64 encoded contract code into tvc with default init data
     *
     * ---
     * Required permissions: `basic`
     */
    codeToTvc(code: string): Promise<string>;
    /**
     * Splits base64 encoded state init into code and data
     *
     * ---
     * Required permissions: `basic`
     */
    splitTvc(tvc: string): Promise<ProviderApiResponse<'splitTvc'>>;
    /**
     * Adds asset to the selected account
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    addAsset<T extends AssetType>(args: AddAssetParams<T>): Promise<ProviderApiResponse<'addAsset'>>;
    verifySignature(args: ProviderApiRequestParams<'verifySignature'>): Promise<ProviderApiResponse<'verifySignature'>>;
    /**
     * Signs arbitrary data.
     *
     * NOTE: hashes data before signing. Use `signDataRaw` to sign without hash.
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    signData(args: ProviderApiRequestParams<'signData'>): Promise<ProviderApiResponse<'signData'>>;
    /**
     * Signs arbitrary data without hashing it
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    signDataRaw(args: ProviderApiRequestParams<'signDataRaw'>): Promise<ProviderApiResponse<'signDataRaw'>>;
    /**
     * Encrypts arbitrary data with specified algorithm for each specified recipient
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    encryptData(args: ProviderApiRequestParams<'encryptData'>): Promise<EncryptedData[]>;
    /**
     * Decrypts encrypted data. Returns base64 encoded data
     *
     * ---
     * Requires permissions: `accountInteraction`
     */
    decryptData(encryptedData: EncryptedData): Promise<string>;
    /**
     * Sends internal message from user account.
     * Shows an approval window to the user.
     *
     * ---
     * Required permissions: `accountInteraction`
     */
    sendMessage(args: ProviderApiRequestParams<'sendMessage'>): Promise<ProviderApiResponse<'sendMessage'>>;
    private _registerEventHandlers;
    private _getEventSubscriptions;
}
/**
 * @category Provider
 */
export interface Subscription<T extends ProviderEvent> {
    /**
     * Fires on each incoming event with the event object as argument.
     *
     * @param eventName 'data'
     * @param listener
     */
    on(eventName: 'data', listener: (data: ProviderEventData<T>) => void): this;
    /**
     * Fires on successful re-subscription
     *
     * @param eventName 'subscribed'
     * @param listener
     */
    on(eventName: 'subscribed', listener: () => void): this;
    /**
     * Fires on unsubscription
     *
     * @param eventName 'unsubscribed'
     * @param listener
     */
    on(eventName: 'unsubscribed', listener: () => void): this;
    /**
     * Can be used to re-subscribe with the same parameters.
     */
    subscribe(): Promise<void>;
    /**
     * Unsubscribes the subscription.
     */
    unsubscribe(): Promise<void>;
}
/**
 * @category Provider
 */
export declare class ProviderNotFoundException extends Error {
    constructor();
}
/**
 * @category Provider
 */
export declare class ProviderNotInitializedException extends Error {
    constructor();
}
/**
 * @category Provider
 */
export declare type RawRpcMethod<P extends ProviderMethod> = RawProviderApiRequestParams<P> extends {} ? (args: RawProviderApiRequestParams<P>) => Promise<RawProviderApiResponse<P>> : () => Promise<RawProviderApiResponse<P>>;
/**
 * @category Provider
 */
export declare type RawProviderApiMethods = {
    [P in ProviderMethod]: RawRpcMethod<P>;
};
/**
 * @category Provider
 */
export declare type GetExpectedAddressParams<Abi> = Abi extends {
    data: infer D;
} ? {
    /**
     * Base64 encoded TVC file
     */
    tvc: string;
    /**
     * Contract workchain. 0 by default
     */
    workchain?: number;
    /**
     * Public key, which will be injected into the contract. 0 by default
     */
    publicKey?: string;
    /**
     * State init params
     */
    initParams: MergeInputObjectsArray<D>;
} : never;
/**
 * @category Provider
 */
export declare type AddAssetParams<T extends AssetType> = {
    /**
     * Owner's wallet address.
     * It is the same address as the `accountInteraction.address`, but it must be explicitly provided
     */
    account: Address;
    /**
     * Which asset to add
     */
    type: T;
    /**
     * Asset parameters
     */
    params: AssetTypeParams<T>;
};
