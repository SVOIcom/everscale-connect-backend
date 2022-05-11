import {CONSTANTS, UTILS as utils} from "../getProvider.mjs";

/**
 * TIP-4.3 NFT token contract
 * @class TIP4Nft
 */
class TIP4Nft {
    /**
     *
     * @param {EverscaleWallet} ton
     */
    constructor(ton) {
        this.ton = ton;
        this.nftContract = null;
        this.nft43Contract = null;
        this.address = null;
    }


    async init(address) {
        this.address = address;
        this.tip6 = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP6, address);
        this.nftContract = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP41_NFT, address);
        this.nft43Contract = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP43_NFT, address);
        return this;
    }

    async getInfo() {
        return (await this.nftContract.getInfo({answerId: 0}));

    }


}


export default TIP4Nft;