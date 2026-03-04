import { prisma } from "@repo/db";
import { Sidebar } from "./Sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const agency = await prisma.agency.findFirst({
        select: { name: true },
    });

    return (
        <div className="admin-shell">
            <Sidebar agencyName={agency?.name} />
            <main className="main-content">{children}</main>
        </div>
    );
}
