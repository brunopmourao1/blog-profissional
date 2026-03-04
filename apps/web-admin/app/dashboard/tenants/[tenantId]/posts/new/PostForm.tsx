"use client";

import { createPost, updatePost } from "../../../../actions";

interface PostFormProps {
    tenantId: string;
    categories: { id: string; name: string }[];
    tags: { id: string; name: string }[];
    post?: {
        id: string;
        title: string;
        slug: string;
        content: string;
        excerpt: string | null;
        status: string;
        categories: { id: string }[];
        tags: { id: string }[];
    };
}

const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: "1rem",
} as const;

const labelStyle = {
    display: "block" as const,
    fontWeight: 600,
    marginBottom: "0.5rem",
};

export function PostForm({ tenantId, categories, tags, post }: PostFormProps) {
    const isEditing = !!post;

    return (
        <form
            action={isEditing ? updatePost : createPost}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
            <input type="hidden" name="tenantId" value={tenantId} />
            {isEditing && <input type="hidden" name="postId" value={post.id} />}

            <div>
                <label style={labelStyle}>Título</label>
                <input
                    name="title"
                    required
                    defaultValue={post?.title}
                    placeholder="Título do post"
                    onInput={(e) => {
                        if (isEditing) return;
                        const slug = (e.target as HTMLInputElement).value
                            .toLowerCase()
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "");
                        const slugInput = document.getElementById("post-slug") as HTMLInputElement;
                        if (slugInput) slugInput.value = slug;
                    }}
                    style={inputStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>Slug</label>
                <input
                    name="slug"
                    id="post-slug"
                    required
                    defaultValue={post?.slug}
                    pattern="^[a-z0-9-]+$"
                    style={{ ...inputStyle, fontFamily: "monospace" }}
                />
            </div>

            <div>
                <label style={labelStyle}>Conteúdo (HTML)</label>
                <textarea
                    name="content"
                    required
                    defaultValue={post?.content}
                    placeholder="<h2>Título</h2><p>Conteúdo do post...</p>"
                    rows={12}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "0.875rem" }}
                />
            </div>

            <div>
                <label style={labelStyle}>Resumo</label>
                <textarea
                    name="excerpt"
                    defaultValue={post?.excerpt || ""}
                    placeholder="Breve descrição do post"
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                    <label style={labelStyle}>Categorias</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 150, overflowY: "auto" }}>
                        {categories.map((cat) => (
                            <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    name="categoryIds"
                                    value={cat.id}
                                    defaultChecked={post?.categories.some((c) => c.id === cat.id)}
                                />
                                {cat.name}
                            </label>
                        ))}
                        {categories.length === 0 && <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Nenhuma categoria</span>}
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Tags</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 150, overflowY: "auto" }}>
                        {tags.map((tag) => (
                            <label key={tag.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    name="tagIds"
                                    value={tag.id}
                                    defaultChecked={post?.tags.some((t) => t.id === tag.id)}
                                />
                                {tag.name}
                            </label>
                        ))}
                        {tags.length === 0 && <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Nenhuma tag</span>}
                    </div>
                </div>
            </div>

            <div>
                <label style={labelStyle}>Status</label>
                <select
                    name="status"
                    defaultValue={post?.status || "DRAFT"}
                    style={{ ...inputStyle, cursor: "pointer" }}
                >
                    <option value="DRAFT">Rascunho</option>
                    <option value="PUBLISHED">Publicado</option>
                </select>
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
                {isEditing ? "Salvar Post" : "Criar Post"}
            </button>
        </form>
    );
}
