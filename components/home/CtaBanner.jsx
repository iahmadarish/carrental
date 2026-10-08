"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/Motion";
import { useToast } from "@/components/providers/AppProviders";
import { api } from "@/lib/api";

export default function CtaBanner({ locale, dict }) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const n = dict.home.newsletter;

  async function join(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api("/newsletter", { method: "POST", body: { email } });
      toast(r.message, "ok");
      setEmail("");
    } catch (err) {
      toast(err.message, "err");
    }
    setBusy(false);
  }

  return (
    <section className="section pt-0">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-[40px] bg-ochre px-6 py-16 sm:px-16 sm:py-24">
          <span aria-hidden className="pointer-events-none absolute -right-[2vw] -bottom-[4vw] font-display text-[22vw] leading-[0.8] font-extrabold text-black/10 select-none">
            G’DAY
          </span>
          <h2 className="h-lg relative max-w-[14ch] text-white">{n.title}</h2>
          <p className="relative mt-5 mb-8 max-w-[46ch] text-white/85">{n.body}</p>
          <form onSubmit={join} className="relative flex max-w-md gap-2 rounded-full bg-black/20 p-1.5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={n.placeholder}
              aria-label="Email"
              className="min-w-0 flex-1 bg-transparent px-4 text-white outline-none placeholder:text-white/70"
            />
            <button disabled={busy} className="btn border-ink bg-ink">
              {n.cta}
            </button>
          </form>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/rent`} className="btn border-ink bg-ink">
              {dict.cta.primary} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href={`/${locale}/contact`} className="btn btn-ghost border-white/40 text-white">
              {dict.cta.secondary}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
