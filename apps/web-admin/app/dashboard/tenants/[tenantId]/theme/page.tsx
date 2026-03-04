import { prisma } from "@repo/db";
import type { Metadata } from "next";
import { DEFAULT_THEME_TOKENS } from "@repo/config";
import { ThemeEditor } from "./ThemeEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Editor de Tema — Admin",
};

interface ThemePageProps {
    params: Promise<{ tenantId: string }>;
}

export default async function ThemePage({ params }: ThemePageProps) {
    const { tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true },
    });

    const activeTheme = await prisma.themeRevision.findFirst({
        where: { tenantId, active: true },
    });

    const tokens = (activeTheme?.tokens as Record<string, unknown>) || DEFAULT_THEME_TOKENS;

    return (
        <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Editor de Tema</h1>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        {tenant?.name} · {activeTheme ? `Versão ${activeTheme.version}` : "Tema padrão"}
                    </p>
                </div>
                <a href={`/dashboard/tenants/${tenantId}`} style={{ color: "#6366f1", textDecoration: "none" }}>← Tenant</a>
            </div>
            <ThemeEditor tenantId={tenantId} initialTokens={tokens} />
        </div>
    );
}
