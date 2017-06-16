import { Configuration } from '../Configuration';
import { Ticker } from '../datacollection/Ticker';
import { Balance } from '../datacollection/Balance';
import * as GoogleDataStore from '@google-cloud/datastore';
import * as path from 'path';

export class DataStore {
    private store;
    constructor(config: Configuration) {
        this.store = GoogleDataStore({
            projectId: config.googleCloud.projectId,
            keyFilename: path.join(__dirname, '../../', config.googleCloud.keyFile)
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

    async getPriceOverPeriod(ticker: string, from: Date, to: Date) {
        let query = this.store.createQuery('Rate');
        query.filter('pair', ticker);
        query.filter('time', '>=', from);
        query.filter('time', '<=', to);
        query.order('time');
        const result = await this.store.runQuery(query);
        return (result)[0];
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
