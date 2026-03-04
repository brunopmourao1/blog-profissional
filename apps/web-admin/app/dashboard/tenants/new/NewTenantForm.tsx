"use client";

import { createTenant } from "../../actions";

export function NewTenantForm({ agencyId }: { agencyId: string }) {
    return (
        <form action={createTenant} className="stack stack-lg" style={{ maxWidth: 500 }}>
            <input type="hidden" name="agencyId" value={agencyId} />

            <div className="form-group">
                <label className="form-label">Nome do Blog</label>
                <input
                    name="name"
                    required
                    placeholder="Ex: Meu Blog de Tecnologia"
                    className="form-input"
                    onInput={(e) => {
                        const slug = (e.target as HTMLInputElement).value
                            .toLowerCase()
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "");
                        const slugInput = document.getElementById("slug") as HTMLInputElement;
                        if (slugInput) slugInput.value = slug;
                    }}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Slug (URL)</label>
                <input
                    name="slug"
                    id="slug"
                    required
                    placeholder="meu-blog-de-tecnologia"
                    pattern="^[a-z0-9-]+$"
                    className="form-input mono"
                />
                <p className="form-hint">Acessível em: /slug-do-blog</p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                Criar Blog
            </button>
        </form>
    );
}
