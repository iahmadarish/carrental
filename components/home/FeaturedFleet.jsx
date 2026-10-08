"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import VehicleCard, { CardSkeletons } from "@/components/shared/VehicleCard";
import { SplitHeading, useStaggerIn } from "@/components/shared/Motion";
import { api } from "@/lib/api";

export default function FeaturedFleet({ locale, dict }) {
  const [cars, setCars] = useState(null);
  const [error, setError] = useState("");
  const grid = useRef(null);
  const f = dict.home.featured;

  useEffect(() => {
    api("/cars?featured=true&limit=6")
      .then((d) => setCars(d.cars))
      .catch(() => setError(dict.common.error));
  }, [dict.common.error]);

  useStaggerIn(grid, [cars]);

  return (
    <section className="section pt-0">
      <div className="container-x">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">{f.label}</span>
            <SplitHeading text={f.title} className="h-lg mt-5" />
          </div>
          <Link href={`/${locale}/fleet`} className="btn btn-ghost">
            {f.all} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div ref={grid} className="grid gap-6 [perspective:1200px] sm:grid-cols-2 lg:grid-cols-3">
          {error ? (
            <p className="col-span-full rounded-3xl border border-dashed border-line-2 p-16 text-center text-mute">{error}</p>
          ) : cars ? (
            cars.map((car) => <VehicleCard key={car._id} car={car} locale={locale} dict={dict} />)
          ) : (
            <CardSkeletons n={3} />
          )}
        </div>
      </div>
    </section>
  );
}
