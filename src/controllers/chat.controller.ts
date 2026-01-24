import { controller } from '@/controllers/container.controller';
import {
    CreateChatBodyDto,
    DeleteChatParamsDto,
    GetListChatQueryDto,
    UpdateChatBodyDto,
    UpdateChatParamsDto,
} from '@/dto/chat.dto';
import { chatService } from '@/services/chat.service';
import { chatUserService } from '@/services/chatUser.service';

class Controller {
    getListChat = controller({ query: GetListChatQueryDto }, async (req) => {
        const { cursor } = req.query;
        const userId = req.user.sub;
        const result = await chatUserService.getListChatForUser(userId, cursor);

        return { data: result, statusCode: 200 };
    });

    createChat = controller({ body: CreateChatBodyDto }, async (req) => {
        const { name, description, memberIds } = req.body;
        const userId = req.user.sub;
        const chat = await chatService.createChat({
            createdBy: userId,
            name,
            description,
        });

        await chatUserService.createBulkChatUsers(chat._id.toString(), [
            userId,
            ...(memberIds ?? []),
        ]);

        return { data: chat, statusCode: 201 };
    });

    updateChat = controller(
        { params: UpdateChatParamsDto, body: UpdateChatBodyDto },
        async (req) => {
            const { chatId } = req.params;
            const { name, description } = req.body;

            const chat = await chatService.updateChat(chatId, {
                name,
                description,
            });

            return { data: chat, statusCode: 200 };
        },
    );

    deleteChat = controller({ params: DeleteChatParamsDto }, async (req) => {
        const { chatId } = req.params;

        await chatService.deleteChat(chatId);
        await chatUserService.deleteChatUsers(chatId);

        return { statusCode: 204, data: null };
    });
}

export const chatController = new Controller();
