import { Socket as ServerSocket } from 'socket.io';
import { Socket as ClientSocket } from 'socket.io-client';

export const waitFor = (socket: ServerSocket | ClientSocket, event: string) =>
    new Promise((resolve) => {
        socket.once(event, resolve);
    });
