import React from "react";
import { Metadata } from "next";
import "@/app/globals.css"; // Import global CSS

export const metadata: Metadata = {
  title: "キクメモ (KikuMemo) - AI議事録生成サービス",
  description: "「書く」を邪魔せず、「記憶」を拡張するAI議事録生成サービス",
  manifest: "/manifest.json", // PWA manifest
  themeColor: "#ffffff",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

// This is the root layout for the entire application.
// It wraps all other layouts and pages.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      {" "}
      {/* Default to 'ja' for the very root, overridden by [locale] */}
      <body>{children}</body>
    </html>
  );
}
