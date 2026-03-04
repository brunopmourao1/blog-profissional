import { type Request, type Response, type NextFunction } from "express";
import { prisma, Role } from "@repo/db";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";
import { getParam } from "./auth.js";

// =============================================================
// Role-Based Access Control Middleware
// =============================================================

/**
 * Requires the user to have a specific role in ANY of their memberships.
 */
export function requireRole(...allowedRoles: Role[]) {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> => {
        if (!req.user) {
            next(new UnauthorizedError());
            return;
        }

        const memberships = await prisma.membership.findMany({
            where: { userId: req.user.userId },
            select: { role: true },
        });

        const hasRole = memberships.some((m: { role: Role }) =>
            allowedRoles.includes(m.role),
        );

        if (!hasRole) {
            next(new ForbiddenError("Insufficient permissions"));
            return;
        }

        next();
    };
}

/**
 * Requires the user to be a member of the specified agency.
 */
export function requireAgencyAccess(agencyIdParam: string = "agencyId") {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> => {
        if (!req.user) {
            next(new UnauthorizedError());
            return;
        }

        const agencyId = getParam(req, agencyIdParam);
        if (!agencyId) {
            next(new ForbiddenError("Agency ID required"));
            return;
        }

        // SuperAdmins have access to everything
        const isSuperAdmin = await prisma.membership.findFirst({
            where: {
                userId: req.user.userId,
                role: Role.SUPER_ADMIN,
            },
        });

        if (isSuperAdmin) {
            next();
            return;
        }

        const membership = await prisma.membership.findFirst({
            where: {
                userId: req.user.userId,
                agencyId,
                role: { in: [Role.AGENCY_OWNER, Role.AGENCY_MEMBER] },
            },
        });

        if (!membership) {
            next(new ForbiddenError("No access to this agency"));
            return;
        }

        next();
    };
}

/**
 * Requires the user to be a member of the specified tenant.
 */
export function requireTenantAccess(tenantIdParam: string = "tenantId") {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> => {
        if (!req.user) {
            next(new UnauthorizedError());
            return;
        }

        const tenantId = getParam(req, tenantIdParam);
        if (!tenantId) {
            next(new ForbiddenError("Tenant ID required"));
            return;
        }

        // SuperAdmins have access to everything
        const isSuperAdmin = await prisma.membership.findFirst({
            where: {
                userId: req.user.userId,
                role: Role.SUPER_ADMIN,
            },
        });

        if (isSuperAdmin) {
            next();
            return;
        }

        // Check agency-level access (agency owners/members have access to their tenants)
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { agencyId: true },
        });

        if (tenant) {
            const agencyMembership = await prisma.membership.findFirst({
                where: {
                    userId: req.user.userId,
                    agencyId: tenant.agencyId,
                    role: { in: [Role.AGENCY_OWNER, Role.AGENCY_MEMBER] },
                },
            });

            if (agencyMembership) {
                next();
                return;
            }
        }

        // Check direct tenant membership
        const membership = await prisma.membership.findFirst({
            where: {
                userId: req.user.userId,
                tenantId,
                role: { in: [Role.TENANT_ADMIN, Role.TENANT_EDITOR] },
            },
        });

        if (!membership) {
            next(new ForbiddenError("No access to this tenant"));
            return;
        }

        next();
    };
}
