export class Ticker {
    constructor(public pair: string,
        public price: number,
        public time: Date,
        public low_24hr: number,
        public high_24hr: number,
        public volume_24hr: number) {

    }
}
