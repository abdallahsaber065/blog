// lib/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { Request } from 'express';

const getRateLimitMessage = (max: number, windowMs: number, ip: string) => {
    return `Too many requests from IP ${ip}, please try again after ${windowMs / 60000} minutes`;
}

const keyGenerator = (req: Request) => {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '';
    return ipAddress;
};

const rateLimiterConfig = {
    login: { max: 2, windowMs: 15 * 60 * 1000 }, // 10 requests per 15 minutes
    signup: { max: 30, windowMs: 60 * 60 * 1000 }, // 30 requests per hour
    checkUniqueness: { max: 30, windowMs: 15 * 60 * 1000 }, // 30 requests per 15 minutes
};

const rateLimiters = {
    login: rateLimit({
        windowMs: rateLimiterConfig.login.windowMs,
        max: rateLimiterConfig.login.max,
        message: (req: Request) => getRateLimitMessage(rateLimiterConfig.login.max, rateLimiterConfig.login.windowMs, keyGenerator(req)),
        keyGenerator,
    }),
    signup: rateLimit({
        windowMs: rateLimiterConfig.signup.windowMs,
        max: rateLimiterConfig.signup.max,
        message: (req: Request) => getRateLimitMessage(rateLimiterConfig.signup.max, rateLimiterConfig.signup.windowMs, keyGenerator(req)),
        keyGenerator,
    }),
    checkUniqueness: rateLimit({
        windowMs: rateLimiterConfig.checkUniqueness.windowMs,
        max: rateLimiterConfig.checkUniqueness.max,
        message: (req: Request) => getRateLimitMessage(rateLimiterConfig.checkUniqueness.max, rateLimiterConfig.checkUniqueness.windowMs, keyGenerator(req)),
        keyGenerator,
    }),
};

export default rateLimiters;