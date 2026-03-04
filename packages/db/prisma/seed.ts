import { PrismaClient, Role, PlanTier } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // 1. SuperAdmin user
    const superAdmin = await prisma.user.upsert({
        where: { email: "admin@blogplatform.com" },
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@blogplatform.com",
            passwordHash: hashSync("admin123", 10),
            emailVerified: true,
        },
    });
    console.log("  ✅ SuperAdmin:", superAdmin.email);

    // 2. Agency
    const agency = await prisma.agency.upsert({
        where: { slug: "demo-agency" },
        update: {},
        create: {
            name: "Demo Agency",
            slug: "demo-agency",
            planTier: PlanTier.STARTER,
        },
    });
    console.log("  ✅ Agency:", agency.slug);

    // 3. SuperAdmin membership (global)
    await prisma.membership.upsert({
        where: { userId_agencyId: { userId: superAdmin.id, agencyId: agency.id } },
        update: {},
        create: {
            userId: superAdmin.id,
            agencyId: agency.id,
            role: Role.SUPER_ADMIN,
        },
    });

    // 4. Agency Owner
    const agencyOwner = await prisma.user.upsert({
        where: { email: "owner@demo-agency.com" },
        update: {},
        create: {
            name: "Agency Owner",
            email: "owner@demo-agency.com",
            passwordHash: hashSync("owner123", 10),
            emailVerified: true,
        },
    });
    console.log("  ✅ Agency Owner:", agencyOwner.email);

    await prisma.membership.upsert({
        where: {
            userId_agencyId: { userId: agencyOwner.id, agencyId: agency.id },
        },
        update: {},
        create: {
            userId: agencyOwner.id,
            agencyId: agency.id,
            role: Role.AGENCY_OWNER,
        },
    });

    // 5. Tenants
    const tenant1 = await prisma.tenant.upsert({
        where: { slug: "blog-alpha" },
        update: {},
        create: {
            name: "Blog Alpha",
            slug: "blog-alpha",
            agencyId: agency.id,
        },
    });

    const tenant2 = await prisma.tenant.upsert({
        where: { slug: "blog-beta" },
        update: {},
        create: {
            name: "Blog Beta",
            slug: "blog-beta",
            agencyId: agency.id,
        },
    });
    console.log("  ✅ Tenants:", tenant1.slug, tenant2.slug);

    // 6. Tenant Admin
    const tenantAdmin = await prisma.user.upsert({
        where: { email: "admin@blog-alpha.com" },
        update: {},
        create: {
            name: "Tenant Admin",
            email: "admin@blog-alpha.com",
            passwordHash: hashSync("tenant123", 10),
            emailVerified: true,
        },
    });

    await prisma.membership.upsert({
        where: {
            userId_tenantId: { userId: tenantAdmin.id, tenantId: tenant1.id },
        },
        update: {},
        create: {
            userId: tenantAdmin.id,
            tenantId: tenant1.id,
            role: Role.TENANT_ADMIN,
        },
    });
    console.log("  ✅ Tenant Admin:", tenantAdmin.email);

    // 7. Tenant Editor
    const tenantEditor = await prisma.user.upsert({
        where: { email: "editor@blog-alpha.com" },
        update: {},
        create: {
            name: "Tenant Editor",
            email: "editor@blog-alpha.com",
            passwordHash: hashSync("editor123", 10),
            emailVerified: true,
        },
    });

    await prisma.membership.upsert({
        where: {
            userId_tenantId: { userId: tenantEditor.id, tenantId: tenant1.id },
        },
        update: {},
        create: {
            userId: tenantEditor.id,
            tenantId: tenant1.id,
            role: Role.TENANT_EDITOR,
        },
    });
    console.log("  ✅ Tenant Editor:", tenantEditor.email);

    console.log("🌱 Seed completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
