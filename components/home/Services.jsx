"use client";

import { CarFront, KeyRound, Sparkles } from "lucide-react";
import { Reveal, SplitHeading } from "@/components/shared/Motion";

const items = [
  { key: "rent", Icon: KeyRound },
  { key: "sales", Icon: CarFront },
  { key: "concierge", Icon: Sparkles },
];

export default function Services({ dict }) {
  return (
    <section className="section pt-0">
      <div className="container-x">
        <span className="eyebrow">{dict.services.label}</span>
        <SplitHeading text={dict.services.title} className="h-lg mt-5 mb-14" />
        <Reveal className="grid gap-5 md:grid-cols-3" stagger={0.12}>
          {items.map(({ key, Icon }, i) => (
            <div
              key={key}
              data-reveal
              className="group card relative overflow-hidden p-8 transition duration-500 hover:-translate-y-1.5 hover:border-ochre/60"
            >
              <span className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-ochre/0 blur-3xl transition duration-700 group-hover:bg-ochre/25" />
              <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-ochre/12 text-ochre transition duration-500 group-hover:rotate-[-8deg] group-hover:bg-ochre group-hover:text-white">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <p className="relative mt-10 font-display text-sm text-mute">0{i + 1}</p>
              <h3 className="relative mt-1 text-2xl font-bold">{dict.services[key].title}</h3>
              <p className="relative mt-3 text-mute">{dict.services[key].desc}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
