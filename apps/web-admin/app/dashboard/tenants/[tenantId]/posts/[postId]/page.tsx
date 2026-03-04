import { prisma } from "@repo/db";
import type { Metadata } from "next";
import { PostForm } from "../new/PostForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Editar Post — Admin",
};

interface EditPostPageProps {
    params: Promise<{ tenantId: string; postId: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
    const { tenantId, postId } = await params;

    const [post, categories, tags] = await Promise.all([
        prisma.post.findUnique({
            where: { id: postId },
            include: {
                categories: { select: { id: true } },
                tags: { select: { id: true } },
            },
        }),
        prisma.category.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
        prisma.tag.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    ]);

    if (!post) {
        return (
            <div className="page-body" style={{ textAlign: "center" }}>
                <h1>Post não encontrado</h1>
                <a href={`/dashboard/tenants/${tenantId}/posts`} className="btn btn-outline" style={{ marginTop: "1rem" }}>← Voltar</a>
            </div>
        );
    }

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Editar Post</h1>
                    <p className="page-header-sub">{post.title}</p>
                </div>
                <a href={`/dashboard/tenants/${tenantId}/posts`} className="btn btn-ghost">← Posts</a>
            </header>
            <div className="page-body" style={{ maxWidth: 800 }}>
                <PostForm
                    tenantId={tenantId}
                    categories={categories}
                    tags={tags}
                    post={{
                        id: post.id,
                        title: post.title,
                        slug: post.slug,
                        content: post.content,
                        excerpt: post.excerpt,
                        status: post.status,
                        categories: post.categories,
                        tags: post.tags,
                    }}
                />
            </div>
        </>
    );
}
