import type { Metadata, Viewport } from "next";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Quest",
  description: "G検定・統計・英語・投資の毎日を冒険にする個人用アプリ",
  appleWebApp: {
    capable: true,
    title: "Quest",
    statusBarStyle: "black",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060f",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <head>
        {/* next/font はビルド時に Google Fonts へ通信するので使わない（構築記録の判断どおり）。実行時に読む */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DotGothic16&family=M+PLUS+Rounded+1c:wght@400;700&display=swap"
        />
      </head>
      <body className="min-h-full">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
