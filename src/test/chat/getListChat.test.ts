import { createServer } from '@/routers/app';
import SocketServerSingleton from '@/socket';
import { CHAT_ID } from '@/test/setup/seed';
import { Server } from 'http';
import request from 'supertest';

describe('GET /chat', () => {
    let server: Server;

    beforeAll((done) => {
        server = createServer();
        server.listen(done);
    });

    afterAll(async () => {
        await SocketServerSingleton.resetForTests();
        await new Promise((resolve) => server.close(resolve));
    });

    it('should return chat list for user without cursor', async () => {
        const res = await request(server).get('/chat').set('Authorization', 'Bearer test-token');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('hasMore', false);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]).toHaveProperty('chatId', CHAT_ID);
    });

    it('should pass cursor to service when provided', async () => {
        const res = await request(server).get('/chat').set('Authorization', 'Bearer test-token');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data).toHaveLength(1);

        const res2 = await request(server)
            .get('/chat')
            .query({ cursor: res.body.data[0].updatedAt })
            .set('Authorization', 'Bearer test-token');

        expect(res2.status).toBe(200);
        expect(res2.body).toHaveProperty('data');
        expect(res2.body.data).toBeInstanceOf(Array);
        expect(res2.body.data).toHaveLength(0);
    });
});
