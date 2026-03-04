import { prisma } from "@repo/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Tenant — Admin",
    description: "Detalhe do tenant",
};

interface TenantDetailProps {
    params: Promise<{ tenantId: string }>;
}

export default async function TenantDetailPage({ params }: TenantDetailProps) {
    const { tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
            _count: { select: { posts: true } },
        },
    });

    if (!tenant) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h1>Tenant não encontrado</h1>
                <a href="/dashboard/tenants">← Voltar</a>
            </div>
        );
    }

    const postCount = tenant._count.posts;

    const theme = await prisma.themeRevision.findFirst({
        where: { tenantId, active: true },
    });

    const homepage = await prisma.homeRevision.findFirst({
        where: { tenantId, active: true },
    });

    return (
        <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>{tenant.name}</h1>
                    <p style={{ color: "#6b7280" }}>/{tenant.slug}</p>
                </div>
                <a href="/dashboard/tenants" style={{ color: "#6366f1", textDecoration: "none" }}>← Tenants</a>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem",
                }}
            >
                <StatCard label="Posts" value={String(postCount)} />
                <StatCard label="Tema" value={theme ? `v${theme.version}` : "Padrão"} />
                <StatCard label="Homepage" value={homepage ? `v${homepage.version}` : "Padrão"} />
                <StatCard label="Status" value={tenant.active ? "✅ Ativo" : "❌ Inativo"} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <NavLink href={`/dashboard/tenants/${tenantId}/posts`} label="📝 Gerenciar Posts" />
                <NavLink href={`/dashboard/tenants/${tenantId}/theme`} label="🎨 Editor de Tema" />
                <NavLink href={`/dashboard/tenants/${tenantId}/homepage`} label="🏠 Editor de Homepage" />
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                padding: "1.25rem",
                borderRadius: 8,
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>{label}</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{value}</div>
        </div>
    );
}

function NavLink({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            style={{
                display: "block",
                padding: "1rem 1.5rem",
                borderRadius: 8,
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                color: "#111827",
                fontWeight: 500,
            }}
        >
            {label}
        </a>
    );
}
