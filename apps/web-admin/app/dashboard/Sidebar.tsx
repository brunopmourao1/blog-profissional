"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
    { section: "PRINCIPAL" },
    { href: "/dashboard", icon: "📊", label: "Dashboard" },
    { section: "CONTEÚDO" },
    { href: "/dashboard/tenants", icon: "🌐", label: "Blogs / Tenants" },
    { section: "CONFIGURAÇÕES" },
    { href: "/dashboard/members", icon: "👥", label: "Equipe" },
    { href: "/dashboard/branding", icon: "🎨", label: "White-Label" },
] as const;

interface SidebarProps {
    agencyName?: string;
}

export function Sidebar({ agencyName }: SidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <>
            <button
                className="mobile-toggle"
                onClick={() => setOpen(!open)}
                aria-label="Menu"
            >
                {open ? "✕" : "☰"}
            </button>

            <div
                className={`sidebar-overlay${open ? " open" : ""}`}
                onClick={() => setOpen(false)}
            />

            <aside className={`sidebar${open ? " open" : ""}`}>
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">B</div>
                    <div>
                        <div className="sidebar-brand-text">
                            {agencyName || "BlogPro"}
                        </div>
                        <span className="sidebar-brand-sub">Admin Panel</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item, i) => {
                        if ("section" in item) {
                            return (
                                <div key={i} className="sidebar-section">
                                    {item.section}
                                </div>
                            );
                        }
                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link${isActive(item.href) ? " active" : ""}`}
                                onClick={() => setOpen(false)}
                            >
                                <span className="sidebar-link-icon">{item.icon}</span>
                                {item.label}
                            </a>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    © 2026 BlogPro SaaS
                </div>
            </aside>
        </>
    );
}
