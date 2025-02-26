/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,     // Disable React Strict Mode that shows console.log 2 times in dev mode
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true, // This will ignore ESLint errors during build
    },
    images: {
        domains: [ 'f2fintechcustomerdocs.s3.eu-north-1.amazonaws.com' ],
    },
};

export default nextConfig;
