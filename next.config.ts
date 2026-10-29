import type { NextConfig } from "next";

// Topologi deploy:
// 1. Homeserver menjalankan aplikasi lengkap (halaman + API + database). BACKEND_URL kosong.
// 2. Vercel hanya menyajikan halaman. BACKEND_URL diisi alamat homeserver, dan semua /api/*
//    diteruskan ke sana sebelum route /api lokal sempat menjawab (beforeFiles).
const backend = process.env.BACKEND_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Image Docker untuk homeserver memakai server.js mandiri.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  async rewrites() {
    return {
      beforeFiles: backend ? [{ source: "/api/:path*", destination: `${backend}/api/:path*` }] : [],
      afterFiles: [],
      fallback: [],
    };
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
