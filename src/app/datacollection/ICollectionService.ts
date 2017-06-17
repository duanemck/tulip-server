import { Balance, Ticker } from '../domain';

export interface ICollectionService {
    getBalances(): Promise<Balance[]>;
    getTicker(pair: string): Promise<Ticker>;
}
