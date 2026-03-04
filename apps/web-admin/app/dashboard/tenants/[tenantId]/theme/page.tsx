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
        <>
            <header className="page-header">
                <div>
                    <h1>Editor de Tema</h1>
                    <p className="page-header-sub">
                        {tenant?.name} · {activeTheme ? `Versão ${activeTheme.version}` : "Tema padrão"}
                    </p>
                </div>
                <a href={`/dashboard/tenants/${tenantId}`} className="btn btn-ghost">← Tenant</a>
            </header>
            <div className="page-body">
                <ThemeEditor tenantId={tenantId} initialTokens={tokens} />
            </div>
        </>
    );
}
