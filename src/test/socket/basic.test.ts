import { createServer } from '@/routers/app';
import { waitFor } from '@/test/utils/socket';
import { AddressInfo } from 'node:net';
import { Server, Socket as ServerSocket } from 'socket.io';
import { Socket as ClientSocket, io as ioc } from 'socket.io-client';

describe('basic connection', () => {
    let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;

    beforeAll((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            const port = (httpServer.address() as AddressInfo).port;
            clientSocket = ioc(`http://127.0.0.1:${port}`);
            io.on('connection', (socket) => {
                serverSocket = socket;
            });
            clientSocket.on('connect', done);
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.disconnect();
    });
    test('should work', (done) => {
        clientSocket.on('hello', (arg) => {
            expect(arg).toBe('world');
            done();
        });
        serverSocket.emit('hello', 'world');
    });

    test('should work with an acknowledgement', (done) => {
        serverSocket.on('hi', (cb) => {
            cb('hola');
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clientSocket.emit('hi', (arg: any) => {
            expect(arg).toBe('hola');
            done();
        });
    });

    test('should work with emitWithAck()', async () => {
        serverSocket.on('foo', (cb) => {
            cb('bar');
        });
        const result = await clientSocket.emitWithAck('foo');
        expect(result).toBe('bar');
    });

    test('should work with waitFor()', () => {
        clientSocket.emit('baz');

        return waitFor(serverSocket, 'baz');
    });
});
