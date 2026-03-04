import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

// =============================================================
// Audit Log Middleware
// =============================================================

/**
 * Logs administrative actions (POST, PUT, PATCH, DELETE) with user context.
 */
export function auditLog(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const method = req.method;

    // Only log mutating requests
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        next();
        return;
    }

    const startTime = Date.now();

    // Hook into response finish to log after completion
    res.on("finish", () => {
        const duration = Date.now() - startTime;

        logger.info("AUDIT", {
            method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            userId: req.user?.userId || "anonymous",
            ip: req.ip || req.socket.remoteAddress,
            duration: `${duration}ms`,
            userAgent: req.headers["user-agent"],
        });
    });

    next();
}
