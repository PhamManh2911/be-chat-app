import { CHAT_CREATED } from '@/constants/socketEvent';
import { ChatModel } from '@/models/chat.model';
import { ChatUserModel } from '@/models/chatUser.model';
import { createServer } from '@/routers/app';
import SocketServerSingleton from '@/socket';
import { USER1_ID, USER2_ID } from '@/test/setup/seed';
import { waitFor } from '@/test/utils/socket';
import { STATUS } from '@/types/app';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { Socket as ClientSocket, io as ioc } from 'socket.io-client';
import request from 'supertest';

describe('POST /chat', () => {
    let clientSocket: ClientSocket, clientSocket2: ClientSocket, server: Server;

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
    beforeAll((done) => {
        clientSocket2 = ioc(`http://127.0.0.1:${(server.address() as AddressInfo).port}`, {
            auth: { token: 'test-token2' },
        });

        clientSocket2.on('connect', done);
    });
    afterAll(async () => {
        clientSocket.removeAllListeners().disconnect();
        clientSocket2.removeAllListeners().disconnect();
        await SocketServerSingleton.resetForTests();
        await new Promise((resolve) => server.close(resolve));
    });

    describe('success case', () => {
        it('should create a new chat and send the notification to all chat users', async () => {
            // NOTE: register socket event listener before making api request
            const user1SocketPromise = waitFor(clientSocket, CHAT_CREATED);
            const user2SocketPromise = waitFor(clientSocket2, CHAT_CREATED);
            const res = await request(server)
                .post('/chat')
                .set('Authorization', 'Bearer test-token')
                .send({
                    name: 'New Chat',
                    description: 'This is a new chat',
                    memberIds: [USER2_ID],
                });

            expect(res.status).toBe(201);
            const chat = res.body;

            expect(chat).toHaveProperty('name', 'New Chat');
            expect(chat).toHaveProperty('description', 'This is a new chat');
            expect(chat).toHaveProperty('_id');

            const chatId = chat._id;
            // Database checking
            const chatDocument = await ChatModel.findById(chatId).lean();

            expect(chatDocument).toBeTruthy();
            expect(chatDocument?.name).toBe('New Chat');
            expect(chatDocument?.description).toBe('This is a new chat');
            expect(chatDocument?.status).toBe(STATUS.ACTIVE);
            expect(
                await ChatUserModel.findOne({ chatId, userId: USER1_ID, status: STATUS.ACTIVE }),
            ).toBeTruthy();
            expect(
                await ChatUserModel.findOne({ chatId, userId: USER2_ID, status: STATUS.ACTIVE }),
            ).toBeTruthy();
            // Socket event checking
            const user1SocketData = await user1SocketPromise;

            expect(user1SocketData).toHaveProperty('name', 'New Chat');
            expect(user1SocketData).toHaveProperty('description', 'This is a new chat');
            expect(user1SocketData).toHaveProperty('_id', chatId);

            const user2SocketData = await user2SocketPromise;

            expect(user2SocketData).toHaveProperty('name', 'New Chat');
            expect(user2SocketData).toHaveProperty('description', 'This is a new chat');
            expect(user2SocketData).toHaveProperty('_id', chatId);
        });
    });
});
