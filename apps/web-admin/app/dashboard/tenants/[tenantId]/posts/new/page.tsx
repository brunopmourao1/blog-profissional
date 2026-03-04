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
        prisma.category.findMany({
            where: { tenantId },
            orderBy: { name: "asc" },
        }),
        prisma.tag.findMany({
            where: { tenantId },
            orderBy: { name: "asc" },
        }),
    ]);

    return (
        <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Novo Post</h1>
                <a href={`/dashboard/tenants/${tenantId}/posts`} style={{ color: "#6366f1", textDecoration: "none" }}>← Posts</a>
            </div>
            <PostForm tenantId={tenantId} categories={categories} tags={tags} />
        </div>
    );
}
