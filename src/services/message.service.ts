import { MessageFilter, MessageModel, MessagePayload } from '@/models/message.model';
import { CursorQueryList } from '@/types/app';

class Service {
    getListMessages = async (chatId: string, queryList: CursorQueryList) => {
        const { cursor, limit } = queryList;
        const filter: MessageFilter = { chatId };

        if (cursor) {
            filter.createdAt = { $lt: cursor };
        }
        const documents = await MessageModel.find(filter)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const hasMore =
            documents.length < limit
                ? false
                : await MessageModel.exists({
                      chatId,
                      createdAt: { $lt: documents[documents.length - 1].createdAt },
                  });

        return { data: documents, hasMore };
    };

    createMessage = async (payload: MessagePayload) => {
        const message = await MessageModel.create(payload);

        return message;
    };

    updateMessage = async (userId: string, messageId: string, content: string) => {
        const result = await MessageModel.findOneAndUpdate(
            { _id: messageId, userId },
            { $set: { content, isEdited: true } },
            { new: true },
        );

        if (!result) {
            throw new Error('Not found message');
        }
        return result;
    };

    deleteMessage = async (userId: string, messageId: string) => {
        const result = await MessageModel.deleteOne({ _id: messageId, userId });

        if (result.deletedCount === 0) {
            throw new Error('Not found message');
        }
        return result;
    };
}

export const messageService = new Service();
