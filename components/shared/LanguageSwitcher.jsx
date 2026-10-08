"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { localeLabels, locales } from "@/lib/i18n/config";

export default function LanguageSwitcher({ locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function switchLocale(next) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || "/");
    setOpen(false);
  }

  const current = localeLabels[locale] ?? localeLabels.en;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line-2 bg-transparent px-3 py-2 text-sm font-medium text-foreground transition hover:border-sand"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4 text-mute" aria-hidden />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-mute" aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-line-2 bg-ink-3 py-1 shadow-2xl shadow-black/60"
        >
          {locales.map((code) => {
            const item = localeLabels[code];
            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={code === locale}
                  onClick={() => switchLocale(code)}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-white/5 ${
                    code === locale ? "font-semibold text-ochre-2" : "text-sand"
                  }`}
                >
                  <span>{item.flag}</span>
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
