export type CorsConfig = {
    origin: string;
    // credentials: boolean;
};

export const corsConfig: CorsConfig = {
    origin: process.env.BE_APP_CORS_ORIGIN || '*',
    // credentials: true,
};
