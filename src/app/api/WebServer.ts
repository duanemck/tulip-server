import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as serveStatic from 'serve-static';
import * as cors from 'cors';

import { WalletService, PriceService } from '../services';
import { WalletRoutes, PricesRoute } from './routes';
import { Configuration } from '../configuration';
import { DataStore } from '../storage';

const NG_APP_ROUTE = '/app';

export class WebServer {
    private app: express.Application;
    private server: http.Server;
    private dataStore: DataStore;

    constructor(private config: Configuration, private walletService: WalletService, private priceService: PriceService) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.dataStore = new DataStore(this.config);
        this.walletService = new WalletService(this.dataStore);
        this.priceService = new PriceService(this.dataStore);
    }

    start() {
        this.server.listen(this.config.server.port);
        this.server.on('error', (error) => this.onError(error));
        this.server.on('listening', () => this.onListening());

        this.enableDebugCors();
        this.setupRewrite();
        this.setupPipeline();

        return this.server;
    }

    shutdown() {
        this.server.close();
    }

    private enableDebugCors() {
        let corsOptions = {
            origin: 'http://localhost:4200'
        };
        this.app.use(cors(corsOptions));
    }

    private setupRewrite() {
        let filesRegex = /^\/(.*\..*$)/;
        let apiRegex = /^\/api\/(.*$)/;
        let socketRegex = /^\/socket.io/;

        this.app.use((req, res, next) => {
            let fileMatch = filesRegex.exec(req.url);
            if (fileMatch) {
                req.url = `${NG_APP_ROUTE}/${fileMatch[1]}`;
            } else if (!apiRegex.test(req.url) && !socketRegex.test(req.url)) {
                req.url = `${NG_APP_ROUTE}/index.html`;
            }
            next();
        });
    }

    private setupPipeline() {
        this.routeToFrontend();
        this.routeToApi();
    }

    private routeToFrontend() {
        let ngApp = this.config.server.frontendLocation
            ? this.config.server.frontendLocation
            : path.join(__dirname, '../../../../tulip/dist');

        this.app.use(NG_APP_ROUTE, serveStatic(ngApp));
    }

    private routeToApi() {
        let router: express.Router;
        router = express.Router();

        new WalletRoutes(this.walletService).configure(router);
        new PricesRoute(this.priceService).configure(router);

        this.app.use(router);
    }

    private onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        switch (error.code) {
            case 'EACCES':
                console.error('Port requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error('Port is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    private onListening() {
        let addr = this.server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        console.info('Web server listening on ' + bind);
    }
}
