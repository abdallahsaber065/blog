// lib/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import axios from 'axios';

const getRateLimitMessage = (max: number, windowMs: number) => {
    return `Too many requests, please try again after ${windowMs / 60000} minutes`;
}

const keyGenerator = (req: Request) => {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '';
    return ipAddress;
};

const rateLimiterConfig = {
    login: { max: 10, windowMs: 15 * 60 * 1000 }, // 10 requests per 15 minutes
    signup: { max: 30, windowMs: 60 * 60 * 1000 }, // 30 requests per hour
    checkUniqueness: { max: 30, windowMs: 15 * 60 * 1000 }, // 30 requests per 15 minutes
};

const rateLimiters = {
    login: rateLimit({
        windowMs: rateLimiterConfig.login.windowMs,
        max: rateLimiterConfig.login.max,
        message: getRateLimitMessage(rateLimiterConfig.login.max, rateLimiterConfig.login.windowMs),
        keyGenerator,
    }),
    signup: rateLimit({
        windowMs: rateLimiterConfig.signup.windowMs,
        max: rateLimiterConfig.signup.max,
        message: getRateLimitMessage(rateLimiterConfig.signup.max, rateLimiterConfig.signup.windowMs),
        keyGenerator,
    }),
    checkUniqueness: rateLimit({
        windowMs: rateLimiterConfig.checkUniqueness.windowMs,
        max: rateLimiterConfig.checkUniqueness.max,
        message: getRateLimitMessage(rateLimiterConfig.checkUniqueness.max, rateLimiterConfig.checkUniqueness.windowMs),
        keyGenerator,
    }),
};

export default rateLimiters;