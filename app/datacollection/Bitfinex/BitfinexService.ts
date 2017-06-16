import {Configuration} from '../../Configuration';
import { Balance } from '../Balance';
import * as request from 'request-promise-native';
import { BitfinexBalance } from './BitfinexBalance';
import { Ticker } from '../Ticker';
import { BitfinexTicker } from './BitfinexTicker';
import { ICollectionService } from '../ICollectionService';
import * as crypto from 'crypto';



const baseUrl = 'https://api.bitfinex.com';

export class BitfinexService implements ICollectionService {

    constructor(private config: Configuration) {

    }

    async getBalances(): Promise<Balance[]> {
        const url = '/v1/balances'
        const nonce = Date.now().toString()
        const completeURL = baseUrl + url
        const body = {
            request: url,
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
    }

    async getTicker(ticker: string): Promise<Ticker> {
        const response = JSON.parse(await request.get(`https://api.bitfinex.com/v1/pubticker/${ticker}`)) as BitfinexTicker;
        return new Ticker(ticker, +response.last_price, new Date(+response.timestamp));
    }
}





