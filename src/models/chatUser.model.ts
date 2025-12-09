import { getModelForClass, index, prop } from '@typegoose/typegoose';
import { QueryFilter, UpdateQuery } from 'mongoose';

@index({ userId: 1, latestMessageAt: -1 })
@index({ chatId: 1, userId: 1 }, { unique: true })
class ChatUser {
    @prop({ required: true })
    chatId: string;

    @prop({ required: true })
    chatName: string;

    @prop({ required: true })
    userId: string;

    @prop({ required: true })
    createdAt: Date;

    @prop({ required: true })
    latestSender: string;

    @prop({ required: true })
    latestMessage: string;

    @prop({ required: true })
    latestMessageAt: Date;

    @prop({ default: false, required: true })
    muted: boolean;
}

export type ChatUserFilter = QueryFilter<ChatUser>;

export type ChatUserUpdateQuery = UpdateQuery<ChatUser>;

export const ChatUserModel = getModelForClass(ChatUser);
