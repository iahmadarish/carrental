import { Suspense } from "react";
import FleetGrid from "@/components/fleet/FleetGrid";
import SalesHero from "@/components/sales/SalesHero";
import SalesSteps from "@/components/sales/SalesSteps";
import { CardSkeletons } from "@/components/shared/VehicleCard";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

// Locale is prerendered via generateStaticParams; allow the brief param read to block.
export const instant = false;

export default async function SalesPage({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <>
      <SalesHero dict={dict} />
      <SalesSteps dict={dict} />
      <section className="container-x border-t border-line pt-16 pb-20">
        <Suspense fallback={<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"><CardSkeletons n={6} /></div>}>
          <FleetGrid locale={locale} dict={dict} lockListing="sale" />
        </Suspense>
      </section>
    </>
  );
}
