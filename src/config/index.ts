import './env';

import { databaseConfig, DatabaseConfig } from '@/config/database';
import { AppConfig, appConfig } from './app';
import { CacheConfig, cacheConfig } from './cache';
import { CorsConfig, corsConfig } from './cors';

type Config = {
    appConfig: AppConfig;
    databaseConfig: DatabaseConfig;
    cacheConfig: CacheConfig;
    corsConfig: CorsConfig;
};

export const config: Config = {
    appConfig,
    databaseConfig,
    cacheConfig,
    corsConfig,
};
