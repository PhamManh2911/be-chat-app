import { loggerMiddleware } from '@/logger';
import chatRouter from '@/routers/chat.router';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { createServer } from 'http';
import 'reflect-metadata';

// @ts-expect-error (package missing TS types)
import xssClean from 'xss-clean';

import '@/cache'; // Initialize Redis connection
import '@/database'; // Initialize MongoDB connection
import { errorMiddleware } from '@/middlewares/error';

export const app = express();

app.use(loggerMiddleware);
/** --------------------------------------
 *  Body Parsers
 * ------------------------------------- */
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(cors({ origin: '*', credentials: true })); // CORS
app.use(helmet()); // Security Headers
app.use(xssClean()); // Prevent XSS Attacks
app.use(hpp()); // Prevent Parameter Pollution

app.use('/chat', chatRouter);

app.use(errorMiddleware);

export const httpServer = createServer(app);
