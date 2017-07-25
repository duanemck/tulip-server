import { GraphPoint } from '../domain/GraphPoint';
import { DailyRate } from '../domain/DailyRate';
import { Ticker } from '../domain/Ticker';
import { Balance } from '../domain/Balance';

export interface IDataStore {
    connect(): Promise<any>;
    storeBalances(balances: Balance[]): Promise<any>;
    storeRate(rate: Ticker): Promise<any>;
    storeDailyRate(rate: DailyRate): Promise<any>;
    getUniqueTickers(): Promise<string[]>;
    getOldestPrice(ticker: string): Promise<Ticker[]>;
    getLatestPrice(ticker: string): Promise<Ticker[]>;
    getPriceOverPeriod(ticker: string, from: Date, to: Date): Promise<Ticker[]>;
    getDailyRateOverPeriod(ticker: string, from: Date, to: Date): Promise<DailyRate[]>;
    getDailyRateGraph(ticker: string, from: Date, to: Date): Promise<GraphPoint[]>;
    getDailyRate(ticker: string, date: Date): Promise<DailyRate>;
    getLatestWallets(source: string): Promise<Balance[]>;
}
