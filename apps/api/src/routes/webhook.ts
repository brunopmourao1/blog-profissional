import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma, type PlanTier } from "@repo/db";
import { logger } from "../lib/logger.js";

const router = Router();

// =============================================================
// POST /webhooks/stripe — Handle Stripe webhook events
// =============================================================

router.post(
    "/stripe",
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        // In production, verify Stripe signature:
        // const sig = req.headers['stripe-signature'];
        // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

        const event = req.body;

        logger.info("Stripe webhook received", { type: event.type });

        try {
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data?.object;
                    if (session?.metadata?.agencyId) {
                        await prisma.subscription.upsert({
                            where: { agencyId: session.metadata.agencyId },
                            update: {
                                stripeSubId: session.subscription,
                                status: "ACTIVE",
                            },
                            create: {
                                agencyId: session.metadata.agencyId,
                                stripeSubId: session.subscription,
                                status: "ACTIVE",
                            },
                        });
                        logger.info("Subscription activated", {
                            agencyId: session.metadata.agencyId,
                        });
                    }
                    break;
                }

                case "customer.subscription.updated": {
                    const sub = event.data?.object;
                    if (sub?.id) {
                        const existing = await prisma.subscription.findUnique({
                            where: { stripeSubId: sub.id },
                        });
                        if (existing) {
                            const statusMap: Record<string, PlanTier> = {
                                active: "STARTER",
                                past_due: "STARTER",
                            };
                            await prisma.subscription.update({
                                where: { stripeSubId: sub.id },
                                data: {
                                    status:
                                        sub.status === "active"
                                            ? "ACTIVE"
                                            : sub.status === "past_due"
                                                ? "PAST_DUE"
                                                : "CANCELED",
                                    currentPeriodEnd: sub.current_period_end
                                        ? new Date(sub.current_period_end * 1000)
                                        : null,
                                },
                            });
                            logger.info("Subscription updated", {
                                subId: sub.id,
                                status: sub.status,
                            });
                        }
                    }
                    break;
                }

                case "customer.subscription.deleted": {
                    const sub = event.data?.object;
                    if (sub?.id) {
                        await prisma.subscription.updateMany({
                            where: { stripeSubId: sub.id },
                            data: { status: "CANCELED" },
                        });
                        logger.info("Subscription canceled", { subId: sub.id });
                    }
                    break;
                }

                default:
                    logger.info("Unhandled webhook event", { type: event.type });
            }

            res.json({ received: true });
        } catch (error) {
            logger.error("Webhook processing error", { error });
            res.status(500).json({ error: "Webhook processing failed" });
        }
    },
);

export default router;
