let everInstances = {};

module.exports = async function getTonInstance(network = 'main2.ton.dev') {
    if(everInstances[network]) {
        return everInstances[network];
    }

    const {TonClient} = require('@eversdk/core');
    const {libNode} = require("@eversdk/lib-node");
    TonClient.useBinaryLibrary(libNode);

    let EVER = everInstances[network] = new TonClient({
        network: {
            server_address: network
        }
    });

    everInstances[network].runLocal = async (address, abi, functionName, input = {}) => {
        const account = (await EVER.net.query_collection({
            collection: 'accounts',
            filter: {id: {eq: address}},
            result: 'boc'
        })).result[0].boc;

        const message = await EVER.abi.encode_message({
            abi: {
                type: 'Json',
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

        let response = await EVER.tvm.run_tvm({
            message: message.message,
            account: account,
            abi: {
                type: 'Json',
                value: (abi)
            },
        });

        return response.decoded.output;
    }

    return everInstances[network]
}