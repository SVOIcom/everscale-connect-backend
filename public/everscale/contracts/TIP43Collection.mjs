import {CONSTANTS, UTILS as utils} from "../getProvider.mjs";

/**
 * TIP-4.3 NFT token collection contract
 * @class TIP43Collection
 */
class TIP43Collection {
    /**
     *
     * @param {EverscaleWallet} ton
     */
    constructor(ton) {
        this.ton = ton;
        this.collectionContract = null;
        this.collection43Contract = null;
        this.metadataContract = null;
        this.address = null;
    }


    async init(address) {
        this.address = address;
        this.tip6 = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP6, address);
        this.collectionContract = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP41_COLLECTION, address);
        this.collection43Contract = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP43_COLLECTION, address);
        this.metadataContract = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP42_COLLECTION_METADATA, address);
        return this;
    }

    /**
     * Return token info
     * @returns {Promise<{symbol: *, totalSupply: number, decimals: number, name: *, icon: null}>}
     */
    async getTokenInfo() {
        try {
            let data = (await this.metadataContract.getJson({answerId: 0})).json;

            return JSON.parse(data);

        } catch (e) {
            console.log(e);
            throw e;
        }
    }


}


export default TIP43Collection;