async function loadEverWeb(){
    let _fetch = window.fetch;
    window.fetch = (...args)=>{
        if(args[0] === '/eversdk.wasm'){
            console.log('loadEverWeb: wasm fall calling detected');
            args[0] = 'https://everscale-connect.svoi.dev/ever/everSdk/eversdk.wasm';
        }
        return _fetch(...args)
    }

    try{
        await import("https://everscale-connect.svoi.dev/ever/everSdk/main.js");
    }catch (e) {
        console.log(e);
    }


    try{
        tonclientWeb.libWebSetup({
            binaryURL: '/eversdk.wasm',
        });
        tonclientWeb.TonClient.useBinaryLibrary(tonclientWeb.libWeb);
    }catch (e) {
        console.log(e)
    }


    window.fetch = _fetch;
}

export default loadEverWeb;