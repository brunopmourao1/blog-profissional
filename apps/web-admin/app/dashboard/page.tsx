import { prisma } from "@repo/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Dashboard — Admin",
    description: "Painel administrativo da agência",
};

export default async function DashboardPage() {
    // For SSR, we'd need auth context. Using static placeholder for now.
    // In production, this would read from session/cookie.
    const stats = await prisma.agency.findFirst({
        select: {
            id: true,
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

    return (
        <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>
                Dashboard
            </h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                }}
            >
                <StatCard label="Plano" value={stats?.planTier || "—"} />
                <StatCard label="Tenants" value={String(stats?._count.tenants || 0)} />
                <StatCard label="Membros" value={String(stats?._count.memberships || 0)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <NavLink href="/dashboard/tenants" label="📋 Gerenciar Tenants" />
                <NavLink href="/dashboard/members" label="👥 Gerenciar Membros" />
                <NavLink href="/dashboard/branding" label="🎨 White-Label / Branding" />
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                padding: "1.5rem",
                borderRadius: 8,
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                {label}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
        </div>
    );
}

function NavLink({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            style={{
                display: "block",
                padding: "1rem 1.5rem",
                borderRadius: 8,
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                color: "#111827",
                fontWeight: 500,
                fontSize: "1rem",
            }}
        >
            {label}
        </a>
    );
}
