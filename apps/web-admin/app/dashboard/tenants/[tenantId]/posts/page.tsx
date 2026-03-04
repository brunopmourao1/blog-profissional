import { prisma } from "@repo/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Posts — Admin",
    description: "Gerenciar posts do tenant",
};

interface PostsPageProps {
    params: Promise<{ tenantId: string }>;
}

export default async function PostsPage({ params }: PostsPageProps) {
    const { tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, slug: true },
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
        <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Posts</h1>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{tenant?.name}</p>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <a href={`/dashboard/tenants/${tenantId}`} style={{ color: "#6366f1", textDecoration: "none" }}>← Tenant</a>
                    <a
                        href={`/dashboard/tenants/${tenantId}/posts/new`}
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
                        + Novo Post
                    </a>
                </div>
            </div>

            {posts.length === 0 ? (
                <p style={{ color: "#6b7280" }}>Nenhum post criado.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {posts.map((post) => (
                        <a
                            key={post.id}
                            href={`/dashboard/tenants/${tenantId}/posts/${post.id}`}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "1rem 1.5rem",
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                                backgroundColor: "#fff",
                                textDecoration: "none",
                                color: "inherit",
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600 }}>{post.title}</div>
                                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                                    {post.author.name} · {post.categories.map((c) => c.name).join(", ") || "Sem categoria"} ·{" "}
                                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : "Rascunho"}
                                </div>
                            </div>
                            <span
                                style={{
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: 999,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    backgroundColor: post.status === "PUBLISHED" ? "#dcfce7" : "#fef3c7",
                                    color: post.status === "PUBLISHED" ? "#166534" : "#92400e",
                                }}
                            >
                                {post.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                            </span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
