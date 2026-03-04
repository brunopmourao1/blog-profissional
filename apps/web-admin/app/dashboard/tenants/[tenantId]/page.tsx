import { prisma } from "@repo/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Tenant — Admin",
};

interface TenantDetailProps {
    params: Promise<{ tenantId: string }>;
}

export default async function TenantDetailPage({ params }: TenantDetailProps) {
    const { tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { _count: { select: { posts: true } } },
    });

    if (!tenant) {
        return (
            <div className="page-body" style={{ textAlign: "center" }}>
                <h1>Tenant não encontrado</h1>
                <a href="/dashboard/tenants" className="btn btn-outline" style={{ marginTop: "1rem" }}>← Voltar</a>
            </div>
        );
    }

    const theme = await prisma.themeRevision.findFirst({
        where: { tenantId, active: true },
    });

    const homepage = await prisma.homeRevision.findFirst({
        where: { tenantId, active: true },
    });

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>{tenant.name}</h1>
                    <p className="page-header-sub">/{tenant.slug}</p>
                </div>
                <a href="/dashboard/tenants" className="btn btn-ghost">← Tenants</a>
            </header>

            <div className="page-body stack stack-lg">
                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-label">Posts</div>
                        <div className="stat-value">{tenant._count.posts}</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-label">Tema</div>
                        <div className="stat-value">{theme ? `v${theme.version}` : "Padrão"}</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-label">Homepage</div>
                        <div className="stat-value">{homepage ? `v${homepage.version}` : "Padrão"}</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-label">Status</div>
                        <div className="stat-value">{tenant.active ? "✅ Ativo" : "❌ Inativo"}</div>
                    </div>
                </div>

                <div className="stack stack-sm">
                    <a href={`/dashboard/tenants/${tenantId}/posts`} className="list-item card-clickable">
                        <div className="list-item-title">📝 Gerenciar Posts</div>
                        <span style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>→</span>
                    </a>
                    <a href={`/dashboard/tenants/${tenantId}/theme`} className="list-item card-clickable">
                        <div className="list-item-title">🎨 Editor de Tema</div>
                        <span style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>→</span>
                    </a>
                    <a href={`/dashboard/tenants/${tenantId}/homepage`} className="list-item card-clickable">
                        <div className="list-item-title">🏠 Editor de Homepage</div>
                        <span style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>→</span>
                    </a>
                </div>
            </div>
        </>
    );
}
