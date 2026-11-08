import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Study Quest",
    short_name: "Study Quest",
    description: "G検定と英語の毎日を記録する個人用アプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#16254e",
    theme_color: "#0c1217",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
