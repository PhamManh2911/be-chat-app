import { CHAT_ID, USER1_ID, USER3_ID } from '@/test/setup/seed';

import redis from '@/cache';
import { IDEMPOTENT_PROCESS_COMPLETED } from '@/constants/idempotencyStatus';
import { CHAT_USER_ADDED } from '@/constants/socketEvent';
import { ChatUserModel } from '@/models/chatUser.model';
import { createServer } from '@/routers/app';
import { cacheService } from '@/services/cache.service';
import SocketServerSingleton from '@/socket';
import { waitFor } from '@/test/utils/socket';
import { STATUS } from '@/types/app';
import { Server } from 'http';
import mongoose from 'mongoose';
import { AddressInfo } from 'net';
import { Socket as ClientSocket, io as ioc } from 'socket.io-client';
import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';

describe('POST /chat/:chatId/user', () => {
    const REQUEST_URL = `/chat/${CHAT_ID}/user`;
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
        // currently check for chat user status only, next maybe change to role checking
        it("should return error when chat user doesn't have right to add other chat user", async () => {
            await ChatUserModel.updateOne(
                { chatId: CHAT_ID, userId: USER1_ID, status: STATUS.ACTIVE },
                { $set: { status: STATUS.ARCHIVED } },
            );
            const idempotencyKey = uuidV4();
            const res = await request(server)
                .post(REQUEST_URL)
                .set('Authorization', 'Bearer test-token')
                .set('Idempotency-Key', idempotencyKey)
                .send({ userId: USER3_ID });

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Chat user not found or inactive');
            await ChatUserModel.updateOne(
                { chatId: CHAT_ID, userId: USER1_ID },
                { $set: { status: STATUS.ACTIVE } },
            );
        });

        it('should return error when not provide idempotency key', async () => {
            const res = await request(server)
                .post(REQUEST_URL)
                .set('Authorization', 'Bearer test-token')
                .send({ userId: USER3_ID });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Missing idempotency key');
        });

        it('should return error when using same idempotency key', async () => {
            const idempotencyKey = uuidV4();
            const reqPayload = { userId: new mongoose.Types.ObjectId().toString() };
            await request(server)
                .post(REQUEST_URL)
                .set('Authorization', 'Bearer test-token')
                .set('Idempotency-Key', idempotencyKey)
                .send(reqPayload);
            const res = await request(server)
                .post(REQUEST_URL)
                .set('Authorization', 'Bearer test-token')
                .set('Idempotency-Key', idempotencyKey)
                .send(reqPayload);

            expect(res.status).toBe(409);
            expect(res.body.message).toBe(
                'Idempotency key is currently being processed by another request',
            );
        });

        it('should remove cached idempotency process in redis when fail on creating in database', async () => {
            const idempotencyKey = uuidV4();
            const reqPayload = {};
            const res = await request(server)
                .post(REQUEST_URL)
                .set('Authorization', 'Bearer test-token')
                .set('Idempotency-Key', idempotencyKey)
                .send(reqPayload);

            expect(res.statusCode).toBe(400);
            const data = res.body.data;

            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('property', 'userId');
            expect(data[0].constraints).toHaveProperty('isDefined');

            // Cache idempotency data checking
            const idempotencyProcess = await redis.get(
                cacheService.getIdempotentProcessFromNs('chatUser', idempotencyKey),
            );

            expect(idempotencyProcess).toBeFalsy();
        });
    });

    describe('success case', () => {
        it('should create chat user in database and notify that user', async () => {
            const idempotencyKey = uuidV4();
            const socketPromise = waitFor(clientSocket, CHAT_USER_ADDED);
            const res = await request(server)
                .post(REQUEST_URL)
                .set('Authorization', 'Bearer test-token')
                .set('Idempotency-Key', idempotencyKey)
                .send({ userId: USER3_ID });

            expect(res.status).toBe(201);
            const chatUser = res.body;

            expect(chatUser).toHaveProperty('chatId', CHAT_ID);
            expect(chatUser).toHaveProperty('userId', USER3_ID);

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

            // Cache idempotency data checking
            const idempotencyProcess = await redis.get(
                cacheService.getIdempotentProcessFromNs('chatUser', idempotencyKey),
            );

            expect(idempotencyProcess).toBeTruthy();
            const { data, status } = JSON.parse(idempotencyProcess as string);
            expect(status).toBe(IDEMPOTENT_PROCESS_COMPLETED);
            expect(data).toEqual(chatUser);
        });
    });
});
