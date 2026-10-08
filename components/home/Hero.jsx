"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { isoDate } from "@/lib/format";
import { useDay } from "@/lib/hooks";
import { Magnetic } from "@/components/shared/Motion";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const CITIES = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Hobart", "Darwin"];
const TYPES = ["SUV", "4WD", "Ute", "Electric", "Luxury", "Sedan", "Hatch", "Van", "Convertible"];

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function fireIntro() {
  window.__veloIntroFired = true;
  window.dispatchEvent(new Event("velo:intro"));
}

export default function Hero({ locale, dict }) {
  const router = useRouter();
  const root = useRef(null);
  const [showLoader, setShowLoader] = useState(true);
  const [listing, setListing] = useState("rent");
  const [form, setForm] = useState({ city: "", type: "", from: "", to: "", max: "", fuel: "" });
  const h = dict.home;

  // dates resolve on the client only (Cache Components: no clock reads during prerender)
  const today = useDay(0);
  const dFrom = useDay(1);
  const dTo = useDay(4);
  const from = form.from || dFrom;
  const to = form.to || dTo;

  // preloader (once per session) → headline reveal → 3D intro
  useIso(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("velo-loaded");
    const ctx = gsap.context(() => {
      const reveal = () => {
        fireIntro();
        gsap.fromTo(".hero-line > span", { yPercent: 110 }, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.12, delay: 0.2 });
        gsap.fromTo(".hero-in", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: 0.6 });
      };
      if (reduce || seen) {
        setShowLoader(false);
        if (reduce) fireIntro();
        else reveal();
        return;
      }
      sessionStorage.setItem("velo-loaded", "1");
      gsap.set(".hero-line > span", { yPercent: 110 });
      gsap.set(".hero-in", { opacity: 0 });
      const counter = { v: 0 };
      gsap
        .timeline()
        .to(".loader-word", { y: 0, duration: 0.9, ease: "power4.out", stagger: 0.08 })
        .to(
          counter,
          {
            v: 100,
            duration: 1.6,
            ease: "power2.inOut",
            onUpdate: () => {
              const n = root.current?.querySelector(".loader-count");
              const b = root.current?.querySelector(".loader-bar");
              if (n) n.textContent = Math.round(counter.v);
              if (b) b.style.width = `${counter.v}%`;
            },
          },
          0.2,
        )
        .to(".loader-word", { y: "-110%", duration: 0.6, ease: "power3.in", stagger: 0.05 })
        .to(".loader", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.2")
        .add(reveal, "-=0.45")
        .add(() => setShowLoader(false));
    }, root);

    // parallax the copy away as you scroll past the hero
    const p = gsap.to(".hero-copy", {
      yPercent: -18,
      opacity: 0.2,
      ease: "none",
      scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
    });
    return () => {
      ctx.revert();
      p.scrollTrigger?.kill();
      p.kill();
    };
  }, []);

  function submit(e) {
    e.preventDefault();
    const p = new URLSearchParams({ listing });
    if (form.city) p.set("city", form.city);
    if (form.type) p.set("type", form.type);
    if (listing === "rent") {
      p.set("from", from);
      p.set("to", to);
    } else {
      if (form.max) p.set("max", form.max);
      if (form.fuel) p.set("fuel", form.fuel);
    }
    router.push(`/${locale}/fleet?${p}`);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const field = "flex flex-col gap-0.5 rounded-2xl border border-transparent bg-white/[0.04] px-4 py-3 transition focus-within:border-ochre";
  const label = "text-[11px] font-bold tracking-[0.12em] text-mute uppercase";
  const control = "w-full bg-transparent font-semibold outline-none [color-scheme:dark] [&>option]:bg-ink-2";

  return (
    <section ref={root} className="relative flex min-h-svh items-end overflow-hidden pt-36 pb-16 max-md:pt-28">
      {showLoader && (
        <div className="loader fixed inset-0 z-[90] grid place-items-center bg-ink">
          <div className="overflow-hidden font-display text-4xl font-extrabold tracking-tight sm:text-7xl">
            <span className="loader-word inline-block translate-y-[110%]">VELO</span>
            <span className="loader-word inline-block translate-y-[110%] text-ochre">.</span>
            <span className="loader-word inline-block translate-y-[110%]">DRIVE</span>
          </div>
          <div className="loader-count absolute right-8 bottom-6 font-display text-6xl text-ochre">0</div>
          <div className="loader-bar absolute bottom-0 left-0 h-[3px] w-0 bg-ochre" />
        </div>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute -top-[10vw] -right-[15vw] h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle,rgba(232,100,44,.28),transparent_60%)] blur-3xl"
      />
      <HeroScene />

      <div className="hero-copy container-x pointer-events-none relative z-10">
        <span className="eyebrow hero-in">{dict.hero.badge}</span>
        <h1 className="h-xl mt-5 mb-6">
          <span className="hero-line block overflow-hidden pb-[0.06em]">
            <span className="inline-block">{dict.hero.title}</span>
          </span>
          <span className="hero-line block overflow-hidden pb-[0.06em]">
            <span className="inline-block">
              {(() => {
                const words = dict.hero.titleAccent.split(" ");
                return (
                  <>
                    <span className="outline-text">{words[0]}</span>{" "}
                    <span className="text-ochre">{words.slice(1).join(" ")}</span>
                  </>
                );
              })()}
            </span>
          </span>
        </h1>
        <p className="lead hero-in max-md:[text-shadow:0_2px_14px_#0b0b0d]">{dict.hero.subtitle}</p>

        <form
          onSubmit={submit}
          className="hero-in pointer-events-auto mt-9 max-w-5xl rounded-[28px] border border-line-2 bg-ink-2/70 p-2.5 backdrop-blur-xl"
        >
          <div className="relative m-1.5 mb-2.5 inline-flex gap-1 rounded-full bg-white/5 p-1">
            {["rent", "sale"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setListing(l)}
                className={`relative rounded-full px-5 py-2 text-[13px] font-bold transition ${listing === l ? "bg-ochre text-white" : "text-mute"}`}
              >
                {l === "rent" ? h.searchRent : h.searchBuy}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-[repeat(4,1fr)_auto]">
            <label className={field}>
              <span className={label}>{h.city}</span>
              <select className={control} value={form.city} onChange={set("city")}>
                <option value="">{h.allCities}</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className={field}>
              <span className={label}>{h.type}</span>
              <select className={control} value={form.type} onChange={set("type")}>
                <option value="">{h.anyType}</option>
                {TYPES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {listing === "rent" ? (
              <>
                <label className={field}>
                  <span className={label}>{h.from}</span>
                  <input
                    type="date"
                    className={control}
                    value={from}
                    min={today || undefined}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((f) => ({ ...f, from: v, to: to <= v ? isoDate(new Date(new Date(v).getTime() + 86400000)) : to }));
                    }}
                  />
                </label>
                <label className={field}>
                  <span className={label}>{h.to}</span>
                  <input type="date" className={control} value={to} min={from || undefined} onChange={set("to")} />
                </label>
              </>
            ) : (
              <>
                <label className={field}>
                  <span className={label}>{h.budget}</span>
                  <select className={control} value={form.max} onChange={set("max")}>
                    <option value="">{h.anyBudget}</option>
                    <option value="50000">Under $50k</option>
                    <option value="80000">Under $80k</option>
                    <option value="120000">Under $120k</option>
                    <option value="200000">Under $200k</option>
                  </select>
                </label>
                <label className={field}>
                  <span className={label}>{h.fuel}</span>
                  <select className={control} value={form.fuel} onChange={set("fuel")}>
                    <option value="">{h.anyFuel}</option>
                    {["Petrol", "Diesel", "Hybrid", "Electric"].map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <Magnetic strength={0.15} className="block max-md:col-span-2">
              <button className="btn h-full w-full rounded-2xl px-8 max-md:py-4">
                {h.search} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </Magnetic>
          </div>
        </form>
      </div>

      <div className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2.5 text-[11px] tracking-[0.3em] text-mute uppercase md:flex">
        {h.scroll}
        <i className="block h-11 w-px origin-top animate-[drip_2s_infinite] bg-gradient-to-b from-ochre to-transparent" />
      </div>
    </section>
  );
}
