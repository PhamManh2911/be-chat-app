import { Status, STATUS } from '@/types/app';
import { getModelForClass, prop } from '@typegoose/typegoose';
import {
    ApplyBasicCreateCasting,
    DeepPartial,
    DefaultIdVirtual,
    HydratedDocument,
    Require_id,
} from 'mongoose';

class Chat {
    @prop({ required: true })
    createdBy: string;

    @prop({ required: true })
    name: string;

    @prop({})
    description?: string;

    @prop({ enum: Object.values(STATUS), default: STATUS.ACTIVE, required: true, type: String })
    status: Status;
}

export type ChatPayload = DeepPartial<ApplyBasicCreateCasting<Require_id<Chat>>>;

export type ChatDocument = HydratedDocument<Chat> & DefaultIdVirtual;

export const ChatModel = getModelForClass(Chat);
