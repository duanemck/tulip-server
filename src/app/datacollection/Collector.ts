import { WalletService, PriceService } from '../services';
import { Configuration } from '../configuration';
import { ICollectionService } from '../datacollection';

import { LunoService } from './Luno/LunoService';
import { BitfinexService } from './Bitfinex/BitfinexService';
import { Ticker } from '../domain';

const INTERVAL: number = 5 * 60 * 1000;

export class Collector {
    private timer: NodeJS.Timer;
    private balanceCollectors: ICollectionService[];
    private rateCollectors: Map<string, ICollectionService> = new Map();

    constructor(private config: Configuration, private walletService: WalletService, private priceService: PriceService) {
        let luno = new LunoService(config);
        let bitfinex = new BitfinexService(config);

        this.balanceCollectors = [luno, bitfinex];
        this.rateCollectors.set('XBTZAR', luno);
        // this.rateCollectors.set('ethbtc', bitfinex);
    }

    private async collect() {
        console.log(`${new Date()} Collecting data`);
        console.log('\tCollecting balances');
        this.balanceCollectors.forEach(async collector => {
            let balances = await collector.getBalances();
            if (balances) {
                await this.walletService.storeBalances(balances);
            }
        });

        console.log('\tCollecting rates');
        let rates: Ticker[] = [];
        this.rateCollectors.forEach(async (value, key) => {
            let rate = await this.rateCollectors.get(key).getTicker(key);

            if (rate) {
                rates.push(rate);
                await this.priceService.storePrice(rate);
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
