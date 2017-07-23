import * as path from 'path';
import * as moment from 'moment';

import * as promisify from 'es6-promisify';

import { IDataStore } from './IDataStore';
import { Configuration } from '../configuration';
import { Collection, Db, MongoClient, FindOneOptions } from 'mongodb';
import { Ticker, Balance, DailyRate, GraphPoint } from '../domain';

export class MongoDataStore implements IDataStore {
    private db;
    private ratesCollection: Collection;
    private dailyRatesCollection: Collection;
    private balancesCollection: Collection;

    private findRates;
    private findDailyRates;
    private findBalances;
    private findOneRate;
    private findOneDailyRate;

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

                this.findBalances = wrapCursor(this.balancesCollection, this.balancesCollection.find);
                this.findRates = wrapCursor(this.ratesCollection, this.ratesCollection.find);
                this.findOneRate = wrap(this.ratesCollection, this.ratesCollection.findOne);

                this.findDailyRates = wrapCursor(this.dailyRatesCollection, this.dailyRatesCollection.find);
                this.findOneDailyRate = wrap(this.dailyRatesCollection, this.dailyRatesCollection.findOne);
                resolve();
            })
        });
    }

    async storeBalances(balances: Balance[]) {
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
        return this.findOneRate({ 'pair': ticker }, { sort: 'time', limit: 1 });
    }

    async getLatestPrice(ticker: string): Promise<Ticker> {
        return this.findOneRate({ 'pair': ticker }, { sort: '-time', limit: 1 });
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
        return this.findRates(query, { sort: 'time' });
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
        return this.findDailyRates(query, { sort: 'time' });
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
        return this.findDailyRates(query, { sort: 'date' })
            .then(result => result.map(p => new GraphPoint(p.close, p.date)));
    }

    async getDailyRate(ticker: string, date: Date): Promise<DailyRate> {
        let query = {
            'pair': ticker,
            'time': date
        };
        return this.findOneDailyRate(query, { sort: 'time' })
    }

    async getLatestWallets(source: string): Promise<Balance[]> {
        let query = {
            'source': source
        };
        return this.findBalances(query, { sort: '-timestamp', limit: 2 });
    }



}


function wrap(context, f): () => Promise<any> {
    return function (...args: any[]) {
        return new Promise<any>((resolve, reject) => {
            args.push((err, response) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(response);
            });
            f.apply(context, args);
        });
    }
}

function wrapCursor(context, f): () => Promise<any> {
    return function (...args: any[]) {
        return new Promise<any>((resolve, reject) => {
            args.push((err, response) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(response);
            });
            f.apply(context, args);
        })
            .then(cursor => {

                return cursor.toArray();
            });
    }
}
