import { CHAT_USER_ADDED, CHAT_USER_REMOVED } from '@/constants/socketEvent';
import { controller } from '@/controllers/container.controller';
import {
    AddUserToChatBodyDto,
    AddUserToChatParamsDto,
    GetUsersInChatParamsDto,
    GetUsersInChatQueryDto,
    RemoveUserFromChatParamsDto,
} from '@/dto/chatUser.dto';
import { chatService } from '@/services/chat.service';
import { chatUserService } from '@/services/chatUser.service';
import SocketServerSingleton from '@/socket';

class Controller {
    addUserToChat = controller(
        { params: AddUserToChatParamsDto, body: AddUserToChatBodyDto },
        async (req) => {
            const { chatId } = req.params;
            const { userId } = req.body;

            await chatService.checkChatActive(chatId);
            const chatUser = await chatUserService.createBulkChatUsers(chatId, [userId]);

            SocketServerSingleton.getIO()
                .to(chatService.getSocketRoomForChat(chatId))
                .emit(CHAT_USER_ADDED, chatUser);

            return { statusCode: 201, data: null };
        },
    );

    getUsersInChat = controller(
        { params: GetUsersInChatParamsDto, query: GetUsersInChatQueryDto },
        async (req) => {
            const { chatId } = req.params;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;

            await chatService.checkChatActive(chatId);
            const data = await chatUserService.getListUserForChat(chatId, page, pageSize);

            return { statusCode: 200, data };
        },
    );

    removeUserFromChat = controller({ params: RemoveUserFromChatParamsDto }, async (req) => {
        const { chatId, userId } = req.params;

        await chatService.checkChatActive(chatId);
        await chatUserService.deleteChatUsers(chatId, [userId]);

        SocketServerSingleton.getIO()
            .to(chatService.getSocketRoomForChat(chatId))
            .emit(CHAT_USER_REMOVED, { userId });

        return { statusCode: 204, data: null };
    });
}

export const chatUserController = new Controller();
