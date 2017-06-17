import { DataStore } from './app/storage/';
import { WebServer } from './app/api';
import { Collector } from './app/datacollection';
import { Configuration } from './app/configuration';
import { PriceService, WalletService } from './app/services';

let config = new Configuration();
let datastore = new DataStore(config);
let priceService = new PriceService(datastore);
let walletService = new WalletService(datastore);

let server = new WebServer(config, walletService, priceService);
let collector = new Collector(config, walletService, priceService)

process.on('SIGTERM', async () => {
    console.log('Process Terminated');
    await server.shutdown();
    await collector.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await server.shutdown()
    await collector.stop();
    process.exit(0);
});

collector.start();
server.start();
