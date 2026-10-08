"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { api } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

/* ---------------- Auth ---------------- */
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

/* ---------------- Toasts ---------------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

/* ---------------- Smooth scroll ---------------- */
const LenisCtx = createContext({ current: null });
export const useLenis = () => useContext(LenisCtx);

export default function AppProviders({ locale, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState([]);
  const lenisRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const { user: u } = await api("/auth/me");
      setUser(u);
      return u;
    } catch {
      setUser(null);
      return null;
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    api("/auth/me")
      .then(({ user: u }) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    router.push(`/${locale}`);
  }, [locale, router]);

  const requireLogin = useCallback(() => {
    router.push(`/${locale}/login?next=${encodeURIComponent(pathname)}`);
  }, [locale, pathname, router]);

  const toast = useCallback((msg, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // Lenis smooth scrolling synced with GSAP ScrollTrigger
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // scroll to top + refresh triggers on route change
  useEffect(() => {
    // wait a frame so the new route is painted, then jump to the top
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    });
    const id = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
    };
  }, [pathname]);

  return (
    <AuthCtx.Provider value={{ user, setUser, ready, refresh, logout, requireLogin }}>
      <ToastCtx.Provider value={toast}>
        <LenisCtx.Provider value={lenisRef}>
          {children}
          <Cursor />
          <div className="grain" aria-hidden />
          <div className="fixed right-5 bottom-5 z-[70] flex flex-col gap-2.5" role="status" aria-live="polite">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`max-w-sm min-w-[260px] rounded-2xl border border-line-2 bg-ink-3 px-4 py-3.5 text-sm shadow-2xl shadow-black/60 border-l-[3px] ${
                  t.type === "ok" ? "border-l-emerald-400" : t.type === "err" ? "border-l-red-400" : "border-l-ochre"
                }`}
                style={{ animation: "toast-in .45s cubic-bezier(.22,1,.36,1)" }}
              >
                {t.msg}
              </div>
            ))}
          </div>
          <style>{`@keyframes toast-in{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}`}</style>
        </LenisCtx.Provider>
      </ToastCtx.Provider>
    </AuthCtx.Provider>
  );
}

/* Custom cursor (desktop only) — grows over links & buttons */
function Cursor() {
  const ring = useRef(null);
  const dot = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ring.current;
    const d = dot.current;
    r.style.display = d.style.display = "block";
    const xr = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" });
    const yr = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" });
    const move = (e) => {
      xr(e.clientX);
      yr(e.clientY);
      gsap.set(d, { x: e.clientX, y: e.clientY });
      const hot = e.target.closest?.("a, button, input, select, textarea, label, [data-hover]");
      r.classList.toggle("is-hot", !!hot);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[80] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white mix-blend-difference transition-[width,height,background] duration-300 [&.is-hot]:h-16 [&.is-hot]:w-16 [&.is-hot]:bg-white"
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[80] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
      />
    </>
  );
}
