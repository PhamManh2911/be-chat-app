import { MESSAGE_DELETED } from '@/constants/socketEvent';
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

describe('DELETE /chat/:chatId/message/:messageId', () => {
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
        it('should return error when chat user is archived or deleted', async () => {
            await ChatUserModel.updateOne(
                { chatId: CHAT_ID, userId: USER1_ID, status: STATUS.ACTIVE },
                { $set: { status: STATUS.ARCHIVED } },
            );
            const res = await request(server)
                .delete(`/chat/${CHAT_ID}/message/${MSG_USER1}`)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Chat user not found or inactive');

            await ChatUserModel.updateOne(
                { chatId: CHAT_ID, userId: USER1_ID },
                { $set: { status: STATUS.ACTIVE } },
            );
        });
    });

    describe('success case', () => {
        it('should remove message in database and send the notification', async () => {
            const socketPromise = waitFor(clientSocket, MESSAGE_DELETED);
            const res = await request(server)
                .delete(`/chat/${CHAT_ID}/message/${MSG_USER1}`)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(204);

            // Database checking
            expect(await MessageModel.findById(MSG_USER1)).toBeNull();

            // Websocket checking
            const socketData = await socketPromise;
            expect(socketData).toHaveProperty('messageId', MSG_USER1);
        });
    });
});
