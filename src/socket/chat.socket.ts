import logger from '@/logger';
import { chatService } from '@/services/chat.service';
import { chatUserService } from '@/services/chatUser.service';
import { SocketData } from '@/types/app';
import { DefaultEventsMap, Socket, Server as SocketServer } from 'socket.io';

export class ChatSocket {
    io: SocketServer;
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

    constructor(io: SocketServer, socket: Socket) {
        this.io = io;
        this.socket = socket;

        this.registerEventListeners();
    }

    async registerEventListeners() {
        this.socket.conn.once('upgrade', () => {
            // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
            logger.debug('upgraded transport', this.socket.conn.transport.name); // prints "websocket"
        });

        this.socket.on('disconnect', (reason) => {
            // ...
            logger.debug(`Socket disconnected: ${reason}`);
            this.socket.removeAllListeners();
        });

        this.socket.on('error', (err) => {
            if (err && err.message === 'unauthorized event') {
                this.socket.disconnect();
            }
        });
        // TODO: only get 9999 chat user, maybe change later
        const listChat = await chatUserService.getListChatForUser(this.socket.data.user.sub, {
            limit: 9999,
        });

        await this.socket.join(
            listChat.data.map((c) => chatService.getSocketRoomForChat(c.chatId.toString())),
        );
    }
}
