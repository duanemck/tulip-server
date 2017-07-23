import * as config from 'config';

import { IServerConfig, IApiConfig, IMongoConfig, IGoogleCloudConfig } from '.';

export class Configuration {
    environment: string;
    mongo: IMongoConfig;
    server: IServerConfig;
    luno: IApiConfig;
    bitfinex: IApiConfig;
    googleCloud: IGoogleCloudConfig;

    constructor() {
        this.environment = process.env.NODE_ENV || 'default';

        this.mongo = config.get('mongo') as IMongoConfig;
        this.server = config.get('server') as IServerConfig;
        this.bitfinex = config.get('bitfinex') as IApiConfig;
        this.luno = config.get('luno') as IApiConfig;
        this.googleCloud = config.get('google-cloud') as IGoogleCloudConfig;
    }

    get(key: string): any {
        return config.get(key);
    }
}
