import type { Metadata } from "next";
import { NewTenantForm } from "./NewTenantForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Novo Tenant — Admin",
};

interface NewTenantPageProps {
    searchParams: Promise<{ agencyId?: string }>;
}

export default async function NewTenantPage({ searchParams }: NewTenantPageProps) {
    const { agencyId } = await searchParams;

    return (
        <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Novo Tenant</h1>
                <a href="/dashboard/tenants" style={{ color: "#6366f1", textDecoration: "none" }}>← Voltar</a>
            </div>
            <NewTenantForm agencyId={agencyId || ""} />
        </div>
    );
}
