import type { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { PLANS, type PlanTier } from "@repo/config";
import { ForbiddenError } from "../lib/errors.js";
import { getParam } from "./auth.js";

// =============================================================
// Plan Enforcement Middleware
// =============================================================

/**
 * Check if agency can create more tenants.
 */
export function enforceTenantLimit(agencyIdParam = "agencyId") {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const agencyId = getParam(req, agencyIdParam);

            const agency = await prisma.agency.findUnique({
                where: { id: agencyId },
                select: {
                    planTier: true,
                    _count: { select: { tenants: true } },
                },
            });

            if (!agency) {
                next();
                return;
            }

            const plan = PLANS[agency.planTier as PlanTier];
            if (
                plan.maxTenants !== -1 &&
                agency._count.tenants >= plan.maxTenants
            ) {
                next(
                    new ForbiddenError(
                        `Limite do plano ${plan.name}: máximo de ${plan.maxTenants} tenants. Faça upgrade para adicionar mais.`,
                    ),
                );
                return;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Check if tenant can create more posts.
 */
export function enforcePostLimit(tenantIdParam = "tenantId") {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const tenantId = getParam(req, tenantIdParam);

            const tenant = await prisma.tenant.findUnique({
                where: { id: tenantId },
                include: {
                    agency: { select: { planTier: true } },
                    _count: { select: { posts: true } },
                },
            });

            if (!tenant) {
                next();
                return;
            }

            const plan = PLANS[tenant.agency.planTier as PlanTier];
            if (
                plan.maxPostsPerTenant !== -1 &&
                tenant._count.posts >= plan.maxPostsPerTenant
            ) {
                next(
                    new ForbiddenError(
                        `Limite do plano ${plan.name}: máximo de ${plan.maxPostsPerTenant} posts por tenant. Faça upgrade para publicar mais.`,
                    ),
                );
                return;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Generates upgrade messages based on current plan limits.
 */
export function getUpgradeMessage(
    currentTier: PlanTier,
    feature: string,
): string {
    const plan = PLANS[currentTier];
    const upgrades: Record<string, string> = {
        STARTER: "Faça upgrade para o plano Growth para desbloquear este recurso.",
        GROWTH: "Faça upgrade para o plano Unlimited para acesso ilimitado.",
        UNLIMITED: "Você já está no plano máximo.",
    };
    return `${feature} não disponível no plano ${plan.name}. ${upgrades[currentTier]}`;
}
