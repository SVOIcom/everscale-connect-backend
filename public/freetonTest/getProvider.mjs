/*
  _______          _____                _     _
 |__   __|        |  __ \              (_)   | |
    | | ___  _ __ | |__) | __ _____   ___  __| | ___ _ __
    | |/ _ \| '_ \|  ___/ '__/ _ \ \ / / |/ _` |/ _ \ '__|
    | | (_) | | | | |   | | | (_) \ V /| | (_| |  __/ |
    |_|\___/|_| |_|_|   |_|  \___/ \_/ |_|\__,_|\___|_|
 */
/**
 * @name FreeTON connection provider
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */
import {} from '../thirdparty/eventemitter3.min.js';

import TonWeb from "./providers/TonWeb/TonWeb.mjs";
import TonWallet from "./providers/TonWallet/TonWallet.mjs";
import CrystalWallet from "./providers/CrystalWallet/CrystalWallet.mjs";
import ExtraTon from "./providers/ExtraTon/ExtraTon.mjs";
import TonBackendWeb from "./providers/TonBackendWeb/TonBackendWeb.mjs";
import utils from "./utils.mjs";

const PROVIDERS = {
    TonWallet: 'tonwallet',
    TonWeb: 'tonweb',
    CrystalWallet: 'crystalwallet',
    ExtraTON: 'extraton',
    TonBackendWeb: 'tonbackendweb',
};


const PROVIDERS_INSTANCES = {
    tonweb: TonWeb,
    tonwallet: TonWallet,
    crystalwallet: CrystalWallet,
    extraton: ExtraTon,
    tonbackendweb: TonBackendWeb
}



/**
 * Provider factory
 * @param {object|undefined} options
 * @param {string} provider
 * @returns {*}
 */
function getProvider(options = undefined, provider = PROVIDERS.TonWallet) {
    if(PROVIDERS_INSTANCES[provider]) {
        return new PROVIDERS_INSTANCES[provider](options);
    } else {
        throw new Error('Invalid provider ' + provider);
    }
}

export {getProvider as default, PROVIDERS, utils as UTILS};