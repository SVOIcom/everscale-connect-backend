import {CONSTANTS, UTILS as utils} from "../getProvider.mjs";

/**
 * TIP-3.1 contract implementation for Everscale Connect
 * @class TIP31Root
 */
class TIP31Root {
    /**
     *
     * @param {EverscaleWallet} ton
     */
    constructor(ton) {
        this.ton = ton;
        this.contract = null;
    }


    async init(address) {
        this.contract = await this.ton.loadContract(CONSTANTS.ABIS_URLS.TIP31_ROOT, address);
        return this;
    }

    /**
     * Return token info
     * @returns {Promise<{symbol: *, totalSupply: number, decimals: number, name: *, icon: null}>}
     */
    async getTokenInfo() {
        try {
            let name = (await this.contract.name({answerId: 0})).value0;
            let symbol = (await this.contract.symbol({answerId: 0})).value0;
            let decimals = (await this.contract.decimals({answerId: 0})).value0;
            let totalSupply = (await this.contract.totalSupply({answerId: 0})).value0;


            return {
                decimals: Number(decimals),
                name: (name),
                symbol: (symbol),
                totalSupply: Number(totalSupply),
                icon: null
            };
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    /**
     * Get wallet address by owner address
     * @param {string} walletOwner Owner address
     * @returns {Promise<*>}
     */
    async getWalletAddressByMultisig(walletOwner) {

        return (await this.contract.walletOf({
            answerId: 0,
            walletOwner
        })).value0;
    }

    //TODO: add wallet instance by address


    /**
     * Create deploy wallet payload
     * @param {string} ownerAddress
     * @param {string|number} deployWalletValue
     * @returns {Promise<*>}
     */
    async deployWalletPayload(ownerAddress, deployWalletValue = 5e8) {
        return await this.contract.deployWallet({
            answerId: 0,
            deployWalletValue: deployWalletValue,
            walletOwner: ownerAddress
        }).payload;
    }

}


export default TIP31Root;