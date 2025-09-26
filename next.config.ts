import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // ✅ อนุญาตโหลดรูปจากทุก subdomain ของ supabase
      },
    ],
  },
};

export default nextConfig;