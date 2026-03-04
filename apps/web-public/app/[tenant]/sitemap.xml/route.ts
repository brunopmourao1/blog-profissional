import { prisma, PostStatus } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ tenant: string }> },
) {
    const { tenant: tenantSlug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug, active: true },
        select: { id: true, slug: true },
    });

    if (!tenant) {
        return new NextResponse("Not found", { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    const posts = await prisma.post.findMany({
        where: { tenantId: tenant.id, status: PostStatus.PUBLISHED },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: "desc" },
    });

    const categories = await prisma.category.findMany({
        where: { tenantId: tenant.id },
        select: { slug: true },
    });

    const tags = await prisma.tag.findMany({
        where: { tenantId: tenant.id },
        select: { slug: true },
    });

    const urls = [
        // Homepage
        `<url><loc>${baseUrl}/${tenantSlug}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
        // Posts
        ...posts.map(
            (p) =>
                `<url><loc>${baseUrl}/${tenantSlug}/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
        ),
        // Categories
        ...categories.map(
            (c) =>
                `<url><loc>${baseUrl}/${tenantSlug}/category/${c.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
        ),
        // Tags
        ...tags.map(
            (t) =>
                `<url><loc>${baseUrl}/${tenantSlug}/tag/${t.slug}</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>`,
        ),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
