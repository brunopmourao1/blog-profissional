import { prisma } from "@repo/db";
import type { Metadata } from "next";
import { HomepageEditor } from "./HomepageEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Editor de Homepage — Admin",
};

interface HomepagePageProps {
    params: Promise<{ tenantId: string }>;
}

export default async function HomepagePage({ params }: HomepagePageProps) {
    const { tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true },
    });

    const activeHome = await prisma.homeRevision.findFirst({
        where: { tenantId, active: true },
    });

    const sections = (activeHome?.sections as Array<Record<string, unknown>>) || [];

    return (
        <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Editor de Homepage</h1>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        {tenant?.name} · {activeHome ? `Versão ${activeHome.version}` : "Padrão"}
                    </p>
                </div>
                <a href={`/dashboard/tenants/${tenantId}`} style={{ color: "#6366f1", textDecoration: "none" }}>← Tenant</a>
            </div>
            <HomepageEditor tenantId={tenantId} initialSections={sections} />
        </div>
    );
}
