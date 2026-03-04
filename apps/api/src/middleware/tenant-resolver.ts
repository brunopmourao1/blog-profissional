import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";
import { NotFoundError } from "../lib/errors.js";

// =============================================================
// Tenant Resolution Middleware
// =============================================================

/**
 * Resolves the current tenant from request headers or params.
 * Sets `req.tenant` with { id, slug, agencyId }.
 *
 * Resolution order:
 * 1. x-tenant-id header
 * 2. x-tenant-slug header
 * 3. :tenantId route param
 */
export async function resolveTenant(
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> {
    const tenantIdHeader = req.headers["x-tenant-id"] as string | undefined;
    const tenantSlug = req.headers["x-tenant-slug"] as string | undefined;
    const tenantIdParam = req.params["tenantId"];
    const tenantId = tenantIdHeader || (typeof tenantIdParam === "string" ? tenantIdParam : undefined);

    if (!tenantId && !tenantSlug) {
        next(new NotFoundError("Tenant"));
        return;
    }

    try {
        const tenant = tenantId
            ? await prisma.tenant.findUnique({
                where: { id: tenantId },
                select: { id: true, slug: true, agencyId: true, active: true },
            })
            : await prisma.tenant.findUnique({
                where: { slug: tenantSlug },
                select: { id: true, slug: true, agencyId: true, active: true },
            });

        if (!tenant) {
            next(new NotFoundError("Tenant"));
            return;
        }

        if (!tenant.active) {
            next(new NotFoundError("Tenant is inactive"));
            return;
        }

        req.tenant = {
            id: tenant.id,
            slug: tenant.slug,
            agencyId: tenant.agencyId,
        };

        next();
    } catch (error) {
        next(error);
    }
}
