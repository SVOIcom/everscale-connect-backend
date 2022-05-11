import {CONSTANTS, UTILS as utils} from "../getProvider.mjs";
import TIP4Nft from "./TIP4Nft.mjs";
import NFTIndexHelper from "./NFTIndexHelper.mjs";

/**
 * TIP-4.3 NFT token collection contract
 * @class TIP4Collection
 */
class TIP4Collection {
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

        this.nftIndexHelper = await (new NFTIndexHelper(this.ton)).initAuto();

        return this;
    }


    async getTokenInfo() {
        let data = (await this.metadataContract.getJson({answerId: 0})).json;
        return JSON.parse(data);
    }

    async totalSupply() {
        return Number((await this.collectionContract.totalSupply({"answerId": 0})).count);
    }

    async getNftAddress(id) {
        return (await this.collectionContract.nftAddress({"answerId": 0, "id": id})).nft;
    }

    async nftCodeHash() {
        return (await this.collectionContract.nftCodeHash({"answerId": 0})).codeHash;
    }

    async nftCode() {
        return (await this.collectionContract.nftCode({"answerId": 0})).code;
    }

    async indexCodeHash() {
        return (await this.collection43Contract.indexCodeHash({"answerId": 0})).hash;
    }

    async getNft(id) {
        let nftAddress = await this.getNftAddress(id);
        let nft = await (new TIP4Nft(this.ton)).init(nftAddress);

        return nft;
    }

    async getOwnerNfts(owner) {
        let codehash = await this.nftIndexHelper.resolveCodeHashNftIndex(this.address, owner);
        console.log("codehash", codehash);
    }

    async getNftByAddress(address) {
        let nft = await (new TIP4Nft(this.ton)).init(address);

        return nft;
    }



}


export default TIP4Collection;