import { app } from '@/routers/app';
import request from 'supertest';

describe('GET /api/chats', () => {
    it('should return chat list for user without cursor', async () => {
        const mockResult = {
            data: [{ chatId: 'chat-1' }, { chatId: 'chat-2' }],
            nextCursor: 'cursor-2',
        };

        const res = await request(app).get('/api/chats').set('Authorization', 'Bearer test-token');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockResult);
    });

    it('should pass cursor to service when provided', async () => {
        const mockResult = {
            data: [],
            nextCursor: null,
        };

        const res = await request(app)
            .get('/api/chats')
            .query({ cursor: 'cursor-1' })
            .set('Authorization', 'Bearer test-token');

        expect(res.body).toEqual(mockResult);
    });
});
