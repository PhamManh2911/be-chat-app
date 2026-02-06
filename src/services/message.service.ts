import { MessageFilter, MessageModel } from '@/models/message.model';

class Service {
    private readonly pageSize = 20;

    getListMessages = async (chatId: string, cursor?: Date) => {
        const filter: MessageFilter = { chatId };

        if (cursor) {
            filter.createdAt = { $lt: cursor };
        }
        const documents = await MessageModel.find(filter)
            .limit(this.pageSize)
            .sort({ createdAt: -1 })
            .lean();

        const hasMore =
            documents.length < this.pageSize
                ? false
                : await MessageModel.exists({
                      chatId,
                      createdAt: { $lt: documents[documents.length - 1].createdAt },
                  });

        return { data: documents, hasMore };
    };

    createMessage = async (chatId: string, userId: string, content: string) => {
        const message = await MessageModel.create({ chatId, userId, content });

        return message;
    };

    updateMessage = async (userId: string, messageId: string, content: string) => {
        const result = await MessageModel.updateOne(
            { _id: messageId, userId },
            { $set: { content, isEdited: true } },
        );

        if (result.modifiedCount === 0) {
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
