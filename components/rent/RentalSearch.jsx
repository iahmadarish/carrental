"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, CarFront, MapPin, Search } from "lucide-react";
import { useDay } from "@/lib/hooks";

const CITIES = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Hobart", "Darwin"];
const TYPES = ["SUV", "4WD", "Ute", "Electric", "Luxury", "Sedan", "Hatch", "Van", "Convertible"];

function L({ icon: Icon, children }) {
  return (
    <span className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-mute uppercase">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </span>
  );
}

/** Updates the rent page's URL filters (the grid below reacts to them). */
export default function RentalSearch({ dict }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [form, setForm] = useState({ city: sp.get("city") || "", type: sp.get("type") || "", from: sp.get("from") || "", to: sp.get("to") || "" });
  const today = useDay(0);
  const dFrom = useDay(1);
  const dTo = useDay(4);
  const from = form.from || dFrom;
  const to = form.to || dTo;

  function submit(e) {
    e.preventDefault();
    const p = new URLSearchParams();
    Object.entries({ ...form, from, to }).forEach(([k, v]) => v && p.set(k, v));
    router.replace(`${pathname}?${p}`, { scroll: false });
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const t = dict.rentPage.form;

  return (
    <form onSubmit={submit} className="panel grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto] lg:items-end">
      <label>
        <L icon={MapPin}>{t.location}</L>
        <select className="input" value={form.city} onChange={set("city")}>
          <option value="">{dict.home.allCities}</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        <L icon={Calendar}>{t.pickup}</L>
        <input type="date" className="input [color-scheme:dark]" min={today || undefined} value={from} onChange={set("from")} />
      </label>
      <label>
        <L icon={Calendar}>{t.return}</L>
        <input type="date" className="input [color-scheme:dark]" min={from || undefined} value={to} onChange={set("to")} />
      </label>
      <label>
        <L icon={CarFront}>{t.category}</L>
        <select className="input" value={form.type} onChange={set("type")}>
          <option value="">{t.allCategories}</option>
          {TYPES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <button className="btn h-[52px]">
        <Search className="h-4 w-4" aria-hidden /> {t.search}
      </button>
    </form>
  );
}
