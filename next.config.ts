import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 画面に埋め込む版。/api/version と比べて、古い画面のままなら「更新する」を出す（PwaRegister）
  env: { BUILD_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Service Worker は常に最新を取りに行かせる。
        // 古い sw.js が residual キャッシュから返ると、更新が永久に届かなくなる。
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
