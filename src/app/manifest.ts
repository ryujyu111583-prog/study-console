import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "学習コンソール",
    short_name: "学習",
    description: "G検定と英語の毎日を記録する個人用アプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#eef1f4",
    theme_color: "#0c1217",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
