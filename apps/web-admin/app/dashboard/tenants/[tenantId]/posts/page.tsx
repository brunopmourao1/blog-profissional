import { prisma } from "@repo/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Posts — Admin",
};

interface PostsPageProps {
    params: Promise<{ tenantId: string }>;
}

export default async function PostsPage({ params }: PostsPageProps) {
    const { tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true },
    });

    const posts = await prisma.post.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        include: {
            author: { select: { name: true } },
            categories: { select: { name: true } },
        },
        take: 50,
    });

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Posts</h1>
                    <p className="page-header-sub">{tenant?.name} · {posts.length} post(s)</p>
                </div>
                <div className="row gap-sm">
                    <a href={`/dashboard/tenants/${tenantId}`} className="btn btn-ghost">← Tenant</a>
                    <a href={`/dashboard/tenants/${tenantId}/posts/new`} className="btn btn-primary">+ Novo Post</a>
                </div>
            </header>

            <div className="page-body">
                {posts.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>Nenhum post criado.</p>
                ) : (
                    <div className="stack stack-sm">
                        {posts.map((post) => (
                            <a key={post.id} href={`/dashboard/tenants/${tenantId}/posts/${post.id}`} className="list-item">
                                <div>
                                    <div className="list-item-title">{post.title}</div>
                                    <div className="list-item-sub">
                                        {post.author.name} · {post.categories.map((c) => c.name).join(", ") || "Sem categoria"} ·{" "}
                                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : "Rascunho"}
                                    </div>
                                </div>
                                <span className={`badge ${post.status === "PUBLISHED" ? "badge-success" : "badge-warning"}`}>
                                    {post.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                                </span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
