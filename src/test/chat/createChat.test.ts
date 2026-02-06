import { CHAT_CREATED } from '@/constants/socketEvent';
import { createServer } from '@/routers/app';
import { chatService } from '@/services/chat.service';
import { chatUserService } from '@/services/chatUser.service';
import SocketServerSingleton from '@/socket';
import { waitFor } from '@/test/utils/socket';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { Socket as ClientSocket, io as ioc } from 'socket.io-client';
import request from 'supertest';

describe('POST /chat', () => {
    let clientSocket: ClientSocket, server: Server;

    beforeAll((done) => {
        server = createServer();
        server.listen(done);
    });
    beforeAll((done) => {
        clientSocket = ioc(`http://127.0.0.1:${(server.address() as AddressInfo).port}`, {
            auth: { token: 'test-token' },
        });

        clientSocket.on('connect', done);
    });
    afterAll(async () => {
        clientSocket.removeAllListeners().disconnect();
        await SocketServerSingleton.resetForTests();
        await new Promise((resolve) => server.close(resolve));
    });

    it('should create a new chat', async () => {
        // register socket event listener before making api request
        const socketPromise = waitFor(clientSocket, CHAT_CREATED);
        const res = await request(server)
            .post('/chat')
            .set('Authorization', 'Bearer test-token')
            .send({
                name: 'New Chat',
                description: 'This is a new chat',
                memberIds: [globalThis.__USER_2_ID],
            });

        expect(res.status).toBe(201);
        const chat = res.body;

        expect(chat).toHaveProperty('name', 'New Chat');
        expect(chat).toHaveProperty('description', 'This is a new chat');
        expect(chat).toHaveProperty('_id');

        const chatId = chat._id;

        expect((await chatService.checkChatActive(chatId))._id.toString()).toBe(chatId);
        expect(
            await chatUserService.checkChatUserActive(chatId, globalThis.__USER_1_ID),
        ).not.toBeNull();
        expect(
            await chatUserService.checkChatUserActive(chatId, globalThis.__USER_2_ID),
        ).not.toBeNull();

        await chatService.deleteChat(chatId);
        await chatUserService.deleteChatUsers(chatId);
        const socketData = await socketPromise;

        expect(socketData).toHaveProperty('name', 'New Chat');
        expect(socketData).toHaveProperty('description', 'This is a new chat');
        expect(socketData).toHaveProperty('_id');
    });
});
