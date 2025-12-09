export type CacheConfig = {
    uri: string;
};

export const cacheConfig: CacheConfig = {
    uri: process.env.BE_APP_CACHE_URI || 'redis://localhost:6379',
};
