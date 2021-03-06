import { Address, ArrayItemType } from './utils';
/**
 * @category Models
 */
export interface ContractState {
    balance: string;
    genTimings: GenTimings;
    lastTransactionId?: LastTransactionId;
    isDeployed: boolean;
    codeHash?: string;
}
/**
 * @category Models
 */
export interface FullContractState extends ContractState {
    boc: string;
}
/**
 * @category Models
 */
export declare type GenTimings = {
    genLt: string;
    genUtime: number;
};
/**
 * @category Models
 */
export declare type WalletContractType = 'SafeMultisigWallet' | 'SafeMultisigWallet24h' | 'SetcodeMultisigWallet' | 'BridgeMultisigWallet' | 'SurfWallet' | 'WalletV3';
/**
 * @category Models
 */
export declare type ContractUpdatesSubscription = {
    /**
     * Whether to listen contract state updates
     */
    state: boolean;
    /**
     * Whether to listen new contract transactions
     */
    transactions: boolean;
};
/**
 * @category Models
 */
export declare type TransactionsBatchInfo = {
    minLt: string;
    maxLt: string;
    batchType: TransactionsBatchType;
};
/**
 * @category Models
 */
export declare type TransactionsBatchType = 'old' | 'new';
/**
 * @category Models
 */
export declare type Transaction<Addr = Address> = {
    id: TransactionId;
    prevTransactionId?: TransactionId;
    createdAt: number;
    aborted: boolean;
    exitCode?: number;
    resultCode?: number;
    origStatus: AccountStatus;
    endStatus: AccountStatus;
    totalFees: string;
    inMessage: Message<Addr>;
    outMessages: Message<Addr>[];
};
/**
 * @category Models
 */
export declare type RawTransaction = Transaction<string>;
/**
 * @category Models
 */
export declare function serializeTransaction(transaction: Transaction): RawTransaction;
/**
 * @category Models
 */
export declare function parseTransaction(transaction: RawTransaction): Transaction;
/**
 * @category Models
 */
export declare type Message<Addr = Address> = {
    hash: string;
    src?: Addr;
    dst?: Addr;
    value: string;
    bounce: boolean;
    bounced: boolean;
    body?: string;
    bodyHash?: string;
};
/**
 * @category Models
 */
export declare type RawMessage = Message<string>;
/**
 * @category Models
 */
export declare function serializeMessage(message: Message): RawMessage;
/**
 * @category Models
 */
export declare function parseMessage(message: RawMessage): Message;
/**
 * @category Models
 */
export declare type AccountStatus = 'uninit' | 'frozen' | 'active' | 'nonexist';
/**
 * @category Models
 */
export declare type LastTransactionId = {
    isExact: boolean;
    lt: string;
    hash?: string;
};
/**
 * @category Models
 */
export declare type TransactionId = {
    lt: string;
    hash: string;
};
/**
 * @category Models
 */
export declare type Permissions<Addr = Address> = {
    basic: true;
    accountInteraction: {
        address: Addr;
        publicKey: string;
        contractType: WalletContractType;
    };
};
/**
 * @category Models
 */
export declare type RawPermissions = Permissions<string>;
/**
 * @category Models
 */
export declare function parsePermissions(permissions: Partial<RawPermissions>): Partial<Permissions>;
/**
 * @category Models
 */
export declare function parseAccountInteraction(accountInteraction: Required<RawPermissions>['accountInteraction']): Required<Permissions>['accountInteraction'];
/**
 * @category Models
 */
export declare type Permission = keyof Permissions;
/**
 * @category Models
 */
export declare type PermissionData<T extends Permission, Addr = Address> = Permissions<Addr>[T];
/**
 * @category Models
 */
export declare type AssetType = 'tip3_token';
/**
 * @category Models
 */
export declare type AssetTypeParams<T extends AssetType, Addr = Address> = T extends 'tip3_token' ? {
    rootContract: Addr;
} : never;
/**
 * @category Models
 */
export declare type EncryptionAlgorithm = 'ChaCha20Poly1305';
/**
 * @category Models
 */
