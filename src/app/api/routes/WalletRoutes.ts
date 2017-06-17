import { Request, Response, Router } from 'express';

import { DataStore } from 'app/storage';

let wrap = fn => (...args) => fn(...args).catch(args[2]);

export class WalletRoutes {
    constructor(private store: DataStore) {

    }
    configure(router: Router) {
        router.get('/api/wallets/current', wrap(this.current.bind(this)));
        router.get('/api/wallets/summary', wrap(this.summary.bind(this)));
    }

    async current(req: Request, res: Response) {
        let wallets = await this.store.getLatestWallets('Luno');
        wallets = wallets.concat(await this.store.getLatestWallets('Bitfinex'));
        res.json(wallets);
    }

    async summary(req: Request, res: Response) {
        let wallets = await this.store.getLatestWallets('Luno');
        wallets = wallets.concat(await this.store.getLatestWallets('Bitfinex'));
        res.json(wallets);
    }
}
