import { Suspense } from "react";
import RentalSearch from "@/components/rent/RentalSearch";
import FleetGrid from "@/components/fleet/FleetGrid";
import PageHero from "@/components/shared/PageHero";
import { CardSkeletons } from "@/components/shared/VehicleCard";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { Shield, Clock, Truck, Headphones } from "lucide-react";

const benefitIcons = [Shield, Headphones, Clock, Truck];

// Locale is prerendered via generateStaticParams; allow the brief param read to block.
export const instant = false;

export default async function RentPage({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const benefits = Object.values(dict.rentPage.benefits);
  const words = dict.rentPage.title.split(" ");

  return (
    <>
      <PageHero lines={[words.slice(0, -1).join(" "), `${words.at(-1)}.`]} subtitle={dict.rentPage.subtitle}>
        <Suspense fallback={<div className="skeleton h-28" />}>
          <RentalSearch dict={dict} />
        </Suspense>
      </PageHero>

      <section className="container-x pb-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((label, i) => {
            const Icon = benefitIcons[i];
            return (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-line bg-ink-2 px-4 py-4">
                <Icon className="h-5 w-5 shrink-0 text-ochre" aria-hidden />
                <span className="text-sm font-semibold text-sand">{label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-x pb-20">
        <Suspense fallback={<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"><CardSkeletons n={6} /></div>}>
          <FleetGrid locale={locale} dict={dict} lockListing="rent" />
        </Suspense>
      </section>
    </>
  );
}
