import redis from '@/cache';
import database from '@/database';
import { ChatModel } from '@/models/chat.model';
import { ChatUserModel } from '@/models/chatUser.model';
import { MessageModel } from '@/models/message.model';
import mongoose from 'mongoose';

beforeAll(async () => {
    console.log(`Connecting to database test ${process.env.JEST_WORKER_ID}`);
    await mongoose.connection.db?.dropDatabase();
    globalThis.__USER_1_ID = new mongoose.Types.ObjectId().toString();
    globalThis.__USER_2_ID = new mongoose.Types.ObjectId().toString();
    globalThis.__CHAT_ID = new mongoose.Types.ObjectId().toString();

    const chatData = [
        { createdBy: globalThis.__USER_1_ID, name: 'Test Chat', _id: globalThis.__CHAT_ID },
    ];
    const chatUserData = [
        { chatId: globalThis.__CHAT_ID, userId: globalThis.__USER_1_ID },
        { chatId: globalThis.__CHAT_ID, userId: globalThis.__USER_2_ID },
    ];

    const messageData = [
        {
            chatId: globalThis.__CHAT_ID,
            userId: globalThis.__USER_1_ID,
            userName: 'User 1',
            content: 'Hello world',
        },
        {
            chatId: globalThis.__CHAT_ID,
            userId: globalThis.__USER_2_ID,
            userName: 'User 2',
            content: 'Hi!',
        },
    ];
    // Chats
    await ChatModel.insertMany(chatData);

    // Chat users
    await ChatUserModel.insertMany(chatUserData);

    // Messages
    await MessageModel.insertMany(messageData);
});

afterAll(async () => {
    console.log('--- Global Teardown Started ---');

    // ---------- Close connections ----------
    await mongoose.connection.db?.dropDatabase();
    await database.disconnect();

    await redis.quit();
    // You can add any global teardown logic here if needed
    console.log('--- Global Teardown Completed ---');
});
