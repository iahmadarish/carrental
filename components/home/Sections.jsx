"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Banknote, Bolt, Globe2, Phone, Repeat, ShieldCheck, Star } from "lucide-react";
import { CountUp, Reveal, SplitHeading } from "@/components/shared/Motion";
import { aud } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Brand marquee (speeds up with scroll velocity) ---------------- */
export function Marquee({ items }) {
  const track = useRef(null);
  useEffect(() => {
    if (reduced()) return;
    const tween = gsap.to(track.current, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 400, 4);
        gsap.to(tween, { timeScale: (self.direction === -1 ? -1 : 1) * (1 + v), duration: 0.3, overwrite: true });
      },
    });
    return () => {
      st.kill();
      tween.kill();
    };
  }, []);
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-line py-7 whitespace-nowrap" aria-hidden>
      <div ref={track} className="inline-flex gap-16 pr-16">
        {row.map((b, i) => (
          <span key={i} className="inline-flex items-center gap-16 font-display text-3xl font-bold text-mute sm:text-4xl">
            {b}
            <span className="text-lg text-ochre">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Intro + animated stats ---------------- */
export function IntroStats({ dict }) {
  const h = dict.home;
  return (
    <section className="section">
      <div className="container-x">
        <div className="mb-16 grid items-end gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">{h.intro.label}</span>
            <SplitHeading text={h.intro.title} className="h-lg mt-5" />
          </div>
          <Reveal>
            <p className="lead">{h.intro.body}</p>
          </Reveal>
        </div>
        <Reveal className="grid grid-cols-2 border-t border-line lg:grid-cols-4" stagger={0.1}>
          {h.stats.map((s) => (
            <div key={s.label} data-reveal className="border-line py-8 pr-4 max-lg:border-b lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0">
              <p className="font-display text-5xl leading-none font-bold sm:text-7xl">
                <CountUp to={s.value} />
                <sup className="ml-1 align-top text-[0.4em] text-ochre">{s.suffix}</sup>
              </p>
              <p className="mt-3 text-sm text-mute">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Pinned horizontal "why us" ---------------- */
const WHY_ICONS = [Globe2, ShieldCheck, Bolt, Banknote, Repeat, Phone];
const WHY_STYLES = ["", "bg-ochre border-ochre [&_p]:text-white/85", "", "bg-sand border-sand text-ink [&_p]:text-[#5c554c]", "", "bg-ochre border-ochre [&_p]:text-white/85"];

export function WhyHorizontal({ dict }) {
  const w = dict.home.why;
  const section = useRef(null);
  const track = useRef(null);
  useEffect(() => {
    if (reduced()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const dist = () => track.current.scrollWidth - window.innerWidth;
      const tween = gsap.to(track.current, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
      });
      track.current.querySelectorAll(".why-icon").forEach((icon) => {
        gsap.from(icon, { rotate: -90, scale: 0.4, opacity: 0, duration: 0.8, scrollTrigger: { trigger: icon, containerAnimation: tween, start: "left 85%" } });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} className="overflow-hidden md:flex md:h-svh md:items-center">
      <div
        ref={track}
        className="flex gap-7 px-5 py-20 max-md:flex-col md:py-0 md:pr-[10vw] md:pl-[max(20px,calc((100vw-80rem)/2+2rem))]"
      >
        <div className="flex shrink-0 flex-col justify-center gap-5 md:w-[460px]">
          <span className="eyebrow">{w.label}</span>
          <h2 className="h-lg">{w.title}</h2>
          <p className="lead">{w.hint}</p>
        </div>
        {w.items.map((it, i) => {
          const Icon = WHY_ICONS[i];
          return (
            <div
              key={it.title}
              className={`relative flex shrink-0 flex-col justify-between gap-10 overflow-hidden rounded-[28px] border border-line bg-ink-2 p-9 md:h-[min(520px,70svh)] md:w-[420px] ${WHY_STYLES[i]}`}
            >
              <span className="why-icon grid h-16 w-16 place-items-center rounded-2xl bg-black/15 text-current">
                <Icon className={`h-7 w-7 ${WHY_STYLES[i] ? "" : "text-ochre"}`} aria-hidden />
              </span>
              <div>
                <p className="font-display text-[110px] leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.18)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 mb-3 text-3xl font-bold">{it.title}</h3>
                <p className="text-mute">{it.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Categories ---------------- */
const CAT_ICONS = {
  SUV: "M10 70h100M18 70l8-24q4-8 14-8h40q10 0 16 8l12 24M40 38v-6h40v6",
  "4WD": "M8 66h104M14 66l4-26h76l10 14 8 4v8M26 40v-8h60v8M100 50h10",
  Ute: "M8 68h104M14 68l6-22h34l8-10h22v32M84 46h26v22",
  Electric: "M10 70h100M18 70l12-20q6-8 18-8h30q12 0 20 10l12 18M62 30l-8 14h10l-6 12",
  Luxury: "M6 68h108M14 68l14-16q10-8 26-10h18q16 2 30 14l12 12",
  Van: "M10 70h100M14 70V36q0-6 6-6h56l22 20 8 20M76 30v20h22",
};
export function Categories({ dict, locale }) {
  const c = dict.home.categories;
  return (
    <section className="section pt-0">
      <div className="container-x">
        <span className="eyebrow">{c.label}</span>
        <SplitHeading text={c.title} className="h-lg mt-5 mb-14" />
        <Reveal className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6" stagger={0.06}>
          {Object.entries(CAT_ICONS).map(([type, d]) => (
            <Link
              key={type}
              data-reveal
              href={`/${locale}/fleet?type=${encodeURIComponent(type)}`}
              className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2xl border border-line bg-ink-2 p-5 transition duration-500 hover:-translate-y-2 hover:border-ochre"
            >
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#e8642c,transparent_70%)] opacity-0 transition duration-500 group-hover:opacity-35" />
              <span className="relative font-display text-2xl font-bold">{dict.fleet.categories?.[type.toLowerCase()] ?? type}</span>
              <svg viewBox="0 0 120 90" className="relative w-full fill-none stroke-sand stroke-[1.4] transition duration-700 group-hover:translate-x-2 group-hover:stroke-white">
                <path d={d} />
                <circle cx="34" cy="72" r="9" />
                <circle cx="92" cy="72" r="9" />
              </svg>
              <span className="relative text-[13px] text-mute">{c.explore}</span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- How it works (scroll-linked progress line) ---------------- */
export function Steps({ dict }) {
  const s = dict.home.steps;
  const ref = useRef(null);
  const [on, setOn] = useState(0);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".steps-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
          end: "bottom 55%",
          scrub: true,
          onUpdate: (self) => setOn(Math.ceil(self.progress * s.items.length + 0.2)),
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [s.items.length]);
  return (
    <section className="section pt-0">
      <div className="container-x">
        <span className="eyebrow">{s.label}</span>
        <SplitHeading text={s.title} className="h-lg mt-5 mb-14" />
        <div ref={ref}>
        <Reveal className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          <span className="absolute top-[34px] right-0 left-0 hidden h-px bg-line-2 lg:block" />
          <span className="steps-progress absolute top-[34px] left-0 hidden h-0.5 w-full origin-left scale-x-0 bg-ochre lg:block" />
          {s.items.map((it, i) => (
            <div key={it.title} data-reveal className="relative pr-7">
              <span
                className={`relative z-10 mb-7 grid h-[68px] w-[68px] place-items-center rounded-full border font-display text-xl font-bold transition duration-500 ${
                  i < on ? "border-ochre bg-ochre" : "border-line-2 bg-ink"
                }`}
              >
                {i + 1}
              </span>
              <h4 className="mb-2.5 text-[22px] font-bold">{it.title}</h4>
              <p className="text-[15px] text-mute">{it.desc}</p>
            </div>
          ))}
        </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Finance calculator ---------------- */
export function FinanceCalc({ dict, locale }) {
  const f = dict.home.finance;
  const [v, setV] = useState({ price: 60000, dep: 10000, term: 5, rate: 7.49 });
  const out = useRef({ w: 0, m: 0 });
  const weeklyEl = useRef(null);
  const monthlyEl = useRef(null);

  useEffect(() => {
    const P = Math.max(0, v.price - v.dep);
    const n = v.term * 12;
    const r = v.rate / 100 / 12;
    const monthly = r ? (P * r) / (1 - (1 + r) ** -n) : P / n;
    const weekly = (monthly * 12) / 52;
    const t = gsap.to(out.current, {
      w: weekly,
      m: monthly,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        if (weeklyEl.current) weeklyEl.current.textContent = aud(out.current.w);
        if (monthlyEl.current) monthlyEl.current.textContent = aud(out.current.m);
      },
    });
    return () => t.kill();
  }, [v]);

  const rows = [
    ["price", f.price, 10000, 300000, 1000, aud(v.price)],
    ["dep", f.deposit, 0, 100000, 500, aud(v.dep)],
    ["term", f.term, 1, 7, 1, `${v.term} ${f.years}`],
    ["rate", f.rate, 4, 15, 0.01, `${v.rate.toFixed(2)}%`],
  ];

  return (
    <section className="section pt-0" id="finance">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
        <div>
          <span className="eyebrow">{f.label}</span>
          <SplitHeading text={f.title} className="h-lg mt-5 mb-6" />
          <Reveal>
            <p className="lead">{f.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${locale}/contact#finance`} className="btn">
                {f.cta} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href={`/${locale}/contact#trade-in`} className="btn btn-ghost">
                {f.trade}
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal className="panel">
          {rows.map(([k, label, min, max, step, shown]) => (
            <div key={k} className="mb-6">
              <div className="mb-3 flex justify-between text-sm">
                <span>{label}</span>
                <b className="font-display text-lg">{shown}</b>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={v[k]}
                aria-label={label}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setV((o) => {
                    const next = { ...o, [k]: val };
                    if (next.dep > next.price) next.dep = next.price;
                    return next;
                  });
                }}
              />
            </div>
          ))}
          <div className="flex flex-wrap items-end justify-between gap-5 border-t border-dashed border-line-2 pt-6">
            <div>
              <span className="text-[13px] text-mute">{f.weekly}</span>
              <p ref={weeklyEl} className="font-display text-5xl leading-none font-bold text-ochre sm:text-6xl">
                $0
              </p>
            </div>
            <div className="text-right">
              <span className="text-[13px] text-mute">{f.monthly}</span>
              <p ref={monthlyEl} className="font-display text-2xl font-bold">
                $0
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-mute">{f.fine}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Locations (animated map pins) ---------------- */
const LOCS = [
  { city: "Sydney", state: "NSW", note: "Airport T1/T2 · CBD · Parramatta", x: 508, y: 352 },
  { city: "Melbourne", state: "VIC", note: "Tullamarine · Southbank", x: 425, y: 420 },
  { city: "Brisbane", state: "QLD", note: "Airport · Fortitude Valley", x: 530, y: 262 },
  { city: "Perth", state: "WA", note: "Airport · Fremantle", x: 92, y: 336 },
  { city: "Adelaide", state: "SA", note: "Airport · CBD", x: 345, y: 382 },
  { city: "Darwin", state: "NT", note: "Airport", x: 292, y: 108 },
  { city: "Hobart", state: "TAS", note: "Airport", x: 450, y: 490 },
  { city: "Canberra", state: "ACT", note: "Airport · Civic", x: 478, y: 384 },
];
export function Locations({ dict, locale }) {
  const l = dict.home.locations;
  const svg = useRef(null);
  useEffect(() => {
    if (reduced()) return;
    const t = gsap.from(svg.current.querySelectorAll(".pin"), {
      scale: 0,
      transformOrigin: "center",
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "back.out(3)",
      scrollTrigger: { trigger: svg.current, start: "top 75%" },
    });
    return () => {
      t.scrollTrigger?.kill();
      t.kill();
    };
  }, []);
  return (
    <section className="section pt-0">
      <div className="container-x">
        <span className="eyebrow">{l.label}</span>
        <SplitHeading text={l.title} className="h-lg mt-5 mb-14" />
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <svg ref={svg} viewBox="0 0 600 520" className="w-full" role="img" aria-label="VeloDrive locations across Australia">
            <path
              className="fill-ink-3 stroke-line-2"
              d="M118 162l38-30 30 6 22-22 44-6 18-26 40 6 10-20 34 18 10 30 22-8 24 26-6 30 30 40 34 6 22 28 26 40 4 44 20 40-8 48-26 40-40 30-24 30-42 10-26-12-36 10-40-28-30 8-40-18-24-32-56-6-50 22-46-4-36 18-18-30 10-44-12-50-30-40 6-32 26-30z"
            />
            <path className="fill-ink-3 stroke-line-2" d="M432 470l26-6 14 18-10 22-24 2-12-18z" />
            {LOCS.map((p, i) => (
              <g key={p.city} className="pin">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="10"
                  className="fill-none stroke-ochre"
                  style={{ transformBox: "fill-box", transformOrigin: "center", animation: `ping-ring 2.4s ${i * 0.3}s infinite cubic-bezier(.22,1,.36,1)` }}
                />
                <circle cx={p.x} cy={p.y} r="5" className="fill-ochre" />
                <text
                  x={p.x + (p.x > 480 ? -12 : 12)}
                  y={p.y + 4}
                  textAnchor={p.x > 480 ? "end" : "start"}
                  className="fill-sand text-[13px] font-bold"
                >
                  {p.city}
                </text>
              </g>
            ))}
          </svg>
          <Reveal className="flex flex-col" stagger={0.06}>
            {LOCS.slice(0, 6).map((p) => (
              <Link
                key={p.city}
                data-reveal
                href={`/${locale}/fleet?city=${encodeURIComponent(p.city)}`}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-5 border-b border-line py-5 transition-all duration-500 hover:pl-3"
              >
                <span>
                  <span className="block font-display text-2xl font-bold">{p.city}</span>
                  <span className="text-[13px] text-mute">{p.note}</span>
                </span>
                <span className="text-[13px] text-mute">{p.state}</span>
                <ArrowRight className="h-4 w-4 text-ochre" aria-hidden />
              </Link>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Reviews ---------------- */
export function Reviews({ dict }) {
  const r = dict.home.reviews;
  return (
    <section className="section pt-0">
      <div className="container-x">
        <span className="eyebrow">{r.label}</span>
        <SplitHeading text={r.title} className="h-lg mt-5 mb-14" />
        <Reveal className="grid gap-5 lg:grid-cols-3" stagger={0.12}>
          {r.items.map((it) => (
            <figure key={it.name} data-reveal className="card flex flex-col gap-6 p-8">
              <div className="flex gap-1 text-ochre" aria-label="5 stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
                ))}
              </div>
              <blockquote className="text-lg leading-relaxed">“{it.quote}”</blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ink-3 font-extrabold text-ochre">
                  {it.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map((x) => x[0]).slice(0, 2).join("")}
                </span>
                <span>
                  <b className="block">{it.name}</b>
                  <span className="text-[13px] text-mute">{it.place}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- FAQ accordion ---------------- */
export function Faq({ dict }) {
  const f = dict.home.faq;
  const [open, setOpen] = useState(-1);
  const refs = useRef([]);
  function toggle(i) {
    const next = open === i ? -1 : i;
    refs.current.forEach((el, k) => {
      if (!el) return;
      gsap.to(el, { height: k === next ? "auto" : 0, duration: 0.6, ease: "power3.inOut", onComplete: () => ScrollTrigger.refresh() });
    });
    setOpen(next);
  }
  return (
    <section className="section pt-0" id="faq">
      <div className="container-x max-w-4xl">
        <div className="mb-12 text-center">
          <span className="eyebrow">{f.label}</span>
          <SplitHeading text={f.title} className="h-lg mt-5" />
        </div>
        <Reveal stagger={0.05}>
          {f.items.map((it, i) => (
            <div key={it.q} data-reveal className="border-b border-line">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-5 py-6 text-left font-display text-lg font-bold sm:text-2xl"
              >
                {it.q}
                <span
                  className={`relative h-9 w-9 shrink-0 rounded-full border transition duration-500 before:absolute before:top-1/2 before:left-1/2 before:h-[1.5px] before:w-3 before:-translate-1/2 before:bg-current after:absolute after:top-1/2 after:left-1/2 after:h-3 after:w-[1.5px] after:-translate-1/2 after:bg-current ${
                    open === i ? "rotate-45 border-ochre bg-ochre" : "border-line-2"
                  }`}
                />
              </button>
              <div ref={(el) => (refs.current[i] = el)} className="h-0 overflow-hidden">
                <p className="max-w-[70ch] pb-6 text-mute">{it.a}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
