import { CHAT_STATUS_UPDATED } from '@/constants/socketEvent';
import { ChatModel } from '@/models/chat.model';
import { ChatUserModel } from '@/models/chatUser.model';
import { createServer } from '@/routers/app';
import SocketServerSingleton from '@/socket';
import { CHAT_ID, USER1_ID, USER2_ID } from '@/test/setup/seed';
import { waitFor } from '@/test/utils/socket';
import { STATUS } from '@/types/app';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { Socket as ClientSocket, io as ioc } from 'socket.io-client';
import request from 'supertest';

describe('PUT /chat/:chatId/status', () => {
    let server: Server, clientSocket: ClientSocket;

    beforeAll((done) => {
        server = createServer();
        server.listen(done);
    });

    beforeAll((done) => {
        clientSocket = ioc(`http://127.0.0.1:${(server.address() as AddressInfo).port}`, {
            auth: { token: 'test-token2' },
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
        it('should return error if status is not a string', async () => {
            const res = await request(server)
                .put(`/chat/${CHAT_ID}/status`)
                .set('Authorization', 'Bearer test-token')
                .send({ status: 1 });

            expect(res.status).toBe(400);
            const data = res.body.data;

            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('property', 'status');
            expect(data[0].constraints).toHaveProperty('isString');
        });

        it('should return error if status is invalid', async () => {
            const res = await request(server)
                .put(`/chat/${CHAT_ID}/status`)
                .set('Authorization', 'Bearer test-token')
                .send({ status: 'something' });

            expect(res.status).toBe(400);
            const data = res.body.data;

            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('property', 'status');
            expect(data[0].constraints).toHaveProperty('isEnum');
        });
    });

    describe('success case', () => {
        it('should update chat, chat user status and send notification if status is archived', async () => {
            const socketPromise = waitFor(clientSocket, CHAT_STATUS_UPDATED);
            const res = await request(server)
                .put(`/chat/${CHAT_ID}/status`)
                .set('Authorization', 'Bearer test-token')
                .send({ status: STATUS.ARCHIVED });

            expect(res.status).toBe(200);
            const data = res.body;

            expect(data).toHaveProperty('_id', CHAT_ID);
            expect(data).toHaveProperty('status', STATUS.ARCHIVED);

            // Database checking
            expect((await ChatModel.findOne({ _id: CHAT_ID }).lean())?.status).toBe(
                STATUS.ARCHIVED,
            );
            expect(
                await ChatUserModel.exists({
                    chatId: CHAT_ID,
                    userId: USER1_ID,
                    status: STATUS.ARCHIVED,
                }),
            ).toBeTruthy();

            expect(
                await ChatUserModel.exists({
                    chatId: CHAT_ID,
                    userId: USER2_ID,
                    status: STATUS.ARCHIVED,
                }),
            ).toBeTruthy();

            // Websocket checking
            const socketData = await socketPromise;

            expect(socketData).toHaveProperty('chatId', CHAT_ID);
            expect(socketData).toHaveProperty('status', STATUS.ARCHIVED);
        });

        it('should update chat, chat user status in database and send notification if status is deleted', async () => {
            const socketPromise = waitFor(clientSocket, CHAT_STATUS_UPDATED);
            const res = await request(server)
                .put(`/chat/${CHAT_ID}/status`)
                .set('Authorization', 'Bearer test-token')
                .send({ status: STATUS.DELETED });

            expect(res.status).toBe(200);
            const data = res.body;

            expect(data).toHaveProperty('_id', CHAT_ID);
            expect(data).toHaveProperty('status', STATUS.DELETED);

            // Database checking
            expect((await ChatModel.findOne({ _id: CHAT_ID }).lean())?.status).toBe(STATUS.DELETED);
            expect(
                await ChatUserModel.exists({
                    chatId: CHAT_ID,
                    userId: USER1_ID,
                    status: STATUS.DELETED,
                }),
            ).toBeTruthy();

            expect(
                await ChatUserModel.exists({
                    chatId: CHAT_ID,
                    userId: USER2_ID,
                    status: STATUS.DELETED,
                }),
            ).toBeTruthy();

            // Websocket checking
            const socketData = await socketPromise;

            expect(socketData).toHaveProperty('chatId', CHAT_ID);
            expect(socketData).toHaveProperty('status', STATUS.DELETED);
        });
    });
});
