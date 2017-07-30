import * as path from 'path';
import * as moment from 'moment';

import * as promisify from 'es6-promisify';

import { IDataStore } from './IDataStore';
import { Configuration } from '../configuration';
import { Collection, Db, MongoClient, FindOneOptions } from 'mongodb';
import { Ticker, Wallet, DailyRate, GraphPoint } from '../domain';

export class MongoDataStore implements IDataStore {
    private db;
    private ratesCollection: Collection;
    private dailyRatesCollection: Collection;
    private balancesCollection: Collection;

    constructor(private config: Configuration) {

    }

    async connect() {
        return new Promise((resolve, reject) => {
            new MongoClient().connect(this.config.mongo.url, (err, database) => {
                if (err) {
                    console.error(err);
                    reject();
                }
                this.db = database;
                this.ratesCollection = this.db.collection('rates');
                this.dailyRatesCollection = this.db.collection('dailyRates');
                this.balancesCollection = this.db.collection('balances');

                resolve();
            })
        });
    }

    async storeBalances(balances: Wallet[]) {
        await this.balancesCollection.insertMany(balances);
    }

    async storeRate(rate: Ticker) {
        return this.ratesCollection.insert(rate);
    }

    async storeDailyRate(rate: DailyRate) {
        return this.dailyRatesCollection.insert(rate);
    }

    async getUniqueTickers(): Promise<string[]> {
        return this.ratesCollection.distinct('pair', {});
    }

    async getOldestPrice(ticker: string): Promise<Ticker> {
        return this.ratesCollection
            .find({ pair: ticker })
            .sort({ time: 1 })
            .limit(1)
            .toArray()
            .then(prices => prices[0]);
    }

    async getLatestPrice(ticker: string): Promise<Ticker> {
        return this.ratesCollection
            .find({ pair: ticker })
            .sort({ time: -1 })
            .limit(1)
            .toArray()
            .then(prices => prices[0]);
    }

    async getPriceOverPeriod(ticker: string, from: Date, to: Date): Promise<Ticker[]> {
        let query = {
            'pair': ticker,
            '$and': [
                {
                    'time': {
                        '$gte': from
                    }
                },
                {
                    'time': {
                        '$lte': to
                    }
                }
            ]
        };
        return this.ratesCollection
            .find(query)
            .sort({ 'time': 1 })
            .toArray();
    }

    async getDailyRateOverPeriod(ticker: string, from: Date, to: Date): Promise<DailyRate[]> {
        let query = {
            'pair': ticker,
            '$and': [
                {
                    'time': {
                        '$gte': from
                    }
                },
                {
                    'time': {
                        '$lte': to
                    }
                }
            ]
        };
        return this.dailyRatesCollection
            .find(query)
            .sort({ 'date': 1 })
            .toArray();
    }

    async getDailyRateGraph(ticker: string, from: Date, to: Date): Promise<GraphPoint[]> {

        let query = {
            'pair': ticker,
            '$and': [
                {
                    'date': {
                        '$gte': from
                    }
                },
                {
                    'date': {
                        '$lte': to
                    }
                }
            ]
        };
        return this.dailyRatesCollection
            .find(query)
            .sort({ 'date': 1 })
            .toArray()
            .then(result => result.map(p => new GraphPoint(p.close, p.date)));
    }

    async getDailyRate(ticker: string, date: Date): Promise<DailyRate> {
        let query = {
            'pair': ticker,
            'date': date
        };
        return this.dailyRatesCollection
            .findOne(query);
    }

    async getLatestWallets(source: string): Promise<Wallet[]> {
        let query = {
            'source': source
        };
        return this.balancesCollection
            .find(query)
            .sort({ 'timestamp': -1 })
            .limit(2)
            .toArray();
    }
}

