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
        <>
            <header className="page-header">
                <div>
                    <h1>Blogs / Tenants</h1>
                    <p className="page-header-sub">{tenants.length} blog(s) registrado(s)</p>
                </div>
                <a href={`/dashboard/tenants/new?agencyId=${agencyId}`} className="btn btn-primary">
                    + Novo Blog
                </a>
            </header>

            <div className="page-body">
                {tenants.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>Nenhum blog criado.</p>
                ) : (
                    <div className="stack stack-sm">
                        {tenants.map((t) => (
                            <div key={t.id} className="list-item">
                                <a href={`/dashboard/tenants/${t.id}`} style={{ flex: 1, textDecoration: "none", color: "inherit" }}>
                                    <div className="list-item-title">{t.name}</div>
                                    <div className="list-item-sub">/{t.slug} · {t._count.posts} posts</div>
                                </a>
                                <div className="row gap-sm">
                                    <ToggleButton tenantId={t.id} active={t.active} />
                                    <span className={`badge ${t.active ? "badge-success" : "badge-danger"}`}>
                                        {t.active ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
