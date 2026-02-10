import { MESSAGE_UPDATED } from '@/constants/socketEvent';
import { ChatUserModel } from '@/models/chatUser.model';
import { MessageModel } from '@/models/message.model';
import { createServer } from '@/routers/app';
import SocketServerSingleton from '@/socket';
import { CHAT_ID, MSG_USER1, USER1_ID } from '@/test/setup/seed';
import { waitFor } from '@/test/utils/socket';
import { STATUS } from '@/types/app';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { Socket as ClientSocket, io as ioc } from 'socket.io-client';
import request from 'supertest';

describe('PUT /chat/:chatId/message/:messageId', () => {
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
        it('should return error when no content was sent', async () => {
            const res = await request(server)
                .put(`/chat/${CHAT_ID}/message/${MSG_USER1}`)
                .set('Authorization', 'Bearer test-token')
                .send({});

            expect(res.status).toBe(400);
            const data = res.body.data;

            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('property', 'content');
            expect(data[0].constraints).toHaveProperty('isDefined');
        });

        it('should return error when send number', async () => {
            const res = await request(server)
                .put(`/chat/${CHAT_ID}/message/${MSG_USER1}`)
                .set('Authorization', 'Bearer test-token')
                .send({ content: 5 });

            expect(res.status).toBe(400);
            const data = res.body.data;

            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('property', 'content');
            expect(data[0].constraints).toHaveProperty('isString');
        });

        it('should return error when send empty string', async () => {
            const res = await request(server)
                .put(`/chat/${CHAT_ID}/message/${MSG_USER1}`)
                .set('Authorization', 'Bearer test-token')
                .send({ content: '' });

            expect(res.status).toBe(400);
            const data = res.body.data;

            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('property', 'content');
            expect(data[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should return error when chat user is archived or deleted', async () => {
            await ChatUserModel.updateOne(
                { chatId: CHAT_ID, userId: USER1_ID, status: STATUS.ACTIVE },
                { $set: { status: STATUS.ARCHIVED } },
            );
            const res = await request(server)
                .put(`/chat/${CHAT_ID}/message/${MSG_USER1}`)
                .set('Authorization', 'Bearer test-token')
                .send({ content: 'message' });

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Chat user not found or inactive');

            await ChatUserModel.updateOne(
                { chatId: CHAT_ID, userId: USER1_ID },
                { $set: { status: STATUS.ACTIVE } },
            );
        });
    });

    describe('success case', () => {
        it('should return success, save to database and send notification to other chat users', async () => {
            const socketPromise = waitFor(clientSocket, MESSAGE_UPDATED);
            const message = 'Hello yo';
            const res = await request(server)
                .put(`/chat/${CHAT_ID}/message/${MSG_USER1}`)
                .set('Authorization', 'Bearer test-token')
                .send({ content: message });

            expect(res.status).toBe(200);
            const messageData = res.body;

            expect(messageData).toHaveProperty('_id', MSG_USER1);
            expect(messageData).toHaveProperty('userId', USER1_ID);
            expect(messageData).toHaveProperty('content', message);
            expect(messageData).toHaveProperty('isEdited', true);

            // Checking database
            const messageDocument = await MessageModel.findById(MSG_USER1).lean();

            expect(messageDocument).toBeTruthy();
            expect(messageDocument?.content).toBe(message);
            expect(messageDocument?.isEdited).toBe(true);

            // Websocket checking
            const socketData = await socketPromise;

            expect(socketData).toHaveProperty('_id', MSG_USER1);
            expect(socketData).toHaveProperty('userId', USER1_ID);
            expect(socketData).toHaveProperty('content', message);
            expect(socketData).toHaveProperty('isEdited', true);
        });
    });
});
