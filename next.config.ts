/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ (Optional but useful) Ignore ESLint errors too
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
