import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Konsultan Otot AI | Pelatihan Kelas Profesional",
  description: "Dapatkan rencana latihan yang dipersonalisasi dari pelatih AI yang dirancang untuk biomekanik dan tujuanmu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased h-full`}
    >
      <body className="font-sans min-h-full flex flex-col bg-zinc-950 text-zinc-50 selection:bg-purple-500/40">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
