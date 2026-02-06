import { CHAT_UPDATED } from '@/constants/socketEvent';
import { createServer } from '@/routers/app';
import SocketServerSingleton from '@/socket';
import { CHAT_ID } from '@/test/setup/seed';
import { waitFor } from '@/test/utils/socket';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { Socket as ClientSocket, io as ioc } from 'socket.io-client';
import request from 'supertest';

describe('PUT /chat/:chatId', () => {
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

    it('should update chat detail and online member should receive socket update', async () => {
        const socketPromise = waitFor(clientSocket, CHAT_UPDATED);
        const res = await request(server)
            .put(`/chat/${CHAT_ID}`)
            .set('Authorization', 'Bearer test-token')
            .send({
                name: 'New name',
                description: 'New description',
            });

        expect(res.status).toBe(200);
        const data = res.body;

        expect(data).toHaveProperty('_id', CHAT_ID);
        expect(data).toHaveProperty('name', 'New name');
        expect(data).toHaveProperty('description', 'New description');

        const socketData = await socketPromise;

        expect(socketData).toHaveProperty('_id', CHAT_ID);
        expect(socketData).toHaveProperty('name', 'New name');
        expect(socketData).toHaveProperty('description', 'New description');
    });
});
