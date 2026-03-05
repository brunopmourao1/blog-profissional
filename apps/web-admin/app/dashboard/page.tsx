import { prisma } from "@repo/db";
import type { Metadata } from "next";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Dashboard — Admin",
    description: "Painel administrativo da agência",
};

export default async function DashboardPage() {
    const agency = await prisma.agency.findFirst({
        select: {
            name: true,
            planTier: true,
            _count: {
                select: {
                    tenants: true,
                    memberships: true,
                },
            },
        },
    });

    const recentPosts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            tenant: { select: { name: true, id: true } },
        },
    });

    return (
        <DashboardClient
            stats={{
                planTier: agency?.planTier || "—",
                tenants: agency?._count.tenants || 0,
                members: agency?._count.memberships || 0,
                posts: recentPosts.length,
            }}
            recentPosts={recentPosts.map((p) => ({
                id: p.id,
                title: p.title,
                status: p.status,
                createdAt: p.createdAt.toISOString(),
                tenantId: p.tenant.id,
                tenantName: p.tenant.name,
            }))}
        />
    );
}
