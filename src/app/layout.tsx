import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

const biroScriptPlus = localFont({
  src: "../../public/fonts/biro-script-plus.ttf",
  variable: "--font-handwriting",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Itergo - Plan Your Dream Trips Together",
  description:
    "Turn travel dreams into reality with your friends. Collaborative trip planning with AI-powered itineraries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${playfair.variable} ${biroScriptPlus.variable} paper-canvas paper-canvas-warm font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
