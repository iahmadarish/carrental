"use client";

import { BadgeCheck, FileCheck, Percent } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

export default function SalesHero({ dict }) {
  const highlights = [
    { icon: Percent, text: dict.salesPage.finance },
    { icon: BadgeCheck, text: dict.salesPage.warranty },
    { icon: FileCheck, text: dict.salesPage.inspection },
  ];
  const words = dict.salesPage.title.split(" ");
  const cut = Math.ceil(words.length / 2);

  return (
    <PageHero
      eyebrow={dict.nav.sales}
      lines={[words.slice(0, cut).join(" "), words.slice(cut).join(" ")]}
      subtitle={dict.salesPage.subtitle}
    >
      <div className="flex flex-wrap gap-3">
        {highlights.map(({ icon: Icon, text }) => (
          <span key={text} className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold">
            <Icon className="h-4 w-4 text-ochre" aria-hidden />
            {text}
          </span>
        ))}
      </div>
    </PageHero>
  );
}
