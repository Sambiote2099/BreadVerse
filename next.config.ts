import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Completely ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  /* config options here */
  reactCompiler: true,
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      { protocol: "https", hostname: "i.ytimg.com" },
       { protocol: "https", hostname: "images.unsplash.com" },
        {
        protocol: 'https',
        hostname: '**', // allow all (dev only)
      },
    ],
  },
};

export default nextConfig;
