import { Router, type Request, type Response, type NextFunction } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "@repo/db";
import {
    themeTokensSchema,
    DEFAULT_THEME_TOKENS,
} from "@repo/config";
import { authenticate, getParam } from "../middleware/auth.js";
import { requireTenantAccess } from "../middleware/rbac.js";
import { NotFoundError } from "../lib/errors.js";

const router = Router();

// =============================================================
// GET /api/tenants/:tenantId/themes — List theme revisions
// =============================================================

router.get(
    "/:tenantId/themes",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");

            const themes = await prisma.themeRevision.findMany({
                where: { tenantId },
                orderBy: { version: "desc" },
            });

            res.json({ themes });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/tenants/:tenantId/themes/active — Get active theme
// =============================================================

router.get(
    "/:tenantId/themes/active",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");

            const theme = await prisma.themeRevision.findFirst({
                where: { tenantId, active: true },
            });

            res.json({ theme: theme || { tokens: DEFAULT_THEME_TOKENS } });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// POST /api/tenants/:tenantId/themes — Create theme revision
// =============================================================

router.post(
    "/:tenantId/themes",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");

            // Validate tokens
            const tokens = themeTokensSchema.parse(req.body.tokens || {});

            // Get next version number
            const latest = await prisma.themeRevision.findFirst({
                where: { tenantId },
                orderBy: { version: "desc" },
                select: { version: true },
            });
            const nextVersion = (latest?.version || 0) + 1;

            // Deactivate all and create new active revision
            await prisma.$transaction([
                prisma.themeRevision.updateMany({
                    where: { tenantId, active: true },
                    data: { active: false },
                }),
                prisma.themeRevision.create({
                    data: {
                        tenantId,
                        version: nextVersion,
                        active: true,
                        tokens: tokens as unknown as Prisma.InputJsonValue,
                    },
                }),
            ]);

            const theme = await prisma.themeRevision.findUnique({
                where: { tenantId_version: { tenantId, version: nextVersion } },
            });

            res.status(201).json({ theme });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// PUT /api/tenants/:tenantId/themes/:themeId/activate
// =============================================================

router.put(
    "/:tenantId/themes/:themeId/activate",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const themeId = getParam(req, "themeId");

            const theme = await prisma.themeRevision.findFirst({
                where: { id: themeId, tenantId },
            });

            if (!theme) {
                throw new NotFoundError("Theme revision");
            }

            await prisma.$transaction([
                prisma.themeRevision.updateMany({
                    where: { tenantId, active: true },
                    data: { active: false },
                }),
                prisma.themeRevision.update({
                    where: { id: themeId },
                    data: { active: true },
                }),
            ]);

            res.json({ theme: { ...theme, active: true } });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
