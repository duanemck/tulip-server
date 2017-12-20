import { IDataStore } from '../storage';
import { Wallet, BalanceSummary, CurrentState } from '../domain';
import * as moment from 'moment';

export class WalletSummary {
    totalBTC;
    totalRand;
    todayChange;
    todayChangePercent;
    gainLoss;
    gainLossPercent;
    investment;
    fees;
}

const investments = {
    xbt: 1000,
    eth: 0,
    btc: 0,
};

const fees = {
    xbt: 45,
    eth: 0,
    btc: 0,
};

const xbtInvestment = investments.xbt;
const btcInvestment = investments.btc;
const ethInvestment = investments.eth;

const investment = btcInvestment + ethInvestment + xbtInvestment;
const btcFees = (fees.xbt = 45);
const ethFees = (fees.eth = 0);
const totalFees = btcFees + ethFees;

const actualInvestment = investment; // - totalFees;

const offlineWallet = 0.01945304;

function round(amount) {
    return Math.round(amount * 100) / 100;
}

export class WalletService {
    constructor(private store: IDataStore) {}

    async getCurrentWallet(source: string, baseCurrency: string): Promise<Wallet> {
        return this.store.getLatestWallets(source).then((wallets: Wallet[]) => {
            return wallets.filter(w => w.baseCurrency.toLowerCase() === baseCurrency.toLowerCase())[0];
        });
    }

    async getCurrentWalletBalances(): Promise<Wallet[]> {
        let exchangeWallets = [
            await this.getWalletPerformance('Luno', 'XBT', ['XBTZAR']),
            //   await this.getWalletPerformance("Bitfinex", "eth", ["ethbtc", "XBTZAR"]),
            //   await this.getWalletPerformance("Bitfinex", "btc", ["XBTZAR"])
        ].filter(wallet => wallet.baseValue > 0);
        exchangeWallets.push(await this.getOfflineWalletPerformance());
        return exchangeWallets;
    }

    async getWalletPerformance(source: string, base: string, tickerPairs: string[]): Promise<Wallet> {
        let wallet = await this.getCurrentWallet(source, base);
        if (!wallet) {
            return new Wallet(source, 0, base, new Date());
        }
        let currentPrices = await Promise.all(tickerPairs.map(async pair => await this.store.getLatestPrice(pair)));

        let openingPrices = await Promise.all(
            tickerPairs.map(
                async pair =>
                    await this.store.getDailyRate(
                        pair,
                        moment()
                            .add(-1, 'days')
                            .startOf('day')
                            .toDate()
                    )
            )
        );

        let currentPrice = currentPrices.reduce((price, rate) => price * rate.price, 1);
        let openingPrice = openingPrices.reduce((price, rate) => price * (rate ? rate.close : 0), 1);

        wallet.currentValueRand = currentPrice * wallet.baseValue;
        wallet.openingValueRand = wallet.baseValue * openingPrice;
        wallet.changeTodayRand = wallet.baseValue * currentPrice - openingPrice * wallet.baseValue;
        wallet.changeTodayPercent = wallet.changeTodayRand / (openingPrice * wallet.baseValue);

        let walletInvestment = investments[base]; // - fees[base];
        wallet.changeSinceStartRand = currentPrice * wallet.baseValue - walletInvestment;
        wallet.changeSinceStartPercent = wallet.changeSinceStartRand / walletInvestment;

        return wallet;
    }

    async getOfflineWalletPerformance(): Promise<Wallet> {
        let wallet = new Wallet('Mycellium', offlineWallet, 'btc', new Date());
        let currentPrices = await Promise.all(['XBTZAR'].map(async pair => await this.store.getLatestPrice(pair)));

        let openingPrices = await Promise.all(
            ['XBTZAR'].map(
                async pair =>
                    await this.store.getDailyRate(
                        pair,
                        moment()
                            .add(-1, 'days')
                            .startOf('day')
                            .toDate()
                    )
            )
        );

        let currentPrice = currentPrices.reduce((price, rate) => price * rate.price, 1);
        let openingPrice = openingPrices.reduce((price, rate) => price * (rate ? rate.close : 0), 1);

        wallet.currentValueRand = currentPrice * wallet.baseValue;
        wallet.openingValueRand = wallet.baseValue * openingPrice;
        wallet.changeTodayRand = wallet.baseValue * currentPrice - openingPrice * wallet.baseValue;
        wallet.changeTodayPercent = wallet.changeTodayRand / (openingPrice * wallet.baseValue);

        let walletInvestment = 1000; // - fees[base];
        wallet.changeSinceStartRand = currentPrice * wallet.baseValue - walletInvestment;
        wallet.changeSinceStartPercent = wallet.changeSinceStartRand / walletInvestment;
        wallet.url = 'https://www.blocktrail.com/BTC/address/19fedXKZdPGdUavsCydbvdYZ37NhjLW7A4';
        return wallet;
    }

    async getSummary(): Promise<BalanceSummary> {
        let btcBalanceLuno = await this.getWalletPerformance('Luno', 'xbt', ['XBTZAR']);
        let mycelliumBalance = await this.getOfflineWalletPerformance();

        let ethbtcRate = (await this.store.getLatestPrice('ethbtc')).price;
        let btczarRate = (await this.store.getLatestPrice('XBTZAR')).price;
        let ethzarRate = ethbtcRate * btczarRate;

        let summary = new WalletSummary();
        summary.totalBTC = btcBalanceLuno.baseValue + mycelliumBalance.baseValue;
        summary.totalRand = summary.totalBTC * btczarRate;
        summary.todayChange = btcBalanceLuno.changeTodayRand + mycelliumBalance.changeTodayRand;
        summary.todayChangePercent = btcBalanceLuno.changeTodayPercent + mycelliumBalance.changeTodayPercent;
        summary.gainLoss = summary.totalRand - actualInvestment;
        summary.gainLossPercent = summary.gainLoss / actualInvestment;
        summary.investment = investment;
        summary.fees = totalFees;
        return summary;
    }

    async storeBalances(balances: Wallet[]) {
        await this.store.storeBalances(balances);
    }
}
