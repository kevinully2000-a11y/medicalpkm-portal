import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KOL Brief Generator | MedicalPKM",
  description: "Generate comprehensive Key Opinion Leader briefs for conference preparation and business development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-suite-bg`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
