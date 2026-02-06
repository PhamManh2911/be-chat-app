import { config } from '@/config';
import logger from '@/logger';
import mongoose from 'mongoose';

class Database {
    private static instance: Database;
    private isConnected = false;

    private constructor() {}

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect() {
        if (this.isConnected) {
            logger.info('[DB] Already connected');
            return mongoose.connection;
        }

        try {
            mongoose.set('strictQuery', true);

            if (!config.appConfig.isDebugMode) {
                await mongoose.connect(config.databaseConfig.uri);
            } else {
                // with each jest worker use different database for parallel testing
                await mongoose.connect(
                    `${config.databaseConfig.uri}${process.env.JEST_WORKER_ID}`,
                    {
                        maxPoolSize: 1,
                        minPoolSize: 0,
                        serverSelectionTimeoutMS: 5000,
                        authSource: 'admin',
                    },
                );
            }

            if (config.appConfig.isDebugMode) {
                mongoose.set('debug', true);
            }
            this.isConnected = true;

            logger.info('[DB] Connected successfully');
            return mongoose.connection;
        } catch (err) {
            logger.error('[DB] Error connecting:', err);
            throw err;
        }
    }

    public async disconnect() {
        if (!this.isConnected) return;

        await mongoose.disconnect();
        this.isConnected = false;

        logger.info('[DB] Disconnected');
    }
}

const database = Database.getInstance();

database.connect();

export default database;
