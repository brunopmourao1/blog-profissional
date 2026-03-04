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
        <>
            <header className="page-header">
                <div>
                    <h1>Editor de Homepage</h1>
                    <p className="page-header-sub">
                        {tenant?.name} · {activeHome ? `Versão ${activeHome.version}` : "Padrão"}
                    </p>
                </div>
                <a href={`/dashboard/tenants/${tenantId}`} className="btn btn-ghost">← Tenant</a>
            </header>
            <div className="page-body">
                <HomepageEditor tenantId={tenantId} initialSections={sections} />
            </div>
        </>
    );
}
