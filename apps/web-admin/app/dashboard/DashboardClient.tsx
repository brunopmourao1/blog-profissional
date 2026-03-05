"use client";

import { AnimatedCard } from "../components/AnimatedCard";
import { AnimatedLayout } from "../components/AnimatedLayout";
import { AnimatedList, AnimatedListItem } from "../components/AnimatedList";

interface DashboardClientProps {
    stats: {
        planTier: string;
        tenants: number;
        members: number;
        posts: number;
    };
    recentPosts: {
        id: string;
        title: string;
        status: string;
        createdAt: string;
        tenantId: string;
        tenantName: string;
    }[];
}

export function DashboardClient({ stats, recentPosts }: DashboardClientProps) {
    return (
        <AnimatedLayout>
            <header className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="page-header-sub">Visão geral da agência</p>
                </div>
            </header>

            <div className="page-body stack stack-lg">
                <div className="stats-grid">
                    {[
                        { label: "Plano", value: stats.planTier || "—" },
                        { label: "Blogs", value: stats.tenants },
                        { label: "Membros", value: stats.members },
                        { label: "Posts total", value: stats.posts },
                    ].map((stat, i) => (
                        <AnimatedCard key={stat.label} className="card stat-card" index={i}>
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value">{stat.value}</div>
                        </AnimatedCard>
                    ))}
                </div>

                <div>
                    <div className="section-header">
                        <h2 className="section-title">Últimos Posts</h2>
                    </div>
                    <AnimatedList className="stack stack-sm">
                        {recentPosts.map((post) => (
                            <AnimatedListItem key={post.id}>
                                <a
                                    href={`/dashboard/tenants/${post.tenantId}/posts/${post.id}`}
                                    className="list-item"
                                >
                                    <div>
                                        <div className="list-item-title">{post.title}</div>
                                        <div className="list-item-sub">
                                            {post.tenantName} · {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                                        </div>
                                    </div>
                                    <span
                                        className={`badge ${post.status === "PUBLISHED" ? "badge-success" : "badge-warning"}`}
                                    >
                                        {post.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                                    </span>
                                </a>
                            </AnimatedListItem>
                        ))}
                    </AnimatedList>
                </div>
            </div>
        </AnimatedLayout>
    );
}
