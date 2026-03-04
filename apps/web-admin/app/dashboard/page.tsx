import { prisma } from "@repo/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Dashboard — Admin",
    description: "Painel administrativo da agência",
};

export default async function DashboardPage() {
    const stats = await prisma.agency.findFirst({
        select: {
            name: true,
            planTier: true,
            _count: {
                select: {
                    tenants: true,
                    memberships: true,
                },
            },
        },
    });

    const recentPosts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            tenant: { select: { name: true, id: true } },
        },
    });

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="page-header-sub">Visão geral da agência</p>
                </div>
            </header>

            <div className="page-body stack stack-lg">
                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-label">Plano</div>
                        <div className="stat-value">{stats?.planTier || "—"}</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-label">Blogs</div>
                        <div className="stat-value">{stats?._count.tenants || 0}</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-label">Membros</div>
                        <div className="stat-value">{stats?._count.memberships || 0}</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-label">Posts total</div>
                        <div className="stat-value">{recentPosts.length}</div>
                    </div>
                </div>

                <div>
                    <div className="section-header">
                        <h2 className="section-title">Últimos Posts</h2>
                    </div>
                    <div className="stack stack-sm">
                        {recentPosts.map((post) => (
                            <a key={post.id} href={`/dashboard/tenants/${post.tenant.id}/posts/${post.id}`} className="list-item">
                                <div>
                                    <div className="list-item-title">{post.title}</div>
                                    <div className="list-item-sub">
                                        {post.tenant.name} · {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                                    </div>
                                </div>
                                <span className={`badge ${post.status === "PUBLISHED" ? "badge-success" : "badge-warning"}`}>
                                    {post.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
