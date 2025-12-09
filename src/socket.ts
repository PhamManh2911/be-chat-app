import redis from '@/cache';
import { config } from '@/config';
import { httpServer } from '@/routers/app';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server as SocketServer } from 'socket.io';

const pubClient = redis;
const subClient = redis.duplicate();

export const io = new SocketServer(httpServer, {
    cors: { origin: config.corsConfig.origin },
    adapter: createAdapter(pubClient, subClient),
});

io.on('connection', (socket) => {
    // ...
});
