import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "VeloDrive — Car Rental & Sales Australia",
  description: "Rent or buy premium cars across Australia. Unlimited kilometres, GST-inclusive pricing, finance and trade-ins.",
};

export const viewport = { themeColor: "#0b0b0d" };

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU" className={`${syne.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ink font-sans text-foreground">{children}</body>
    </html>
  );
}
