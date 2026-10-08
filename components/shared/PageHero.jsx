"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Big page title whose lines rise out of a mask on load. */
export default function PageHero({ eyebrow, lines, accentLine = 1, subtitle, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".ph-line > span", { yPercent: 110, duration: 1.2, ease: "power4.out", stagger: 0.1, delay: 0.05 });
      gsap.from(".ph-in", { opacity: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.35 });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="relative overflow-hidden pt-40 pb-14 sm:pt-44">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(232,100,44,.18),transparent_60%)] blur-2xl"
      />
      <div className="container-x relative">
        {eyebrow && <span className="eyebrow ph-in">{eyebrow}</span>}
        <h1 className="h-lg mt-5">
          {lines.map((l, i) => (
            <span key={i} className="ph-line block overflow-hidden pb-[0.06em]">
              <span className={`inline-block ${i === accentLine ? "text-ochre" : ""}`}>{l}</span>
            </span>
          ))}
        </h1>
        {subtitle && <p className="lead ph-in mt-6">{subtitle}</p>}
        {children && <div className="ph-in mt-10">{children}</div>}
      </div>
    </section>
  );
}
