import { prisma, PostStatus } from "@repo/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface TenantPageProps {
    params: Promise<{ tenant: string }>;
}

export async function generateMetadata({
    params,
}: TenantPageProps): Promise<Metadata> {
    const { tenant: slug } = await params;
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { name: true },
    });

    if (!tenant) return {};
    return { title: tenant.name, description: `Últimos artigos do ${tenant.name}` };
}

export default async function TenantHomePage({ params }: TenantPageProps) {
    const { tenant: slug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug, active: true },
        select: { id: true, name: true },
    });

    if (!tenant) notFound();

    const posts = await prisma.post.findMany({
        where: { tenantId: tenant.id, status: PostStatus.PUBLISHED },
        include: {
            author: { select: { name: true } },
            categories: { select: { name: true, slug: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 20,
    });

    return (
        <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>
                Últimos artigos
            </h1>

            {posts.length === 0 ? (
                <p style={{ color: "#6b7280" }}>Nenhum artigo publicado ainda.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            style={{
                                borderBottom: "1px solid #f3f4f6",
                                paddingBottom: "1.5rem",
                            }}
                        >
                            {post.coverImage && (
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    style={{
                                        width: "100%",
                                        height: 200,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                        marginBottom: "1rem",
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    marginBottom: "0.5rem",
                                    flexWrap: "wrap",
                                }}
                            >
                                {post.categories.map((cat) => (
                                    <a
                                        key={cat.slug}
                                        href={`/${slug}/category/${cat.slug}`}
                                        style={{
                                            fontSize: "0.75rem",
                                            textTransform: "uppercase",
                                            color: "#6366f1",
                                            textDecoration: "none",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {cat.name}
                                    </a>
                                ))}
                            </div>
                            <a
                                href={`/${slug}/${post.slug}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <h2
                                    style={{
                                        fontSize: "1.5rem",
                                        fontWeight: 600,
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {post.title}
                                </h2>
                            </a>
                            {post.excerpt && (
                                <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
                                    {post.excerpt}
                                </p>
                            )}
                            <div
                                style={{
                                    fontSize: "0.875rem",
                                    color: "#9ca3af",
                                    marginTop: "0.5rem",
                                }}
                            >
                                {post.author.name} ·{" "}
                                {post.publishedAt
                                    ? new Date(post.publishedAt).toLocaleDateString("pt-BR")
                                    : ""}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
