"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, CarFront } from "lucide-react";
import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useAuth, useLenis } from "@/components/providers/AppProviders";

const navKeys = [
  { key: "home", href: "" },
  { key: "rent", href: "/rent" },
  { key: "sales", href: "/sales" },
  { key: "fleet", href: "/fleet" },
  { key: "contact", href: "/contact" },
];

export function Logo({ base }) {
  return (
    <Link href={base} className="group flex items-center gap-2.5" aria-label="VeloDrive home">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ochre text-white transition duration-500 group-hover:rotate-[-8deg] group-hover:scale-105">
        <CarFront className="h-5 w-5" aria-hidden />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight">
        VELO<span className="text-ochre">.</span>DRIVE
      </span>
    </Link>
  );
}

export default function Header({ locale, dict }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const lenis = useLenis();
  const [openAt, setOpenAt] = useState(null);
  const mobileOpen = openAt === pathname; // closes itself on navigation
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const base = `/${locale}`;

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // while the menu is open: stop page scrolling and close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const l = lenis.current;
    l?.stop();
    document.documentElement.style.overflow = "hidden";
    const esc = (e) => e.key === "Escape" && setOpenAt(null);
    window.addEventListener("keydown", esc);
    return () => {
      l?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [mobileOpen, lenis]);

  function isActive(href) {
    if (href === "") return pathname === base || pathname === `${base}/`;
    return pathname.startsWith(`${base}${href}`);
  }

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-line bg-ink/75 py-3 backdrop-blur-xl" : "py-5"
      } ${hidden && !mobileOpen ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="container-x flex items-center justify-between gap-4">
        <Logo base={base} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navKeys.map(({ key, href }) => (
            <Link
              key={key}
              href={href ? `${base}${href}` : base}
              className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive(href) ? "text-white" : "text-sand/70 hover:text-white"
              }`}
            >
              {isActive(href) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-line-2"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative">{dict.nav[key]}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher locale={locale} />
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href={`${base}/admin`} className="btn btn-ghost btn-sm hidden sm:inline-flex">
                  {dict.nav.admin}
                </Link>
              )}
              <Link
                href={`${base}/account`}
                className="hidden items-center gap-2 rounded-full border border-line-2 py-1.5 pr-3.5 pl-1.5 text-sm font-semibold sm:flex"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ochre text-xs font-extrabold">{initials}</span>
                {user.name.split(" ")[0]}
              </Link>
            </>
          ) : (
            <>
              <Link href={`${base}/login`} className="btn btn-ghost btn-sm hidden sm:inline-flex">
                {dict.nav.login}
              </Link>
              <Link href={`${base}/rent`} className="btn btn-sm hidden sm:inline-flex">
                {dict.nav.bookNow}
              </Link>
            </>
          )}
          <button
            type="button"
            className="relative z-50 inline-flex rounded-full border border-line-2 bg-ink/60 p-2.5 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setOpenAt(mobileOpen ? null : pathname)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

    </header>
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            id="mobile-menu"
            data-lenis-prevent
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink-2 px-6 pt-28 pb-10 lg:hidden"
          >
            {navKeys.map(({ key, href }, i) => (
              <motion.div key={key} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <Link
                  href={href ? `${base}${href}` : base}
                  className={`block border-b border-line py-3 font-display text-4xl font-bold ${isActive(href) ? "text-ochre" : ""}`}
                >
                  {dict.nav[key]}
                </Link>
              </motion.div>
            ))}
            <div className="mt-8 flex gap-3">
              {user ? (
                <>
                  <Link href={`${base}/account`} className="btn flex-1">{dict.nav.account}</Link>
                  <button type="button" onClick={logout} className="btn btn-ghost">{dict.nav.logout}</button>
                </>
              ) : (
                <>
                  <Link href={`${base}/login`} className="btn btn-ghost flex-1">{dict.nav.login}</Link>
                  <Link href={`${base}/rent`} className="btn flex-1">{dict.nav.bookNow}</Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
