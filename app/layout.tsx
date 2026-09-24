import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "YucaChain - Cassava Batch Traceability & QR Code System",
  description: "Official YucaChain supply chain passport. Record cassava variety, moisture, cyanide, weight, and YucaHub tracking dates with instant verifiable QR codes.",
  keywords: ["YucaChain", "Cassava Traceability", "QR Code", "YucaHub", "AgriTech", "Cyanide Testing", "Moisture Content"],
  icons: {
    icon: "/Logo.png",
    shortcut: "/Logo.png",
    apple: "/Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
