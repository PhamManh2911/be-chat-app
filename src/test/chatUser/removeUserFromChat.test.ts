import { CHAT_USER_REMOVED } from '@/constants/socketEvent';
import { ChatUserModel } from '@/models/chatUser.model';
import { createServer } from '@/routers/app';
import { chatService } from '@/services/chat.service';
import { userService } from '@/services/user.service';
import SocketServerSingleton from '@/socket';
import { CHAT_ID, USER1_ID, USER2_ID } from '@/test/setup/seed';
import { waitFor } from '@/test/utils/socket';
import { STATUS } from '@/types/app';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { Socket as ClientSocket, io as ioc } from 'socket.io-client';
import request from 'supertest';

describe('DELETE /chat/:chatId/user/:userId', () => {
    const REQUEST_URL = `/chat/${CHAT_ID}/user/${USER2_ID}`;
    let server: Server, clientSocket: ClientSocket, clientSocket2: ClientSocket;

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
        await SocketServerSingleton.resetForTests();
        await new Promise((resolve) => server.close(resolve));
    });

    afterAll(() => {
        clientSocket.removeAllListeners().disconnect();
        clientSocket2.removeAllListeners().disconnect();
    });

    describe('error case', () => {
        afterEach(async () => {
            await ChatUserModel.updateOne(
                { chatId: CHAT_ID, userId: USER1_ID },
                { $set: { status: STATUS.ACTIVE } },
            );
        });
        it("should return error when the user doesn't have permission", async () => {
            await ChatUserModel.updateOne(
                { chatId: CHAT_ID, userId: USER1_ID, status: STATUS.ACTIVE },
                { $set: { status: STATUS.ARCHIVED } },
            );
            const res = await request(server)
                .delete(REQUEST_URL)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Chat user not found or inactive');
        });
    });

    describe('success case', () => {
        it('should update the database and notify the user', async () => {
            const socketPromise = waitFor(clientSocket2, CHAT_USER_REMOVED);
            const res = await request(server)
                .delete(REQUEST_URL)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(204);

            // Database checking
            expect(
                await ChatUserModel.findOne({
                    chatId: CHAT_ID,
                    userId: USER2_ID,
                }),
            ).toBeNull();

            // Websocket checking
            const socketData = await socketPromise;

            expect(socketData).toHaveProperty('chatId', CHAT_ID);
            expect(socketData).toHaveProperty('userId', USER2_ID);
            const chatRoom = SocketServerSingleton.getIO().sockets.adapter.rooms.get(
                chatService.getSocketRoomForChat(CHAT_ID),
            );

            expect(chatRoom?.has(userService.getSocketRoomForUser(USER2_ID))).toBe(false);
        });
    });
});
