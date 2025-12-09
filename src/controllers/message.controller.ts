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
import { chatUserService } from '@/services/chatUser.service';
import { messageService } from '@/services/message.service';
import { io } from '@/socket';

class Controller {
    getMessagesInChat = controller(
        { params: GetMessageInChatParamsDto, query: GetMessageInChatQueryDto },
        async (req) => {
            const { chatId } = req.params;
            const { cursor } = req.query;

            const data = await messageService.getListMessages(chatId, cursor);

            return { statusCode: 200, data };
        },
    );

    sendMessageInChat = controller(
        { params: SendMessageInChatParamsDto, body: SendMessageInChatBodyDto },
        async (req) => {
            const { chatId } = req.params;
            const { content } = req.body;
            const userId = req.user.id;

            const message = await messageService.createMessage(chatId, userId, content);

            // send notification to chat members
            io.to(chatId).emit('message:new', message);
            // update latest message in chat
            await chatUserService.updateChatUsersForChat(chatId, {
                latestSender: message.userId,
                latestMessage: content,
                latestMessageAt: message.createdAt,
            });

            return { statusCode: 201, data: message };
        },
    );

    editMessageInChat = controller(
        { params: EditMessageInChatParamsDto, body: EditMessageInChatBodyDto },
        async (req) => {
            const { messageId, chatId } = req.params;
            const { content } = req.body;

            const message = await messageService.updateMessage(messageId, content);

            io.to(chatId).emit('message:updated', message);

            return { statusCode: 200, data: message };
        },
    );

    deleteMessageFromChat = controller({ params: DeleteMessageFromChatParamsDto }, async (req) => {
        const { messageId, chatId } = req.params;

        await messageService.deleteMessage(messageId);
        io.to(chatId).emit('message:deleted', { messageId });

        return { statusCode: 204, data: null };
    });
}

export const messageController = new Controller();
