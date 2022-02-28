const NETWORKS = {
    main: 'alwaysonlineevermainnode.svoi.dev',
    test: 'net.ton.dev',
    svoi: 'alwaysonlineevermainnode.svoi.dev',
};

const REVERSE_NETWORKS = {
    'main.ton.dev': 'main',
    'main1.ton.dev': 'main',
    'main2.ton.dev': 'main',
    'main3.ton.dev': 'main',
    'main4.ton.dev': 'main',
    'alwaysonlineevermainnode.svoi.dev': 'main',
    'net.ton.dev': 'test',
    'localhost': 'local'
}

const EXPLORERS = {
    test: 'net.ton.live',
    main: 'main.ton.live',
    local: 'main.ton.live',
}

const SAFE_MULTISIG_ABI = 'https://everscale-connect.svoi.dev/contracts/abi/SafeMultisigWallet.abi.json';

const BACKEND_PROVIDER_API_URL = "https://everscale-connect.svoi.dev/EverscaleBackendProvider/";

export { NETWORKS, REVERSE_NETWORKS, EXPLORERS, SAFE_MULTISIG_ABI, BACKEND_PROVIDER_API_URL };