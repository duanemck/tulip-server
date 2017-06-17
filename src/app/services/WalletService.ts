import { DataStore } from '../storage';
import { Balance, BalanceSummary, CurrentState } from '../domain';


export class WalletService {
    constructor(private store: DataStore) {

    }

    async getCurrentWalletBalances(): Promise<Balance[]> {
        let wallets = await this.store.getLatestWallets('Luno');
        return wallets.concat(await this.store.getLatestWallets('Bitfinex'));
    }

    // async getSummary(): Promise<BalanceSummary> {

    // }

    // async getCurrentState(): Promise<CurrentState> {

    // }

    async storeBalances(balances: Balance[]) {
        await this.store.storeBalances(balances);
    }
}
