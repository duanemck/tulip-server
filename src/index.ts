import { IDataStore, MongoDataStore } from './app/storage/';
import { WebServer } from './app/api';
import { Collector } from './app/datacollection';
import { Configuration } from './app/configuration';
import { PriceService, WalletService } from './app/services';
import { Consolidator } from './app/consolidation';

let config = new Configuration();
let datastore: IDataStore = new MongoDataStore(config);
let priceService = new PriceService(datastore);
let walletService = new WalletService(datastore);

let server = new WebServer(config, walletService, priceService);
let collector = new Collector(config, walletService, priceService);
let consolidator = new Consolidator(config, datastore);

process.on('SIGTERM', async () => {
    console.log('Process Terminated');
    await server.shutdown();
    await collector.stop();
    await consolidator.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await server.shutdown()
    await collector.stop();
    await consolidator.stop();
    process.exit(0);
});

datastore.connect()
    .then(() => {
        collector.start();
        server.start();
        consolidator.start();
        //new Importer().start();
    });



// class Exporter {
//     async start() {
//         let store = new GoogleCloudDataStore(config);
//         let rates = await store.getAllRates();
//         console.log('Got Rates');
//         let fs = require('fs');

//         let file = fs.createWriteStream('rates.txt');
//         file.on('error', function (err) {
//             console.error(err);
//         });
//         rates.forEach(function (v) {
//             file.write(JSON.stringify(v) + '\n');
//         });
//         file.end();


//     }
// }

// class Importer {
//     async start() {
//         let lineReader = require('readline').createInterface({
//             input: require('fs').createReadStream('rates.txt')
//         });
//         let moment = require('moment');

//         lineReader.on('line', function (line) {
//             let x = JSON.parse(line);
//             x.date = moment(x.date).toDate();
//             datastore.storeDailyRate(x);
//         });


//     }
// }
