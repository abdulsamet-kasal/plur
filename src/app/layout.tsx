import type { Metadata } from "next";
import { Rajdhani, Inter } from "next/font/google";

import BanGuard from "@/components/BanGuard";
import PresenceTracker from "@/components/PresenceTracker";

import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PLUR — Valorant Duo Bul",
  description:
    "Valorant'ta doğru duo partnerini bul. Rank kas, daha iyi oyna.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body className={`${rajdhani.variable} ${inter.variable}`}>
        <BanGuard>
          <PresenceTracker />
          {children}
        </BanGuard>
      </body>
    </html>
  );
}
