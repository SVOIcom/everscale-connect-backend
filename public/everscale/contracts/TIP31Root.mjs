import {UTILS as utils} from "../0.1.1/getProvider.mjs";
import {ABIS_URLS} from "../0.1.1/constants.mjs";

const EMPTY_ADDRESS = "0:0000000000000000000000000000000000000000000000000000000000000000";

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
        this.contract = await this.ton.loadContract(ABIS_URLS.TIP31_ROOT, address);
        return this;
    }

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

}


export default TIP31Root;