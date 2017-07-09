export class DailyRate {
    constructor(
        public pair: string,
        public high: number,
        public low: number,
        public open: number,
        public close: number,
        public date: Date) {
    }
}
