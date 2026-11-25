import type { Metadata } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import Header from "@/components/Header";
import "./globals.css";

const head = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-head" });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "Seedling - fund ideas that matter", template: "%s | Seedling" },
  description: "Back campaigns, launch your own and follow every rupee from pledge to payout.",
  icons: { icon: "/art/cf-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${head.variable} ${body.variable}`}>
      <body className="min-h-dvh antialiased">
        <AuthProvider>
          <Suspense fallback={null}><Header /></Suspense>
          <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6"><Suspense fallback={<div className="card h-64 animate-pulse bg-[#efece4]" />}>{children}</Suspense></main>
        </AuthProvider>
      </body>
    </html>
  );
}
