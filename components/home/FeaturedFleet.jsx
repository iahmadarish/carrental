"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import VehicleCard, { CardSkeletons } from "@/components/shared/VehicleCard";
import { SplitHeading, useStaggerIn } from "@/components/shared/Motion";
import { api } from "@/lib/api";
import RetryPanel from "@/components/shared/RetryPanel";

export default function FeaturedFleet({ locale, dict }) {
  const [cars, setCars] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const grid = useRef(null);
  const f = dict.home.featured;

  useEffect(() => {
    setError("");
    api("/cars?featured=true&limit=6")
      .then((d) => setCars(d.cars))
      .catch(() => setError(dict.common.error));
  }, [dict.common.error, reloadKey]);

  useStaggerIn(grid, [cars]);

  return (
    <section className="section pt-0">
      <div className="container-x">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <SplitHeading text={f.title} className="h-lg" />
            {f.body && <p className="lead mt-4">{f.body}</p>}
          </div>
          <Link href={`/${locale}/fleet`} className="btn btn-ghost">
            {f.all} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div ref={grid} className="grid gap-6 [perspective:1200px] sm:grid-cols-2 lg:grid-cols-3">
          {error ? (
            <RetryPanel message={error} retryLabel={dict.common.retry} onRetry={() => setReloadKey((k) => k + 1)} />
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
