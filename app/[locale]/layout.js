import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LocaleHtml from "@/components/providers/LocaleHtml";
import AppProviders from "@/components/providers/AppProviders";
import { isValidLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    openGraph: { title: dict.meta.title, description: dict.meta.description, type: "website", locale: locale === "au" ? "en_AU" : locale },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRental",
  name: "VeloDrive",
  url: "https://velodrive.com.au",
  telephone: "+61-1300-835-637",
  priceRange: "A$59–A$549 per day",
  areaServed: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Hobart", "Darwin", "Canberra", "Gold Coast"],
  address: { "@type": "PostalAddress", addressCountry: "AU", addressRegion: "NSW", addressLocality: "Sydney" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "2148" },
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <AppProviders locale={locale}>
      <LocaleHtml locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header locale={locale} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} dict={dict} />
    </AppProviders>
  );
}
