"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const sidebarVariants = {
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const overlayVariants = {
    closed: { opacity: 0, transition: { duration: 0.2 } },
    open: { opacity: 1, transition: { duration: 0.3 } },
};

const navItemVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" as const },
    }),
};

export function Sidebar({ agencyName }: SidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <>
            <motion.button
                className="mobile-toggle"
                onClick={() => setOpen(!open)}
                aria-label="Menu"
                whileTap={{ scale: 0.9 }}
            >
                <motion.span
                    key={open ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {open ? "✕" : "☰"}
                </motion.span>
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="sidebar-overlay open"
                        variants={overlayVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        onClick={() => setOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Desktop: always visible sidebar (CSS handles it) */}
            {/* Mobile: animated sidebar */}
            <aside className={`sidebar${open ? " open" : ""}`}>
                <motion.div
                    className="sidebar-brand"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <motion.div
                        className="sidebar-brand-icon"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        B
                    </motion.div>
                    <div>
                        <div className="sidebar-brand-text">
                            {agencyName || "BlogPro"}
                        </div>
                        <span className="sidebar-brand-sub">Admin Panel</span>
                    </div>
                </motion.div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item, i) => {
                        if ("section" in item) {
                            return (
                                <motion.div
                                    key={i}
                                    className="sidebar-section"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 + 0.2 }}
                                >
                                    {item.section}
                                </motion.div>
                            );
                        }
                        return (
                            <motion.a
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link${isActive(item.href) ? " active" : ""}`}
                                onClick={() => setOpen(false)}
                                variants={navItemVariants}
                                initial="hidden"
                                animate="visible"
                                custom={i}
                                whileHover={{
                                    x: 4,
                                    transition: { duration: 0.15 },
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.span
                                    className="sidebar-link-icon"
                                    whileHover={{ scale: 1.2 }}
                                >
                                    {item.icon}
                                </motion.span>
                                {item.label}
                                {isActive(item.href) && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: 3,
                                            borderRadius: 2,
                                            background: "#6366f1",
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 30,
                                        }}
                                    />
                                )}
                            </motion.a>
                        );
                    })}
                </nav>

                <motion.div
                    className="sidebar-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    © 2026 BlogPro SaaS
                </motion.div>
            </aside>
        </>
    );
}
