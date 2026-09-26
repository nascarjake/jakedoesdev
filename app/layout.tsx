import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jakedoesdev.com"),
  title: {
    default: "Jacob Clark — The Workbench",
    template: "%s — Jacob Clark",
  },
  description:
    "The workbench of Jacob Clark. Products, tools, and a little bit of play, built with 24+ years of curiosity.",
  openGraph: {
    title: "Jacob Clark",
    description: "Serious code. Playful instincts. Welcome to the workbench.",
    type: "website",
    images: [
      {
        url: "/og-workbench.png",
        width: 1200,
        height: 630,
        alt: "Jacob Clark’s workbench — products, tools, and a little bit of play",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jacob Clark",
    description: "Serious code. Playful instincts. Welcome to the workbench.",
    images: ["/og-workbench.png"],
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
