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
  },
};

export default nextConfig;