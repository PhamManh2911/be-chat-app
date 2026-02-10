import mongoose from 'mongoose';

export const USER1_ID = new mongoose.Types.ObjectId().toString();
export const USER2_ID = new mongoose.Types.ObjectId().toString();
export const USER3_ID = new mongoose.Types.ObjectId().toString();
export const CHAT_ID = new mongoose.Types.ObjectId().toString();

export const MSG_USER1 = new mongoose.Types.ObjectId().toString();
export const MSG_USER2 = new mongoose.Types.ObjectId().toString();

export const CHAT_DATA = [{ createdBy: USER1_ID, name: 'Test Chat', _id: CHAT_ID }];
export const CHAT_USER_DATA = [
    { chatId: CHAT_ID, userId: USER1_ID },
    { chatId: CHAT_ID, userId: USER2_ID },
];

export const MESSAGE_USER1 = {
    _id: MSG_USER1,
    chatId: CHAT_ID,
    userId: USER1_ID,
    userName: 'User 1',
    content: 'Hello world',
};

export const MESSAGE_USER2 = {
    _id: MSG_USER2,
    chatId: CHAT_ID,
    userId: USER2_ID,
    userName: 'User 2',
    content: 'Hi!',
};
