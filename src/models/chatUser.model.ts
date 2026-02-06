import { Status, STATUS, TimeStamps } from '@/types/app';
import { getModelForClass, index, ModelOptions, prop } from '@typegoose/typegoose';
import { DefaultIdVirtual, HydratedDocument, QueryFilter, UpdateQuery } from 'mongoose';

@index({ userId: 1, updatedAt: -1 })
@index({ chatId: 1, userId: 1 }, { unique: true })
@ModelOptions({ schemaOptions: { timestamps: true } })
class ChatUser extends TimeStamps {
    @prop({ required: true })
    chatId: string;

    @prop({ required: true })
    userId: string;

    @prop({ default: false, required: true })
    muted: boolean;

    @prop({
        default: STATUS.ACTIVE,
        required: true,
        enum: Object.values(STATUS),
        type: String,
        select: false,
    })
    status: Status;
}

export type ChatUserFilter = QueryFilter<ChatUser>;

export type ChatUserUpdateQuery = UpdateQuery<ChatUser>;

export type ChatUserDocument = HydratedDocument<ChatUser> & DefaultIdVirtual;

export const ChatUserModel = getModelForClass(ChatUser);
