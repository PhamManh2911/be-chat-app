import { config } from '@/config';
import { Request, Response } from 'express';
import morgan, { TokenIndexer } from 'morgan';
import winston, { format, transports } from 'winston';

const logger = winston.createLogger({
    format: format.combine(format.timestamp(), format.json()),
    defaultMeta: { service: config.appConfig.appName },
    transports: [
        new transports.Console(), // Ghi log ra stdout
    ],
});

export const loggerMiddleware = morgan(
    (tokens: TokenIndexer<Request, Response>, req: Request, res: Response) => {
        req.meta = req.meta || {};
        req.meta.remote = tokens['remote-addr'](req, res);
        req.meta.method = tokens.method(req, res);
        req.meta.url = tokens.url(req, res);
        req.meta.http = tokens['http-version'](req, res);
        req.meta.status = tokens.status(req, res);
        req.meta.referrer = tokens.referrer(req, res);
        req.meta['user-agent'] = tokens['user-agent'](req, res);
        req.meta.rpt = tokens['response-time'](req, res);

        return JSON.stringify({
            ...req.meta,
            service: config.appConfig.appName,
            level: 'http',
        });
    },
);

export default logger;
