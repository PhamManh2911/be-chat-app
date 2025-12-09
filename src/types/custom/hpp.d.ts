declare module 'hpp' {
    import { RequestHandler } from 'express';
    interface Options {
        whitelist?: string[];
    }
    const hpp: (options?: Options) => RequestHandler;
    export default hpp;
}
