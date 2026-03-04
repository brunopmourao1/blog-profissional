import { prisma } from "@repo/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Membros — Admin",
    description: "Gerencie os membros da agência",
};

export default async function MembersPage() {
    const memberships = await prisma.membership.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true } },
            tenant: { select: { name: true } },
        },
        take: 50,
    });

    return (
        <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Membros</h1>
                <a href="/dashboard" style={{ color: "#6366f1", textDecoration: "none" }}>← Dashboard</a>
            </div>

            {memberships.length === 0 ? (
                <p style={{ color: "#6b7280" }}>Nenhum membro registrado.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {memberships.map((m) => (
                        <div
                            key={m.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "1rem 1.5rem",
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                                backgroundColor: "#fff",
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600 }}>{m.user.name}</div>
                                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                    {m.user.email} · {m.tenant?.name || "Agência"}
                                </div>
                            </div>
                            <span
                                style={{
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: 999,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    backgroundColor: "#ede9fe",
                                    color: "#5b21b6",
                                }}
                            >
                                {m.role}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
