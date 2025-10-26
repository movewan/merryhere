import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalHeader } from "@/components/layout/conditional-header";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MERRY HERE | 메리히어",
  description: "소셜 벤처를 위한 공유 오피스 공간, MERRY HERE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ConditionalHeader />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
