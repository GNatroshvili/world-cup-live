import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";
import { ModalHost } from "@/components/layout/ModalHost/ModalHost";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_NAME = "World Cup 2026 Live";
const SITE_DESC =
  "Live FIFA World Cup 2026 hub — group standings, results, fixtures, the full knockout bracket, team profiles and tournament statistics across the USA, Canada and Mexico.";

export const metadata: Metadata = {
  metadataBase: new URL("https://worldcup2026.example.com"),
  title: {
    default: `${SITE_NAME} · Groups, Bracket & Stats`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "World Cup 2026",
    "FIFA",
    "group standings",
    "knockout bracket",
    "fixtures",
    "results",
    "football",
    "soccer",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: "World Cup Live" }],
  openGraph: {
    type: "website",
    title: `${SITE_NAME} · Groups, Bracket & Stats`,
    description: SITE_DESC,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#06070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <ModalHost />
      </body>
    </html>
  );
}
