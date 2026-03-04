import { prisma } from "@repo/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Branding — Admin",
    description: "Personalize o visual da sua agência",
};

export default async function BrandingPage() {
    const agency = await prisma.agency.findFirst({
        select: { id: true, name: true },
    });

    const branding = agency
        ? await prisma.agencyBranding.findUnique({
            where: { agencyId: agency.id },
        })
        : null;

    return (
        <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>White-Label</h1>
                <a href="/dashboard" style={{ color: "#6366f1", textDecoration: "none" }}>← Dashboard</a>
            </div>

            <div
                style={{
                    padding: "2rem",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                }}
            >
                <FieldDisplay label="Agência" value={agency?.name || "—"} />
                <FieldDisplay label="Logo URL" value={branding?.logo || "Não definido"} />
                <FieldDisplay label="Cor Primária" value={branding?.primaryColor || "#6366f1"} />
                <FieldDisplay label="Domínio do Painel" value={branding?.panelDomain || "Não definido"} />
            </div>

            <p style={{ marginTop: "1.5rem", color: "#6b7280", fontSize: "0.875rem" }}>
                Para atualizar o branding, use a API: PUT /api/agencies/{"{agencyId}"}/branding
            </p>
        </div>
    );
}

function FieldDisplay({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", marginBottom: "0.25rem", fontWeight: 600 }}>
                {label}
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 500 }}>{value}</div>
        </div>
    );
}
