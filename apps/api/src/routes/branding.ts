import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";
import { authenticate, getParam } from "../middleware/auth.js";
import { requireAgencyAccess } from "../middleware/rbac.js";

const router = Router();

// =============================================================
// GET /api/agencies/:agencyId/branding — Get branding
// =============================================================

router.get(
    "/:agencyId/branding",
    authenticate,
    requireAgencyAccess("agencyId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencyId = getParam(req, "agencyId");

            const branding = await prisma.agencyBranding.findUnique({
                where: { agencyId },
            });

            res.json({
                branding: branding || {
                    agencyId,
                    logo: null,
                    primaryColor: "#6366f1",
                    panelDomain: null,
                },
            });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// PUT /api/agencies/:agencyId/branding — Update branding
// =============================================================

router.put(
    "/:agencyId/branding",
    authenticate,
    requireAgencyAccess("agencyId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencyId = getParam(req, "agencyId");
            const { logo, primaryColor, panelDomain } = req.body;

            const branding = await prisma.agencyBranding.upsert({
                where: { agencyId },
                update: { logo, primaryColor, panelDomain },
                create: { agencyId, logo, primaryColor, panelDomain },
            });

            res.json({ branding });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
