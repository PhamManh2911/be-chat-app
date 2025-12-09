export type AppConfig = {
    port: number;
    appName: string;
    deployment: 'development' | 'production' | 'test';
    isDebugMode: boolean;
};

const deployment = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';

export const appConfig: AppConfig = {
    port: Number(process.env.PORT) || 3000,
    appName: process.env.APP_NAME || 'Chat App',
    deployment,
    isDebugMode: deployment === 'development' || deployment === 'test',
};
