import { DataStore } from '../storage';
import { Balance, BalanceSummary, CurrentState } from '../domain';


export class WalletService {
    constructor(private store: DataStore) {

    }

    async getCurrentWalletBalances(): Promise<Balance[]> {
        let wallets = await this.store.getLatestWallets('Luno');
        return wallets.concat(await this.store.getLatestWallets('Bitfinex'));
    }

    async getSummary(): Promise<BalanceSummary> {
        // this.lastEthbtc = this.ethbtc;
        //         this.lastbtczar = this.btczar;
        //         this.lastBtc = this.btc;
        //         this.lastEth = this.eth;

        //         [this.btc, this.eth, this.ethbtc, this.btczar] = results;

        //         this.balances = [this.btc, this.eth];
        //         this.totalBTC = this.btc.baseValue + this.eth.baseValue * +this.ethbtc.price;
        //         this.totalRand = Math.round(this.totalBTC * +this.btczar.price * 100) / 100;

        //         this.btc.randValue = Math.round(this.btc.baseValue * +this.btczar.price * 100) / 100;
        //         this.eth.randValue = Math.round(this.eth.baseValue * +this.ethbtc.price * +this.btczar.price * 100) / 100;

        //         this.btc.change = this.lastBtc ? Math.round((this.btc.randValue - this.lastBtc.randValue) * 100) / 100 : 0;
        //         this.eth.change = this.lastEth ? Math.round((this.eth.randValue - this.lastEth.randValue) * 100) / 100 : 0;

        //         this.gainLoss = Math.round((this.totalRand - this.investment) * 100) / 100;
        //         this.gainLossPercent = Math.round(this.gainLoss / this.investment * 10000) / 100;
        //         this.loading = false;
        //         this.lastUpdate = new Date().toLocaleTimeString();
        return null;
    }

    // async getCurrentState(): Promise<CurrentState> {

    // }

    async storeBalances(balances: Balance[]) {
        await this.store.storeBalances(balances);
    }
}
