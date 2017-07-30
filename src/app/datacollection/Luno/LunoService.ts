import * as request from 'request-promise-native';

import { Configuration } from '../../configuration';
import { Wallet, Ticker } from '../../domain';

import { ICollectionService } from '..';
import { LunoBalance } from './LunoBalance';
import { LunoTicker } from './LunoTicker';

const URL_TICKER = 'https://api.mybitx.com/api/1/ticker?pair=';
const URL_BALANCE = 'https://api.mybitx.com/api/1/balance';

export class LunoService implements ICollectionService {

    constructor(private config: Configuration) {

    }

    async getBalances(): Promise<Wallet[]> {
        try {
            const response = await request.get(URL_BALANCE)
                .auth(this.config.luno.API_KEY_ID, this.config.luno.API_KEY_SECRET);

            return (JSON.parse(response).balance as LunoBalance[])
                .map(bal => new Wallet('Luno', +bal.balance, bal.asset.toLowerCase(), new Date()));
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getTicker(ticker: string): Promise<Ticker> {
        try {
            const response = JSON.parse((await request.get(URL_TICKER + ticker)
                .auth(this.config.luno.API_KEY_ID, this.config.luno.API_KEY_SECRET))) as LunoTicker;

            return new Ticker(ticker, +response.last_trade, new Date(response.timestamp), 0, 0, +response.rolling_24_hour_volume);
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}





