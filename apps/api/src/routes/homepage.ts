import { Router, type Request, type Response, type NextFunction } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "@repo/db";
import {
    homeRevisionSchema,
    DEFAULT_HOME_SECTIONS,
    PLANS,
    type PlanTier,
} from "@repo/config";
import { authenticate, getParam } from "../middleware/auth.js";
import { requireTenantAccess } from "../middleware/rbac.js";
import { NotFoundError, ForbiddenError } from "../lib/errors.js";

const router = Router();

// =============================================================
// GET /api/tenants/:tenantId/homepage — Active homepage
// =============================================================

router.get(
    "/:tenantId/homepage",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");

            const home = await prisma.homeRevision.findFirst({
                where: { tenantId, active: true },
            });

            res.json({
                homepage: home || { sections: DEFAULT_HOME_SECTIONS },
            });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/tenants/:tenantId/homepage/revisions — List revisions
// =============================================================

router.get(
    "/:tenantId/homepage/revisions",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");

            const revisions = await prisma.homeRevision.findMany({
                where: { tenantId },
                orderBy: { version: "desc" },
            });

            res.json({ revisions });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// POST /api/tenants/:tenantId/homepage — Create revision
// =============================================================

router.post(
    "/:tenantId/homepage",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");

            // Validate sections
            const { sections } = homeRevisionSchema.parse(req.body);

            // Check plan limits
            const tenant = await prisma.tenant.findUnique({
                where: { id: tenantId },
                include: { agency: { select: { planTier: true } } },
            });

            if (tenant) {
                const plan = PLANS[tenant.agency.planTier as PlanTier];
                if (
                    plan.maxHomeSections !== -1 &&
                    sections.length > plan.maxHomeSections
                ) {
                    throw new ForbiddenError(
                        `Plan ${plan.name} allows max ${plan.maxHomeSections} sections. Upgrade to add more.`,
                    );
                }
            }

            // Get next version
            const latest = await prisma.homeRevision.findFirst({
                where: { tenantId },
                orderBy: { version: "desc" },
                select: { version: true },
            });
            const nextVersion = (latest?.version || 0) + 1;

            // Deactivate all, create new active
            await prisma.$transaction([
                prisma.homeRevision.updateMany({
                    where: { tenantId, active: true },
                    data: { active: false },
                }),
                prisma.homeRevision.create({
                    data: {
                        tenantId,
                        version: nextVersion,
                        active: true,
                        sections:
                            sections as unknown as Prisma.InputJsonValue,
                    },
                }),
            ]);

            const home = await prisma.homeRevision.findUnique({
                where: {
                    tenantId_version: { tenantId, version: nextVersion },
                },
            });

            res.status(201).json({ homepage: home });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// PUT /api/tenants/:tenantId/homepage/:homeId/activate
// =============================================================

router.put(
    "/:tenantId/homepage/:homeId/activate",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const homeId = getParam(req, "homeId");

            const home = await prisma.homeRevision.findFirst({
                where: { id: homeId, tenantId },
            });
            if (!home) {
                throw new NotFoundError("Homepage revision");
            }

            await prisma.$transaction([
                prisma.homeRevision.updateMany({
                    where: { tenantId, active: true },
                    data: { active: false },
                }),
                prisma.homeRevision.update({
                    where: { id: homeId },
                    data: { active: true },
                }),
            ]);

            res.json({ homepage: { ...home, active: true } });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
