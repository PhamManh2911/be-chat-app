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
import { userService } from '@/services/user.service';
import SocketServerSingleton from '@/socket';

// TODO: what is remove/add user permission
class Controller {
    addUserToChat = controller(
        { params: AddUserToChatParamsDto, body: AddUserToChatBodyDto },
        async (req) => {
            const { chatId } = req.params;
            const { userId } = req.body;

            // everyone is active can add new chat member
            await chatUserService.checkChatUserActive(chatId, req.user.sub);
            const chatUser = await chatUserService.createBulkChatUsers(chatId, [userId]);

            SocketServerSingleton.getIO()
                .to(userService.getSocketRoomForUser(userId))
                .emit(CHAT_USER_ADDED, chatUser[0]);
            SocketServerSingleton.getIO()
                .in(userService.getSocketRoomForUser(userId))
                .socketsJoin(chatService.getSocketRoomForChat(chatId));

            return { statusCode: 201, data: chatUser[0] };
        },
    );

    getUsersInChat = controller(
        { params: GetUsersInChatParamsDto, query: GetUsersInChatQueryDto },
        async (req) => {
            const { chatId } = req.params;
            const page = req.query.page ? +req.query.page : 1;
            const pageSize = req.query.pageSize ? +req.query.pageSize : 20;

            const data = await chatUserService.getListUserForChat(chatId, { page, pageSize });

            return { statusCode: 200, data };
        },
    );

    // TODO: what about leaving chat (send userId as yourself)
    removeUserFromChat = controller({ params: RemoveUserFromChatParamsDto }, async (req) => {
        const { chatId, userId } = req.params;

        // everyone is active can remove chat member
        await chatUserService.checkChatUserActive(chatId, req.user.sub);
        await chatUserService.deleteChatUsers(chatId, [userId]);

        SocketServerSingleton.getIO()
            .to(userService.getSocketRoomForUser(userId))
            .emit(CHAT_USER_REMOVED, { userId, chatId });
        SocketServerSingleton.getIO()
            .in(userService.getSocketRoomForUser(userId))
            .socketsLeave(chatService.getSocketRoomForChat(chatId));

        return { statusCode: 204, data: null };
    });
}

export const chatUserController = new Controller();
