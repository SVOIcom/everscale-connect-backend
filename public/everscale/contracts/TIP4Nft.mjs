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

    async transferPayload(to, sendGasTo = this.address, callbacks = {}) {

        /**
         * Callbacks is an object like this:
         *  {
         *      {"0:121c70d1bc61ce1656ab0a73540bcdd81c7e033ef4c7396a2d4b9ab686fe959e":{value: '2000000000', payload: 'te6ccgEBAQEAEgAAIAAAAAAAAAAAAAAJGE5yoAA='}}
         *        ^ - this one is callback receiver                                   ^ - this one is callback params with encoded payload
         *  }
         *
         *  EVERWallet can't handle callbacks in those format but we can convert it to this format:
         *  [
         *      [
         *          "0:121c70d1bc61ce1656ab0a73540bcdd81c7e033ef4c7396a2d4b9ab686fe959e",
         *          {value: '2000000000', payload: 'te6ccgEBAQEAEgAAIAAAAAAAAAAAAAAJGE5yoAA='}
         *      ]
         *  ]
         *
         *  So we just hotfix it here but TODO fix it in EVERWallet module
         */


        //TODO Fix this hack
        if(this.ton.walletName === 'EVERWallet') {
            let newCallbacks = [];

            for (let callbackAddress in callbacks) {
                newCallbacks.push([callbackAddress, callbacks[callbackAddress]]);
            }
            callbacks = newCallbacks;
        }
        return await this.nftContract.transfer.payload({
            to,
            sendGasTo,
            callbacks
        })
    }

}


export default TIP4Nft;