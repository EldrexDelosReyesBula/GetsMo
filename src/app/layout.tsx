import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Funnel_Display } from "next/font/google";
import Script from "next/script";
import "../styles.css";

/* ── Fonts ── */
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

/* ── SEO Metadata ── */
export const metadata: Metadata = {
  metadataBase: new URL("https://getsmo.vercel.app"),
  title: {
    default: "GetsMo — Formal Logic Workspace",
    template: "%s | GetsMo",
  },
  description:
    "GetsMo is a free, offline-first formal logic workspace for students and educators. Generate truth tables, solve Karnaugh maps, analyze conditionals, and learn propositional logic — all in your browser.",
  keywords: [
    "formal logic",
    "truth table generator",
    "Karnaugh map",
    "K-map solver",
    "propositional logic",
    "logic calculator",
    "discrete mathematics",
    "tautology checker",
    "logical operators",
    "CS education",
    "logic workspace",
    "offline logic tool",
  ],
  authors: [{ name: "GetsMo" }],
  creator: "GetsMo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://getsmo.vercel.app",
    siteName: "GetsMo",
    title: "GetsMo — Formal Logic Workspace",
    description:
      "Free, offline-first tool for truth tables, Karnaugh maps, conditional analysis, and propositional logic — built for CS, IT, Engineering, and Discrete Mathematics students.",
    images: [
      {
        url: "/getsmo-official-logo.svg",
        width: 1200,
        height: 630,
        alt: "GetsMo — Formal Logic Workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetsMo — Formal Logic Workspace",
    description:
      "Free, offline-first formal logic workspace. Truth tables, K-maps, conditionals, and more — runs entirely in your browser.",
    images: ["/getsmo-official-logo.svg"],
  },
};

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GetsMo",
  url: "https://getsmo.vercel.app",
  description:
    "A free, offline-first formal logic workspace for students and educators. Generate truth tables, solve Karnaugh maps, and learn propositional logic.",
  applicationCategory: "EducationApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Truth Table Generator",
    "Karnaugh Map Solver",
    "Conditional Analysis",
    "Logical Classification",
    "Interactive Learn Mode",
    "100% Offline — No Backend Required",
  ],
};

/* ── Root Layout ── */
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
      <head>
        <link rel="canonical" href="https://getsmo.vercel.app" />
      </head>
      <body>
        {children}

        {/* Structured Data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
