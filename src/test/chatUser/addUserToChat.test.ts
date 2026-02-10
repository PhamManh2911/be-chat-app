import { CHAT_ID, USER1_ID, USER3_ID } from '@/test/setup/seed';

import { CHAT_USER_ADDED } from '@/constants/socketEvent';
import { ChatUserModel } from '@/models/chatUser.model';
import { createServer } from '@/routers/app';
import SocketServerSingleton from '@/socket';
import { waitFor } from '@/test/utils/socket';
import { STATUS } from '@/types/app';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { Socket as ClientSocket, io as ioc } from 'socket.io-client';
import request from 'supertest';

describe('POST /chat/:chatId/user', () => {
    let server: Server, clientSocket: ClientSocket;

    beforeAll((done) => {
        server = createServer();
        server.listen(done);
    });

    beforeAll((done) => {
        clientSocket = ioc(`http://127.0.0.1:${(server.address() as AddressInfo).port}`, {
            auth: { token: 'test-token3' },
        });

        clientSocket.on('connect', done);
    });

    afterAll(async () => {
        await SocketServerSingleton.resetForTests();
        await new Promise((resolve) => server.close(resolve));
    });

    afterAll(() => {
        clientSocket.removeAllListeners().disconnect();
    });

    describe('error case', () => {
        afterEach(async () => {
            await ChatUserModel.updateOne(
                { chatId: CHAT_ID, userId: USER1_ID },
                { $set: { status: STATUS.ACTIVE } },
            );
        });
        // currently check for chat user status only, next maybe change to role checking
        it("should return error when chat user doesn't have right to add other chat user", async () => {
            await ChatUserModel.updateOne(
                { chatId: CHAT_ID, userId: USER1_ID, status: STATUS.ACTIVE },
                { $set: { status: STATUS.ARCHIVED } },
            );
            const res = await request(server)
                .post(`/chat/${CHAT_ID}/user`)
                .set('Authorization', 'Bearer test-token')
                .send({ userId: USER3_ID });

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Chat user not found or inactive');
        });
    });

    describe('success case', () => {
        it('should create chat user in database and notify that user', async () => {
            const socketPromise = waitFor(clientSocket, CHAT_USER_ADDED);
            const res = await request(server)
                .post(`/chat/${CHAT_ID}/user`)
                .set('Authorization', 'Bearer test-token')
                .send({ userId: USER3_ID });

            expect(res.status).toBe(201);
            const data = res.body;

            expect(data).toHaveProperty('chatId', CHAT_ID);
            expect(data).toHaveProperty('userId', USER3_ID);

            // Database checking
            const chatUserDocument = await ChatUserModel.findOne({
                chatId: CHAT_ID,
                userId: USER3_ID,
                status: STATUS.ACTIVE,
            }).lean();

            expect(chatUserDocument).toBeTruthy();
            expect(chatUserDocument?.muted).toBe(false);

            // Websocket checking
            const socketData = await socketPromise;

            expect(socketData).toHaveProperty('chatId', CHAT_ID);
            expect(socketData).toHaveProperty('userId', USER3_ID);
        });
    });
});
