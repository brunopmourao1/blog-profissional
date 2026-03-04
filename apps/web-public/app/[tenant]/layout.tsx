import { prisma } from "@repo/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface TenantLayoutProps {
    children: React.ReactNode;
    params: Promise<{ tenant: string }>;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
    const { tenant: slug } = await params;
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { name: true },
    });

    if (!tenant) return { title: "Blog Not Found" };

    return {
        title: { default: tenant.name, template: `%s | ${tenant.name}` },
        description: `Blog ${tenant.name}`,
    };
}

export default async function TenantLayout({
    children,
    params,
}: TenantLayoutProps) {
    const { tenant: slug } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { slug, active: true },
        select: {
            id: true,
            name: true,
            slug: true,
            categories: {
                select: { name: true, slug: true },
                orderBy: { name: "asc" },
            },
        },
    });

    if (!tenant) notFound();

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <header
                style={{
                    borderBottom: "1px solid #e5e7eb",
                    padding: "1rem 2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <a
                    href={`/${tenant.slug}`}
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        textDecoration: "none",
                        color: "#111827",
                    }}
                >
                    {tenant.name}
                </a>
                <nav style={{ display: "flex", gap: "1.5rem" }}>
                    {tenant.categories.map((cat) => (
                        <a
                            key={cat.slug}
                            href={`/${tenant.slug}/category/${cat.slug}`}
                            style={{ textDecoration: "none", color: "#4b5563" }}
                        >
                            {cat.name}
                        </a>
                    ))}
                </nav>
            </header>

            <main style={{ flex: 1, maxWidth: 800, margin: "0 auto", padding: "2rem", width: "100%" }}>
                {children}
            </main>

            <footer
                style={{
                    borderTop: "1px solid #e5e7eb",
                    padding: "1.5rem 2rem",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                }}
            >
                © {new Date().getFullYear()} {tenant.name}
            </footer>
        </div>
    );
}
