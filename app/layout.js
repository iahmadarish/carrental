import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.CLIENT_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://velodrive.com.au";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "VeloDrive — Car Rental & Sales Australia",
  description: "Rent or buy premium cars across Australia. Unlimited kilometres, GST-inclusive pricing, finance and trade-ins.",
  openGraph: {
    title: "VeloDrive — Car Rental & Sales Australia",
    description: "Unlimited kilometres, GST-inclusive pricing, rent or buy premium cars nationwide.",
    type: "website",
    siteName: "VeloDrive",
  },
  twitter: { card: "summary_large_image", title: "VeloDrive", description: "Premium car rental & sales across Australia." },
};

export const viewport = { themeColor: "#0b0b0d" };

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ink font-sans text-foreground">{children}</body>
    </html>
  );
}
