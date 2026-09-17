import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    icon: "/logo.svg",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
