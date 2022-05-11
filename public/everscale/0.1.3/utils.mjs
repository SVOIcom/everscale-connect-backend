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

const utils = {
    /**
     * Shorten pubkey or address
     * @param pubkey
     * @param delimiter
     * @returns {string}
     */
    shortenPubkey: (pubkey, delimiter = '...') => {
        pubkey = String(pubkey);
        return pubkey.substr(0, 6) + delimiter + pubkey.substr(-4);
    },
    /**
     * Convert string to hex string
     * @param {string} str
     * @returns {string}
     */
    toHex(str) {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            result += str.charCodeAt(i).toString(16);
        }
        return result;
    },
    EMPTY_TON_ADDRESS: '0:0000000000000000000000000000000000000000000000000000000000000000',
    /**
     * Transfer hack ABI
     */
    TRANSFER_BODY: {
        "ABI version": 2,
        "functions": [
            {
                "name": "transfer",
                "id": "0x00000000",
                "inputs": [
                    {
                        "name": "pubkey",
                        "type": "uint256"
                    }
                ],
                "outputs": []
            }
        ],
        "events": [],
        "data": []
    },

    /**
     * Big hex string to big dec string
     * @param {string} s
     * @returns {string}
     */
    hexString2DecString(s) {

        function add(x, y) {
            let c = 0, r = [];
            x = x.split('').map(Number);
            y = y.split('').map(Number);
            while (x.length || y.length) {
                let s = (x.pop() || 0) + (y.pop() || 0) + c;
                r.unshift(s < 10 ? s : s - 10);
                c = s < 10 ? 0 : 1;
            }
            if(c) {
                r.unshift(c);
            }
            return r.join('');
        }

        let dec = '0';
        s.split('').forEach(function (chr) {
            let n = parseInt(chr, 16);
            for (let t = 8; t; t >>= 1) {
                dec = add(dec, dec);
                if(n & t) {
                    dec = add(dec, '1');
                }
            }
        });
        return dec;
    },
    /**
     * Show token
     * @param {number|string} amount
     * @param {number} precision
     * @returns {string}
     */
    showToken(amount, precision = 9) {
        amount = Number(amount);
        if(!amount) {
            return '0';
        }

        return String(BigNumber(amount).toFixed(precision));
    },
    /**
     * Js number to raw unsigned number
     * @param num
     * @param decimals
     * @returns {number}
     */
    numberToUnsignedNumber(num, decimals = 9) {
        if(decimals === 0) {
            return BigNumber(num).toFixed(decimals);
        }
        return (BigNumber(num).toFixed(decimals).replace('.', ''))
    },
    /**
     * Raw unsigned number to js number
     * @param num
     * @param decimals
     * @returns {number}
     */
    unsignedNumberToSigned(num, decimals = 9) {
        if(decimals === 0) {
            return BigNumber(num).toFixed(decimals);
        }
        return BigNumber(num).div(Math.pow(10, decimals)).toFixed(decimals);
    },
    /**
     * Big number to big string
     * @param number
     * @returns {string}
     */
    bigNumberToString(number) {
        return Number(number).toLocaleString('en').replace(/,/g, '');
    },
    /**
     * Extract transaction id
     * @param tx
     * @returns {null|*}
     */
    getTxId(tx) {
        if(tx.txid) {
            return tx.txid;
        }

        if(tx.transaction) {
            if(tx.transaction.id) {
                return tx.transaction.id
            }
        }

        if(tx.tx) {
            if(tx.tx.lastBlockId) {
                return tx.tx.lastBlockId
            }

        }


    },
    /**
     * Hex string to base64 string
     * @param hexstring
     * @returns {string}
     */
    hexToBase64(hexstring) {
        return btoa(hexstring.match(/\w{2}/g).map(function (a) {
            return String.fromCharCode(parseInt(a, 16));
        }).join(""));
    },

    /**
     * Async JSONP
     * @async
     * @param url
     * @param callback
     * @returns {Promise<unknown>}
     */
    jsonp(url, callback = "jsonpCallback_" + String(Math.round(Math.random() * 100000))) {
        return new Promise((resolve, reject) => {
            try {
                let script = document.createElement("script");

                window[callback] = function (data) {
                    window[callback] = undefined;
                    resolve(data);
                };
                script.src = `${url}?callback=${callback}`;
                document.body.appendChild(script);
            } catch (e) {
                reject(e);
            }
        });
    },

    /**
     * Get JSON file
     * @param {string} url
     * @param {boolean} local
     * @returns {Promise<any>}
     */
    async fetchJSON(url, local = false) {
        if(url.includes('file:') || local) {
            if(!url.includes('file:') && window._isApp) {
                url = 'file:///android_asset/www' + url;
            }
            return await (await this.fetchLocal(url)).json();
        }
        return await ((await fetch(url))).json();
    },
    /**
     * Hex encoded string to string
     * @param {string} hexString
     * @returns {string}
     */
    hex2String(hexString) {
        return Buffer.from(hexString, 'hex').toString();
    },

    /**
     * String to hex string
     * @param {string} str
     * @returns {string}
     */
    string2Hex(str) {
        return Buffer.from(str, 'utf8').toString('hex');
    },

    /**
     * Create tvm cell payload with public key
     * @param pubkey
     * @returns {string}
     */
    createPubkeyTVMCELL(pubkey) {
        let data = 'b5ee9c720101010100' + '22000040' + pubkey;
        return this.hexToBase64(data);
    },

    /**
     * Returns random id
     * @returns {number}
     */
    randomId() {
        return Math.round(Math.random() * 1000000);
    },

    /**
     * Simple async wait
     * @param timeout
     * @async
     * @returns {Promise<unknown>}
     */
    wait: (timeout = 1000) => {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        })
    },

    /**
     * Returns full contract state
     * @param TON
     * @param address
     * @returns {Promise<{}|{state: {balance: number, lastTransactionId: *, isDeployed: (boolean), boc, genTimings: {genLt: string, genUtime: number}}}>}
     */
    async getFullContractState(TON, address) {


        let contractState = (await TON.net.query_collection({
            collection: 'accounts',
            filter: {id: {eq: address}},
            result: 'boc balance acc_type'
        })).result[0];

        if(!contractState || contractState.balance === undefined) {
            return {};
        }

        let lastTx = (await this.getTransactions(TON, address)).shift();

        return {
            "state": {
                "balance": Number(contractState.balance),
                "genTimings": {
                    "genLt": "0",
                    "genUtime": 0
                },
                "lastTransactionId": {
                    ...lastTx.id
                },
                "isDeployed": contractState.acc_type !== 3 ? true : false,
                "boc": contractState.boc
            }
        }

    },

    /**
     * Decodes message
     * @param TON
     * @param msg
     * @param abi
     * @returns {Promise<*>}
     */
    async decodeMessage(TON, msg, abi) {
        let result = await TON.abi.decode_message_body({
            body: msg.body,
            is_internal: true,
            abi: {
                type: 'Contract',
                value: abi
            }
        });

        return result;
    },

    /**
     * Decodes transaction
     * @param TON
     * @param tx
     * @param abi
     * @param methods
     * @returns {Promise<null|{output, input, method}>}
     */
    async decodeTransaction(TON, tx, abi, methods) {


        if(typeof abi === 'string') {
            abi = JSON.parse(abi);
        }

        try {
            let result = await this.decodeMessage(TON, tx.inMessage, abi);

            return {
                method: result.name,
                input: result.value,
                output: result.output||{},
            }
        } catch (e) {
            return null;
        }

    },

    /**
     * Format message in Broxus style
     * @param msg
     * @returns {*&{bodyHash: *, value: (number|number)}}
     */
    formatMessage(msg) {
        return {
            ...msg,
            bodyHash: msg.body_hash,
            value: msg.value ? Number(msg.value) : 0,
        }
    },

    /**
     * Format TX in Broxus style
     * @param tx
     * @returns {*&{createdAt: number, totalFees: (number|number), outMessages: *[], origStatus: *, inMessage: *, exitCode: number, id: {lt: number, hash}, prevTransactionId: {lt: number, hash: *}, endStatus: *}}
     */
    formatTransaction(tx) {

        let outMessages = [];

        for (let msg of tx.out_messages) {
            outMessages.push(this.formatMessage(msg));
        }

        return {
            ...tx,
            id: {
                hash: tx.id,
                lt: Number(tx.lt)
            },
            prevTransactionId: {
                hash: tx.prev_trans_hash,
                lt: Number(tx.prev_trans_lt)
            },
            createdAt: Number(tx.now),
            origStatus: tx.orig_status_name?.toLowerCase(),
            endStatus: tx.end_status_name?.toLowerCase(),
            totalFees: tx.total_fees ? Number(tx.total_fees) : 0,
            exitCode: 0, //TODO Dont know where get it
            inMessage: this.formatMessage(tx.in_message),
            outMessages
        }

    },

    /**
     * Get message by id
     * @param TON
     * @param id
     * @returns {Promise<any>}
     */
    async getMessage(TON, id) {
        return (await TON.net.query_collection({
            collection: 'messages',
            filter: {id: {eq: id}},
            result: 'id src dst body body_hash created_at value bounce bounced'
        })).result[0];
    },

    /**
     * Get transactions by address
     * @param TON
     * @param address
     * @returns {Promise<*[]>}
     */
    async getTransactions(TON, address) {


        let transactionsRaw = (await TON.net.query_collection({
            collection: 'transactions',
            filter: {account_addr: {eq: address}},
            order: [
                {path: "now", direction: "DESC"}],
            result: 'id prev_trans_hash prev_trans_lt in_message { id src dst body body_hash created_at value bounce bounced  } out_messages { id src dst body body_hash created_at value bounce bounced  }  now status status_name end_status_name aborted lt total_fees orig_status_name'
        })).result;

        let transactions = [];

        for (let tx of transactionsRaw) {
            transactions.push(this.formatTransaction(tx));
        }

        return transactions;
    },

    /**
     * Get transaction by id
     * @param TON
     * @param id
     * @returns {Promise<*>}
     */
    async getTransaction(TON, id) {

        let transactionsRaw = (await TON.net.query_collection({
            collection: 'transactions',
            filter: {id: {eq: id}},
            order: [
                {path: "now", direction: "DESC"}],
            result: 'id prev_trans_hash prev_trans_lt in_message { id src dst body body_hash created_at value bounce bounced  } out_messages { id src dst body body_hash created_at value bounce bounced  }  now status status_name end_status_name aborted lt total_fees orig_status_name'
        })).result[0];

        return this.formatTransaction(transactionsRaw)
    }

}
export default utils;