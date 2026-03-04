import { prisma } from "@repo/db";
import type { Metadata } from "next";
import { ToggleButton } from "./ToggleButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Tenants — Admin",
    description: "Gerencie seus blogs",
};

export default async function TenantsPage() {
    const tenants = await prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            slug: true,
            active: true,
            agencyId: true,
            createdAt: true,
            _count: { select: { posts: true } },
        },
        take: 50,
    });

    const agencyId = tenants[0]?.agencyId || "";

    return (
        <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Tenants</h1>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <a href="/dashboard" style={{ color: "#6366f1", textDecoration: "none" }}>← Dashboard</a>
                    <a
                        href={`/dashboard/tenants/new?agencyId=${agencyId}`}
                        style={{
                            padding: "0.5rem 1.25rem",
                            backgroundColor: "#6366f1",
                            color: "#fff",
                            borderRadius: 8,
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                        }}
                    >
                        + Novo Tenant
                    </a>
                </div>
            </div>

            {tenants.length === 0 ? (
                <p style={{ color: "#6b7280" }}>Nenhum tenant criado.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {tenants.map((t) => (
                        <div
                            key={t.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "1rem 1.5rem",
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                                backgroundColor: "#fff",
                            }}
                        >
                            <a
                                href={`/dashboard/tenants/${t.id}`}
                                style={{ textDecoration: "none", color: "inherit", flex: 1 }}
                            >
                                <div style={{ fontWeight: 600 }}>{t.name}</div>
                                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                    /{t.slug} · {t._count.posts} posts
                                </div>
                            </a>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <ToggleButton tenantId={t.id} active={t.active} />
                                <span
                                    style={{
                                        padding: "0.25rem 0.75rem",
                                        borderRadius: 999,
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        backgroundColor: t.active ? "#dcfce7" : "#fef2f2",
                                        color: t.active ? "#166534" : "#991b1b",
                                    }}
                                >
                                    {t.active ? "Ativo" : "Inativo"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
