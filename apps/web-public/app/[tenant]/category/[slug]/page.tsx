import { prisma, PostStatus } from "@repo/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface CategoryPageProps {
    params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({
    params,
}: CategoryPageProps): Promise<Metadata> {
    const { tenant: tenantSlug, slug } = await params;
    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
    });
    if (!tenant) return {};

    const category = await prisma.category.findUnique({
        where: { tenantId_slug: { tenantId: tenant.id, slug } },
        select: { name: true, description: true },
    });
    if (!category) return {};

    return {
        title: category.name,
        description: category.description || `Artigos em ${category.name}`,
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { tenant: tenantSlug, slug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug, active: true },
        select: { id: true },
    });
    if (!tenant) notFound();

    const category = await prisma.category.findUnique({
        where: { tenantId_slug: { tenantId: tenant.id, slug } },
        select: { name: true, description: true },
    });
    if (!category) notFound();

    const posts = await prisma.post.findMany({
        where: {
            tenantId: tenant.id,
            status: PostStatus.PUBLISHED,
            categories: { some: { slug } },
        },
        include: {
            author: { select: { name: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 50,
    });

    return (
        <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                {category.name}
            </h1>
            {category.description && (
                <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
                    {category.description}
                </p>
            )}

            {posts.length === 0 ? (
                <p style={{ color: "#6b7280" }}>Nenhum artigo nesta categoria.</p>
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
