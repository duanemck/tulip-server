import { Configuration } from '../Configuration';
import { ICollectionService } from './ICollectionService';
import { LunoService } from './Luno/LunoService';
import { BitfinexService } from './Bitfinex/BitfinexService';
import { DataStore } from '../storage/DataStore';

const INTERVAL: number = 60 * 1000;

export class Collector {
    private timer: NodeJS.Timer;
    private balanceCollectors: ICollectionService[];
    private rateCollectors: Map<string, ICollectionService> = new Map();
    private dataStore: DataStore;

    constructor(private config: Configuration) {
        this.dataStore = new DataStore(config);
        let luno = new LunoService(config);
        let bitfinex = new BitfinexService(config);

        this.balanceCollectors = [luno, bitfinex];
        this.rateCollectors.set('XBTZAR', luno);
        this.rateCollectors.set('ethbtc', bitfinex);
    }

    private async collect() {
        console.log(`${new Date()} Collecting data`);
        console.log('\tCollecting balances');
        this.balanceCollectors.forEach(async collector => {
            let balances = await collector.getBalances();
            if (balances) {
                await this.dataStore.storeBalances(balances);
            }
        });

        console.log('\tCollecting rates');
        this.rateCollectors.forEach(async (value, key) => {
            let rate = await this.rateCollectors.get(key).getTicker(key);

            if (rate) {
                await this.dataStore.storeRate(rate);
            }
        });
    }

    async start() {
        this.timer = setInterval(() => this.collect(), INTERVAL);
        await this.collect();
    }

    stop() {
        clearInterval(this.timer);
    }
}
