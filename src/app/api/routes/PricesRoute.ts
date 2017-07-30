import { Request, Response, Router } from 'express';
import * as moment from 'moment';
import { PriceService } from '../../services';

let wrap = fn => (...args) => fn(...args).catch(args[2]);

export class PricesRoute {
    constructor(private priceService: PriceService) {

    }

    configure(router: Router) {
        router.get('/api/prices/:ticker/latest', wrap(this.latest.bind(this)));
        router.get('/api/prices/:ticker/period', wrap(this.range.bind(this)));
        router.get('/api/prices/:ticker/graph/daily', wrap(this.dailyGraph.bind(this)));
        router.get('/api/prices/:ticker/graph/intraday', wrap(this.intraday.bind(this)));
    }

    async latest(req: Request, res: Response) {
        const ticker = req.params.ticker;
        let rates = await this.priceService.getLatestPrice(ticker);
        res.json(rates);
    }

    async range(req: Request, res: Response) {
        const ticker = req.params.ticker;
        const from = new Date(Date.parse(req.query.from));
        const to = new Date(Date.parse(req.query.to));
        res.json(await this.priceService.getForTickerOverPeriod(ticker, from, to));
    }

    async dailyGraph(req: Request, res: Response) {
        const ticker = req.params.ticker;
        const from = moment(req.query.from).startOf('day').toDate();
        let to = moment(req.query.to).startOf('day').toDate();
        to = to || moment().startOf('day').toDate();
        let r = await this.priceService.getDailyGraph(ticker, from, to);
        let now = (await this.priceService.getLatestPrice(ticker)) as any;
        now.date = moment().toDate();
        r.push(now);
        res.json(r);
    }

    async intraday(req: Request, res: Response) {
        const ticker = req.params.ticker;
        let r = await this.priceService.getIntradayGraph(ticker, moment().toDate());
        res.json(r);
    }
}


