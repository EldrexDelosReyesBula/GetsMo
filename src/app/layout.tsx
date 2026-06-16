import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Funnel_Display } from "next/font/google";
import "../styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const funnelDisplay = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-funnel-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GetsMo — Formal Logic Workspace",
  description:
    "Smart truth table generator, Karnaugh map solver, and interactive formal logic learning platform. 100% offline.",
  openGraph: {
    title: "GetsMo — Formal Logic Workspace",
    description:
      "Smart truth tables, K-maps, conditional analysis, and lessons. Runs entirely in your browser.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${funnelDisplay.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
