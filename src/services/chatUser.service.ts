import { ForbiddenError } from '@/errors/app';
import { ChatUserFilter, ChatUserModel } from '@/models/chatUser.model';
import { CursorQueryList, OffsetQueryList, STATUS } from '@/types/app';

class Service {
    getListChatForUser = async (userId: string, queryList: CursorQueryList) => {
        const filter: ChatUserFilter = { userId };

        if (queryList.cursor) {
            filter.updatedAt = { $lt: queryList.cursor };
        }
        const documents = await ChatUserModel.find(filter)
            .limit(queryList.limit)
            .sort({ updatedAt: -1 })
            .lean();

        const hasMore =
            documents.length < queryList.limit
                ? false
                : await ChatUserModel.exists({
                      userId,
                      updatedAt: { $lt: documents[documents.length - 1].updatedAt },
                  });

        return { data: documents, hasMore };
    };

    getListUserForChat = async (chatId: string, queryList: OffsetQueryList) => {
        const { page, pageSize } = queryList;
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
        const chatUsers = await ChatUserModel.insertMany(
            memberIds.map((memberId) => ({
                chatId,
                userId: memberId,
            })),
        );

        return chatUsers;
    };

    deleteChatUsers = async (chatId: string, userIds?: string[]) => {
        const filter: ChatUserFilter = { chatId };

        if (userIds) {
            filter.userId = { $in: userIds };
        }

        await ChatUserModel.deleteMany(filter);
    };

    updateChatUserStatusForChat = async (chatId: string, status: string) => {
        const result = await ChatUserModel.updateMany({ chatId }, { $set: { status } });

        return result;
    };

    checkChatUserActive = async (chatId: string, userId: string) => {
        const chatUser = await ChatUserModel.exists({
            chatId,
            userId,
            status: STATUS.ACTIVE,
        });

        if (!chatUser) {
            throw new ForbiddenError({ message: 'Chat user not found or inactive' });
        }
        return chatUser;
    };
}

export const chatUserService = new Service();
