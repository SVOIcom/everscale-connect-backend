class EverscaleUtils {
    /**
     * Run local contract method
     * @param TON
     * @param abi
     * @param address
     * @param functionName
     * @param input
     * @returns {Promise<any>}
     * @private
     */
    async runLocal(TON, abi, address, functionName, input = {}) {

        const account = (await TON.net.query_collection({
            collection: 'accounts',
            filter: {id: {eq: address}},
            result: 'boc'
        })).result[0].boc;

        const message = await TON.abi.encode_message({
            abi: {
                type: 'Contract',
                value: (abi)
            },
            address: address,
            call_set: {
                function_name: functionName,
                input: input
            },
            signer: {
                type: 'None'
            }
        });

        let response = await TON.tvm.run_tvm({
            message: message.message,
            account: account,
            abi: {
                type: 'Contract',
                value: (abi)
            },
        });

        return response.decoded.output;
    }

    /**
     * Create method call payload
     * @param TON
     * @param abi
     * @param functionName
     * @param input
     * @param signer
     * @returns {Promise<*>}
     * @private
     */
    async encodeCallBody(TON, abi, functionName, input = {}, signer = {type: 'None'}) {
        return (await TON.abi.encode_message_body({
            abi: {
                type: 'Contract',
                value: (abi)
            },
            call_set: {
                function_name: functionName,
                input: input
            },
            is_internal: true,
            signer: signer
        })).body;
    }
}

let everscaleUtils = new EverscaleUtils();

export default everscaleUtils;