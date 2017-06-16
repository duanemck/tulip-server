import { Configuration } from '../../Configuration';
import { Balance } from '../Balance';
import * as request from 'request-promise-native';
import { BitfinexBalance } from './BitfinexBalance';
import { Ticker } from '../Ticker';
import { BitfinexTicker } from './BitfinexTicker';
import { ICollectionService } from '../ICollectionService';
import * as crypto from 'crypto';

const baseUrl = 'https://api.bitfinex.com';
const balanceUrl = '/v1/balances';
const tickerUrl = '/v1/pubticker/';

export class BitfinexService implements ICollectionService {

    constructor(private config: Configuration) {

    }

    async getBalances(): Promise<Balance[]> {
        try {
            const nonce = Date.now().toString()
            const completeURL = `${baseUrl}${balanceUrl}`;
            const body = {
                request: balanceUrl,
                nonce
            }
            const payload = new Buffer(JSON.stringify(body))
                .toString('base64')

            const signature = crypto
                .createHmac('sha384', this.config.bitfinex.API_KEY_SECRET)
                .update(payload)
                .digest('hex')

            const options = {
                url: completeURL,
                headers: {
                    'X-BFX-APIKEY': this.config.bitfinex.API_KEY_ID,
                    'X-BFX-PAYLOAD': payload,
                    'X-BFX-SIGNATURE': signature
                },
                body: JSON.stringify(body)
            }

            const response = await request.post(options);

            return (JSON.parse(response) as BitfinexBalance[])
                .map(bal => new Balance('Bitfinex', +bal.amount, bal.currency.toLowerCase(), new Date()));
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getTicker(ticker: string): Promise<Ticker> {
        try {
            const response = JSON.parse(await request.get(`${baseUrl}${tickerUrl}${ticker}`)) as BitfinexTicker;
            return new Ticker(ticker, +response.last_price,
                new Date(Math.trunc(+response.timestamp) * 1000),
                +response.low, +response.high, +response.volume);
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}





