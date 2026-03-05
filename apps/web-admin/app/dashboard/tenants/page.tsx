import { prisma } from "@repo/db";
import type { Metadata } from "next";
import { TenantsListClient } from "./TenantsListClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Tenants — Admin",
    description: "Gerencie seus blogs",
};

export default async function TenantsPage() {
    const tenants = await prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            slug: true,
            active: true,
            agencyId: true,
            createdAt: true,
            _count: { select: { posts: true } },
        },
        take: 50,
    });

    const agencyId = tenants[0]?.agencyId || "";

    return (
        <TenantsListClient
            agencyId={agencyId}
            tenants={tenants.map((t) => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                active: t.active,
                postCount: t._count.posts,
            }))}
        />
    );
}
