import { createServer } from '@/routers/app';
import SocketServerSingleton from '@/socket';
import { CHAT_ID, USER1_ID, USER2_ID } from '@/test/setup/seed';
import { Server } from 'http';
import request from 'supertest';

describe('GET /chat/:chatId/user', () => {
    const REQUEST_URL = `/chat/${CHAT_ID}/user`;
    let server: Server;

    beforeAll((done) => {
        server = createServer();
        server.listen(done);
    });

    afterAll(async () => {
        await SocketServerSingleton.resetForTests();
        await new Promise((resolve) => server.close(resolve));
    });
    describe('error case', () => {
        it('should return error when page and pageSize are not number compatible', async () => {
            const res = await request(server)
                .get(REQUEST_URL)
                .query({ page: 'page', pageSize: 'pageSize' })
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(400);
            const data = res.body.data;

            expect(data).toHaveLength(2);
            expect(data[0]).toHaveProperty('property', 'page');
            expect(data[0].constraints).toHaveProperty('min');
            expect(data[0].constraints).toHaveProperty('isNumber');

            expect(data[1]).toHaveProperty('property', 'pageSize');
            expect(data[1].constraints).toHaveProperty('min');
            expect(data[1].constraints).toHaveProperty('max');
            expect(data[1].constraints).toHaveProperty('isNumber');
        });

        it('should return error when page and pageSize are not positive numbers', async () => {
            const res = await request(server)
                .get(REQUEST_URL)
                .query({ page: 0, pageSize: 0 })
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(400);
            const data = res.body.data;

            expect(data).toHaveLength(2);
            expect(data[0]).toHaveProperty('property', 'page');
            expect(data[0].constraints).toHaveProperty('min');

            expect(data[1]).toHaveProperty('property', 'pageSize');
            expect(data[1].constraints).toHaveProperty('min');
        });

        it('should return error when pageSize is bigger than 50', async () => {
            const res = await request(server)
                .get(REQUEST_URL)
                .query({ pageSize: 51 })
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(400);
            const data = res.body.data;

            expect(data).toHaveLength(1);
            expect(data[0]).toHaveProperty('property', 'pageSize');
            expect(data[0].constraints).toHaveProperty('max');
        });
    });
    describe('success case', () => {
        it('should return list when page and pageSize are not provided', async () => {
            const res = await request(server)
                .get(REQUEST_URL)
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            const data = res.body;

            expect(data).toHaveProperty('page', 1);
            expect(data).toHaveProperty('pageSize', 20);
            expect(data).toHaveProperty('totalPages', 1);
            expect(data.data).toHaveLength(2);
            expect(data.data[0]).toHaveProperty('userId', USER1_ID);
            expect(data.data[0].chatId).toBe(CHAT_ID);

            expect(data.data[1]).toHaveProperty('userId', USER2_ID);
            expect(data.data[1].chatId).toBe(CHAT_ID);
        });

        it('should return list when page and pageSize are provided', async () => {
            const res = await request(server)
                .get(REQUEST_URL)
                .query({ page: 1, pageSize: 20 })
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            const data = res.body;

            expect(data).toHaveProperty('page', 1);
            expect(data).toHaveProperty('pageSize', 20);
            expect(data).toHaveProperty('totalPages', 1);
            expect(data.data).toHaveLength(2);
            expect(data.data[0]).toHaveProperty('userId', USER1_ID);
            expect(data.data[0].chatId).toBe(CHAT_ID);

            expect(data.data[1]).toHaveProperty('userId', USER2_ID);
            expect(data.data[1].chatId).toBe(CHAT_ID);
        });

        it('should return empty list when page is bigger than total page', async () => {
            const res = await request(server)
                .get(REQUEST_URL)
                .query({ page: 2, pageSize: 20 })
                .set('Authorization', 'Bearer test-token');

            expect(res.status).toBe(200);
            const data = res.body;

            expect(data).toHaveProperty('page', 2);
            expect(data).toHaveProperty('pageSize', 20);
            expect(data).toHaveProperty('totalPages', 1);
            expect(data.data).toHaveLength(0);
        });
    });
});
