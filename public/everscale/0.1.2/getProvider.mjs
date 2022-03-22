/*

  ________      ________ _____   _____  _____          _      ______
 |  ____\ \    / /  ____|  __ \ / ____|/ ____|   /\   | |    |  ____|
 | |__   \ \  / /| |__  | |__) | (___ | |       /  \  | |    | |__
 |  __|   \ \/ / |  __| |  _  / \___ \| |      / /\ \ | |    |  __|
 | |____   \  /  | |____| | \ \ ____) | |____ / ____ \| |____| |____
 |______|   \/   |______|_|  \_\_____/ \_____/_/    \_\______|______|
  / ____|                          | |
 | |     ___  _ __  _ __   ___  ___| |_
 | |    / _ \| '_ \| '_ \ / _ \/ __| __|
 | |___| (_) | | | | | | |  __/ (__| |_
  \_____\___/|_| |_|_| |_|\___|\___|\__|
 */
/**
 * @name Everscale connection provider
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */
import {} from '../../thirdparty/eventemitter3.min.js';

import EverWeb from "./providers/EverWeb/EverWeb.mjs";
import EverscaleWallet from "./providers/EverscaleWallet/EverscaleWallet.mjs";
import EVERWallet from "./providers/EVERWallet/EVERWallet.mjs?v=1";
import ExtraTon from "./providers/ExtraTon/ExtraTon.mjs";
import EverBackendWeb from "./providers/EverBackendWeb/EverBackendWeb.mjs";
import utils from "./utils.mjs";
import * as CONSTANTS from "./constants.mjs";

const PROVIDERS = {

    EverscaleWallet: 'everscalewallet',
    EverWeb: 'everweb',
    EVERWallet: 'everwallet',
    EverBackendWeb: 'everbackendweb',

    /**
     * @deprecated
     */
    TonBackendWeb: 'everbackendweb',
    /**
     * @deprecated
     */
    TonWeb: 'everweb',
    /**
     * @deprecated
     */
    ExtraTON: 'extraton',
    /**
     * @deprecated
     */
    TonWallet: 'tonwallet',
    /**
     * @deprecated
     */
    CrystalWallet: 'crystalwallet',
};


const PROVIDERS_INSTANCES = {

    everweb: EverWeb,
    everscalewallet: EverscaleWallet,
    everwallet: EVERWallet,
    everbackendweb: EverBackendWeb,

    /**
     * @deprecated
     */
    tonweb: EverWeb,
    tonbackendweb: EverBackendWeb,
    crystalwallet: EVERWallet,
    extraton: ExtraTon,
    tonwallet: EverscaleWallet,
}


/**
 * Provider factory
 * @param {object|undefined} options
 * @param {string} provider
 * @returns {*}
 */
function getProvider(options = undefined, provider = PROVIDERS.EverscaleWallet) {
    if(PROVIDERS_INSTANCES[provider]) {
        return new PROVIDERS_INSTANCES[provider](options);
    } else {
        throw new Error('Invalid provider ' + provider);
    }
}

export {getProvider as default, PROVIDERS, utils as UTILS, CONSTANTS};