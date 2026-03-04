import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma, Role } from "@repo/db";
import { validateBody } from "../lib/validate.js";
import { authenticate, getParam } from "../middleware/auth.js";
import { requireRole, requireAgencyAccess } from "../middleware/rbac.js";
import { hashPassword } from "@repo/auth";
import {
    NotFoundError,
    ConflictError,
    ForbiddenError,
} from "../lib/errors.js";

const router = Router();

// =============================================================
// Schemas
// =============================================================

const createAgencySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must contain only lowercase letters, numbers, and hyphens",
        ),
});

const updateAgencySchema = z.object({
    name: z.string().min(2).optional(),
});

const addMemberSchema = z.object({
    email: z.string().email("Invalid email"),
    name: z.string().min(2).optional(),
    password: z.string().min(6).optional(),
    role: z.enum(["AGENCY_OWNER", "AGENCY_MEMBER"]),
});

// =============================================================
// POST /api/agencies — Create agency (SUPER_ADMIN only)
// =============================================================

router.post(
    "/",
    authenticate,
    requireRole(Role.SUPER_ADMIN),
    validateBody(createAgencySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, slug } = req.body;

            const existing = await prisma.agency.findUnique({ where: { slug } });
            if (existing) {
                throw new ConflictError("Agency slug already taken");
            }

            const agency = await prisma.agency.create({
                data: { name, slug },
            });

            res.status(201).json({ agency });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/agencies — List all agencies (SUPER_ADMIN only)
// =============================================================

router.get(
    "/",
    authenticate,
    requireRole(Role.SUPER_ADMIN),
    async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencies = await prisma.agency.findMany({
                include: { _count: { select: { tenants: true, memberships: true } } },
                orderBy: { createdAt: "desc" },
            });

            res.json({ agencies });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/agencies/:agencyId — Get agency details
// =============================================================

router.get(
    "/:agencyId",
    authenticate,
    requireAgencyAccess("agencyId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencyId = getParam(req, "agencyId");
            const agency = await prisma.agency.findUnique({
                where: { id: agencyId },
                include: { _count: { select: { tenants: true, memberships: true } } },
            });

            if (!agency) {
                throw new NotFoundError("Agency");
            }

            res.json({ agency });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// PUT /api/agencies/:agencyId — Update agency
// =============================================================

router.put(
    "/:agencyId",
    authenticate,
    requireAgencyAccess("agencyId"),
    validateBody(updateAgencySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencyId = getParam(req, "agencyId");

            // Only AGENCY_OWNER or SUPER_ADMIN can update
            const membership = await prisma.membership.findFirst({
                where: {
                    userId: req.user!.userId,
                    agencyId,
                    role: { in: [Role.AGENCY_OWNER, Role.SUPER_ADMIN] },
                },
            });

            if (!membership) {
                throw new ForbiddenError("Only agency owners can update agency");
            }

            const agency = await prisma.agency.update({
                where: { id: agencyId },
                data: req.body,
            });

            res.json({ agency });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/agencies/:agencyId/members — List members
// =============================================================

router.get(
    "/:agencyId/members",
    authenticate,
    requireAgencyAccess("agencyId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencyId = getParam(req, "agencyId");
            const members = await prisma.membership.findMany({
                where: { agencyId },
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            res.json({ members });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// POST /api/agencies/:agencyId/members — Add member
// =============================================================

router.post(
    "/:agencyId/members",
    authenticate,
    requireAgencyAccess("agencyId"),
    validateBody(addMemberSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check requester is AGENCY_OWNER or SUPER_ADMIN
            const requesterMembership = await prisma.membership.findFirst({
                where: {
                    userId: req.user!.userId,
                    role: { in: [Role.AGENCY_OWNER, Role.SUPER_ADMIN] },
                },
            });

            if (!requesterMembership) {
                throw new ForbiddenError("Only agency owners can add members");
            }

            const { email, name, password, role } = req.body;
            const agencyId = getParam(req, "agencyId");

            // Find or create user
            let user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                if (!name || !password) {
                    throw new ConflictError(
                        "Name and password are required for new users",
                    );
                }
                const passwordHash = await hashPassword(password);
                user = await prisma.user.create({
                    data: { name, email, passwordHash },
                });
            }

            // Check if already a member
            const existingMembership = await prisma.membership.findFirst({
                where: { userId: user.id, agencyId },
            });

            if (existingMembership) {
                throw new ConflictError("User is already a member of this agency");
            }

            const membership = await prisma.membership.create({
                data: {
                    userId: user.id,
                    agencyId,
                    role: role as Role,
                },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
            });

            res.status(201).json({ membership });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
