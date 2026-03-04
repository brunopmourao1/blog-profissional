import { prisma } from "@repo/db";
import { tokensToCssVars, DEFAULT_THEME_TOKENS, type ThemeTokens } from "@repo/config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CookieBanner } from "./CookieBanner";

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

    // Load active theme or defaults
    const themeRevision = await prisma.themeRevision.findFirst({
        where: { tenantId: tenant.id, active: true },
        select: { tokens: true },
    });

    const tokens = (themeRevision?.tokens as ThemeTokens) || DEFAULT_THEME_TOKENS;
    const cssVars = tokensToCssVars(tokens);

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Inject theme CSS variables */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `:root { ${cssVars} }
            body {
              font-family: var(--font-body);
              color: var(--color-text);
              background-color: var(--color-background);
              font-size: var(--typography-base-size);
              line-height: var(--typography-line-height);
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: var(--font-heading);
            }
            a { color: var(--color-primary); }
          `,
                }}
            />

            <header
                style={{
                    borderBottom: "1px solid var(--color-muted, #e5e7eb)",
                    padding: "var(--layout-spacing, 1rem) calc(var(--layout-spacing, 1rem) * 2)",
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
                        color: "var(--color-text)",
                        fontFamily: "var(--font-heading)",
                    }}
                >
                    {tenant.name}
                </a>
                <nav style={{ display: "flex", gap: "1.5rem" }}>
                    {tenant.categories.map((cat) => (
                        <a
                            key={cat.slug}
                            href={`/${tenant.slug}/category/${cat.slug}`}
                            style={{ textDecoration: "none", color: "var(--color-muted)" }}
                        >
                            {cat.name}
                        </a>
                    ))}
                </nav>
            </header>

            <main
                style={{
                    flex: 1,
                    maxWidth: "var(--layout-max-width, 800px)",
                    margin: "0 auto",
                    padding: "calc(var(--layout-spacing, 1rem) * 2)",
                    width: "100%",
                }}
            >
                {children}
            </main>

            <footer
                style={{
                    borderTop: "1px solid var(--color-muted, #e5e7eb)",
                    padding: "1.5rem 2rem",
                    textAlign: "center",
                    color: "var(--color-muted)",
                    fontSize: "0.875rem",
                }}
            >
                <div style={{ marginBottom: "0.5rem" }}>
                    © {new Date().getFullYear()} {tenant.name}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem" }}>
                    <a href={`/${tenant.slug}/privacy`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>
                        Política de Privacidade
                    </a>
                    <a href={`/${tenant.slug}/terms`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>
                        Termos de Uso
                    </a>
                </div>
            </footer>

            <CookieBanner tenantSlug={tenant.slug} />
        </div>
    );
}
