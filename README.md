# Everscale-Connect - Universal Everscale web provider

Provider available at https://everscale-connect.svoi.dev/everscale/getProvider.mjs

## Connection

### Direct web


If you are using pure ES6 imports you can use importing directly from the link https://everscale-connect.svoi.dev/everscale/getProvider.mjs

Otherwise, you can use a wrapper script to activate module functionality in the global scope:

```html
<script src="https://everscale-connect.svoi.dev/everscale/index.mjs" type="module"></script>

<script>
    //Now we have window.EverscaleConnect available and can use it
    let EVER = await EverscaleConnect.getProvider({}, EverscaleConnect.PROVIDERS.EverscaleWallet);
    //Do you Everscale stuff
</script>
```

### Webpack
Due to the specific factors of the Everscale network connection, this module **does not support** webpack packaging.

You can try to download the module directly and import it into the webpack project, but most likely you will lose the availability of the EverWeb provider which provides a direct connection to the web from a browser.


## Versioning

By default the module is using the latest version of the Everscale-Connect module.

You can choose version by using direct version links:

```html
<!-- Import the module with the specific version -->
<script src="https://everscale-connect.svoi.dev/everscale/0.1.1/index.mjs" type="module"></script>

<script>
    //Import the module with the specific version
    import * from "https://everscale-connect.svoi.dev/everscale/0.1.1/getProvider.mjs";
</script>
```

## Usage example

```javascript
import {default as getProvider, PROVIDERS, UTILS} from "https://everscale-connect.svoi.dev/everscale/getProvider.mjs";

    window.getProvider = getProvider;
    window.PROVIDERS = PROVIDERS;
    window.UTILS = UTILS;


    const DEFAULT_WALLET = PROVIDERS.EVERWallet;

    let EVER = null;
    try {

        //Initialize provider
        EVER = await getProvider({}, PROVIDERS.EverBackendWeb);
        await EVER.requestPermissions();
        await EVER.start();
    } catch (e) {
        console.log(e);
        EVER = await getProvider({
            network: 'main',
            networkServer: 'alwaysonlineevermainnode.svoi.dev'
        }, PROVIDERS.EverBackendWeb);
        await EVER.requestPermissions();
        await EVER.start();

    }
    window.EVER = EVER;

    console.log('CURRENT WALLET', await EVER.getWallet());
```

See [examples](examples) for mor information

## Providers

Everscale-Connect now supports these providers and extensions:

* [EverscaleWallet](https://everscalewallet.com/) by SVOI.dev
* [EVER Wallet](https://l1.broxus.com/everscale/wallet) by Broxus
* Internal: EverWeb - signing transactions and fetch blockchain information from webpage
* Internal: EverBackendWeb - only for fetching information from smart contracts

Deprecated providers:
* [ExtraTon](https://extraton.io) 

## Projects using TonConnect

* Upcoming project...
* [ScalePunks.com](https://scalepunks.com)
* [swap.block-chain.com](swap.block-chain.com) (elder version)

## Info

Developed with ❤️ by SVOI.dev Team https://svoi.dev