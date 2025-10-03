import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // ✅ อนุญาตโหลดรูปจากทุก subdomain ของ supabase
      },
      {
        protocol: "https",
        hostname: "picsum.photos", // ✅ อนุญาตโหลดรูปจาก picsum.photos (placeholder images)
      },
    ],
    qualities: [25, 50, 75, 100], // ✅ เพิ่มการกำหนดค่า quality สำหรับ Next.js 16
  },
  // Disable static optimization for API routes
  output: 'standalone',
  // Ensure API routes are not statically generated
  trailingSlash: false,
  // Prevent prerendering of API routes
  serverExternalPackages: [],
};

export default nextConfig;