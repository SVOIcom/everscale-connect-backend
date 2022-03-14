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

const PAYLOAD_CACHE_TIME = 60000; // 1 minute
const RUN_LOCAL_CACHE_TIME = 10000; // 10 seconds

class EverscaleBackendProvider extends _App {

    async index() {
        return 'EverscaleBackendProvider';
    }

    async runLocal(networkServer = DEFAULT_SERVER, address, method) {

        let callLog = `Call: ${method} ${address} ${networkServer}`;

        // console.time(callLog);

        let result = await this.cache.load(`${method}-${address}-${networkServer}-${JSON.stringify(this.post.input)}`, async () => {
            let EVER = await require('../modules/utils/EVER')(networkServer);


            try {
                let result = await EVER.runLocal(address, this.post.abi, method, this.post.input);

                return {status: 'ok', result, _cacheId: Math.random()}
            } catch (e) {

                console.log(callLog, 'ERROR', e)
                return {status: 'error', error: e.message, encodedError: JSON.stringify(e),  _cacheId: Math.random()};
            }
        }, RUN_LOCAL_CACHE_TIME);

        // console.timeEnd(callLog);
        return result;


    }

    async payload(networkServer = DEFAULT_SERVER, method) {

        let callLog = `Payload: ${method} ${networkServer}`;

        // console.time(callLog);
        let result = await this.cache.load(`${method}-${networkServer}-${JSON.stringify(this.post.input)}`, async () => {
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
        }, PAYLOAD_CACHE_TIME);

        //  console.timeEnd(callLog);
        return result;

    }


    async cacheTest() {
        return {
            test: await this.cache.load('test', async () => {
                return Math.random()
            }, 30000)
        };
    }

    async config() {
        return {};
    }

}

module.exports = EverscaleBackendProvider;