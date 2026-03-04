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
        prisma.category.findMany({
            where: { tenantId },
            orderBy: { name: "asc" },
        }),
        prisma.tag.findMany({
            where: { tenantId },
            orderBy: { name: "asc" },
        }),
    ]);

    if (!post) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h1>Post não encontrado</h1>
                <a href={`/dashboard/tenants/${tenantId}/posts`}>← Voltar</a>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Editar Post</h1>
                <a href={`/dashboard/tenants/${tenantId}/posts`} style={{ color: "#6366f1", textDecoration: "none" }}>← Posts</a>
            </div>
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
    );
}
