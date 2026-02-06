import { NotFoundError } from '@/errors/app';
import { ChatModel, ChatPayload } from '@/models/chat.model';
import { Status, STATUS } from '@/types/app';

class Service {
    getSocketRoomForChat = (chatId: string) => `chat:${chatId}`;

    createChat = async (payload: ChatPayload) => {
        const chat = await ChatModel.create(payload);

        return chat;
    };

    checkChatActive = async (chatId: string) => {
        const isExist = await ChatModel.exists({ _id: chatId, status: STATUS.ACTIVE });

        if (!isExist) {
            throw new NotFoundError({ message: 'Chat not found or not active' });
        }
        return isExist;
    };

    updateChat = async (chatId: string, userId: string, payload: ChatPayload) => {
        const chat = await ChatModel.findOneAndUpdate(
            { _id: chatId, createdBy: userId, status: STATUS.ACTIVE },
            { $set: payload },
            { new: true },
        );

        if (!chat) {
            throw new NotFoundError({ message: 'Chat not found' });
        }
        return chat;
    };

    updateChatStatus = async (chatId: string, userId: string, status: Status) => {
        const chat = await ChatModel.findOneAndUpdate(
            { _id: chatId, createdBy: userId },
            { $set: { status } },
            { new: true },
        );

        if (!chat) {
            throw new NotFoundError({ message: 'Chat not found' });
        }
        return chat;
    };

    deleteChat = async (chatId: string) => {
        const chat = await ChatModel.deleteOne({ _id: chatId });

        if (chat.deletedCount === 0) {
            throw new NotFoundError({ message: 'Chat not found' });
        }
        return chat;
    };
}

export const chatService = new Service();
