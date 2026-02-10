import { createServer } from '@/routers/app';
import SocketServerSingleton from '@/socket';
import { CHAT_ID } from '@/test/setup/seed';
import { Server } from 'http';
import request from 'supertest';

describe('GET /chat/:chatId/message', () => {
    let server: Server;

    beforeAll((done) => {
        server = createServer();
        server.listen(done);
    });

    afterAll(async () => {
        await SocketServerSingleton.resetForTests();
        await new Promise((resolve) => server.close(resolve));
    });

    describe('success case', () => {
        it('should return chat list for user without cursor', async () => {
            const res = await request(server)
                .get(`/chat/${CHAT_ID}/message`)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            const data = res.body;

            expect(data).toHaveProperty('hasMore', false);
            expect(data.data).toHaveLength(2);
            expect(data.data[0]).toHaveProperty('content', 'Hi!');
            expect(data.data[1]).toHaveProperty('content', 'Hello world');
        });

        it('should pass cursor to service when provided', async () => {
            const res = await request(server)
                .get(`/chat/${CHAT_ID}/message`)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);

            console.log(res.body);

            const res2 = await request(server)
                .get(`/chat/${CHAT_ID}/message`)
                .query({ cursor: res.body.data[0].createdAt })
                .set('Authorization', 'Bearer test-token');

            expect(res2.status).toBe(200);
            expect(res2.body.data).toHaveLength(1);
            expect(res2.body.data[0]).toHaveProperty('content', 'Hello world');
        });
    });
});
