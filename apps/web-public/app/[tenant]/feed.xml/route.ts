import { prisma, PostStatus } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ tenant: string }> },
) {
    const { tenant: tenantSlug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug, active: true },
        select: { id: true, name: true, slug: true },
    });

    if (!tenant) {
        return new NextResponse("Not found", { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    const posts = await prisma.post.findMany({
        where: { tenantId: tenant.id, status: PostStatus.PUBLISHED },
        include: { author: { select: { name: true } } },
        orderBy: { publishedAt: "desc" },
        take: 50,
    });

    const items = posts
        .map(
            (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/${tenantSlug}/${post.slug}</link>
      <description><![CDATA[${post.excerpt || ""}]]></description>
      <author>${post.author.name}</author>
      <pubDate>${post.publishedAt ? post.publishedAt.toUTCString() : ""}</pubDate>
      <guid isPermaLink="true">${baseUrl}/${tenantSlug}/${post.slug}</guid>
    </item>`,
        )
        .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${tenant.name}</title>
    <link>${baseUrl}/${tenantSlug}</link>
    <description>Blog ${tenant.name}</description>
    <language>pt-BR</language>
    <atom:link href="${baseUrl}/${tenantSlug}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
