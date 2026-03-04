import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";
import { authenticate, getParam } from "../middleware/auth.js";
import { requireAgencyAccess } from "../middleware/rbac.js";

const router = Router();

// =============================================================
// GET /api/agencies/:agencyId/billing/status — Subscription status
// =============================================================

router.get(
    "/:agencyId/billing/status",
    authenticate,
    requireAgencyAccess("agencyId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencyId = getParam(req, "agencyId");

            const subscription = await prisma.subscription.findUnique({
                where: { agencyId },
            });

            const agency = await prisma.agency.findUnique({
                where: { id: agencyId },
                select: { planTier: true, stripeCustomerId: true },
            });

            res.json({
                subscription: subscription || null,
                planTier: agency?.planTier || "STARTER",
                hasStripeCustomer: !!agency?.stripeCustomerId,
            });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// POST /api/agencies/:agencyId/billing/checkout — Create checkout session
// =============================================================

router.post(
    "/:agencyId/billing/checkout",
    authenticate,
    requireAgencyAccess("agencyId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencyId = getParam(req, "agencyId");
            const { planTier } = req.body;

            // Skeleton: In production, this would create a Stripe Checkout session
            // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
            // const session = await stripe.checkout.sessions.create({...});

            res.json({
                message: "Stripe Checkout skeleton — configure STRIPE_SECRET_KEY to activate",
                agencyId,
                requestedPlan: planTier || "GROWTH",
                checkoutUrl: null, // session.url in production
            });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/agencies/:agencyId/billing/portal — Stripe portal link
// =============================================================

router.get(
    "/:agencyId/billing/portal",
    authenticate,
    requireAgencyAccess("agencyId"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const agencyId = getParam(req, "agencyId");

            const agency = await prisma.agency.findUnique({
                where: { id: agencyId },
                select: { stripeCustomerId: true },
            });

            if (!agency?.stripeCustomerId) {
                res.json({
                    message: "No Stripe customer — use checkout first",
                    portalUrl: null,
                });
                return;
            }

            // Skeleton: In production, create portal session
            // const session = await stripe.billingPortal.sessions.create({...});

            res.json({
                message: "Stripe Portal skeleton — configure STRIPE_SECRET_KEY to activate",
                portalUrl: null, // session.url in production
            });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
