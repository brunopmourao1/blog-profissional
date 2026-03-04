import { type Request, type Response, type NextFunction } from "express";
import { verifyToken, type AuthPayload } from "@repo/auth";
import { UnauthorizedError } from "../lib/errors.js";

// =============================================================
// Extend Express Request type
// =============================================================

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
            tenant?: {
                id: string;
                slug: string;
                agencyId: string;
            };
        }
    }
}

// =============================================================
// Param helper (Express 5 returns string | string[])
// =============================================================

export function getParam(req: Request, name: string): string {
    const value = req.params[name];
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}

// =============================================================
// JWT Auth Middleware
// =============================================================

export function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction,
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next(new UnauthorizedError("Missing or invalid Authorization header"));
        return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        next(new UnauthorizedError("Token not provided"));
        return;
    }

    try {
        const payload = verifyToken(token);
        req.user = { userId: payload.userId, email: payload.email };
        next();
    } catch {
        next(new UnauthorizedError("Invalid or expired token"));
    }
}
