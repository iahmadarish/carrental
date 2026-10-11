import { Suspense } from "react";
import FleetGrid from "@/components/fleet/FleetGrid";
import PageHero from "@/components/shared/PageHero";
import { CardSkeletons } from "@/components/shared/VehicleCard";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

// Locale is prerendered via generateStaticParams; allow the brief param read to block.
export const instant = false;

export default async function FleetPage({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const words = dict.fleetPage.title.split(" ");

  return (
    <>
      <PageHero lines={[words[0], words.slice(1).join(" ") || "fleet."]} subtitle={dict.fleetPage.subtitle} />
      <section className="container-x pb-20">
        {/* filters read the URL (useSearchParams), so they stream in behind a fallback */}
        <Suspense fallback={<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"><CardSkeletons n={6} /></div>}>
          <FleetGrid locale={locale} dict={dict} />
        </Suspense>
      </section>
    </>
  );
}
