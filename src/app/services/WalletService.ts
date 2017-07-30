import { IDataStore } from '../storage';
import { Wallet, BalanceSummary, CurrentState } from '../domain';
import * as moment from 'moment';

export class WalletSummary {
    totalBTC;
    totalRand;
    gainLoss;
    gainLossPercent;
    investment;
    fees;
}

const investments = {
    xbt: 500,
    eth: 500
};

const fees = {
    xbt: 45,
    eth: 0
};

const btcInvestment = investments.xbt;
const ethInvestment = investments.eth;
const investment = btcInvestment + ethInvestment;
const btcFees = fees.xbt = 45;
const ethFees = fees.eth = 0;
const totalFees = btcFees + ethFees;

const actualInvestment = investment - totalFees;

function round(amount) {
    return Math.round(amount * 100) / 100;
}

export class WalletService {

    constructor(private store: IDataStore) {

    }

    async getCurrentWallet(source: string, baseCurrency: string): Promise<Wallet> {
        return this.store.getLatestWallets(source)
            .then((wallets: Wallet[]) => wallets.filter(w => w.baseCurrency === baseCurrency)[0]);
    }

    async getCurrentWalletBalances(): Promise<Wallet[]> {
        return [
            await this.getWalletPerformance('Luno', 'xbt', ['XBTZAR']),
            await this.getWalletPerformance('Bitfinex', 'eth', ['ethbtc', 'XBTZAR'])
        ];
    }

    async getWalletPerformance(source: string, base: string, tickerPairs: string[]): Promise<Wallet> {
        let wallet = await this.getCurrentWallet(source, base);
        let currentPrices = await Promise.all(tickerPairs
            .map(async pair => await this.store.getLatestPrice(pair))
        );

        let openingPrices = await Promise.all(tickerPairs
            .map(async pair => await this.store.getDailyRate(pair, moment().add(-1, 'days').startOf('day').toDate()))
        );

        let currentPrice = currentPrices.reduce((price, rate) => price * rate.price, 1);
        let openingPrice = openingPrices.reduce((price, rate) => price * rate.close, 1);

        wallet.currentValueRand = currentPrice * wallet.baseValue;
        wallet.openingValueRand = wallet.baseValue * openingPrice;
        wallet.changeTodayRand = (wallet.baseValue * currentPrice) - (openingPrice * wallet.baseValue);
        wallet.changeTodayPercent = wallet.changeTodayRand / (openingPrice * wallet.baseValue);

        let walletInvestment = investments[base] - fees[base];
        wallet.changeSinceStartRand =   (currentPrice * wallet.baseValue) - walletInvestment;
        wallet.changeSinceStartPercent = wallet.changeSinceStartRand / walletInvestment;

        return wallet;
    }

    async getSummary(): Promise<BalanceSummary> {
        let btcBalance = (await this.getCurrentWallet('Luno', 'xbt')).baseValue;
        let ethBalance = (await this.getCurrentWallet('Bitfinex', 'eth')).baseValue;

        let ethbtcRate = (await this.store.getLatestPrice('ethbtc')).price;
        let btczarRate = (await this.store.getLatestPrice('XBTZAR')).price;
        let ethzarRate = ethbtcRate * btczarRate;

        let summary = new WalletSummary();
        summary.totalBTC = btcBalance + (ethBalance * ethbtcRate);
        summary.totalRand = round(summary.totalBTC * btczarRate);
        summary.gainLoss = round(summary.totalRand - actualInvestment);
        summary.gainLossPercent = round(summary.gainLoss / actualInvestment * 100);
        summary.investment = investment;
        summary.fees = totalFees;
        return summary;
    }

    async storeBalances(balances: Wallet[]) {
        await this.store.storeBalances(balances);
    }
}