export declare type EncryptedData = {
    algorithm: EncryptionAlgorithm;
    /**
     * Hex encoded encryptor's public key
     */
    sourcePublicKey: string;
    /**
     * Hex encoded recipient public key
     */
    recipientPublicKey: string;
    /**
     * Base64 encoded data
     */
    data: string;
    /**
     * Base64 encoded nonce
     */
    nonce: string;
};
/**
 * @category Models
 */
export declare type SignedMessage = {
    bodyHash: string;
    expireAt: number;
    boc: string;
};
/**
 * @category Models
 */
export declare type TokenValue<Addr = Address> = null | boolean | string | number | Addr | {
    [K in string]: TokenValue<Addr>;
} | TokenValue<Addr>[] | (readonly [TokenValue<Addr>, TokenValue<Addr>])[];
/**
 * @category Models
 */
export declare type RawTokenValue = TokenValue<string>;
/**
 * @category Models
 */
export declare type TokensObject<Addr = Address> = {
    [K in string]: TokenValue<Addr>;
};
/**
 * @category Models
 */
export declare type RawTokensObject = TokensObject<string>;
/**
 * @category Models
 */
export declare type FunctionCall<Addr = Address> = {
    /**
     * Contract ABI
     */
    abi: string;
    /**
     * Specific method from specified contract ABI
     */
    method: string;
    /**
     * Method arguments
     */
    params: TokensObject<Addr>;
};
/**
 * @category Models
 */
export declare type RawFunctionCall = FunctionCall<string>;
declare type AbiParamKindUint = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint160' | 'uint256';
declare type AbiParamKindInt = 'int8' | 'int16' | 'int32' | 'int64' | 'int128' | 'int160' | 'int256';
declare type AbiParamKindTuple = 'tuple';
declare type AbiParamKindBool = 'bool';
declare type AbiParamKindCell = 'cell';
declare type AbiParamKindAddress = 'address';
declare type AbiParamKindBytes = 'bytes';
declare type AbiParamKindString = 'string';
declare type AbiParamKindGram = 'gram';
declare type AbiParamKindTime = 'time';
declare type AbiParamKindExpire = 'expire';
declare type AbiParamKindPublicKey = 'pubkey';
declare type AbiParamKindArray = `${AbiParamKind}[]`;
declare type AbiParamKindMap = `map(${AbiParamKindInt | AbiParamKindUint | AbiParamKindAddress},${AbiParamKind | `${AbiParamKind}[]`})`;
declare type AbiParamOptional = `optional(${AbiParamKind})`;
/**
 * @category Models
 */
export declare type AbiParamKind = AbiParamKindUint | AbiParamKindInt | AbiParamKindTuple | AbiParamKindBool | AbiParamKindCell | AbiParamKindAddress | AbiParamKindBytes | AbiParamKindString | AbiParamKindGram | AbiParamKindTime | AbiParamKindExpire | AbiParamKindPublicKey;
/**
 * @category Models
 */
export declare type AbiParam = {
    name: string;
    type: AbiParamKind | AbiParamKindMap | AbiParamKindArray | AbiParamOptional;
    components?: AbiParam[];
};
/**
 * @category Models
 */
export declare type ReadonlyAbiParam = {
    name: string;
    type: AbiParamKind | AbiParamKindMap | AbiParamKindArray | AbiParamOptional;
    components?: readonly ReadonlyAbiParam[];
};
/**
 * @category Models
 */
export declare function serializeTokensObject(object: TokensObject): RawTokensObject;
/**
 * @category Models
 */
export declare function parseTokensObject(params: AbiParam[], object: RawTokensObject): TokensObject;
/**
 * @category Models
 */
