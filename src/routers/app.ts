import { loggerMiddleware } from '@/logger';
import chatRouter from '@/routers/chat.router';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { createServer } from 'http';
import 'reflect-metadata';

import '@/cache'; // Initialize Redis connection
import '@/database'; // Initialize MongoDB connection
import { authMiddleware } from '@/middlewares/auth';
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
app.use(hpp()); // Prevent Parameter Pollution

app.use(authMiddleware);
app.use('/chat', chatRouter);

app.use(errorMiddleware);

export const httpServer = createServer(app);
