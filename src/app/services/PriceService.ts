import { Ticker } from '../domain';
import * as moment from 'moment';
import * as timezone from 'moment-timezone';

import { IDataStore } from 'app/storage/IDataStore';

export class PriceService {
    constructor(private store: IDataStore) {

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

    async getDailyGraph(ticker: string, from: Date, to: Date) {
        return await this.store.getDailyRateGraph(ticker, from, to);
    }

    async getIntradayGraph(ticker: string, date: Date) {
        const fromDate = moment.tz(date, 'Africa/Johannesburg').startOf('day').utc().toDate();
        const toDate = moment.tz(date, 'Africa/Johannesburg').endOf('day').utc().toDate();
        const allData = await this.store.getPriceOverPeriod(ticker, fromDate, toDate);
        return allData;
    }
}
