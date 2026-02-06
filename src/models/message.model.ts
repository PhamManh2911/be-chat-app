import { TimeStamps } from '@/types/app';
import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import { DefaultIdVirtual, HydratedDocument, QueryFilter, Types } from 'mongoose';

@index({ chatId: 1, createdAt: -1 })
@modelOptions({ schemaOptions: { timestamps: true } })
class Message extends TimeStamps {
    @prop({ type: Types.ObjectId, required: true, ref: 'Chat', select: false })
    chatId: string;

    @prop({ required: true })
    userId: string;

    @prop({ required: true })
    userName: string;

    @prop({})
    userAvatarUrl?: string;

    @prop({ required: true })
    content: string;

    @prop({ default: false })
    isEdited: boolean;

    // TODO: implement enum for message type
}

export type MessageFilter = QueryFilter<Message>;

export type MessageDocument = HydratedDocument<Message> & DefaultIdVirtual;

export const MessageModel = getModelForClass(Message);
