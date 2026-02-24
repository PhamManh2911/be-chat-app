import redis from '@/cache';
import { IDEMPOTENT_PROCESS_COMPLETED } from '@/constants/idempotencyStatus';
import { CHAT_CREATED } from '@/constants/socketEvent';
import { ChatModel } from '@/models/chat.model';
import { ChatUserModel } from '@/models/chatUser.model';
import { createServer } from '@/routers/app';
import { cacheService } from '@/services/cache.service';
import SocketServerSingleton from '@/socket';
import { USER1_ID, USER2_ID } from '@/test/setup/seed';
import { waitFor } from '@/test/utils/socket';
import { STATUS } from '@/types/app';
import { Server } from 'http';
import mongoose from 'mongoose';
import { AddressInfo } from 'net';
import { Socket as ClientSocket, io as ioc } from 'socket.io-client';
import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';

describe('POST /chat', () => {
    const REQUEST_URL = '/chat';
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

    describe('error case', () => {
        it('should return error when not provide idempotency key', async () => {
            const res = await request(server)
                .post(REQUEST_URL)
                .set('Authorization', 'Bearer test-token')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Missing idempotency key');
        });

        it('should return error when using same idempotency key', async () => {
            const idempotencyKey = uuidV4();
            const reqPayload = {
                name: 'New Chat',
                description: 'This is a new chat',
                memberIds: [new mongoose.Types.ObjectId().toString()],
            };
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
            const reqPayload = {
                name: 'New Chat',
                description: 'This is a new chat',
                memberIds: [],
            };
            const res = await request(server)
                .post(REQUEST_URL)
                .set('Authorization', 'Bearer test-token')
                .set('Idempotency-Key', idempotencyKey)
                .send(reqPayload);

            expect(res.statusCode).toBe(400);
            const data = res.body.data;

            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('property', 'memberIds');
            expect(data[0].constraints).toHaveProperty('arrayNotEmpty');

            // Cache idempotency data checking
            const idempotencyProcess = await redis.get(
                cacheService.getIdempotentProcessFromNs('chat', idempotencyKey),
            );

            expect(idempotencyProcess).toBeFalsy();
        });
    });

    describe('success case', () => {
        it('should create a new chat, send the notification to all chat users and have cached idempotency process', async () => {
            // NOTE: register socket event listener before making api request
            const user1SocketPromise = waitFor(clientSocket, CHAT_CREATED);
            const user2SocketPromise = waitFor(clientSocket2, CHAT_CREATED);
            const idempotencyKey = uuidV4();
            const reqPayload = {
                name: 'New Chat',
                description: 'This is a new chat',
                memberIds: [USER2_ID],
            };
            const res = await request(server)
                .post(REQUEST_URL)
                .set('Authorization', 'Bearer test-token')
                .set('Idempotency-Key', idempotencyKey)
                .send(reqPayload);

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

            // Cache idempotency data checking
            const idempotencyProcess = await redis.get(
                cacheService.getIdempotentProcessFromNs('chat', idempotencyKey),
            );

            expect(idempotencyProcess).toBeTruthy();
            const { data, status } = JSON.parse(idempotencyProcess as string);
            expect(status).toBe(IDEMPOTENT_PROCESS_COMPLETED);
            expect(data).toEqual(chat);
        });
    });
});
