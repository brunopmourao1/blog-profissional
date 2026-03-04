"use client";

import { useState, useEffect } from "react";

export function CookieBanner({ tenantSlug }: { tenantSlug: string }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = document.cookie
            .split(";")
            .some((c) => c.trim().startsWith("cookie_consent="));
        if (!consent) setVisible(true);
    }, []);

    if (!visible) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "#1f2937",
                color: "#f9fafb",
                padding: "1rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                fontSize: "0.875rem",
                zIndex: 9999,
            }}
        >
            <p style={{ margin: 0, flex: 1 }}>
                Este site utiliza cookies para melhorar sua experiência.
                Ao continuar navegando, você concorda com nossa{" "}
                <a
                    href={`/${tenantSlug}/privacy`}
                    style={{ color: "#f59e0b", textDecoration: "underline" }}
                >
                    Política de Privacidade
                </a>.
            </p>
            <button
                onClick={() => {
                    document.cookie = "cookie_consent=true;path=/;max-age=31536000";
                    setVisible(false);
                }}
                style={{
                    padding: "0.5rem 1.25rem",
                    backgroundColor: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                }}
            >
                Aceitar
            </button>
        </div>
    );
}
