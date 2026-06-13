import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob Storage (upload de imagens de produtos e universos)
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      // Supabase Storage (caso usado no futuro)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
