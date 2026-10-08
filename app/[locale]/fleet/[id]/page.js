import { Suspense } from "react";
import { notFound } from "next/navigation";
import VehicleDetail from "@/components/vehicle/VehicleDetail";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";

// Cars come from the database, so `id` (the car's slug) is only known per request.
// The shared layout reads the pathname (header, auth), so this route renders per request.
export const instant = false;

export default function VehicleDetailPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="container-x grid gap-10 pt-36 pb-20 lg:grid-cols-[1.5fr_1fr]">
          <div className="skeleton aspect-[16/10]" />
          <div className="skeleton min-h-[520px]" />
        </div>
      }
    >
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }) {
  const { locale, id } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  return <VehicleDetail slug={id} locale={locale} dict={dict} />;
}
