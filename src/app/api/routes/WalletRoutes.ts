import { Request, Response, Router } from 'express';

import { WalletService } from '../../services';

let wrap = fn => (...args) => fn(...args).catch(args[2]);

export class WalletRoutes {
    constructor(private walletService: WalletService) {

    }
    configure(router: Router) {
        router.get('/api/wallets/current', wrap(this.current.bind(this)));
        router.get('/api/wallets/summary', wrap(this.summary.bind(this)));
    }

    async current(req: Request, res: Response) {
        const wallets = await this.walletService.getCurrentWalletBalances();
        res.json(wallets);
    }

    async summary(req: Request, res: Response) {
        const summary = await this.walletService.getSummary();
        res.json(summary);
    }
}
