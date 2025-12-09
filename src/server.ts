import { config } from '@/config';
import logger from '@/logger';
import { httpServer } from '@/routers/app';

import '@/socket';

httpServer.listen(config.appConfig.port, () => {
    logger.info(`Server is running on http://localhost:${config.appConfig.port}`);
});
