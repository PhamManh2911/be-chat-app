import { TimeStamps } from '@/types/app';
import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import { QueryFilter, Types } from 'mongoose';

@index({ chatId: 1, createdAt: -1 })
@modelOptions({ schemaOptions: { timestamps: true } })
class Message extends TimeStamps {
    @prop({ type: Types.ObjectId, required: true, ref: 'Chat' })
    chatId: string;

    @prop({ required: true })
    userId: string;

    @prop({ required: true })
    userName: string;

    @prop({})
    userAvatarUrl?: string;

    @prop({ required: true })
    content: string;
}

export type MessageFilter = QueryFilter<Message>;

export const MessageModel = getModelForClass(Message);
