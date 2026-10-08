"use client";

import { useEffect } from "react";

export default function LocaleHtml({ locale }) {
  useEffect(() => {
    document.documentElement.lang = locale === "au" ? "en-AU" : locale === "nz" ? "en-NZ" : locale;
  }, [locale]);

  return null;
}
