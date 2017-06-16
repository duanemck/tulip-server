import { Balance } from './Balance';
import { Ticker } from './Ticker';

export interface ICollectionService {
    getBalances(): Promise<Balance[]>;
    getTicker(pair: string): Promise<Ticker>;
}
