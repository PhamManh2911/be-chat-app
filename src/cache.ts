import { config } from '@/config';
import logger from '@/logger';
import Redis, { Redis as RedisClient } from 'ioredis';

class RedisSingleton {
    private static instance: RedisClient | null = null;

    private constructor() {}

    public static getInstance(): RedisClient {
        if (!RedisSingleton.instance) {
            RedisSingleton.instance = new Redis(config.cacheConfig.uri, {
                maxRetriesPerRequest: null,
                enableReadyCheck: true,
                lazyConnect: false,
                retryStrategy(times) {
                    return Math.min(times * 50, 2000);
                },
            });

            RedisSingleton.instance.on('connect', () => {
                logger.info('🔌 Redis connected');
            });

            RedisSingleton.instance.on('ready', () => {
                logger.info('✅ Redis ready');
            });

            RedisSingleton.instance.on('error', (err) => {
                logger.error('❌ Redis error:', err);
            });
        }

        return RedisSingleton.instance;
    }

    public static async disconnect(): Promise<void> {
        if (RedisSingleton.instance) {
            await RedisSingleton.instance.quit();
            RedisSingleton.instance = null;
        }
    }
}

const redis = RedisSingleton.getInstance();

export default redis;
