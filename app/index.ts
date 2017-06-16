import { WebServer } from './WebServer';
import { Configuration } from './Configuration';
import { Collector } from './datacollection/Collector';

let config = new Configuration();
let server = new WebServer(config);
let collector = new Collector(config)

process.on('SIGTERM', async () => {
    console.log('Process Terminated');
    await server.shutdown()
    process.exit(0);
});

process.on('SIGINT', async () => {
    await server.shutdown()
    process.exit(0);
});

collector.start();
server.start();
