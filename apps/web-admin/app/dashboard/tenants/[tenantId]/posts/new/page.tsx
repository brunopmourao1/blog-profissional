import { prisma } from "@repo/db";
import type { Metadata } from "next";
import { PostForm } from "./PostForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Novo Post — Admin",
};

interface NewPostPageProps {
    params: Promise<{ tenantId: string }>;
}

export default async function NewPostPage({ params }: NewPostPageProps) {
    const { tenantId } = await params;

    const [categories, tags] = await Promise.all([
        prisma.category.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
        prisma.tag.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    ]);

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Novo Post</h1>
                </div>
                <a href={`/dashboard/tenants/${tenantId}/posts`} className="btn btn-ghost">← Posts</a>
            </header>
            <div className="page-body" style={{ maxWidth: 800 }}>
                <PostForm tenantId={tenantId} categories={categories} tags={tags} />
            </div>
        </>
    );
}
