/**
 * @name Everscale connection provider
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */


let CACHE_HODLER = {};


const cache = {
    async get(key, defaultValue = undefined) {
        return CACHE_HODLER[key] || defaultValue;
    },
    async set(key, value) {
        CACHE_HODLER[key] = value;
    }
}

export default cache;