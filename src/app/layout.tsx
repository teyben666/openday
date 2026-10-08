import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/** Rarely above-the-fold (admin refs, confirmation codes) — don't preload */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "新纪元大学学院 | New Era University College - 课程探索",
  description:
    "探索新纪元大学学院30+课程，包括荣誉学士、专业文凭和基础课程。通过趣味测验找到最适合你的未来！",
  keywords: [
    "New Era University College",
    "新纪元大学学院",
    "NEUC",
    "course discovery",
    "课程探索",
    "bachelor degree",
    "diploma",
    "foundation",
    "Malaysia university",
  ],
  icons: {
    icon: [{ url: "/neuc-logo.png", type: "image/png" }],
    apple: "/neuc-logo.png",
    shortcut: "/neuc-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
