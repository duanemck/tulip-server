import { Wallet, Ticker } from '../domain';

export interface ICollectionService {
    getBalances(): Promise<Wallet[]>;
    getTicker(pair: string): Promise<Ticker>;
}
