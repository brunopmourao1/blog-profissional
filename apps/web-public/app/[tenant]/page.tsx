import { prisma, PostStatus } from "@repo/db";
import { DEFAULT_HOME_SECTIONS, type HomeSection } from "@repo/config";
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

// =============================================================
// Section Components
// =============================================================

function HeroSection({ section }: { section: HomeSection }) {
    return (
        <section
            style={{
                textAlign: "center",
                padding: "3rem 0",
                borderBottom: "1px solid var(--color-muted, #e5e7eb)",
                marginBottom: "2rem",
            }}
        >
            <h1
                style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-heading)",
                    marginBottom: "0.5rem",
                }}
            >
                {section.config.title || "Blog"}
            </h1>
            {section.config.subtitle && (
                <p style={{ color: "var(--color-muted, #6b7280)", fontSize: "1.125rem" }}>
                    {section.config.subtitle}
                </p>
            )}
            {section.config.ctaText && section.config.ctaUrl && (
                <a
                    href={section.config.ctaUrl}
                    style={{
                        display: "inline-block",
                        marginTop: "1rem",
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "var(--color-primary, #6366f1)",
                        color: "#fff",
                        borderRadius: "var(--layout-border-radius, 8px)",
                        textDecoration: "none",
                        fontWeight: 600,
                    }}
                >
                    {section.config.ctaText}
                </a>
            )}
        </section>
    );
}

interface PostItem {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: Date | null;
    author: { name: string };
}

function PostGrid({
    posts,
    tenantSlug,
    layout,
}: {
    posts: PostItem[];
    tenantSlug: string;
    layout: string;
}) {
    if (posts.length === 0) {
        return <p style={{ color: "var(--color-muted, #6b7280)" }}>Nenhum artigo.</p>;
    }

    const isGrid = layout === "grid";

    return (
        <div
            style={{
                display: isGrid ? "grid" : "flex",
                gridTemplateColumns: isGrid ? "repeat(auto-fill, minmax(280px, 1fr))" : undefined,
                flexDirection: isGrid ? undefined : "column",
                gap: "1.5rem",
            }}
        >
            {posts.map((post) => (
                <article
                    key={post.id}
                    style={{
                        borderBottom: isGrid ? undefined : "1px solid #f3f4f6",
                        paddingBottom: isGrid ? undefined : "1.5rem",
                    }}
                >
                    {post.coverImage && isGrid && (
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            style={{
                                width: "100%",
                                height: 160,
                                objectFit: "cover",
                                borderRadius: "var(--layout-border-radius, 8px)",
                                marginBottom: "0.75rem",
                            }}
                        />
                    )}
                    <a
                        href={`/${tenantSlug}/${post.slug}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                            {post.title}
                        </h3>
                    </a>
                    {post.excerpt && (
                        <p style={{ color: "var(--color-muted, #6b7280)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                            {post.excerpt}
                        </p>
                    )}
                    <div style={{ fontSize: "0.8rem", color: "var(--color-muted, #9ca3af)", marginTop: "0.25rem" }}>
                        {post.author.name} ·{" "}
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : ""}
                    </div>
                </article>
            ))}
        </div>
    );
}

function NewsletterSection({ section }: { section: HomeSection }) {
    return (
        <section
            style={{
                textAlign: "center",
                padding: "2rem",
                backgroundColor: "#f9fafb",
                borderRadius: "var(--layout-border-radius, 8px)",
                marginBottom: "2rem",
            }}
        >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                {section.config.title || "Newsletter"}
            </h2>
            {section.config.subtitle && (
                <p style={{ color: "var(--color-muted, #6b7280)", marginBottom: "1rem" }}>
                    {section.config.subtitle}
                </p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", maxWidth: 400, margin: "0 auto" }}>
                <input
                    type="email"
                    placeholder="seu@email.com"
                    style={{
                        flex: 1,
                        padding: "0.5rem 1rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "var(--layout-border-radius, 8px)",
                    }}
                />
                <button
                    style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "var(--color-primary, #6366f1)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--layout-border-radius, 8px)",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Inscrever
                </button>
            </div>
        </section>
    );
}

// =============================================================
// Page Component
// =============================================================

export default async function TenantHomePage({ params }: TenantPageProps) {
    const { tenant: slug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug, active: true },
        select: { id: true, name: true },
    });

    if (!tenant) notFound();

    // Load active homepage or defaults
    const homeRevision = await prisma.homeRevision.findFirst({
        where: { tenantId: tenant.id, active: true },
        select: { sections: true },
    });

    const sections = (homeRevision?.sections as HomeSection[]) || DEFAULT_HOME_SECTIONS;
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);

    // Pre-fetch posts for all sections that need them
    const allPublishedPosts = await prisma.post.findMany({
        where: { tenantId: tenant.id, status: PostStatus.PUBLISHED },
        include: { author: { select: { name: true } } },
        orderBy: { publishedAt: "desc" },
        take: 50,
    });

    return (
        <div>
            {sortedSections.map((section, i) => {
                switch (section.type) {
                    case "hero":
                        return <HeroSection key={i} section={section} />;

                    case "latest-posts":
                        return (
                            <section key={i} style={{ marginBottom: "2rem" }}>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
                                    {section.config.title || "Últimos artigos"}
                                </h2>
                                <PostGrid
                                    posts={allPublishedPosts.slice(0, section.config.limit || 6)}
                                    tenantSlug={slug}
                                    layout={section.config.layout || "grid"}
                                />
                            </section>
                        );

                    case "category-posts": {
                        const categoryPosts = section.config.categoryId
                            ? allPublishedPosts.filter(() => true) // would need category relation
                            : allPublishedPosts;
                        return (
                            <section key={i} style={{ marginBottom: "2rem" }}>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
                                    {section.config.title || "Artigos"}
                                </h2>
                                <PostGrid
                                    posts={categoryPosts.slice(0, section.config.limit || 6)}
                                    tenantSlug={slug}
                                    layout={section.config.layout || "grid"}
                                />
                            </section>
                        );
                    }

                    case "featured":
                        return (
                            <section key={i} style={{ marginBottom: "2rem" }}>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
                                    {section.config.title || "Destaques"}
                                </h2>
                                <PostGrid
                                    posts={allPublishedPosts.slice(0, section.config.limit || 3)}
                                    tenantSlug={slug}
                                    layout={section.config.layout || "grid"}
                                />
                            </section>
                        );

                    case "newsletter":
                        return <NewsletterSection key={i} section={section} />;

                    default:
                        return null;
                }
            })}
        </div>
    );
}
