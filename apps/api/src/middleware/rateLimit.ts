import type { Request, Response, NextFunction } from "express";

// =============================================================
// Simple In-Memory Rate Limiter
// =============================================================

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (now > entry.resetAt) {
            store.delete(key);
        }
    }
}, 5 * 60 * 1000);

export function rateLimit(maxRequests: number, windowMs: number) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const key = `${ip}:${req.path}`;
        const now = Date.now();

        const entry = store.get(key);

        if (!entry || now > entry.resetAt) {
            store.set(key, { count: 1, resetAt: now + windowMs });
            next();
            return;
        }

        if (entry.count >= maxRequests) {
            res.status(429).json({
                error: "Too many requests",
                retryAfter: Math.ceil((entry.resetAt - now) / 1000),
            });
            return;
        }

        entry.count++;
        next();
    };
}

// Pre-built limiters
export const authLimiter = rateLimit(10, 60 * 1000); // 10 req/min
export const contentLimiter = rateLimit(60, 60 * 1000); // 60 req/min
export const webhookLimiter = rateLimit(100, 60 * 1000); // 100 req/min
