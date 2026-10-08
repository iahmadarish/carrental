"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fades + lifts children marked [data-reveal] when scrolled into view. */
export function Reveal({ as: Tag = "div", children, className = "", stagger = 0.08, y = 40, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      const items = ref.current.querySelectorAll("[data-reveal]");
      const targets = items.length ? items : [ref.current];
      gsap.from(targets, {
        y,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, [stagger, y]);
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

/** Splits a heading into words that slide up from a mask on scroll. */
export function SplitHeading({ as: Tag = "h2", text, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current.querySelectorAll(".w"), {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        stagger: 0.04,
        scrollTrigger: { trigger: ref.current, start: "top 88%" },
      });
    }, ref);
    return () => ctx.revert();
  }, [text]);
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.06em] align-top">
          <span className="w inline-block">{w}</span>
          {" "}
        </span>
      ))}
    </Tag>
  );
}

/** Counts a number up when visible. */
export function CountUp({ to, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (reduced()) {
      el.textContent = Number(to).toLocaleString("en-AU");
      return;
    }
    const o = { v: 0 };
    const t = gsap.to(o, {
      v: to,
      duration: 2.2,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => {
        el.textContent = Math.round(o.v).toLocaleString("en-AU");
      },
    });
    return () => t.kill();
  }, [to]);
  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}

/** Small "magnetic" pull toward the cursor. */
export function Magnetic({ children, strength = 0.3, className = "inline-block" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!window.matchMedia("(hover: hover)").matches || reduced()) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.4 });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,.4)" });
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}

/** Stagger-in cards inside a grid after data loads (call with a changing key). */
export function useStaggerIn(ref, deps) {
  useEffect(() => {
    if (!ref.current || reduced()) return;
    const cards = ref.current.querySelectorAll(".vcard");
    if (!cards.length) return;
    gsap.fromTo(cards, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.8, ease: "power3.out" });
    ScrollTrigger.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