export declare type HeadersObject = {
    pubkey?: string;
    expire?: string | number;
    time?: string | number;
};
declare type InputTokenValue<T, C> = T extends AbiParamKindUint | AbiParamKindInt | AbiParamKindGram | AbiParamKindTime | AbiParamKindExpire ? string | number : T extends AbiParamKindBool ? boolean : T extends AbiParamKindCell | AbiParamKindBytes | AbiParamKindString | AbiParamKindPublicKey ? string : T extends AbiParamKindAddress ? Address : T extends AbiParamKindTuple ? MergeInputObjectsArray<C> : T extends `${infer K}[]` ? InputTokenValue<K, C>[] : T extends `map(${infer K},${infer V})` ? (readonly [InputTokenValue<K, undefined>, InputTokenValue<V, C>])[] : T extends `optional(${infer V})` ? (V | null) : never;
declare type OutputTokenValue<T, C> = T extends AbiParamKindUint | AbiParamKindInt | AbiParamKindGram | AbiParamKindTime | AbiParamKindCell | AbiParamKindBytes | AbiParamKindString | AbiParamKindPublicKey ? string : T extends AbiParamKindExpire ? number : T extends AbiParamKindBool ? boolean : T extends AbiParamKindAddress ? Address : T extends AbiParamKindTuple ? MergeOutputObjectsArray<C> : T extends `${infer K}[]` ? OutputTokenValue<K, C>[] : T extends `map(${infer K},${infer V})` ? (readonly [OutputTokenValue<K, undefined>, OutputTokenValue<V, C>])[] : T extends `optional(${infer V})` ? (OutputTokenValue<V, C> | null) : never;
/**
 * @category Models
 */
export declare type InputTokenObject<O> = O extends {
    name: infer K;
    type: infer T;
    components?: infer C;
} ? K extends string ? {
    [P in K]: InputTokenValue<T, C>;
} : never : never;
/**
 * @category Models
 */
export declare type OutputTokenObject<O> = O extends {
    name: infer K;
    type: infer T;
    components?: infer C;
} ? K extends string ? {
    [P in K]: OutputTokenValue<T, C>;
} : never : never;
/**
 * @category Models
 */
export declare type MergeInputObjectsArray<A> = A extends readonly [infer T, ...infer Ts] ? (InputTokenObject<T> & MergeInputObjectsArray<[...Ts]>) : A extends readonly [infer T] ? InputTokenObject<T> : A extends readonly [] ? {} : never;
/**
 * @category Models
 */
export declare type MergeOutputObjectsArray<A> = A extends readonly [infer T, ...infer Ts] ? (OutputTokenObject<T> & MergeOutputObjectsArray<[...Ts]>) : A extends readonly [infer T] ? OutputTokenObject<T> : A extends readonly [] ? {} : never;
declare type AbiFunction<C> = C extends {
    functions: infer F;
} ? F extends readonly unknown[] ? ArrayItemType<F> : never : never;
declare type AbiEvent<C> = C extends {
    events: infer E;
} ? E extends readonly unknown[] ? ArrayItemType<E> : never : never;
/**
 * @category Models
 */
export declare type AbiFunctionName<C> = AbiFunction<C>['name'];
/**
 * @category Models
 */
export declare type AbiEventName<C> = AbiEvent<C>['name'];
declare type PickFunction<C, T extends AbiFunctionName<C>> = Extract<AbiFunction<C>, {
    name: T;
}>;
declare type PickEvent<C, T extends AbiEventName<C>> = Extract<AbiEvent<C>, {
    name: T;
}>;
/**
 * @category Models
 */
export declare type AbiFunctionInputs<C, T extends AbiFunctionName<C>> = MergeInputObjectsArray<PickFunction<C, T>['inputs']>;
/**
 * @category Models
 */
export declare type DecodedAbiFunctionInputs<C, T extends AbiFunctionName<C>> = MergeOutputObjectsArray<PickFunction<C, T>['inputs']>;
/**
 * @category Models
 */
export declare type DecodedAbiFunctionOutputs<C, T extends AbiFunctionName<C>> = MergeOutputObjectsArray<PickFunction<C, T>['outputs']>;
/**
 * @category Models
 */
export declare type DecodedAbiEventData<C, T extends AbiEventName<C>> = MergeOutputObjectsArray<PickEvent<C, T>['inputs']>;
export {};
