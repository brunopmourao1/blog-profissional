import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma, PostStatus } from "@repo/db";
import { validateBody } from "../lib/validate.js";
import { authenticate, getParam } from "../middleware/auth.js";
import { requireTenantAccess } from "../middleware/rbac.js";
import { NotFoundError, ConflictError } from "../lib/errors.js";

const router = Router();

// =============================================================
// Schemas
// =============================================================

const createPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().optional(),
    coverImage: z.string().url().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).optional(),
    publishedAt: z.string().datetime().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().max(160).optional(),
    ogImage: z.string().url().optional(),
    categoryIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
});

const updatePostSchema = z.object({
    title: z.string().min(1).optional(),
    slug: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-]+$/)
        .optional(),
    content: z.string().min(1).optional(),
    excerpt: z.string().nullable().optional(),
    coverImage: z.string().url().nullable().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).optional(),
    publishedAt: z.string().datetime().nullable().optional(),
    seoTitle: z.string().nullable().optional(),
    seoDescription: z.string().max(160).nullable().optional(),
    ogImage: z.string().url().nullable().optional(),
    categoryIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
});

// =============================================================
// POST /api/tenants/:tenantId/posts — Create post
// =============================================================

router.post(
    "/:tenantId/posts",
    authenticate,
    requireTenantAccess("tenantId"),
    validateBody(createPostSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const {
                title,
                slug,
                content,
                excerpt,
                coverImage,
                status,
                publishedAt,
                seoTitle,
                seoDescription,
                ogImage,
                categoryIds,
                tagIds,
            } = req.body;

            // Check slug uniqueness within tenant
            const existing = await prisma.post.findUnique({
                where: { tenantId_slug: { tenantId, slug } },
            });
            if (existing) {
                throw new ConflictError("Post slug already exists in this tenant");
            }

            const postStatus = (status as PostStatus) || PostStatus.DRAFT;

            const post = await prisma.post.create({
                data: {
                    tenantId,
                    authorId: req.user!.userId,
                    title,
                    slug,
                    content,
                    excerpt,
                    coverImage,
                    status: postStatus,
                    publishedAt:
                        postStatus === PostStatus.PUBLISHED
                            ? publishedAt
                                ? new Date(publishedAt)
                                : new Date()
                            : publishedAt
                                ? new Date(publishedAt)
                                : undefined,
                    seoTitle,
                    seoDescription,
                    ogImage,
                    categories: categoryIds?.length
                        ? { connect: categoryIds.map((id: string) => ({ id })) }
                        : undefined,
                    tags: tagIds?.length
                        ? { connect: tagIds.map((id: string) => ({ id })) }
                        : undefined,
                },
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    categories: { select: { id: true, name: true, slug: true } },
                    tags: { select: { id: true, name: true, slug: true } },
                },
            });

            res.status(201).json({ post });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/tenants/:tenantId/posts — List posts
// =============================================================

router.get(
    "/:tenantId/posts",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = Math.min(parseInt(req.query["limit"] as string) || 20, 100);
            const status = req.query["status"] as string;
            const categoryId = req.query["categoryId"] as string;
            const tagId = req.query["tagId"] as string;
            const search = req.query["search"] as string;

            const where: Record<string, unknown> = { tenantId };

            if (status) {
                where["status"] = status;
            }
            if (categoryId) {
                where["categories"] = { some: { id: categoryId } };
            }
            if (tagId) {
                where["tags"] = { some: { id: tagId } };
            }
            if (search) {
                where["OR"] = [
                    { title: { contains: search, mode: "insensitive" } },
                    { content: { contains: search, mode: "insensitive" } },
                ];
            }

            const [posts, total] = await Promise.all([
                prisma.post.findMany({
                    where,
                    include: {
                        author: { select: { id: true, name: true } },
                        categories: { select: { id: true, name: true, slug: true } },
                        tags: { select: { id: true, name: true, slug: true } },
                    },
                    orderBy: { createdAt: "desc" },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                prisma.post.count({ where }),
            ]);

            res.json({
                posts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/tenants/:tenantId/posts/:slug — Get post by slug
// =============================================================

router.get(
    "/:tenantId/posts/:slug",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const slug = getParam(req, "slug");

            const post = await prisma.post.findUnique({
                where: { tenantId_slug: { tenantId, slug } },
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    categories: { select: { id: true, name: true, slug: true } },
                    tags: { select: { id: true, name: true, slug: true } },
                },
            });

            if (!post) {
                throw new NotFoundError("Post");
            }

            res.json({ post });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// PUT /api/tenants/:tenantId/posts/:postId — Update post
// =============================================================

router.put(
    "/:tenantId/posts/:postId",
    authenticate,
    requireTenantAccess("tenantId"),
    validateBody(updatePostSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const postId = getParam(req, "postId");
            const { categoryIds, tagIds, publishedAt, ...data } = req.body;

            // Check post exists
            const existing = await prisma.post.findFirst({
                where: { id: postId, tenantId },
            });
            if (!existing) {
                throw new NotFoundError("Post");
            }

            // Check slug uniqueness if changing
            if (data.slug && data.slug !== existing.slug) {
                const slugConflict = await prisma.post.findUnique({
                    where: { tenantId_slug: { tenantId, slug: data.slug } },
                });
                if (slugConflict) {
                    throw new ConflictError("Post slug already exists in this tenant");
                }
            }

            // Auto-set publishedAt when publishing
            const updateData: Record<string, unknown> = { ...data };
            if (publishedAt !== undefined) {
                updateData["publishedAt"] = publishedAt ? new Date(publishedAt) : null;
            } else if (
                data.status === PostStatus.PUBLISHED &&
                !existing.publishedAt
            ) {
                updateData["publishedAt"] = new Date();
            }

            const post = await prisma.post.update({
                where: { id: postId },
                data: {
                    ...updateData,
                    categories: categoryIds
                        ? { set: categoryIds.map((id: string) => ({ id })) }
                        : undefined,
                    tags: tagIds
                        ? { set: tagIds.map((id: string) => ({ id })) }
                        : undefined,
                },
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    categories: { select: { id: true, name: true, slug: true } },
                    tags: { select: { id: true, name: true, slug: true } },
                },
            });

            res.json({ post });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// DELETE /api/tenants/:tenantId/posts/:postId — Delete post
// =============================================================

router.delete(
    "/:tenantId/posts/:postId",
    authenticate,
    requireTenantAccess("tenantId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = getParam(req, "tenantId");
            const postId = getParam(req, "postId");

            const existing = await prisma.post.findFirst({
                where: { id: postId, tenantId },
            });
            if (!existing) {
                throw new NotFoundError("Post");
            }

            await prisma.post.delete({ where: { id: postId } });

            res.json({ message: "Post deleted" });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
