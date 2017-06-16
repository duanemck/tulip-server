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

}
