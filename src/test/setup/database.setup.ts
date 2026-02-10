import redis from '@/cache';
import database from '@/database';
import { ChatModel } from '@/models/chat.model';
import { ChatUserModel } from '@/models/chatUser.model';
import { MessageModel } from '@/models/message.model';
import { CHAT_DATA, CHAT_USER_DATA, MESSAGE_USER1, MESSAGE_USER2 } from '@/test/setup/seed';
import mongoose from 'mongoose';

beforeAll(async () => {
    console.log(`Connecting to database test ${process.env.JEST_WORKER_ID}`);
    await mongoose.connection.db?.dropDatabase();
    // Chats
    await ChatModel.insertMany(CHAT_DATA);

    // Chat users
    await ChatUserModel.insertMany(CHAT_USER_DATA);

    // Messages
    await MessageModel.insertOne(MESSAGE_USER1);
    await new Promise((res) => setTimeout(res, 100));
    await MessageModel.insertOne(MESSAGE_USER2);
});

afterAll(async () => {
    // ---------- Close connections ----------
    await mongoose.connection.db?.dropDatabase();
    await database.disconnect();

    await redis.quit();
    // You can add any global teardown logic here if needed
});
