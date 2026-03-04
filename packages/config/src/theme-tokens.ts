import { z } from "zod";

// =============================================================
// Design Token Schema
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

// =============================================================
// Default Theme Tokens
// =============================================================

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

// =============================================================
// Tokens → CSS Custom Properties
// =============================================================

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
