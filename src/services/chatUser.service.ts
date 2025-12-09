import { ChatUserFilter, ChatUserModel, ChatUserUpdateQuery } from '@/models/chatUser.model';

class Service {
    private readonly pageSize = 20;

    getListChatForUser = async (userId: string, cursor?: Date) => {
        const filter: ChatUserFilter = { userId };

        if (cursor) {
            filter.latestMessageAt = { $lt: cursor };
        }
        const documents = await ChatUserModel.find(filter)
            .limit(this.pageSize)
            .sort({ latestMessageAt: -1 })
            .lean();

        const hasMore =
            documents.length < this.pageSize
                ? false
                : await ChatUserModel.exists({
                      userId,
                      latestMessageAt: { $lt: documents[documents.length - 1].latestMessageAt },
                  });

        return { data: documents, hasMore };
    };

    getListUserForChat = async (chatId: string, page: number, pageSize: number) => {
        const filter: ChatUserFilter = { chatId };

        const documents = await ChatUserModel.find(filter)
            .skip(pageSize * (page - 1))
            .limit(pageSize)
            .sort({ userId: 1 })
            .lean();
        const totalPages = Math.ceil((await ChatUserModel.countDocuments(filter)) / pageSize);

        return { data: documents, page, pageSize, totalPages };
    };

    createBulkChatUsers = async (chatId: string, memberIds: string[]) => {
        const joinAt = new Date();
        const chatUsers = memberIds.map((memberId) => ({
            chatId,
            userId: memberId,
            latestMessageAt: joinAt,
        }));

        await ChatUserModel.insertMany(chatUsers);
    };

    updateChatUsersForChat = async (chatId: string, payload: ChatUserUpdateQuery) => {
        const results = await ChatUserModel.updateMany({ chatId }, payload);

        return results;
    };

    deleteChatUsers = async (chatId: string, userIds?: string[]) => {
        const filter: ChatUserFilter = { chatId };

        if (userIds) {
            filter.userId = { $in: userIds };
        }

        await ChatUserModel.deleteMany(filter);
    };
}

export const chatUserService = new Service();
