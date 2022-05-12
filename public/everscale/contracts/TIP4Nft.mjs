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
        this.metadataContract = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP42_COLLECTION_METADATA, address);

        return this;
    }

    async getMoreInfo() {
        return (await this.nftContract.getInfo({answerId: 0}));

    }

    async getInfo() {
        return {...await this.getMoreInfo(), ...await this.getTokenMetadata()};
    }

    async getTokenMetadata() {
        let data = (await this.metadataContract.getJson({answerId: 0})).json;
        return JSON.parse(data);
    }

    async transferPayload(to, sendGasTo = this.address, callbacks = []) {
        return await this.nftContract.transfer.payload({
            to,
            sendGasTo,
            callbacks
        })
    }

}


export default TIP4Nft;