import {CONSTANTS} from "../getProvider.mjs";
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

    async getIndexBasis(address) {
        return await this.ton.loadContract(CONSTANTS.ABIS_URLS.NFT_INDEX_BASIS, address);
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


    /**
     * Get nft object by address
     * @param address
     * @returns {Promise<TIP4Nft>}
     */
    async getNftByAddress(address) {
        return await (new TIP4Nft(this.ton)).init(address);
    }


    /**
     * Get nft by id
     * @param id
     * @returns {Promise<TIP4Nft>}
     */
    async getNft(id) {
        let nftAddress = await this.getNftAddress(id);
        return await this.getNftByAddress(nftAddress);
    }

    /**
     * Get all owner nfts
     * TODO: Its to slow. Need to optimize
     * @param owner
     * @returns {Promise<*[]>}
     */
    async getOwnerNfts(owner, maxItems = 1000) {
        let codehash = await this.nftIndexHelper.resolveCodeHashNftIndex(this.address, owner);
        //console.log("codehash", codehash);

        //Make GQL request for hash

        let collectionResult;
        let nextFilter = {};
        let collectionAll = [];
        while (true) {

            collectionResult = (await this.ton.queryCollection({
                collection: 'accounts',
                filter: {
                    code_hash: {eq: codehash},
                    ...nextFilter
                },
                result: 'id',
                limit: maxItems
            })).result;

            collectionAll = [...collectionAll, ...collectionResult];

            if(collectionResult.length < 50){
                break;
            }
            nextFilter = {id: {gt: collectionResult[49].id}};

        }

        let nfts = [];

        for (let {id} of collectionAll) {
            let basis = await this.getIndexBasis(id);
            let tokenInfo = await basis.getInfo({"answerId": 0});
            nfts.push(tokenInfo.nft);
        }

        return nfts;
    }


}


export default TIP4Collection;