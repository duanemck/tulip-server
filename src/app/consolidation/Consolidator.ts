import { WalletService, PriceService } from '../services';
import { Configuration } from '../configuration';
import { ICollectionService } from '../datacollection';
import { IDataStore } from '../storage';
import * as moment from 'moment';
import { DailyRate } from '../domain/index';


const INTERVAL: number = 60 * 60 * 1000;

export class Consolidator {
    private timer: NodeJS.Timer;

    constructor(private config: Configuration, private store: IDataStore) {

    }

    private async consolidate() {
        console.log(`${new Date()} Consolidating rate data`);
        const tickers = await this.store.getUniqueTickers();
        // tickers.forEach(async ticker => {
        //     await this.consolidateForTicker(ticker);
        // });
        await this.consolidateForTicker('ethbtc');
    }

    private async consolidateForTicker(ticker: string) {
        const earliestRate = await this.store.getOldestPrice(ticker);
        const earliestDate = moment(earliestRate.time).startOf('day');
        const yesterday = moment().add(-1, 'days').startOf('day');

        let now = moment(earliestDate);
        while (now.isSameOrBefore(yesterday)) {
            try {
                const existingDayRate = await this.store.getDailyRate(ticker, now.toDate());
                if (!existingDayRate) {
                    const intraday = await this.store.getPriceOverPeriod(ticker, now.toDate(), moment(now).endOf('day').toDate());
                    if (intraday.length > 0) {
                        console.log(`Consolidating for ${ticker} on ${now.format('YYYYMMDD')}`);
                        const sorted = intraday.sort((rate1, rate2) => rate1.price - rate2.price);

                        let dayRate = new DailyRate(ticker,
                            sorted[sorted.length - 1].price, // high
                            sorted[0].price, // low
                            intraday[0].price, // open
                            intraday[intraday.length - 1].price, // close
                            now.toDate());
                        await this.store.storeDailyRate(dayRate);
                    } else {
                        console.log(`No intraday data exists for ${ticker} on ${now.format('YYYYMMDD')}`);
                    }
                } else {
                    console.log(`Consolidation already exists for ${ticker} on ${now.format('YYYYMMDD')}`);
                }
                now = now.add(1, 'days');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async start() {
        this.timer = setInterval(() => this.consolidate(), INTERVAL);
        await this.consolidate();
    }

    stop() {
        clearInterval(this.timer);
    }
}
