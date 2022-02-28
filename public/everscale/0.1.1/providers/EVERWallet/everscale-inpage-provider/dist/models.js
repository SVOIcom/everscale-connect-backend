import { Address } from './utils.js';
/**
 * @category Models
 */
export function serializeTransaction(transaction) {
    return {
        ...transaction,
        inMessage: serializeMessage(transaction.inMessage),
        outMessages: transaction.outMessages.map(serializeMessage),
    };
}
/**
 * @category Models
 */
export function parseTransaction(transaction) {
    return {
        ...transaction,
        inMessage: parseMessage(transaction.inMessage),
        outMessages: transaction.outMessages.map(parseMessage),
    };
}
/**
 * @category Models
 */
export function serializeMessage(message) {
    return {
        ...message,
        src: message.src ? message.src.toString() : undefined,
        dst: message.dst ? message.dst.toString() : undefined,
    };
}
/**
 * @category Models
 */
export function parseMessage(message) {
    return {
        ...message,
        src: message.src ? new Address(message.src) : undefined,
        dst: message.dst ? new Address(message.dst) : undefined,
    };
}
/**
 * @category Models
 */
export function parsePermissions(permissions) {
    return {
        ...permissions,
        accountInteraction: permissions.accountInteraction ? parseAccountInteraction(permissions.accountInteraction) : undefined,
    };
}
/**
 * @category Models
 */
export function parseAccountInteraction(accountInteraction) {
    return {
        ...accountInteraction,
        address: new Address(accountInteraction.address),
    };
}
/**
 * @category Models
 */
export function serializeTokensObject(object) {
    return serializeTokenValue(object);
}
function serializeTokenValue(token) {
    if (token instanceof Address) {
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
export function parseTokensObject(params, object) {
    const result = {};
    for (const param of params) {
        result[param.name] = parseTokenValue(param, object[param.name]);
    }
    return result;
}
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
            return new Address(token);
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
