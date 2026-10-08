"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { SlidersHorizontal, X } from "lucide-react";
import VehicleCard, { CardSkeletons, typeLabel } from "@/components/shared/VehicleCard";
import { useStaggerIn } from "@/components/shared/Motion";
import { useLenis } from "@/components/providers/AppProviders";
import { api } from "@/lib/api";
import { aud, fmtDate } from "@/lib/format";

const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"];
const SEATS = ["2", "5", "7"];
const csv = (v) => (v ? v.split(",").filter(Boolean) : []);

function H({ children }) {
  return <p className="mb-3 text-xs font-bold tracking-[0.14em] text-mute uppercase">{children}</p>;
}

function Chips({ values, selected, onToggle, label = (v) => v }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <button key={v} type="button" onClick={() => onToggle(v)} className={`chip ${selected.includes(v) ? "chip-on" : ""}`}>
          {label(v)}
        </button>
      ))}
    </div>
  );
}

/**
 * Inventory with live filters. All filter state lives in the URL, so results are shareable
 * and the home/rent search forms can deep-link here. `lockListing` pins rent/sale pages.
 */
export default function FleetGrid({ locale, dict, lockListing }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const lenis = useLenis();
  const [meta, setMeta] = useState({ makes: [], cities: [], types: [] });
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState(sp.get("q") || "");
  const [drawer, setDrawer] = useState(false);
  const grid = useRef(null);
  const debounce = useRef();

  const f = useMemo(
    () => ({
      listing: lockListing || sp.get("listing") || "",
      city: sp.get("city") || "",
      type: csv(sp.get("type")),
      fuel: csv(sp.get("fuel")),
      make: csv(sp.get("make")),
      seats: sp.get("seats") || "",
      max: sp.get("max") || "",
      q: sp.get("q") || "",
      sort: sp.get("sort") || "",
      page: Number(sp.get("page") || 1),
      from: sp.get("from") || "",
      to: sp.get("to") || "",
    }),
    [sp, lockListing],
  );

  const update = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) => {
        const val = Array.isArray(v) ? v.join(",") : v;
        if (val === "" || val == null) next.delete(k);
        else next.set(k, String(val));
      });
      if (resetPage) next.delete("page");
      if (lockListing) next.delete("listing");
      router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
    },
    [sp, pathname, router, lockListing],
  );

  useEffect(() => {
    api("/cars/meta").then(setMeta).catch(() => {});
  }, []);

  useEffect(() => {
    const p = new URLSearchParams({ page: f.page, limit: 9 });
    ["listing", "city", "seats", "max", "q", "sort"].forEach((k) => f[k] && p.set(k, f[k]));
    ["type", "fuel", "make"].forEach((k) => f[k].length && p.set(k, f[k].join(",")));
    let alive = true;
    if (grid.current) gsap.to(grid.current, { opacity: 0.35, duration: 0.2 });
    api(`/cars?${p}`)
      .then((d) => {
        if (!alive) return;
        setError("");
        setData(d);
      })
      .catch(() => alive && setError(dict.common.error))
      .finally(() => grid.current && gsap.to(grid.current, { opacity: 1, duration: 0.3 }));
    return () => {
      alive = false;
    };
  }, [f, dict.common.error]);

  useStaggerIn(grid, [data]);

  const toggleIn = (key, val) => update({ [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] });
  const sale = f.listing === "sale";
  const maxCap = sale ? 350000 : 600;
  const dateQuery = f.from && f.to ? `?from=${f.from}&to=${f.to}` : "";


  return (
    <div>
      {!lockListing && (
        <div className="mb-10 inline-flex gap-1 rounded-full bg-white/5 p-1">
          {[
            ["", dict.fleetPage.filterAll],
            ["rent", dict.fleetPage.filterRent],
            ["sale", dict.fleetPage.filterSale],
          ].map(([id, label]) => (
            <button
              key={id || "all"}
              type="button"
              onClick={() => update({ listing: id, max: "" })}
              className={`rounded-full px-5 py-2 text-[13px] font-bold transition ${f.listing === id ? "bg-ochre text-white" : "text-mute hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {f.from && f.to && (
        <p className="mb-6 text-sm text-mute">
          📅 {fmtDate(f.from)} → {fmtDate(f.to)}
        </p>
      )}

      <div className="grid items-start gap-10 lg:grid-cols-[270px_1fr]">
        <aside
          className={`flex flex-col gap-7 max-lg:fixed max-lg:inset-0 max-lg:z-[55] max-lg:overflow-y-auto max-lg:bg-ink-2 max-lg:px-6 max-lg:pt-24 max-lg:pb-8 max-lg:transition-transform max-lg:duration-500 lg:sticky lg:top-28 ${
            drawer ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <b className="font-display text-2xl">Filters</b>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setQ("");
                router.replace(pathname, { scroll: false });
              }}
            >
              {dict.common.reset}
            </button>
          </div>
          <div>
            <H>{dict.home.city}</H>
            <select className="input" value={f.city} onChange={(e) => update({ city: e.target.value })}>
              <option value="">{dict.home.allCities}</option>
              {meta.cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <H>{dict.home.type}</H>
            <Chips selected={f.type} onToggle={(v) => toggleIn("type", v)} values={meta.types} label={(v) => typeLabel(dict, v)} />
          </div>
          <div>
            <H>{dict.home.fuel}</H>
            <Chips selected={f.fuel} onToggle={(v) => toggleIn("fuel", v)} values={FUELS} label={(v) => dict.fleet.fuel?.[v.toLowerCase()] ?? v} />
          </div>
          <div>
            <H>Make</H>
            <Chips selected={f.make} onToggle={(v) => toggleIn("make", v)} values={meta.makes} />
          </div>
          <div>
            <H>{dict.vehicleDetail.seats}</H>
            <div className="flex gap-1.5">
              {SEATS.map((s) => (
                <button key={s} type="button" onClick={() => update({ seats: f.seats === s ? "" : s })} className={`chip ${f.seats === s ? "chip-on" : ""}`}>
                  {s}+
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <H>{sale ? "Max price" : "Max / day"}</H>
              <b className="font-display">{f.max ? aud(f.max) : "Any"}</b>
            </div>
            <input
              type="range"
              min={0}
              max={maxCap}
              step={sale ? 5000 : 10}
              defaultValue={f.max || maxCap}
              key={`${f.listing}-${f.max === ""}`}
              aria-label="Maximum price"
              onChange={(e) => {
                const v = e.target.value;
                clearTimeout(debounce.current);
                debounce.current = setTimeout(() => update({ max: Number(v) >= maxCap ? "" : v }), 300);
              }}
            />
          </div>
          <button type="button" className="btn lg:hidden" onClick={() => setDrawer(false)}>
            {data ? `${data.total} ${dict.common.results}` : "OK"}
          </button>
          <button type="button" className="absolute top-6 right-6 rounded-full border border-line-2 p-2 lg:hidden" onClick={() => setDrawer(false)} aria-label="Close filters">
            <X className="h-5 w-5" />
          </button>
        </aside>

        <div>
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2.5">
              <button type="button" className="btn btn-ghost btn-sm lg:hidden" onClick={() => setDrawer(true)}>
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <input
                className="input max-w-xs"
                placeholder="Search make, model…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  clearTimeout(debounce.current);
                  const v = e.target.value;
                  debounce.current = setTimeout(() => update({ q: v }), 350);
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-mute">{data ? `${data.total} ${dict.common.results}` : ""}</span>
              <select className="input w-auto" value={f.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
                <option value="">Recommended</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="newest">Newest</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>

          <div ref={grid} className="grid gap-6 [perspective:1200px] sm:grid-cols-2 xl:grid-cols-3">
            {error ? (
              <p className="col-span-full rounded-3xl border border-dashed border-line-2 p-16 text-center text-mute">{error}</p>
            ) : !data ? (
              <CardSkeletons n={6} />
            ) : data.cars.length ? (
              data.cars.map((car) => (
                <VehicleCard key={car._id} car={car} locale={locale} dict={dict} listing={f.listing || undefined} query={dateQuery} />
              ))
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-line-2 p-16 text-center">
                <h3 className="mb-2 text-2xl font-bold">{dict.common.noResults}</h3>
                <p className="text-mute">{dict.common.noResultsHint}</p>
              </div>
            )}
          </div>

          {data?.pages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    update({ page: n }, { resetPage: false });
                    lenis.current ? lenis.current.scrollTo(grid.current, { offset: -140 }) : grid.current.scrollIntoView();
                  }}
                  className={`h-11 w-11 rounded-full border font-bold ${n === f.page ? "border-ochre bg-ochre" : "border-line-2"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
