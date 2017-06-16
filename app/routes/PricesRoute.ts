import { Request, Response, Router } from 'express';
import { DataStore } from '../storage/DataStore';

let wrap = fn => (...args) => fn(...args).catch(args[2]);

export class PricesRoute {
    constructor(private store: DataStore) {

    }

    configure(router: Router) {
        router.get('/api/prices/:ticker/latest', wrap(this.latest.bind(this)));
        router.get('/api/prices/:ticker/period', wrap(this.range.bind(this)));
    }

    async latest(req: Request, res: Response) {
        const ticker = req.params.ticker;
        res.json(await this.store.getLatestPrice(ticker));
    }

    async range(req: Request, res: Response) {
        const ticker = req.params.ticker;
        const from = new Date(Date.parse(req.query.from));
        const to = new Date(Date.parse(req.query.to));
        res.json(await this.store.getPriceOverPeriod(ticker, from, to));
    }
}


