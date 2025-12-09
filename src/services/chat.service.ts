import { ChatModel, ChatPayload } from '@/models/chat.model';

class Service {
    createChat = async (payload: ChatPayload) => {
        const chat = await ChatModel.create(payload);

        return chat;
    };

    updateChat = async (chatId: string, payload: ChatPayload) => {
        const chat = await ChatModel.findByIdAndUpdate(chatId, payload, { new: true });

        if (!chat) {
            throw new Error('Chat not found');
        }
        return chat;
    };

    deleteChat = async (chatId: string) => {
        const chat = await ChatModel.deleteOne({ _id: chatId });

        if (chat.deletedCount === 0) {
            throw new Error('Chat not found');
        }
        return chat;
    };
}

export const chatService = new Service();
