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

    public async connect(uri: string) {
        if (this.isConnected) {
            logger.info('[DB] Already connected');
            return mongoose.connection;
        }

        try {
            mongoose.set('strictQuery', true);

            await mongoose.connect(uri);

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

database.connect(config.databaseConfig.uri || 'mongodb://localhost:27017/myapp');

export default database;
