export type DatabaseConfig = {
    uri: string;
};

export const databaseConfig: DatabaseConfig = {
    uri: process.env.BE_APP_MONGO_DB_URI || 'mongodb://127.0.0.1:27017/myapp',
};
