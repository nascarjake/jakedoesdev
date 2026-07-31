import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jakedoesdev.com"),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
