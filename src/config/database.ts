export type DatabaseConfig = {
    uri: string;
};

export const databaseConfig: DatabaseConfig = {
    uri: process.env.BE_APP_MONGO_DB_URI || 'mongodb://localhost:27017/myapp',
};
