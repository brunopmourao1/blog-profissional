"use server";

import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// =============================================================
// Tenant Actions
// =============================================================

export async function createTenant(formData: FormData) {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const agencyId = formData.get("agencyId") as string;

    if (!name || !slug || !agencyId) {
        throw new Error("Nome e slug são obrigatórios");
    }

    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
        throw new Error("Slug já em uso");
    }

    await prisma.tenant.create({
        data: { name, slug, agencyId, active: true },
    });

    revalidatePath("/dashboard/tenants");
    redirect("/dashboard/tenants");
}

export async function toggleTenant(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return;

    await prisma.tenant.update({
        where: { id: tenantId },
        data: { active: !tenant.active },
    });

    revalidatePath("/dashboard/tenants");
}

export async function updateTenantLogo(tenantId: string, logoUrl: string) {
    await prisma.tenant.update({
        where: { id: tenantId },
        data: { logoUrl },
    });
    revalidatePath(`/dashboard/tenants/${tenantId}`);
}

// =============================================================
// Post Actions
// =============================================================

export async function createPost(formData: FormData) {
    const tenantId = formData.get("tenantId") as string;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const status = formData.get("status") as string;
    const categoryIds = formData.getAll("categoryIds") as string[];
    const tagIds = formData.getAll("tagIds") as string[];

    if (!title || !slug || !content || !tenantId) {
        throw new Error("Título, slug e conteúdo são obrigatórios");
    }

    const existing = await prisma.post.findUnique({
        where: { tenantId_slug: { tenantId, slug } },
    });
    if (existing) {
        throw new Error("Slug já em uso neste tenant");
    }

    // Get first user as author (demo mode)
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("Nenhum usuário encontrado");

    await prisma.post.create({
        data: {
            tenantId,
            authorId: user.id,
            title,
            slug,
            content,
            excerpt: excerpt || null,
            status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
            publishedAt: status === "PUBLISHED" ? new Date() : null,
            categories: categoryIds.length > 0 ? { connect: categoryIds.map((id) => ({ id })) } : undefined,
            tags: tagIds.length > 0 ? { connect: tagIds.map((id) => ({ id })) } : undefined,
        },
    });

    revalidatePath(`/dashboard/tenants/${tenantId}/posts`);
    redirect(`/dashboard/tenants/${tenantId}/posts`);
}

export async function updatePost(formData: FormData) {
    const postId = formData.get("postId") as string;
    const tenantId = formData.get("tenantId") as string;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const status = formData.get("status") as string;
    const categoryIds = formData.getAll("categoryIds") as string[];
    const tagIds = formData.getAll("tagIds") as string[];

    if (!postId || !title || !slug || !content) {
        throw new Error("Campos obrigatórios faltando");
    }

    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) throw new Error("Post não encontrado");

    await prisma.post.update({
        where: { id: postId },
        data: {
            title,
            slug,
            content,
            excerpt: excerpt || null,
            status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
            publishedAt:
                status === "PUBLISHED" && !existing.publishedAt
                    ? new Date()
                    : existing.publishedAt,
            categories: { set: categoryIds.map((id) => ({ id })) },
            tags: { set: tagIds.map((id) => ({ id })) },
        },
    });

    revalidatePath(`/dashboard/tenants/${tenantId}/posts`);
    redirect(`/dashboard/tenants/${tenantId}/posts`);
}

export async function deletePost(postId: string, tenantId: string) {
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath(`/dashboard/tenants/${tenantId}/posts`);
}

// =============================================================
// Theme Actions
// =============================================================

export async function saveTheme(tenantId: string, tokensJson: string) {
    const tokens = JSON.parse(tokensJson);

    const latest = await prisma.themeRevision.findFirst({
        where: { tenantId },
        orderBy: { version: "desc" },
        select: { version: true },
    });
    const nextVersion = (latest?.version || 0) + 1;

    await prisma.$transaction([
        prisma.themeRevision.updateMany({
            where: { tenantId, active: true },
            data: { active: false },
        }),
        prisma.themeRevision.create({
            data: { tenantId, version: nextVersion, active: true, tokens },
        }),
    ]);

    revalidatePath(`/dashboard/tenants/${tenantId}/theme`);
    return { success: true, version: nextVersion };
}

// =============================================================
// Homepage Actions
// =============================================================

export async function saveHomepage(tenantId: string, sectionsJson: string) {
    const sections = JSON.parse(sectionsJson);

    const latest = await prisma.homeRevision.findFirst({
        where: { tenantId },
        orderBy: { version: "desc" },
        select: { version: true },
    });
    const nextVersion = (latest?.version || 0) + 1;

    await prisma.$transaction([
        prisma.homeRevision.updateMany({
            where: { tenantId, active: true },
            data: { active: false },
        }),
        prisma.homeRevision.create({
            data: { tenantId, version: nextVersion, active: true, sections },
        }),
    ]);

    revalidatePath(`/dashboard/tenants/${tenantId}/homepage`);
    return { success: true, version: nextVersion };
}
