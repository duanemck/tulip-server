import { Ticker } from '../domain';
import * as moment from 'moment';
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
        const fromDate = moment(date).startOf('day').toDate();
        const toDate = moment(date).endOf('day').toDate();
        const allData = await this.store.getPriceOverPeriod(ticker, fromDate, toDate);
        // let array = [];
        // for (let i = 0; i < allData.length; i++) {
        //     if (i % 10 === 0) {
        //         array.push(allData[i]);
        //     }
        // }
        // return array;
        return allData;
    }
}
