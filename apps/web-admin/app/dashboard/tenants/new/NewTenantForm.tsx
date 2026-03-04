"use client";

import { createTenant } from "../../actions";

export function NewTenantForm({ agencyId }: { agencyId: string }) {
    return (
        <form action={createTenant} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <input type="hidden" name="agencyId" value={agencyId} />

            <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>Nome do Blog</label>
                <input
                    name="name"
                    required
                    placeholder="Ex: Meu Blog de Tecnologia"
                    onInput={(e) => {
                        const slug = (e.target as HTMLInputElement).value
                            .toLowerCase()
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "");
                        const slugInput = document.getElementById("slug") as HTMLInputElement;
                        if (slugInput) slugInput.value = slug;
                    }}
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: 8,
                        border: "1px solid #d1d5db",
                        fontSize: "1rem",
                    }}
                />
            </div>

            <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>Slug (URL)</label>
                <input
                    name="slug"
                    id="slug"
                    required
                    placeholder="meu-blog-de-tecnologia"
                    pattern="^[a-z0-9-]+$"
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: 8,
                        border: "1px solid #d1d5db",
                        fontSize: "1rem",
                        fontFamily: "monospace",
                    }}
                />
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    Acessível em: /slug-do-blog
                </p>
            </div>

            <button
                type="submit"
                style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "0.5rem",
                }}
            >
                Criar Tenant
            </button>
        </form>
    );
}
