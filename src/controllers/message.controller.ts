import { MESSAGE_CREATED, MESSAGE_DELETED } from '@/constants/socketEvent';
import { controller } from '@/controllers/container.controller';
import {
    DeleteMessageFromChatParamsDto,
    EditMessageInChatBodyDto,
    EditMessageInChatParamsDto,
    GetMessageInChatParamsDto,
    GetMessageInChatQueryDto,
    SendMessageInChatBodyDto,
    SendMessageInChatParamsDto,
} from '@/dto/message.dto';
import { chatService } from '@/services/chat.service';
import { chatUserService } from '@/services/chatUser.service';
import { messageService } from '@/services/message.service';
import SocketServerSingleton from '@/socket';

class Controller {
    getMessagesInChat = controller(
        { params: GetMessageInChatParamsDto, query: GetMessageInChatQueryDto },
        async (req) => {
            const { chatId } = req.params;
            const { cursor } = req.query;

            await chatUserService.checkChatUserActive(chatId, req.user.sub);
            const data = await messageService.getListMessages(chatId, cursor);

            return { statusCode: 200, data };
        },
    );

    sendMessageInChat = controller(
        { params: SendMessageInChatParamsDto, body: SendMessageInChatBodyDto },
        async (req) => {
            const { chatId } = req.params;
            const { content } = req.body;
            const userId = req.user.sub;

            await chatUserService.checkChatUserActive(chatId, userId);

            const message = await messageService.createMessage(chatId, userId, content);

            // send notification to chat members
            SocketServerSingleton.getIO()
                .to(chatService.getSocketRoomForChat(chatId))
                .emit(MESSAGE_CREATED, message);

            return { statusCode: 201, data: message };
        },
    );

    editMessageInChat = controller(
        { params: EditMessageInChatParamsDto, body: EditMessageInChatBodyDto },
        async (req) => {
            const { messageId, chatId } = req.params;
            const { content } = req.body;
            const userId = req.user.sub;

            await chatUserService.checkChatUserActive(chatId, userId);
            const message = await messageService.updateMessage(userId, messageId, content);

            SocketServerSingleton.getIO()
                .to(chatService.getSocketRoomForChat(chatId))
                .emit(MESSAGE_DELETED, message);

            return { statusCode: 200, data: message };
        },
    );

    deleteMessageFromChat = controller({ params: DeleteMessageFromChatParamsDto }, async (req) => {
        const { messageId, chatId } = req.params;
        const userId = req.user.sub;

        await chatUserService.checkChatUserActive(chatId, userId);
        await messageService.deleteMessage(userId, messageId);

        SocketServerSingleton.getIO()
            .to(chatService.getSocketRoomForChat(chatId))
            .emit(MESSAGE_DELETED, { messageId });

        return { statusCode: 204, data: null };
    });
}

export const messageController = new Controller();
