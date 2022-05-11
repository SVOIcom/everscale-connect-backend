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

const EMPTY_ADDRESS = "0:0000000000000000000000000000000000000000000000000000000000000000";

const SAFE_MULTISIG_ABI = 'https://everscale-connect.svoi.dev/contracts/abi/SafeMultisigWallet.abi.json';

const BACKEND_PROVIDER_API_URL = "https://everscale-connect.svoi.dev/EverscaleBackendProvider/";

const STATUS_UPDATE_INTERVAL = 10000;

const ABIS_URLS = {
    SAFE_MULTISIG: SAFE_MULTISIG_ABI,
    ERC721: 'https://everscale-connect.svoi.dev/contracts/abi/ERC721.abi.json',
    TIP31_ROOT: 'https://everscale-connect.svoi.dev/contracts/abi/TIP3.1/TokenRoot.abi.json',
    TIP31_WALLET: 'https://everscale-connect.svoi.dev/contracts/abi/TIP3.1/TokenWallet.abi.json',
    TIP43_COLLECTION: 'https://everscale-connect.svoi.dev/contracts/abi/TIP4.3/ITIP4_3Collection.abi.json',
    TIP43_COLLECTION_METADATA: 'https://everscale-connect.svoi.dev/contracts/abi/TIP4.3/ITIP4_2JSON_Metadata.abi.json',
    TIP43_NFT: 'https://everscale-connect.svoi.dev/contracts/abi/TIP4.3/ITIP4_3NFT.abi.json',
}

export {NETWORKS, REVERSE_NETWORKS, EXPLORERS, SAFE_MULTISIG_ABI, BACKEND_PROVIDER_API_URL, ABIS_URLS, STATUS_UPDATE_INTERVAL};