import { logger } from '../next-logger.config';

export const loggerMiddleware = (req, res, next) => {
    const log = logger();
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        log.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`
        });
    });

    next();
};