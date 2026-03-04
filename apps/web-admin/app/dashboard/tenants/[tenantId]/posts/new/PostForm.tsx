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

export function PostForm({ tenantId, categories, tags, post }: PostFormProps) {
    const isEditing = !!post;

    return (
        <form action={isEditing ? updatePost : createPost} className="stack stack-lg">
            <input type="hidden" name="tenantId" value={tenantId} />
            {isEditing && <input type="hidden" name="postId" value={post.id} />}

            <div className="form-group">
                <label className="form-label">Título</label>
                <input
                    name="title"
                    required
                    defaultValue={post?.title}
                    placeholder="Título do post"
                    className="form-input"
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
                />
            </div>

            <div className="form-group">
                <label className="form-label">Slug</label>
                <input
                    name="slug"
                    id="post-slug"
                    required
                    defaultValue={post?.slug}
                    pattern="^[a-z0-9-]+$"
                    className="form-input mono"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Conteúdo (HTML)</label>
                <textarea
                    name="content"
                    required
                    defaultValue={post?.content}
                    placeholder="<h2>Título</h2><p>Conteúdo do post...</p>"
                    rows={12}
                    className="form-textarea mono"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Resumo</label>
                <textarea
                    name="excerpt"
                    defaultValue={post?.excerpt || ""}
                    placeholder="Breve descrição do post"
                    rows={3}
                    className="form-textarea"
                />
            </div>

            <div className="grid-2">
                <div className="form-group">
                    <label className="form-label">Categorias</label>
                    <div className="card stack stack-sm" style={{ maxHeight: 160, overflowY: "auto" }}>
                        {categories.map((cat) => (
                            <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                                <input
                                    type="checkbox"
                                    name="categoryIds"
                                    value={cat.id}
                                    defaultChecked={post?.categories.some((c) => c.id === cat.id)}
                                />
                                {cat.name}
                            </label>
                        ))}
                        {categories.length === 0 && <span className="form-hint">Nenhuma categoria</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Tags</label>
                    <div className="card stack stack-sm" style={{ maxHeight: 160, overflowY: "auto" }}>
                        {tags.map((tag) => (
                            <label key={tag.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                                <input
                                    type="checkbox"
                                    name="tagIds"
                                    value={tag.id}
                                    defaultChecked={post?.tags.some((t) => t.id === tag.id)}
                                />
                                {tag.name}
                            </label>
                        ))}
                        {tags.length === 0 && <span className="form-hint">Nenhuma tag</span>}
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Status</label>
                <select
                    name="status"
                    defaultValue={post?.status || "DRAFT"}
                    className="form-select"
                >
                    <option value="DRAFT">Rascunho</option>
                    <option value="PUBLISHED">Publicado</option>
                </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                {isEditing ? "Salvar Post" : "Criar Post"}
            </button>
        </form>
    );
}
