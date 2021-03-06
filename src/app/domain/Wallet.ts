export class Wallet {

    currentValueRand: number;

    openingPriceBase: number;
    openingValueRand: number;

    changeTodayRand: number;
    changeTodayPercent: number;
    changeSinceStartRand: number;
    changeSinceStartPercent: number;

    url: string;

    constructor(public source: string, public baseValue: number, public baseCurrency: string, public timestamp: Date, url = null) {

    }
}
