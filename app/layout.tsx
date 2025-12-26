import type { Metadata } from "next";
import { Manrope, Noto_Serif, Russo_One } from "next/font/google";
import "./globals.css";

const russoOne = Russo_One({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

const notoSerif = Noto_Serif({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
});

const manrope = Manrope({
  variable: "--font-ui",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Read Cyrillic",
  description:
    "Learn the Cyrillic alphabet with quick Russian word practice and pronunciation checks.",
  keywords: [
    "learn cyrillic alphabet",
    "cyrillic alphabet",
    "how to learn cyrillic",
    "learn russian alphabet",
    "russian pronunciation practice",
    "read cyrillic",
  ],
  alternates: {
    canonical: "https://readcyrillic.com",
  },
  openGraph: {
    title: "Read Cyrillic",
    description:
      "Learn the Cyrillic alphabet with quick Russian word practice and pronunciation checks.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Read Cyrillic",
    description:
      "Learn the Cyrillic alphabet with quick Russian word practice and pronunciation checks.",
  },
  icons: {
    icon: [
      {
        url: "/cyrillicfavicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/cyrillicfavicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    shortcut: "/cyrillicfavicons/favicon.ico",
    apple: "/cyrillicfavicons/apple-touch-icon.png",
  },
  manifest: "/cyrillicfavicons/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${russoOne.variable} ${notoSerif.variable} ${manrope.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
