import { Address, UniqueArray } from './utils';
import { AbiParam, FullContractState, Transaction, AbiFunctionName, AbiEventName, AbiFunctionInputs, DecodedAbiFunctionOutputs, DecodedAbiFunctionInputs, DecodedAbiEventData } from './models';
import { ProviderRpcClient } from './index';
/**
 * @category Contract
 */
export declare class Contract<Abi> {
    private readonly _provider;
    private readonly _abi;
    private readonly _functions;
    private readonly _events;
    private readonly _address;
    private readonly _methods;
    constructor(provider: ProviderRpcClient, abi: Abi, address: Address);
    get methods(): ContractMethods<Abi>;
    get address(): Address;
    get abi(): string;
    decodeTransaction(args: DecodeTransactionParams<Abi>): Promise<DecodedTransaction<Abi, AbiFunctionName<Abi>> | undefined>;
    decodeTransactionEvents(args: DecodeTransactionEventsParams): Promise<DecodedEvent<Abi, AbiEventName<Abi>>[]>;
    decodeInputMessage(args: DecodeInputParams<Abi>): Promise<DecodedInput<Abi, AbiFunctionName<Abi>> | undefined>;
    decodeOutputMessage(args: DecodeOutputParams<Abi>): Promise<DecodedOutput<Abi, AbiFunctionName<Abi>> | undefined>;
}
/**
 * @category Contract
 */
export declare class TvmException extends Error {
    readonly code: number;
    constructor(code: number);
}
/**
 * @category Contract
 */
export interface ContractMethod<I, O> {
    /**
     * Target contract address
     */
    readonly address: Address;
    readonly abi: string;
    readonly method: string;
    readonly params: I;
    /**
     * Sends internal message and returns wallet transactions
     *
     * @param args
     */
    send(args: SendInternalParams): Promise<Transaction>;
    /**
     * Sends internal message and waits for the new transaction on target address
     *
     * @param args
     */
    sendWithResult(args: SendInternalParams): Promise<{
        parentTransaction: Transaction;
        childTransaction: Transaction;
        output?: O;
    }>;
    /**
     * Estimates wallet fee for calling this method as an internal message
     */
    estimateFees(args: SendInternalParams): Promise<string>;
    /**
     * Sends external message and returns contract transaction with parsed output
     *
     * @param args
     */
    sendExternal(args: SendExternalParams): Promise<{
        transaction: Transaction;
        output?: O;
    }>;
    /**
     * Runs message locally
     */
    call(args?: CallParams): Promise<O>;
}
/**
 * @category Contract
 */
export declare type ContractMethods<C> = {
    [K in AbiFunctionName<C>]: (params: AbiFunctionInputs<C, K>) => ContractMethod<AbiFunctionInputs<C, K>, DecodedAbiFunctionOutputs<C, K>>;
};
/**
 * @category Contract
 */
export declare type ContractFunction = {
    name: string;
    inputs?: AbiParam[];
    outputs?: AbiParam[];
};
/**
 * @category Contract
 */
export declare type SendInternalParams = {
    from: Address;
    amount: string;
    /**
     * @default true
     */
    bounce?: boolean;
};
/**
 * @category Contract
 */
export declare type SendExternalParams = {
    publicKey: string;
    stateInit?: string;
    /**
     * Whether to run this message locally. Default: false
     */
    local?: boolean;
    /**
     * Whether to prepare this message without signature. Default: false
     */
    withoutSignature?: boolean;
};
/**
 * @category Contract
 */
export declare type CallParams = {
    /**
     * Cached contract state
     */
    cachedState?: FullContractState;
    /**
     * Whether to run the method locally as responsible.
     *
     * This will use internal message with unlimited account balance.
     */
    responsible?: boolean;
};
/**
 * @category Contract
 */
export declare type DecodeTransactionParams<Abi> = {
    transaction: Transaction;
    methods: UniqueArray<AbiFunctionName<Abi>[]>;
};
/**
 * @category Contract
 */
export declare type DecodedTransaction<Abi, T> = T extends AbiFunctionName<Abi> ? {
    method: T;
    input: DecodedAbiFunctionInputs<Abi, T>;
    output: DecodedAbiFunctionOutputs<Abi, T>;
} : never;
/**
 * @category Contract
 */
export declare type DecodeInputParams<Abi> = {
    body: string;
    methods: UniqueArray<AbiFunctionName<Abi>[]>;
    internal: boolean;
};
/**
 * @category Contract
 */
export declare type DecodedInput<Abi, T> = T extends AbiFunctionName<Abi> ? {
    method: T;
    input: DecodedAbiFunctionInputs<Abi, T>;
} : never;
/**
 * @category Contract
 */
export declare type DecodeOutputParams<Abi> = {
    body: string;
    methods: UniqueArray<AbiFunctionName<Abi>[]>;
};
/**
 * @category Contract
 */
export declare type DecodedOutput<Abi, T> = T extends AbiFunctionName<Abi> ? {
    method: T;
    output: DecodedAbiFunctionOutputs<Abi, T>;
} : never;
/**
 * @category Contract
 */
export declare type DecodeTransactionEventsParams = {
    transaction: Transaction;
};
/**
 * @category Contract
 */
export declare type DecodedEvent<Abi, T> = T extends AbiEventName<Abi> ? {
    event: T;
    data: DecodedAbiEventData<Abi, T>;
} : never;
