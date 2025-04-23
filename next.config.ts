import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // output: 'export',
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    basePath: '', // Adjust this to your BSP path
    assetPrefix: '',
    reactStrictMode: true,
};

export default nextConfig;
