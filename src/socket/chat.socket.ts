import logger from '@/logger';
import { chatService } from '@/services/chat.service';
import { Socket, Server as SocketServer } from 'socket.io';

export class ChatSocket {
    io: SocketServer;
    socket: Socket;

    constructor(io: SocketServer, socket: Socket) {
        this.io = io;
        this.socket = socket;

        this.registerEventListeners();
    }

    registerEventListeners() {
        this.socket.conn.once('upgrade', () => {
            // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
            logger.debug('upgraded transport', this.socket.conn.transport.name); // prints "websocket"
        });
        this.socket.on('disconnect', (reason) => {
            // ...
            logger.debug(`Socket disconnected: ${reason}`);
        });

        this.socket.on('error', (err) => {
            if (err && err.message === 'unauthorized event') {
                this.socket.disconnect();
            }
        });

        this.socket.on('chat:join', this.handleJoinRoom.bind(this));
        this.socket.on('chat:leave', this.handleLeaveRoom.bind(this));
    }

    private async handleJoinRoom(payload: { chatId: string }) {
        await this.socket.join(chatService.getSocketRoomForChat(payload.chatId));
        this.socket.emit('chat:joined', { chatId: payload.chatId });
    }

    private async handleLeaveRoom(payload: { chatId: string }) {
        await this.socket.leave(chatService.getSocketRoomForChat(payload.chatId));
        this.socket.emit('chat:left', { chatId: payload.chatId });
    }
}
