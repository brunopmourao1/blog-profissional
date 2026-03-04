import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@repo/db";
import {
    hashPassword,
    verifyPassword,
    generateToken,
    generateRefreshToken,
    refreshAccessToken,
} from "@repo/auth";
import { validateBody } from "../lib/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
    UnauthorizedError,
    ConflictError,
} from "../lib/errors.js";

const router = Router();

// =============================================================
// Schemas
// =============================================================

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});

// =============================================================
// POST /api/auth/register
// =============================================================

router.post(
    "/register",
    validateBody(registerSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, email, password } = req.body;

            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                throw new ConflictError("Email already registered");
            }

            const passwordHash = await hashPassword(password);

            const user = await prisma.user.create({
                data: { name, email, passwordHash },
                select: { id: true, name: true, email: true, createdAt: true },
            });

            const token = generateToken({ userId: user.id, email: user.email });
            const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

            res.status(201).json({ user, token, refreshToken });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// POST /api/auth/login
// =============================================================

router.post(
    "/login",
    validateBody(loginSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new UnauthorizedError("Invalid credentials");
            }

            const valid = await verifyPassword(password, user.passwordHash);
            if (!valid) {
                throw new UnauthorizedError("Invalid credentials");
            }

            const token = generateToken({ userId: user.id, email: user.email });
            const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                token,
                refreshToken,
            });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/auth/me
// =============================================================

router.get(
    "/me",
    authenticate,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user!.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    emailVerified: true,
                    createdAt: true,
                    memberships: {
                        select: {
                            id: true,
                            role: true,
                            agencyId: true,
                            tenantId: true,
                            agency: { select: { id: true, name: true, slug: true } },
                            tenant: { select: { id: true, name: true, slug: true } },
                        },
                    },
                },
            });

            if (!user) {
                throw new UnauthorizedError("User not found");
            }

            res.json({ user });
        } catch (error) {
            next(error);
        }
    },
);

export default router;

// =============================================================
// POST /api/auth/refresh
// =============================================================

const tokenBlacklist = new Set<string>(); // In production, use Redis

router.post(
    "/refresh",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refreshToken: incomingToken } = req.body;

            if (!incomingToken) {
                throw new UnauthorizedError("Refresh token is required");
            }

            if (tokenBlacklist.has(incomingToken)) {
                throw new UnauthorizedError("Token has been revoked");
            }

            const tokens = refreshAccessToken(incomingToken);

            // Blacklist the old refresh token
            tokenBlacklist.add(incomingToken);

            res.json(tokens);
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// POST /api/auth/logout
// =============================================================

router.post(
    "/logout",
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace("Bearer ", "");
            tokenBlacklist.add(token);
        }

        const { refreshToken } = req.body;
        if (refreshToken) {
            tokenBlacklist.add(refreshToken);
        }

        res.json({ message: "Logged out successfully" });
    },
);
