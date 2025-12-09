import redis from '@/cache';
import database from '@/database';
import { ChatModel } from '@/models/chat.model';
import { ChatUserModel } from '@/models/chatUser.model';
import { MessageModel } from '@/models/message.model';
import Redis from 'ioredis';
import mongoose from 'mongoose';

// Make redis accessible in tests if needed
declare global {
    var __REDIS__: Redis | undefined;
}

/**
 * Jest global setup
 * - seed dummy data
 */
beforeAll(async () => {
    // ---------- Seed dummy data ----------
    await seedData();
});

/**
 * Jest global teardown
 * - clean collections
 * - close db & redis connections
 */
afterAll(async () => {
    // ---------- Clean DB ----------
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }

    // ---------- Close connections ----------
    await mongoose.connection.db?.dropDatabase();
    await database.disconnect();

    await redis.quit();
});

/**
 * Optional: clean data between tests if you want isolation
 */
afterEach(async () => {
    jest.clearAllMocks();
});

// ----------------- Helpers -----------------

async function seedData() {
    // Chats
    const chat = await ChatModel.create({
        createdBy: new mongoose.Types.ObjectId().toString(),
        name: 'Test Chat',
    });

    // Chat users
    const users = await ChatUserModel.insertMany([
        {
            chatId: chat._id,
            userId: new mongoose.Types.ObjectId(),
            role: 'admin',
        },
        {
            chatId: chat._id,
            userId: new mongoose.Types.ObjectId(),
            role: 'member',
        },
    ]);

    // Messages
    await MessageModel.insertMany([
        {
            chatId: chat._id,
            senderId: users[0].userId,
            content: 'Hello world',
            type: 'text',
        },
        {
            chatId: chat._id,
            senderId: users[1].userId,
            content: 'Hi!',
            type: 'text',
        },
    ]);
}
