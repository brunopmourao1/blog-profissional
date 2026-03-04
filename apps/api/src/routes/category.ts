import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@repo/db";
import { validateBody } from "../lib/validate.js";
import { authenticate, getParam } from "../middleware/auth.js";
import { requireTenantAccess } from "../middleware/rbac.js";
import { NotFoundError, ConflictError } from "../lib/errors.js";

const router = Router();

// =============================================================
// Schemas
// =============================================================

const createCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z
        .string()
        .min(2)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    description: z.string().optional(),
});

const updateCategorySchema = z.object({
    name: z.string().min(1).optional(),
    slug: z
        .string()
        .min(2)
        .regex(/^[a-z0-9-]+$/)
        .optional(),
    description: z.string().nullable().optional(),
});

// =============================================================
// POST /api/tenants/:tenantId/categories
// =============================================================

router.post(
    "/:tenantId/categories",
    authenticate,
    requireTenantAccess("tenantId"),
    validateBody(createCategorySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const { name, slug, description } = req.body;

            const existing = await prisma.category.findUnique({
                where: { tenantId_slug: { tenantId, slug } },
            });
            if (existing) {
                throw new ConflictError("Category slug already exists in this tenant");
            }

            const category = await prisma.category.create({
                data: { tenantId, name, slug, description },
            });

            res.status(201).json({ category });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/tenants/:tenantId/categories
// =============================================================

router.get(
    "/:tenantId/categories",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");

            const categories = await prisma.category.findMany({
                where: { tenantId },
                include: { _count: { select: { posts: true } } },
                orderBy: { name: "asc" },
            });

            res.json({ categories });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// PUT /api/tenants/:tenantId/categories/:categoryId
// =============================================================

router.put(
    "/:tenantId/categories/:categoryId",
    authenticate,
    requireTenantAccess("tenantId"),
    validateBody(updateCategorySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const categoryId = getParam(req, "categoryId");

            const existing = await prisma.category.findFirst({
                where: { id: categoryId, tenantId },
            });
            if (!existing) {
                throw new NotFoundError("Category");
            }

            // Check slug uniqueness if changing
            if (req.body.slug && req.body.slug !== existing.slug) {
                const slugConflict = await prisma.category.findUnique({
                    where: { tenantId_slug: { tenantId, slug: req.body.slug } },
                });
                if (slugConflict) {
                    throw new ConflictError("Category slug already exists");
                }
            }

            const category = await prisma.category.update({
                where: { id: categoryId },
                data: req.body,
            });

            res.json({ category });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// DELETE /api/tenants/:tenantId/categories/:categoryId
// =============================================================

router.delete(
    "/:tenantId/categories/:categoryId",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const categoryId = getParam(req, "categoryId");

            const existing = await prisma.category.findFirst({
                where: { id: categoryId, tenantId },
            });
            if (!existing) {
                throw new NotFoundError("Category");
            }

            await prisma.category.delete({ where: { id: categoryId } });

            res.json({ message: "Category deleted" });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
