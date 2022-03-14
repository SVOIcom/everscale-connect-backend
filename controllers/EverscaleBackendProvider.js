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
const _App = require('./_App');

const DEFAULT_SERVER = 'eri01.main.everos.dev'

class EverscaleBackendProvider extends _App {

    async index() {
        return 'EverscaleBackendProvider';
    }

    async runLocal(networkServer = DEFAULT_SERVER, address, method) {

        let callLog = `Call: ${method} ${address} ${networkServer}`;

        console.time(callLog);

        let result = await this.cache.load(`${method}-${address}-${networkServer}`, async () => {
            let EVER = await require('../modules/utils/EVER')(networkServer);


            try {
                let result = await EVER.runLocal(address, this.post.abi, method, this.post.input);

                return {status: 'ok', result}
            } catch (e) {

                console.log(callLog, 'ERROR', e)
                return {status: 'error', error: e.message, encodedError: JSON.stringify(e)};
            }
        }, 5000);

        console.timeEnd(callLog);
        return result;


    }

    async payload(networkServer = DEFAULT_SERVER, method) {
        let EVER = await require('../modules/utils/EVER')(networkServer)

        try {
            const callSet = {
                function_name: method,
                input: this.post.input
            }
            const encoded_msg = await EVER.abi.encode_message_body({
                abi: {
                    type: 'Json',
                    value: (this.post.abi)
                },
                call_set: callSet,
                is_internal: true,
                signer: {
                    type: 'None'
                }
            });

            return {status: 'ok', result: encoded_msg.body}
        } catch (e) {
            return {status: 'error', error: e.message, encodedError: JSON.stringify(e)};
        }
    }


    async cacheTest() {
        return {
            test: await this.cache.load('test', async () => {
                return Math.random()
            })
        };
    }

    async config() {
        return {};
    }

}

module.exports = EverscaleBackendProvider;