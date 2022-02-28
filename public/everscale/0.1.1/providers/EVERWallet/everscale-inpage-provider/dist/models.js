"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTokensObject = exports.serializeTokensObject = exports.parseAccountInteraction = exports.parsePermissions = exports.parseMessage = exports.serializeMessage = exports.parseTransaction = exports.serializeTransaction = void 0;
const utils_1 = require("./utils");
/**
 * @category Models
 */
function serializeTransaction(transaction) {
    return {
        ...transaction,
        inMessage: serializeMessage(transaction.inMessage),
        outMessages: transaction.outMessages.map(serializeMessage),
    };
}
exports.serializeTransaction = serializeTransaction;
/**
 * @category Models
 */
function parseTransaction(transaction) {
    return {
        ...transaction,
        inMessage: parseMessage(transaction.inMessage),
        outMessages: transaction.outMessages.map(parseMessage),
    };
}
exports.parseTransaction = parseTransaction;
/**
 * @category Models
 */
function serializeMessage(message) {
    return {
        ...message,
        src: message.src ? message.src.toString() : undefined,
        dst: message.dst ? message.dst.toString() : undefined,
    };
}
exports.serializeMessage = serializeMessage;
/**
 * @category Models
 */
function parseMessage(message) {
    return {
        ...message,
        src: message.src ? new utils_1.Address(message.src) : undefined,
        dst: message.dst ? new utils_1.Address(message.dst) : undefined,
    };
}
exports.parseMessage = parseMessage;
/**
 * @category Models
 */
function parsePermissions(permissions) {
    return {
        ...permissions,
        accountInteraction: permissions.accountInteraction ? parseAccountInteraction(permissions.accountInteraction) : undefined,
    };
}
exports.parsePermissions = parsePermissions;
/**
 * @category Models
 */
function parseAccountInteraction(accountInteraction) {
    return {
        ...accountInteraction,
        address: new utils_1.Address(accountInteraction.address),
    };
}
exports.parseAccountInteraction = parseAccountInteraction;
/**
 * @category Models
 */
function serializeTokensObject(object) {
    return serializeTokenValue(object);
}
exports.serializeTokensObject = serializeTokensObject;
function serializeTokenValue(token) {
    if (token instanceof utils_1.Address) {
        return token.toString();
    }
    if (Array.isArray(token)) {
        const result = [];
        for (const item of token) {
            result.push(serializeTokenValue(item));
        }
        return result;
    }
    else if (token != null && typeof token === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(token)) {
            result[key] = serializeTokenValue(value);
        }
        return result;
    }
    else {
        return token;
    }
}
/**
 * @category Models
 */
function parseTokensObject(params, object) {
    const result = {};
    for (const param of params) {
        result[param.name] = parseTokenValue(param, object[param.name]);
    }
    return result;
}
exports.parseTokensObject = parseTokensObject;
function parseTokenValue(param, token) {
    if (!param.type.startsWith('map')) {
        const isArray = param.type.endsWith('[]');
        const isOptional = !isArray && param.type.startsWith('optional');
        const rawType = (isArray ?
            param.type.slice(0, -2) :
            isOptional ?
                param.type.slice(9, -1) :
                param.type);
        if (isArray) {
            const rawParam = { name: param.name, type: rawType, components: param.components };
            const result = [];
            for (const item of token) {
                result.push(parseTokenValue(rawParam, item));
            }
            return result;
        }
        else if (isOptional) {
            if (token == null) {
                return null;
            }
            else {
                const rawParam = { name: param.name, type: rawType, components: param.components };
                return parseTokenValue(rawParam, token);
            }
        }
        else if (rawType == 'tuple') {
            const result = {};
            if (param.components != null) {
                for (const component of param.components) {
                    result[component.name] = parseTokenValue(component, token[component.name]);
                }
            }
            return result;
        }
        else if (rawType == 'address') {
            return new utils_1.Address(token);
        }
        else {
            return token;
        }
    }
    else {
        let [keyType, valueType] = param.type.split(',');
        keyType = keyType.slice(4);
        valueType = valueType.slice(0, -1);
        const result = [];
        for (const [key, value] of token) {
            result.push([parseTokenValue({
                    name: '',
                    type: keyType,
                }, key), parseTokenValue({
                    name: '',
                    type: valueType,
                    components: param.components,
                }, value)]);
        }
        return result;
    }
}
