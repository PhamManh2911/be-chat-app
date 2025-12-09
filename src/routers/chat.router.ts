import { chatController } from '@/controllers/chat.controller';
import { chatUserController } from '@/controllers/chatUser.controller';
import { messageController } from '@/controllers/message.controller';
import { Router } from 'express';

const chatRouter = Router();

chatRouter.get('', chatController.getListChat); // get list of chats for user
chatRouter.post('', chatController.createChat); // create new chat
chatRouter.put('/:chatId', chatController.updateChat); // update chat details
chatRouter.delete('/:chatId', chatController.deleteChat); // remove chat

const chatUserRouter = Router({ mergeParams: true });

chatUserRouter.get('/', chatUserController.getUsersInChat); // get users in chat
chatUserRouter.post('/', chatUserController.addUserToChat); // add user to chat
chatUserRouter.delete('/:userId', chatUserController.removeUserFromChat); // remove user from chat

const messageRouter = Router({ mergeParams: true });

messageRouter.get('/', messageController.getMessagesInChat); // get messages in chat
messageRouter.post('/', messageController.sendMessageInChat); // send message in chat
messageRouter.put('/:messageId', messageController.editMessageInChat); // edit message in chat
messageRouter.delete('/:messageId', messageController.deleteMessageFromChat); // delete message from chat

chatRouter.use('/:chatId/user', chatUserRouter);
chatRouter.use('/:chatId/message', messageRouter);

export default chatRouter;
