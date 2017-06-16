export class Balance {
    constructor(public source: string, public baseValue: number, public baseCurrency: string, public timestamp: Date) {

    }

    //   static fromLuno(balance: LunoBalance): CryptoBalance {
    //     const value = new CryptoBalance();
    //     value.baseValue = +balance.balance;
    //     value.baseCurrency = balance.asset;
    //     value.source = 'Luno';
    //     return value;
    //   }

    //   static fromBitfinex(balance: BitfinexBalance): CryptoBalance {
    //     const value = new CryptoBalance();
    //     value.baseValue = +balance.amount;
    //     value.baseCurrency = balance.currency;
    //     value.source = 'Bitfinex';
    //     return value;
    //   }
}
