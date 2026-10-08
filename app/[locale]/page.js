import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import FeaturedFleet from "@/components/home/FeaturedFleet";
import CtaBanner from "@/components/home/CtaBanner";
import { Marquee, IntroStats, WhyHorizontal, Categories, Steps, FinanceCalc, Locations, Reviews, Faq } from "@/components/home/Sections";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

// Locale is prerendered via generateStaticParams; allow the brief param read to block.
export const instant = false;

export default async function HomePage({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <Marquee items={dict.home.marquee} />
      <IntroStats dict={dict} />
      <Services dict={dict} />
      <FeaturedFleet locale={locale} dict={dict} />
      <WhyHorizontal dict={dict} />
      <Categories dict={dict} locale={locale} />
      <Steps dict={dict} />
      <FinanceCalc dict={dict} locale={locale} />
      <Locations dict={dict} locale={locale} />
      <Reviews dict={dict} />
      <Faq dict={dict} />
      <CtaBanner locale={locale} dict={dict} />
    </>
  );
}
