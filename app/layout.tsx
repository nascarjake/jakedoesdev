import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "jacob-clark-developer-universe.sites.openai.com";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: {
      default: "Jacob Clark — Creative Developer",
      template: "%s — Jacob Clark",
    },
    description:
      "A spatial portfolio from Jacob Clark, a developer with 24+ years of experience building what's next.",
    openGraph: {
      title: "Jacob Clark",
      description: "24+ years building what's next.",
      type: "website",
      images: [
        {
          url: "/og.png",
          width: 1732,
          height: 909,
          alt: "Jacob Clark — 24+ years building what's next",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Jacob Clark",
      description: "24+ years building what's next.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
