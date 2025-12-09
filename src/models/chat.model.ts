import { getModelForClass, prop } from '@typegoose/typegoose';
import { ApplyBasicCreateCasting, DeepPartial, Require_id } from 'mongoose';

class Chat {
    @prop({ required: true })
    createdBy: string;

    @prop({ required: true })
    name: string;

    @prop({})
    description?: string;
}

export type ChatPayload = DeepPartial<ApplyBasicCreateCasting<Require_id<Chat>>>;

export const ChatModel = getModelForClass(Chat);
