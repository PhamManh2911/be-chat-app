import './env';

import { databaseConfig, DatabaseConfig } from '@/config/database';
import { AppConfig, appConfig } from './app';
import { AuthConfig, authConfig } from './auth';
import { CacheConfig, cacheConfig } from './cache';
import { CorsConfig, corsConfig } from './cors';

type Config = {
    appConfig: AppConfig;
    databaseConfig: DatabaseConfig;
    cacheConfig: CacheConfig;
    corsConfig: CorsConfig;
    authConfig: AuthConfig;
};

export const config: Config = {
    appConfig,
    databaseConfig,
    cacheConfig,
    corsConfig,
    authConfig,
};
