import redis from '@/cache';
import { config } from '@/config';
import logger from '@/logger';
import { authSocketMiddleware } from '@/middlewares/auth';
import { userService } from '@/services/user.service';
import { ChatSocket } from '@/socket/chat.socket';
import { SocketData } from '@/types/app';

import { createAdapter } from '@socket.io/redis-adapter';
import http from 'http';
import { DefaultEventsMap, Server as SocketServer } from 'socket.io';

class SocketServerSingleton {
    private static io: SocketServer<
        DefaultEventsMap,
        DefaultEventsMap,
        DefaultEventsMap,
        SocketData
    > | null = null;

    static init(server: http.Server) {
        if (this.io) {
            logger.warn('Socket.IO already initialized');
            return this.io;
        }

        const pubClient = redis;
        const subClient = redis.duplicate();

        this.io = new SocketServer(server, {
            cors: { origin: config.corsConfig.origin },
            adapter: createAdapter(pubClient, subClient),
        });

        this.io.use(authSocketMiddleware);

        this.io.on('connection', async (socket) => {
            logger.info(`User ${socket.data.user.sub} connected!`);
            await socket.join(userService.getSocketRoomForUser(socket.data.user.sub));

            new ChatSocket(this.io!, socket);
        });

        logger.info('Socket.IO initialized');

        return this.io;
    }

    static getIO() {
        if (!this.io) {
            throw new Error('Socket.IO not initialized. Call init() first.');
        }
        return this.io;
    }

    /**
     * ⚠️ Test-only helper
     */
    static async resetForTests() {
        this.io?.removeAllListeners();
        await this.io?.close();
        this.io = null;
    }
}

export default SocketServerSingleton;
