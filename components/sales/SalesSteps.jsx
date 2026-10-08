"use client";

import { Reveal } from "@/components/shared/Motion";

export default function SalesSteps({ dict }) {
  return (
    <section className="pb-16">
      <div className="container-x">
        <h2 className="h-md">{dict.salesPage.processTitle}</h2>
        <Reveal as="ol" className="mt-8 grid gap-5 md:grid-cols-3" stagger={0.1}>
          {dict.salesPage.steps.map((step, i) => (
            <li key={step.title} data-reveal className="card group p-7 transition duration-500 hover:border-ochre/60">
              <span className="font-display text-5xl font-bold text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.25)] transition group-hover:[-webkit-text-stroke-color:#e8642c]">
                0{i + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-mute">{step.desc}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
