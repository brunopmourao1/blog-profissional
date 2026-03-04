import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export type { Agency, Tenant, User, Membership, Post, Category, Tag, ThemeRevision, HomeRevision, Subscription } from "@prisma/client";
export { Role, PlanTier, PostStatus, SubStatus } from "@prisma/client";
export default prisma;
