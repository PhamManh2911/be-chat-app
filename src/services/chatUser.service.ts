import { NotFoundError } from '@/errors/app';
import { ChatUserFilter, ChatUserModel } from '@/models/chatUser.model';
import { STATUS } from '@/types/app';

class Service {
    private readonly pageSize = 20;

    getListChatForUser = async (userId: string, cursor?: Date) => {
        const filter: ChatUserFilter = { userId };

        if (cursor) {
            filter.updatedAt = { $lt: cursor };
        }
        const documents = await ChatUserModel.find(filter)
            .limit(this.pageSize)
            .sort({ updatedAt: -1 })
            .lean();

        const hasMore =
            documents.length < this.pageSize
                ? false
                : await ChatUserModel.exists({
                      userId,
                      updatedAt: { $lt: documents[documents.length - 1].updatedAt },
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
            throw new NotFoundError({ message: 'Chat user not found or inactive' });
        }
        return chatUser;
    };
}

export const chatUserService = new Service();
