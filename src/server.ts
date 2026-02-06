import { config } from '@/config';
import logger from '@/logger';
import { createServer } from '@/routers/app';

createServer().listen(config.appConfig.port, () => {
    logger.info(`Server is running on http://127.0.0.1:${config.appConfig.port}`);
});
