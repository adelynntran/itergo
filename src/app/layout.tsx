import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Caveat } from "next/font/google";
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

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
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
        className={`${dmSans.variable} ${playfair.variable} ${caveat.variable} paper-canvas paper-canvas-warm font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
