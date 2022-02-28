"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TvmException = exports.Contract = void 0;
const models_1 = require("./models");
/**
 * @category Contract
 */
class Contract {
    constructor(provider, abi, address) {
        if (!Array.isArray(abi.functions)) {
            throw new Error('Invalid abi. Functions array required');
        }
        if (!Array.isArray(abi.events)) {
            throw new Error('Invalid abi. Events array required');
        }
        this._provider = provider;
        this._abi = JSON.stringify(abi);
        this._functions = abi.functions.reduce((functions, item) => {
            functions[item.name] = { inputs: item.inputs || [], outputs: item.outputs || [] };
            return functions;
        }, {});
        this._events = abi.events.reduce((events, item) => {
            events[item.name] = { inputs: item.inputs || [] };
            return events;
        }, {});
        this._address = address;
        class ContractMethodImpl {
            constructor(provider, functionAbi, abi, address, method, params) {
                this.provider = provider;
                this.functionAbi = functionAbi;
                this.abi = abi;
                this.address = address;
                this.method = method;
                this.params = (0, models_1.serializeTokensObject)(params);
            }
            async send(args) {
                const { transaction } = await this.provider.rawApi.sendMessage({
                    sender: args.from.toString(),
                    recipient: this.address.toString(),
                    amount: args.amount,
                    bounce: args.bounce == null ? true : args.bounce,
                    payload: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params,
                    },
                });
                return (0, models_1.parseTransaction)(transaction);
            }
            async sendWithResult(args) {
                const subscriber = this.provider.createSubscriber();
                try {
                    // Parent transaction from wallet
                    let parentTransaction;
                    // Child transaction promise
                    let resolveChildTransactionPromise;
                    const childTransactionPromise = new Promise((resolve) => {
                        resolveChildTransactionPromise = (tx) => resolve(tx);
                    });
                    // Array for collecting transactions on target before parent transaction promise resolution
                    const possibleChildren = [];
                    // Subscribe to this account
                    subscriber.transactions(this.address)
                        .flatMap(batch => batch.transactions)
                        // Listen only messages from sender
                        .filter(item => { var _a; return ((_a = item.inMessage.src) === null || _a === void 0 ? void 0 : _a.equals(args.from)) || false; })
                        .on((tx) => {
                        if (parentTransaction == null) {
                            // If we don't known whether the message was sent just collect all transactions from the sender
                            possibleChildren.push(tx);
                        }
                        else if (parentTransaction.possibleMessages.findIndex((msg) => msg.hash == tx.inMessage.hash) >= 0) {
                            // Resolve promise if transaction was found
                            resolveChildTransactionPromise === null || resolveChildTransactionPromise === void 0 ? void 0 : resolveChildTransactionPromise(tx);
                        }
                    });
                    // Send message
                    const transaction = await this.send(args);
                    // Extract all outgoing messages from the parent transaction to this contract
                    const possibleMessages = transaction.outMessages.filter(msg => { var _a; return ((_a = msg.dst) === null || _a === void 0 ? void 0 : _a.equals(this.address)) || false; });
                    // Update stream state
                    parentTransaction = {
                        transaction,
                        possibleMessages,
                    };
                    // Check whether child transaction was already found
                    const alreadyReceived = possibleChildren.find((tx) => {
                        return possibleMessages.findIndex((msg) => msg.hash == tx.inMessage.hash) >= 0;
                    });
                    if (alreadyReceived != null) {
                        resolveChildTransactionPromise === null || resolveChildTransactionPromise === void 0 ? void 0 : resolveChildTransactionPromise(alreadyReceived);
                    }
                    const childTransaction = await childTransactionPromise;
                    // Parse output
                    let output = undefined;
                    try {
                        const result = await this.provider.rawApi.decodeTransaction({
                            transaction: (0, models_1.serializeTransaction)(childTransaction),
                            abi: this.abi,
                            method: this.method,
                        });
                        if (result != null) {
                            output = this.functionAbi.outputs != null
                                ? (0, models_1.parseTokensObject)(this.functionAbi.outputs, result.output)
                                : {};
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                    // Done
                    return {
                        parentTransaction: parentTransaction.transaction,
                        childTransaction,
                        output,
                    };
                }
                finally {
                    await subscriber.unsubscribe();
                }
            }
            async estimateFees(args) {
                const { fees } = await this.provider.rawApi.estimateFees({
                    sender: args.from.toString(),
                    recipient: this.address.toString(),
                    amount: args.amount,
                    payload: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params,
                    },
                });
                return fees;
            }
            async sendExternal(args) {
                let method = args.withoutSignature === true
                    ? this.provider.rawApi.sendUnsignedExternalMessage
                    : this.provider.rawApi.sendExternalMessage;
                let { transaction, output } = await method({
                    publicKey: args.publicKey,
                    recipient: this.address.toString(),
                    stateInit: args.stateInit,
                    payload: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params,
                    },
                    local: args.local,
                });
                return {
                    transaction: (0, models_1.parseTransaction)(transaction),
                    output: output != null ? (0, models_1.parseTokensObject)(this.functionAbi.outputs, output) : undefined,
                };
            }
            async call(args = {}) {
                let { output, code } = await this.provider.rawApi.runLocal({
                    address: this.address.toString(),
                    cachedState: args.cachedState,
                    responsible: args.responsible,
                    functionCall: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params,
                    },
                });
                if (output == null || code != 0) {
                    throw new TvmException(code);
                }
                else {
                    return (0, models_1.parseTokensObject)(this.functionAbi.outputs, output);
                }
            }
        }
        this._methods = new Proxy({}, {
            get: (_object, method) => {
                const rawAbi = this._functions[method];
                return (params) => new ContractMethodImpl(this._provider, rawAbi, this._abi, this._address, method, params);
            },
        });
    }
    get methods() {
        return this._methods;
    }
    get address() {
        return this._address;
    }
    get abi() {
        return this._abi;
    }
    async decodeTransaction(args) {
        try {
            const result = await this._provider.rawApi.decodeTransaction({
                transaction: (0, models_1.serializeTransaction)(args.transaction),
                abi: this._abi,
                method: args.methods,
            });
            if (result == null) {
                return undefined;
            }
            let { method, input, output } = result;
            const rawAbi = this._functions[method];
            return {
                method,
                input: rawAbi.inputs != null ? (0, models_1.parseTokensObject)(rawAbi.inputs, input) : {},
                output: rawAbi.outputs != null ? (0, models_1.parseTokensObject)(rawAbi.outputs, output) : {},
            };
        }
        catch (_) {
            return undefined;
        }
    }
    async decodeTransactionEvents(args) {
        try {
            const { events } = await this._provider.rawApi.decodeTransactionEvents({
                transaction: (0, models_1.serializeTransaction)(args.transaction),
                abi: this._abi,
            });
            const result = [];
            for (const { event, data } of events) {
                const rawAbi = this._events[event];
                result.push({
                    event,
                    data: rawAbi.inputs != null ? (0, models_1.parseTokensObject)(rawAbi.inputs, data) : {},
                });
            }
            return result;
        }
        catch (_) {
            return [];
        }
    }
    async decodeInputMessage(args) {
        try {
            const result = await this._provider.rawApi.decodeInput({
                abi: this._abi,
                body: args.body,
                internal: args.internal,
                method: args.methods,
            });
            if (result == null) {
                return undefined;
            }
            let { method, input } = result;
            const rawAbi = this._functions[method];
            return {
                method,
                input: rawAbi.inputs != null ? (0, models_1.parseTokensObject)(rawAbi.inputs, input) : {},
            };
        }
        catch (_) {
            return undefined;
        }
    }
    async decodeOutputMessage(args) {
        try {
            const result = await this._provider.rawApi.decodeOutput({
                abi: this._abi,
                body: args.body,
                method: args.methods,
            });
            if (result == null) {
                return undefined;
            }
            let { method, output } = result;
            const rawAbi = this._functions[method];
            return {
                method,
                output: rawAbi.outputs != null ? (0, models_1.parseTokensObject)(rawAbi.outputs, output) : {},
            };
        }
        catch (_) {
            return undefined;
        }
    }
}
exports.Contract = Contract;
/**
 * @category Contract
 */
class TvmException extends Error {
    constructor(code) {
        super(`TvmException: ${code}`);
        this.code = code;
    }
}
exports.TvmException = TvmException;
