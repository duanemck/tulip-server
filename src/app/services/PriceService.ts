import { Ticker } from '../domain';
import { DataStore } from '../storage';

export class PriceService {
    constructor(private store: DataStore) {

    }

    async storePrice(price: Ticker) {
        await this.store.storeRate(price);
    }

    async getLatestPrice(ticker: string) {
        return await this.store.getLatestPrice(ticker);
    }

    async getForTickerOverPeriod(ticker: string, from: Date, to: Date) {
        return await this.store.getPriceOverPeriod(ticker, from, to);
    }
}
