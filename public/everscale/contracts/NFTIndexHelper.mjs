import {CONSTANTS, UTILS as utils} from "../getProvider.mjs";
import TIP31Wallet from "./TIP31Wallet.mjs";

class NFTIndexHelper {
    /**
     *
     * @param {EverscaleWallet} ton
     */
    constructor(ton) {
        this.ton = ton;
        this.contract = null;
        this.address = null;
    }


    async init(address) {
        this.address = address;
        this.contract = await this.ton.loadContract(CONSTANTS.ABIS_URLS.NFT_INDEX_HELPER, address);
        return this;
    }

    async initAuto() {
        return await this.init(CONSTANTS.ADDRESSES.NFT_INDEX_HELPER);
    }

    async resolveCodeHashNftIndex(collectionAddress, ownerAddress) {
        return String((await this.contract.resolveCodeHashNftIndex({
            collection: collectionAddress,
            owner: ownerAddress
        })).value0).replace(/^0x/, "");
    }


}


export default NFTIndexHelper;