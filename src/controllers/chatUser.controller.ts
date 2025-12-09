import { controller } from '@/controllers/container.controller';
import {
    AddUserToChatBodyDto,
    AddUserToChatParamsDto,
    GetUsersInChatParamsDto,
    GetUsersInChatQueryDto,
    RemoveUserFromChatParamsDto,
} from '@/dto/chatUser.dto';
import { chatUserService } from '@/services/chatUser.service';

class Controller {
    addUserToChat = controller(
        { params: AddUserToChatParamsDto, body: AddUserToChatBodyDto },
        async (req) => {
            const { chatId } = req.params;
            const { userId } = req.body;

            await chatUserService.createBulkChatUsers(chatId, [userId]);

            return { statusCode: 201, data: null };
        },
    );

    getUsersInChat = controller(
        { params: GetUsersInChatParamsDto, query: GetUsersInChatQueryDto },
        async (req) => {
            const { chatId } = req.params;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;

            const data = await chatUserService.getListUserForChat(chatId, page, pageSize);

            return { statusCode: 200, data };
        },
    );

    removeUserFromChat = controller({ params: RemoveUserFromChatParamsDto }, async (req) => {
        const { chatId, userId } = req.params;

        await chatUserService.deleteChatUsers(chatId, [userId]);

        return { statusCode: 204, data: null };
    });
}

export const chatUserController = new Controller();
