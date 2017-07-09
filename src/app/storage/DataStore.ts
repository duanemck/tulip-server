import * as path from 'path';
import * as moment from 'moment';
import * as GoogleDataStore from '@google-cloud/datastore';

import { Configuration } from '../configuration';
import { Ticker, Balance, DailyRate, GraphPoint } from '../domain';



export class DataStore {
    private store;
    constructor(config: Configuration) {
        this.store = GoogleDataStore({
            projectId: config.googleCloud.projectId,
            keyFilename: path.join(__dirname, '../../../', config.googleCloud.keyFile)
        });
    }

    async storeBalances(balances: Balance[]) {
        await this.store.insert(balances.map(balance => {
            return {
                key: this.store.key('Balance'),
                data: balance
            };
        }))
    }

    async storeRate(rate: Ticker) {
        await this.store.insert({
            key: this.store.key('Rate'),
            data: rate
        });
    }

    async storeDailyRate(rate: DailyRate) {
        await this.store.insert({
            key: this.store.key('DailyRate'),
            data: rate
        });
    }

    async getUniqueTickers(): Promise<Ticker[]> {
        let query = this.store.createQuery('Rate');
        query.groupBy('pair');
        const result = await this.store.runQuery(query);
        return (result)[0];
    }

    async getOldestPrice(ticker: string): Promise<Ticker> {
        let query = this.store.createQuery('Rate');
        query.filter('pair', ticker);
        query.order('time', {
            ascending: true
        })
        query.limit(1);
        const result = await this.store.runQuery(query);
        return (result)[0][0];
    }

    async getLatestPrice(ticker: string): Promise<Ticker> {
        let query = this.store.createQuery('Rate');
        query.filter('pair', ticker);
        query.order('time', {
            descending: true
        })
        query.limit(1);
        const result = await this.store.runQuery(query);
        return (result)[0][0];
    }

    async getPriceOverPeriod(ticker: string, from: Date, to: Date): Promise<Ticker[]> {
        let query = this.store.createQuery('Rate');
        query.filter('pair', ticker);
        query.filter('time', '>=', from);
        query.filter('time', '<=', to);
        query.order('time');
        const result = await this.store.runQuery(query);
        return (result)[0];
    }

    async getDailyRateOverPeriod(ticker: string, from: Date, to: Date): Promise<DailyRate[]> {
        let query = this.store.createQuery('DailyRate');
        query.filter('pair', ticker);
        query.filter('date', '>=', moment(from).startOf('day').toDate());
        query.filter('date', '<=', moment(to).endOf('day').toDate());
        query.order('date');
        const result = await this.store.runQuery(query);
        return (result)[0];
    }

    async getDailyRateGraph(ticker: string, from: Date, to: Date): Promise<GraphPoint[]> {
        let query = this.store.createQuery('DailyRate')
            .filter('pair', ticker)
            .filter('date', '>=', moment(from).startOf('day').toDate())
            .filter('date', '<=', moment(to).endOf('day').toDate())
            .order('date');
        const result = await this.store.runQuery(query);
        return (result)[0].map(p => new GraphPoint(p.close, p.date));
    }

    async getDailyRate(ticker: string, date: Date): Promise<DailyRate> {
        let query = this.store.createQuery('DailyRate');
        query.filter('pair', ticker);
        query.filter('date', '=', date);
        const result = await this.store.runQuery(query);
        return (result)[0][0];
    }

    async getLatestWallets(source: string): Promise<Balance[]> {
        let query = this.store.createQuery('Balance');
        query.filter('source', source);
        query.order('timestamp', {
            descending: true
        })
        query.limit(2);
        const result = await this.store.runQuery(query);
        return (result)[0];
    }

}
