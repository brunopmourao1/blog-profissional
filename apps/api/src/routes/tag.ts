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

const createTagSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z
        .string()
        .min(2)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

// =============================================================
// POST /api/tenants/:tenantId/tags
// =============================================================

router.post(
    "/:tenantId/tags",
    authenticate,
    requireTenantAccess("tenantId"),
    validateBody(createTagSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const { name, slug } = req.body;

            const existing = await prisma.tag.findUnique({
                where: { tenantId_slug: { tenantId, slug } },
            });
            if (existing) {
                throw new ConflictError("Tag slug already exists in this tenant");
            }

            const tag = await prisma.tag.create({
                data: { tenantId, name, slug },
            });

            res.status(201).json({ tag });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/tenants/:tenantId/tags
// =============================================================

router.get(
    "/:tenantId/tags",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");

            const tags = await prisma.tag.findMany({
                where: { tenantId },
                include: { _count: { select: { posts: true } } },
                orderBy: { name: "asc" },
            });

            res.json({ tags });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// DELETE /api/tenants/:tenantId/tags/:tagId
// =============================================================

router.delete(
    "/:tenantId/tags/:tagId",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const tagId = getParam(req, "tagId");

            const existing = await prisma.tag.findFirst({
                where: { id: tagId, tenantId },
            });
            if (!existing) {
                throw new NotFoundError("Tag");
            }

            await prisma.tag.delete({ where: { id: tagId } });

            res.json({ message: "Tag deleted" });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
