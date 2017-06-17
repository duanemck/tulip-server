import { DataStore } from '../storage';
import { Balance, BalanceSummary, CurrentState } from '../domain';


export class WalletService {
    constructor(private store: DataStore) {

    }

    async getCurrentWalletBalances(): Promise<Balance[]> {

    }

    async getSummary(): Promise<BalanceSummary> {

    }

    async getCurrentState(): Promise<CurrentState> {

    }
}
