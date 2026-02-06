import { CHAT_CREATED, CHAT_STATUS_UPDATED, CHAT_UPDATED } from '@/constants/socketEvent';
import { controller } from '@/controllers/container.controller';
import {
    CreateChatBodyDto,
    GetListChatQueryDto,
    UpdateChatBodyDto,
    UpdateChatParamsDto,
    UpdateChatStatusBodyDto,
    UpdateChatStatusParamsDto,
} from '@/dto/chat.dto';
import { chatService } from '@/services/chat.service';
import { chatUserService } from '@/services/chatUser.service';
import { userService } from '@/services/user.service';
import SocketServerSingleton from '@/socket';

class Controller {
    getListChat = controller({ query: GetListChatQueryDto }, async (req) => {
        const { cursor } = req.query;
        const userId = req.user.sub;
        const result = await chatUserService.getListChatForUser(userId, { cursor, limit: 20 });

        return { data: result, statusCode: 200 };
    });

    createChat = controller({ body: CreateChatBodyDto }, async (req) => {
        const { name, description } = req.body;
        const userId = req.user.sub;
        const chat = await chatService.createChat({
            createdBy: userId,
            name,
            description,
        });
        const memberIds = [userId, ...req.body.memberIds];

        await chatUserService.createBulkChatUsers(chat._id.toString(), memberIds);

        SocketServerSingleton.getIO()
            .to(memberIds.map(userService.getSocketRoomForUser))
            .emit(CHAT_CREATED, chat);

        // NOTE: move socketsJoin after directly sending to all users
        // since socketsJoin doesn't guarantee all users join room chat due to broadcast to adapter
        // comment out adapter in socket to see the effect
        SocketServerSingleton.getIO()
            .in(memberIds.map(userService.getSocketRoomForUser))
            .socketsJoin(chatService.getSocketRoomForChat(chat._id.toString()));

        return { data: chat, statusCode: 201 };
    });

    updateChat = controller(
        { params: UpdateChatParamsDto, body: UpdateChatBodyDto },
        async (req) => {
            const { chatId } = req.params;
            const { name, description } = req.body;
            const userId = req.user.sub;

            const chat = await chatService.updateChat(chatId, userId, { name, description });

            SocketServerSingleton.getIO()
                .to(chatService.getSocketRoomForChat(chatId))
                .emit(CHAT_UPDATED, chat);

            return { data: chat, statusCode: 200 };
        },
    );

    // deleteChat = controller({ params: DeleteChatParamsDto }, async (req) => {
    //     const { chatId } = req.params;

    //     await chatService.deleteChat(chatId);
    //     await chatUserService.deleteChatUsers(chatId);

    //     return { statusCode: 204, data: null };
    // });

    updateChatStatus = controller(
        { params: UpdateChatStatusParamsDto, body: UpdateChatStatusBodyDto },
        async (req) => {
            const { chatId } = req.params;
            const { status } = req.body;
            const userId = req.user.sub;

            const chat = await chatService.updateChatStatus(chatId, userId, status);

            await chatUserService.updateChatUserStatusForChat(chatId, status);
            SocketServerSingleton.getIO()
                .to(chatService.getSocketRoomForChat(chatId))
                .emit(CHAT_STATUS_UPDATED, {
                    chatId,
                    status,
                });

            return { data: chat, statusCode: 200 };
        },
    );
}

export const chatController = new Controller();
