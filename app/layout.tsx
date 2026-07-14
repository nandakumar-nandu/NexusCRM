import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import PageWrapper from "@/components/layout/PageWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NexusCRM - Enterprise Relationship Management Platform",
  description: "Next-generation customer relationship management platform for high-growth enterprises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative min-h-screen">
          <Sidebar />
          <TopBar />
          <PageWrapper>{children}</PageWrapper>
        </div>
      </body>
    </html>
  );
}
