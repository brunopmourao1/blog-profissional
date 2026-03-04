import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma, Role } from "@repo/db";
import { PLANS, type PlanTier } from "@repo/config";
import { validateBody } from "../lib/validate.js";
import { authenticate, getParam } from "../middleware/auth.js";
import { requireAgencyAccess, requireTenantAccess } from "../middleware/rbac.js";
import {
    NotFoundError,
    ConflictError,
    ForbiddenError,
} from "../lib/errors.js";

const router = Router();

// =============================================================
// Schemas
// =============================================================

const createTenantSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must contain only lowercase letters, numbers, and hyphens",
        ),
});

const updateTenantSchema = z.object({
    name: z.string().min(2).optional(),
    customDomain: z.string().nullable().optional(),
    active: z.boolean().optional(),
});

// =============================================================
// POST /api/agencies/:agencyId/tenants — Create tenant
// =============================================================

router.post(
    "/agencies/:agencyId/tenants",
    authenticate,
    requireAgencyAccess("agencyId"),
    validateBody(createTenantSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencyId = getParam(req, "agencyId");
            const { name, slug } = req.body;

            // Check requester is AGENCY_OWNER
            const membership = await prisma.membership.findFirst({
                where: {
                    userId: req.user!.userId,
                    role: { in: [Role.AGENCY_OWNER, Role.SUPER_ADMIN] },
                },
            });

            if (!membership) {
                throw new ForbiddenError("Only agency owners can create tenants");
            }

            // Check plan limits
            const agency = await prisma.agency.findUnique({
                where: { id: agencyId },
                include: { _count: { select: { tenants: true } } },
            });

            if (!agency) {
                throw new NotFoundError("Agency");
            }

            const plan = PLANS[agency.planTier as PlanTier];
            if (plan.maxTenants !== -1 && agency._count.tenants >= plan.maxTenants) {
                throw new ForbiddenError(
                    `Plan ${plan.name} allows max ${plan.maxTenants} tenants. Upgrade your plan.`,
                );
            }

            // Check slug uniqueness
            const existing = await prisma.tenant.findUnique({ where: { slug } });
            if (existing) {
                throw new ConflictError("Tenant slug already taken");
            }

            const tenant = await prisma.tenant.create({
                data: { name, slug, agencyId },
            });

            res.status(201).json({ tenant });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/agencies/:agencyId/tenants — List agency tenants
// =============================================================

router.get(
    "/agencies/:agencyId/tenants",
    authenticate,
    requireAgencyAccess("agencyId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencyId = getParam(req, "agencyId");
            const tenants = await prisma.tenant.findMany({
                where: { agencyId },
                orderBy: { createdAt: "desc" },
            });

            res.json({ tenants });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/tenants/:tenantId — Get tenant details
// =============================================================

router.get(
    "/tenants/:tenantId",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const tenant = await prisma.tenant.findUnique({
                where: { id: tenantId },
                include: {
                    agency: { select: { id: true, name: true, slug: true } },
                    _count: { select: { memberships: true } },
                },
            });

            if (!tenant) {
                throw new NotFoundError("Tenant");
            }

            res.json({ tenant });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// PUT /api/tenants/:tenantId — Update tenant
// =============================================================

router.put(
    "/tenants/:tenantId",
    authenticate,
    requireTenantAccess("tenantId"),
    validateBody(updateTenantSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");

            // Only TENANT_ADMIN, AGENCY_OWNER, or SUPER_ADMIN can update
            const hasTenantAdmin = await prisma.membership.findFirst({
                where: {
                    userId: req.user!.userId,
                    tenantId,
                    role: Role.TENANT_ADMIN,
                },
            });

            const hasHigherRole = await prisma.membership.findFirst({
                where: {
                    userId: req.user!.userId,
                    role: { in: [Role.AGENCY_OWNER, Role.SUPER_ADMIN] },
                },
            });

            if (!hasTenantAdmin && !hasHigherRole) {
                throw new ForbiddenError("Only tenant admins can update tenant");
            }

            // Check custom domain uniqueness if being set
            if (req.body.customDomain) {
                const existing = await prisma.tenant.findUnique({
                    where: { customDomain: req.body.customDomain },
                });
                if (existing && existing.id !== tenantId) {
                    throw new ConflictError("Custom domain already in use");
                }
            }

            const tenant = await prisma.tenant.update({
                where: { id: tenantId },
                data: req.body,
            });

            res.json({ tenant });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
