// @repo/config
// Constantes e configurações compartilhadas

import { z } from "zod";

// =============================================================
// Plans
// =============================================================

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
        maxPostsPerTenant: -1,
        maxHomeSections: 6,
        customDomain: true,
        whiteLabel: false,
        fullCustomization: true,
    },
    UNLIMITED: {
        tier: "UNLIMITED",
        name: "Unlimited",
        priceMonthlyBRL: 1497,
        maxTenants: -1,
        maxPostsPerTenant: -1,
        maxHomeSections: -1,
        customDomain: true,
        whiteLabel: true,
        fullCustomization: true,
    },
};

// =============================================================
// Theme Tokens
// =============================================================

export const themeTokensSchema = z.object({
    colors: z.object({
        primary: z.string().default("#6366f1"),
        accent: z.string().default("#f59e0b"),
        background: z.string().default("#ffffff"),
        text: z.string().default("#111827"),
        muted: z.string().default("#9ca3af"),
    }),
    fonts: z.object({
        heading: z.string().default("Inter"),
        body: z.string().default("Inter"),
    }),
    typography: z.object({
        baseSize: z.string().default("16px"),
        scaleRatio: z.number().default(1.25),
        lineHeight: z.number().default(1.6),
    }),
    layout: z.object({
        maxWidth: z.string().default("800px"),
        borderRadius: z.string().default("8px"),
        spacing: z.string().default("1rem"),
    }),
});

export type ThemeTokens = z.infer<typeof themeTokensSchema>;

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
    colors: {
        primary: "#6366f1",
        accent: "#f59e0b",
        background: "#ffffff",
        text: "#111827",
        muted: "#9ca3af",
    },
    fonts: {
        heading: "Inter",
        body: "Inter",
    },
    typography: {
        baseSize: "16px",
        scaleRatio: 1.25,
        lineHeight: 1.6,
    },
    layout: {
        maxWidth: "800px",
        borderRadius: "8px",
        spacing: "1rem",
    },
};

export function tokensToCssVars(tokens: ThemeTokens): string {
    return `
    --color-primary: ${tokens.colors.primary};
    --color-accent: ${tokens.colors.accent};
    --color-background: ${tokens.colors.background};
    --color-text: ${tokens.colors.text};
    --color-muted: ${tokens.colors.muted};
    --font-heading: '${tokens.fonts.heading}', system-ui, sans-serif;
    --font-body: '${tokens.fonts.body}', system-ui, sans-serif;
    --typography-base-size: ${tokens.typography.baseSize};
    --typography-scale-ratio: ${tokens.typography.scaleRatio};
    --typography-line-height: ${tokens.typography.lineHeight};
    --layout-max-width: ${tokens.layout.maxWidth};
    --layout-border-radius: ${tokens.layout.borderRadius};
    --layout-spacing: ${tokens.layout.spacing};
  `.trim();
}

// =============================================================
// Homepage Sections
// =============================================================

export const SECTION_TYPES = [
    "hero",
    "latest-posts",
    "category-posts",
    "featured",
    "newsletter",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const homeSectionSchema = z.object({
    type: z.enum(SECTION_TYPES),
    order: z.number().int().min(0),
    config: z
        .object({
            title: z.string().optional(),
            subtitle: z.string().optional(),
            ctaText: z.string().optional(),
            ctaUrl: z.string().optional(),
            limit: z.number().int().min(1).max(20).default(6),
            categoryId: z.string().optional(),
            layout: z.enum(["grid", "list", "carousel"]).default("grid"),
        })
        .default({}),
});

export type HomeSection = z.infer<typeof homeSectionSchema>;

export const homeRevisionSchema = z.object({
    sections: z.array(homeSectionSchema).min(1).max(20),
});

export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
    {
        type: "hero",
        order: 0,
        config: {
            title: "Bem-vindo ao Blog",
            subtitle: "Conteúdo atualizado para você",
            limit: 6,
            layout: "grid",
        },
    },
    {
        type: "latest-posts",
        order: 1,
        config: { title: "Últimos artigos", limit: 6, layout: "grid" },
    },
];
