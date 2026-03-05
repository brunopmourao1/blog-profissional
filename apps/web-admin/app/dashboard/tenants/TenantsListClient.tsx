"use client";

import { AnimatedLayout } from "../../components/AnimatedLayout";
import { AnimatedList, AnimatedListItem } from "../../components/AnimatedList";
import { ToggleButton } from "./ToggleButton";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    active: boolean;
    postCount: number;
}

interface TenantsListClientProps {
    tenants: Tenant[];
    agencyId: string;
}

export function TenantsListClient({ tenants, agencyId }: TenantsListClientProps) {
    return (
        <AnimatedLayout>
            <header className="page-header">
                <div>
                    <h1>Blogs / Tenants</h1>
                    <p className="page-header-sub">{tenants.length} blog(s) registrado(s)</p>
                </div>
                <a href={`/dashboard/tenants/new?agencyId=${agencyId}`} className="btn btn-primary">
                    + Novo Blog
                </a>
            </header>

            <div className="page-body">
                {tenants.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>Nenhum blog criado.</p>
                ) : (
                    <AnimatedList className="stack stack-sm">
                        {tenants.map((t) => (
                            <AnimatedListItem key={t.id}>
                                <div className="list-item">
                                    <a
                                        href={`/dashboard/tenants/${t.id}`}
                                        style={{ flex: 1, textDecoration: "none", color: "inherit" }}
                                    >
                                        <div className="list-item-title">{t.name}</div>
                                        <div className="list-item-sub">
                                            /{t.slug} · {t.postCount} posts
                                        </div>
                                    </a>
                                    <div className="row gap-sm">
                                        <ToggleButton tenantId={t.id} active={t.active} />
                                        <span className={`badge ${t.active ? "badge-success" : "badge-danger"}`}>
                                            {t.active ? "Ativo" : "Inativo"}
                                        </span>
                                    </div>
                                </div>
                            </AnimatedListItem>
                        ))}
                    </AnimatedList>
                )}
            </div>
        </AnimatedLayout>
    );
}
