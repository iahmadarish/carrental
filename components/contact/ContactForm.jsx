"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { useAuth, useToast } from "@/components/providers/AppProviders";
import { api } from "@/lib/api";
import { AU_STATES } from "@/lib/format";
import { useHash } from "@/lib/hooks";

const KINDS = ["contact", "finance", "trade-in", "corporate"];

export default function ContactForm({ dict }) {
  const c = dict.contactForm;
  const { user } = useAuth();
  const toast = useToast();
  const hash = useHash();
  const [picked, setKind] = useState(null);
  const kind = picked || (KINDS.includes(hash) ? hash : "contact");
  const [form, setF] = useState({ name: "", email: "", phone: "", state: "", message: "", consent: false, website: "" });
  // signed-in users get their details pre-filled (until they type over them)
  const f = { ...form, name: form.name || user?.name || "", email: form.email || user?.email || "", phone: form.phone || user?.phone || "", state: form.state || user?.state || "" };
  const [d, setD] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    gsap.fromTo(".kind-fields", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 });
  }, [kind]);

  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setDetail = (k) => (e) => setD((o) => ({ ...o, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api("/enquiries", {
        method: "POST",
        body: { kind, name: f.name, email: f.email, phone: f.phone, state: f.state, message: f.message, website: f.website, details: d },
      });
      toast(r.message, "ok");
      setF((o) => ({ ...o, message: "" }));
      setD({});
    } catch (err) {
      toast(err.message, "err");
    }
    setBusy(false);
  }

  const Field = ({ k, label, type = "text", ph }) => (
    <label>
      <span className="field-label">{label}</span>
      <input type={type} className="input" placeholder={ph} value={d[k] || ""} onChange={setDetail(k)} />
    </label>
  );
  const Select = ({ k, label, options }) => (
    <label>
      <span className="field-label">{label}</span>
      <select className="input" value={d[k] || options[0]} onChange={setDetail(k)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
  const labels = { contact: c.general, finance: c.finance, "trade-in": c.tradeIn, corporate: c.corporate };

  return (
    <div id={kind}>
      <div className="mb-5 inline-flex flex-wrap gap-1 rounded-full bg-white/5 p-1">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k);
              setD({});
              history.replaceState(null, "", `#${k}`);
            }}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${kind === k ? "bg-ochre text-white" : "text-mute hover:text-white"}`}
          >
            {labels[k]}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="panel">
        <input className="sr-only" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} aria-hidden />
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label">{dict.contactPage.form.name}</span>
            <input className="input" required value={f.name} onChange={set("name")} />
          </label>
          <label>
            <span className="field-label">{dict.auth.phone}</span>
            <input className="input" placeholder="04xx xxx xxx" value={f.phone} onChange={set("phone")} />
          </label>
          <label>
            <span className="field-label">{dict.contactPage.form.email}</span>
            <input type="email" className="input" required value={f.email} onChange={set("email")} />
          </label>
          <label>
            <span className="field-label">{dict.auth.state}</span>
            <select className="input" value={f.state} onChange={set("state")}>
              <option value="">—</option>
              {AU_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="kind-fields mt-4 grid gap-4 sm:grid-cols-2">
          {kind === "finance" && (
            <>
              {Field({k: "loanAmount", label: c.loanAmount, type: "number", ph: "45000",})}
              {Select({k: "employment", label: c.employment, options: ["Full-time", "Part-time", "Casual", "Self-employed (ABN)"],})}
              {Field({k: "income", label: c.income, type: "number", ph: "85000",})}
              {Select({k: "residency", label: c.residency, options: ["Australian citizen", "Permanent resident", "Visa holder"],})}
            </>
          )}
          {kind === "trade-in" && (
            <>
              {Field({k: "tradeCar", label: c.tradeCar, ph: "Toyota Hilux SR5",})}
              {Field({k: "tradeYear", label: c.tradeYear, type: "number", ph: "2019",})}
              {Field({k: "tradeKm", label: c.tradeKm, type: "number", ph: "85000",})}
              {Field({k: "tradeRego", label: c.tradeRego, ph: "NSW ABC12D",})}
              {Select({k: "tradeCondition", label: c.condition, options: ["Excellent", "Good", "Fair", "Needs work"],})}
            </>
          )}
          {kind === "corporate" && (
            <>
              {Field({k: "company", label: c.company,})}
              {Field({k: "abn", label: c.abn, ph: "11 222 333 444",})}
              {Select({k: "fleetSize", label: c.fleetSize, options: ["1–5 vehicles", "6–20 vehicles", "21–50 vehicles", "50+ vehicles"],})}
            </>
          )}
        </div>

        <label className="mt-4 block">
          <span className="field-label">{dict.contactPage.form.message}</span>
          <textarea className="input min-h-32" value={f.message} onChange={set("message")} />
        </label>
        <label className="mt-4 flex items-start gap-2.5 text-sm text-mute">
          <input type="checkbox" required checked={f.consent} onChange={set("consent")} className="mt-1" />
          {c.consent}
        </label>
        <button className="btn mt-5 w-full" disabled={busy}>
          {dict.contactPage.form.send} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
