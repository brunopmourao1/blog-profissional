// Definição dos planos de assinatura

export type PlanTier = "STARTER" | "GROWTH" | "UNLIMITED";

export interface Plan {
    tier: PlanTier;
    name: string;
    priceMonthlyBRL: number;
    maxTenants: number;
    maxPostsPerTenant: number;
    maxHomeSections: number;
    customDomain: boolean;
    whiteLabel: boolean;
    fullCustomization: boolean;
}

export const PLANS: Record<PlanTier, Plan> = {
    STARTER: {
        tier: "STARTER",
        name: "Starter",
        priceMonthlyBRL: 297,
        maxTenants: 5,
        maxPostsPerTenant: 100,
        maxHomeSections: 3,
        customDomain: false,
        whiteLabel: false,
        fullCustomization: false,
    },
    GROWTH: {
        tier: "GROWTH",
        name: "Growth",
        priceMonthlyBRL: 697,
        maxTenants: 20,
        maxPostsPerTenant: -1, // ilimitado
        maxHomeSections: 6,
        customDomain: true,
        whiteLabel: false,
        fullCustomization: true,
    },
    UNLIMITED: {
        tier: "UNLIMITED",
        name: "Unlimited",
        priceMonthlyBRL: 1497,
        maxTenants: -1, // ilimitado
        maxPostsPerTenant: -1, // ilimitado
        maxHomeSections: -1, // ilimitado
        customDomain: true,
        whiteLabel: true,
        fullCustomization: true,
    },
};
