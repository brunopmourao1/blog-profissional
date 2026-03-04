import { prisma, PostStatus } from "@repo/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PostPageProps {
    params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({
    params,
}: PostPageProps): Promise<Metadata> {
    const { tenant: tenantSlug, slug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true, name: true },
    });
    if (!tenant) return {};

    const post = await prisma.post.findUnique({
        where: {
            tenantId_slug: { tenantId: tenant.id, slug },
            status: PostStatus.PUBLISHED,
        },
        select: {
            title: true,
            excerpt: true,
            seoTitle: true,
            seoDescription: true,
            ogImage: true,
            coverImage: true,
        },
    });
    if (!post) return {};

    const title = post.seoTitle || post.title;
    const description = post.seoDescription || post.excerpt || "";
    const image = post.ogImage || post.coverImage;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            ...(image ? { images: [{ url: image }] } : {}),
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { tenant: tenantSlug, slug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug, active: true },
        select: { id: true, name: true },
    });
    if (!tenant) notFound();

    const post = await prisma.post.findUnique({
        where: {
            tenantId_slug: { tenantId: tenant.id, slug },
            status: PostStatus.PUBLISHED,
        },
        include: {
            author: { select: { name: true } },
            categories: { select: { name: true, slug: true } },
            tags: { select: { name: true, slug: true } },
        },
    });

    if (!post) notFound();

    return (
        <article>
            {post.coverImage && (
                <img
                    src={post.coverImage}
                    alt={post.title}
                    style={{
                        width: "100%",
                        maxHeight: 400,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: "1.5rem",
                    }}
                />
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                {post.categories.map((cat) => (
                    <a
                        key={cat.slug}
                        href={`/${tenantSlug}/category/${cat.slug}`}
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

            <h1 style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem" }}>
                {post.title}
            </h1>

            <div style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: "2rem" }}>
                {post.author.name} ·{" "}
                {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })
                    : ""}
            </div>

            <div
                style={{ lineHeight: 1.8, fontSize: "1.125rem", color: "#374151" }}
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.tags.length > 0 && (
                <div style={{ marginTop: "2rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {post.tags.map((tag) => (
                        <a
                            key={tag.slug}
                            href={`/${tenantSlug}/tag/${tag.slug}`}
                            style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: 999,
                                backgroundColor: "#f3f4f6",
                                color: "#4b5563",
                                fontSize: "0.875rem",
                                textDecoration: "none",
                            }}
                        >
                            #{tag.name}
                        </a>
                    ))}
                </div>
            )}

            {/* Schema.org Article */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        headline: post.title,
                        description: post.excerpt || "",
                        author: { "@type": "Person", name: post.author.name },
                        datePublished: post.publishedAt?.toISOString(),
                        image: post.coverImage || undefined,
                        publisher: { "@type": "Organization", name: tenant.name },
                    }),
                }}
            />
        </article>
    );
}
