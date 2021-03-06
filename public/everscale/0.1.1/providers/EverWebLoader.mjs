async function loadEverWeb() {
    if(window.tonclientWeb) {
        window.tonclientWeb = undefined;
    }
    let _fetch = window.fetch;
    window.fetch = (...args) => {
        if(args[0] === '/eversdk.wasm') {
            console.log('loadEverWeb: wasm fall calling detected');
            args[0] = 'https://everscale-connect.svoi.dev/ever/everSdk/eversdk.wasm';
        }
        return _fetch(...args)
    }

    try {
        //Dont load tonClientWeb if it is already loaded
        if(!window.tonclientWeb) {
            await import("https://everscale-connect.svoi.dev/ever/everSdk/main.js");
        } else {
            console.log('loadEverWeb: tonclientWeb defined for some reason', window.tonclientWeb);
        }

    } catch (e) {
        console.log(e);
    }


    try {
        tonclientWeb.libWebSetup({
            binaryURL: '/eversdk.wasm',
        });
        tonclientWeb.TonClient.useBinaryLibrary(tonclientWeb.libWeb);
    } catch (e) {
        console.log(e)
    }


    window.fetch = _fetch;
}

export default loadEverWeb;