/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/config", "@repo/db"],
};

export default nextConfig;
