import type { Metadata } from "next";
import { NewTenantForm } from "./NewTenantForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Novo Blog — Admin",
};

interface NewTenantPageProps {
    searchParams: Promise<{ agencyId?: string }>;
}

export default async function NewTenantPage({ searchParams }: NewTenantPageProps) {
    const { agencyId } = await searchParams;

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Novo Blog</h1>
                </div>
                <a href="/dashboard/tenants" className="btn btn-ghost">← Voltar</a>
            </header>
            <div className="page-body">
                <NewTenantForm agencyId={agencyId || ""} />
            </div>
        </>
    );
}
