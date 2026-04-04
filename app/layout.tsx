import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/** Google fonts so production builds work without checked-in `.woff` files (Vercel clone must build). */
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Axiom Field",
  description:
    "Face-to-face sales operating system: live visit flow, one-line coaching, presentation, disposition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontMono.variable} app-root antialiased text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
