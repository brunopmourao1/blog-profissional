import { prisma, PostStatus } from "@repo/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface TagPageProps {
    params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({
    params,
}: TagPageProps): Promise<Metadata> {
    const { tenant: tenantSlug, slug } = await params;
    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
    });
    if (!tenant) return {};

    const tag = await prisma.tag.findUnique({
        where: { tenantId_slug: { tenantId: tenant.id, slug } },
        select: { name: true },
    });
    if (!tag) return {};

    return {
        title: `#${tag.name}`,
        description: `Artigos com a tag ${tag.name}`,
    };
}

export default async function TagPage({ params }: TagPageProps) {
    const { tenant: tenantSlug, slug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug, active: true },
        select: { id: true },
    });
    if (!tenant) notFound();

    const tag = await prisma.tag.findUnique({
        where: { tenantId_slug: { tenantId: tenant.id, slug } },
        select: { name: true },
    });
    if (!tag) notFound();

    const posts = await prisma.post.findMany({
        where: {
            tenantId: tenant.id,
            status: PostStatus.PUBLISHED,
            tags: { some: { slug } },
        },
        include: {
            author: { select: { name: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 50,
    });

    return (
        <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>
                #{tag.name}
            </h1>

            {posts.length === 0 ? (
                <p style={{ color: "#6b7280" }}>Nenhum artigo com esta tag.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem" }}
                        >
                            <a
                                href={`/${tenantSlug}/${post.slug}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                                    {post.title}
                                </h2>
                            </a>
                            {post.excerpt && (
                                <p style={{ color: "#6b7280", lineHeight: 1.6 }}>{post.excerpt}</p>
                            )}
                            <div style={{ fontSize: "0.875rem", color: "#9ca3af", marginTop: "0.25rem" }}>
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
