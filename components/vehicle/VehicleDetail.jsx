"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, MapPin, Star, X } from "lucide-react";
import VehicleCard, { FavButton, SmartImage, typeLabel } from "@/components/shared/VehicleCard";
import { Reveal } from "@/components/shared/Motion";
import { useAuth, useLenis, useToast } from "@/components/providers/AppProviders";
import { api } from "@/lib/api";
import { aud, fmtDate, km } from "@/lib/format";
import { useDay } from "@/lib/hooks";

export default function VehicleDetail({ slug, locale, dict }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [img, setImg] = useState(0);
  const [mode, setMode] = useState("rental");
  const [enquiry, setEnquiry] = useState(false);
  const sp = useSearchParams();
  const t = dict.vehicleDetail;

  useEffect(() => {
    api(`/cars/${encodeURIComponent(slug)}`)
      .then((d) => {
        setData(d);
        setMode(d.car.listing === "sale" || sp.get("mode") === "sale" ? "sale" : "rental");
      })
      .catch((e) => setError(e.status === 404 ? t.notFound : dict.common.error));
  }, [slug, sp, t.notFound, dict.common.error]);

  if (error)
    return (
      <div className="container-x py-48 text-center">
        <h1 className="h-md">{error}</h1>
        <Link href={`/${locale}/fleet`} className="btn mt-8">
          ← {t.back}
        </Link>
      </div>
    );
  if (!data)
    return (
      <div className="container-x grid gap-10 pt-36 pb-20 lg:grid-cols-[1.5fr_1fr]">
        <div className="skeleton aspect-[16/10]" />
        <div className="skeleton min-h-[520px]" />
      </div>
    );

  const { car, similar, booked } = data;
  const images = car.images?.length ? car.images : [""];
  const canRent = car.listing !== "sale";
  const canBuy = car.listing !== "rent";

  return (
    <div className="container-x pt-32 pb-12">
      <Link href={`/${locale}/fleet`} className="link-u inline-flex items-center gap-1.5 text-sm text-mute">
        <ArrowLeft className="h-4 w-4" /> {t.back}
      </Link>

      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Reveal className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-ink-2">
            <SmartImage key={img} src={images[img]} alt={car.title} priority sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" />
            <div className="absolute top-4 left-4 flex gap-1.5">
              {canRent && <span className="badge">{t.rent}</span>}
              {canBuy && <span className="badge badge-ochre">{t.buy}</span>}
              {car.fuel === "Electric" && <span className="badge badge-gum">EV</span>}
            </div>
            <FavButton carId={car._id} className="absolute top-3.5 right-3.5" />
          </Reveal>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImg(i)}
                  className={`relative aspect-[16/10] w-28 overflow-hidden rounded-xl border-2 transition ${i === img ? "border-ochre" : "border-transparent opacity-60 hover:opacity-100"}`}
                  aria-label={`Photo ${i + 1}`}
                >
                  <SmartImage src={src} alt="" sizes="112px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <Reveal className="mt-10">
            <span className="eyebrow">
              {car.make} · {car.year}
            </span>
            <h1 className="h-md mt-4">{car.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-mute">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {car.city}, {car.state}
              </span>
              <span className="flex items-center gap-1 font-bold text-foreground">
                <Star className="h-4 w-4 fill-ochre text-ochre" /> {car.rating.toFixed(1)}
                <span className="font-normal text-mute">
                  ({car.reviews} {t.reviews})
                </span>
              </span>
              <span className="flex items-center gap-2">
                ANCAP
                <span className="flex gap-0.5" aria-label={`${car.ancap} star ANCAP`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < car.ancap ? "fill-ochre text-ochre" : "text-line-2"}`} />
                  ))}
                </span>
              </span>
            </div>
            <p className="lead mt-5 max-w-none">{car.description}</p>
          </Reveal>

          <Reveal className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3" stagger={0.03} y={20}>
            {[
              [t.type, typeLabel(dict, car.type)],
              [dict.vehicleDetail.seats, car.seats],
              [t.transmission, car.transmission],
              [t.fuel, car.fuel],
              [t.engine, car.engine || "—"],
              [car.fuel === "Electric" ? t.range : t.economy, (car.fuel === "Electric" ? car.range : car.fuelEconomy) || "—"],
              [t.odometer, km(car.odometer)],
              [t.colour, car.colour || "—"],
              [t.doors, car.doors],
            ].map(([k, v]) => (
              <div key={k} data-reveal className="bg-ink-2 p-4">
                <span className="block text-[11px] tracking-[0.1em] text-mute uppercase">{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </Reveal>

          <h3 className="mt-10 text-2xl font-bold">{t.features}</h3>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {car.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sand">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gum/20 text-[11px] text-gum">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <aside className="panel lg:sticky lg:top-28">
          {canRent && canBuy && (
            <div className="mb-6 inline-flex gap-1 rounded-full bg-white/5 p-1">
              {[
                ["rental", t.rent],
                ["sale", t.buy],
              ].map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-full px-5 py-2 text-[13px] font-bold transition ${mode === m ? "bg-ochre text-white" : "text-mute"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {mode === "rental" ? (
            <BookingPanel car={car} booked={booked} dict={dict} locale={locale} />
          ) : (
            <SalePanel car={car} dict={dict} onEnquire={() => setEnquiry(true)} />
          )}
        </aside>
      </div>

      {similar?.length > 0 && (
        <section className="pt-24">
          <h2 className="h-md mb-10">{t.similar}</h2>
          <div className="grid gap-6 [perspective:1200px] sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <VehicleCard key={s._id} car={s} locale={locale} dict={dict} />
            ))}
          </div>
        </section>
      )}

      {enquiry && <EnquiryModal car={car} dict={dict} onClose={() => setEnquiry(false)} />}
    </div>
  );
}

/* ---------------- Rental booking with live server quote ---------------- */
function BookingPanel({ car, booked, dict, locale }) {
  const t = dict.vehicleDetail;
  const { user, requireLogin } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const sp = useSearchParams();
  const today = useDay(0);
  const dFrom = useDay(1);
  const dTo = useDay(4);
  const [form, setF] = useState({
    startDate: sp.get("from") || "",
    endDate: sp.get("to") || "",
    pickupLocation: `${car.city} Airport`,
    insurance: "standard",
    childSeat: false,
    etag: false,
    gps: false,
    additionalDriver: false,
  });
  const [quote, setQ] = useState(null);
  const [busy, setBusy] = useState(false);
  const totalEl = useRef(null);
  const shown = useRef({ v: 0 });
  const f = { ...form, startDate: form.startDate || dFrom, endDate: form.endDate || dTo };
  const datesOk = !!f.startDate && !!f.endDate && f.endDate > f.startDate;
  const q = datesOk ? quote : null;

  const payload = () => ({
    carId: car._id,
    kind: "rental",
    startDate: f.startDate,
    endDate: f.endDate,
    pickupLocation: f.pickupLocation,
    extras: { insurance: f.insurance, childSeat: f.childSeat, gps: f.gps, etag: f.etag, additionalDriver: f.additionalDriver },
  });

  const quoteKey = JSON.stringify(f);
  useEffect(() => {
    if (!datesOk) return;
    const id = setTimeout(() => {
      api(`/cars/${car._id}/quote`, { method: "POST", body: payload() })
        .then((r) => {
          setQ(r);
          gsap.to(shown.current, {
            v: r.total,
            duration: 0.6,
            ease: "power2.out",
            onUpdate: () => totalEl.current && (totalEl.current.textContent = aud(shown.current.v, 2)),
          });
        })
        .catch(() => {});
    }, 200);
    return () => clearTimeout(id);
    // payload() is derived from quoteKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey, datesOk, car._id]);

  async function reserve(e) {
    e.preventDefault();
    if (!user) {
      toast(t.loginToBook);
      return requireLogin();
    }
    setBusy(true);
    try {
      const r = await api("/bookings", { method: "POST", body: payload() });
      toast(`${r.message} Ref ${r.booking.reference}`, "ok");
      router.push(`/${locale}/account`);
    } catch (err) {
      toast(err.message, "err");
      if (err.data?.code === "UNVERIFIED") router.push(`/${locale}/register?verify=${encodeURIComponent(user.email)}`);
    }
    setBusy(false);
  }

  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <form onSubmit={reserve}>
      <p className="font-display text-4xl font-bold">
        {aud(car.pricePerDay)}
        <span className="mt-1 block font-sans text-xs font-medium text-mute">{dict.common.perDay} · unlimited km · GST incl.</span>
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <label>
          <span className="field-label">{t.pickup}</span>
          <input type="date" className="input [color-scheme:dark]" min={today || undefined} value={f.startDate} onChange={set("startDate")} required />
        </label>
        <label>
          <span className="field-label">{t.return}</span>
          <input type="date" className="input [color-scheme:dark]" min={f.startDate || undefined} value={f.endDate} onChange={set("endDate")} required />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="field-label">{t.pickupLocation}</span>
        <select className="input" value={f.pickupLocation} onChange={set("pickupLocation")}>
          {["Airport", "CBD", "Showroom"].map((p) => (
            <option key={p}>{`${car.city} ${p}`}</option>
          ))}
        </select>
      </label>
      <p className="field-label mt-5">{t.protection}</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["standard", "Standard", "$4,000 excess"],
          ["premium", "+$25/day", "$1,000 excess"],
          ["zero-excess", "+$39/day", "$0 excess"],
        ].map(([v, a, b]) => (
          <label key={v} className={`cursor-pointer rounded-2xl border p-3 text-xs transition ${f.insurance === v ? "border-ochre bg-ochre/10" : "border-line-2"}`}>
            <input type="radio" name="insurance" value={v} checked={f.insurance === v} onChange={set("insurance")} className="sr-only" />
            <b className="block text-sm">{a}</b>
            <span className="text-mute">{b}</span>
          </label>
        ))}
      </div>
      <div className="mt-4">
        {[
          ["childSeat", t.childSeat, "$12/day"],
          ["etag", t.etag, "$6/day"],
          ["gps", t.gps, "$9/day"],
          ["additionalDriver", t.additionalDriver, "$8/day"],
        ].map(([k, label, price]) => (
          <label key={k} className="flex cursor-pointer items-center justify-between border-b border-line py-3 text-sm">
            <span>{label}</span>
            <span className="ml-auto mr-4 text-mute">{price}</span>
            <input type="checkbox" checked={f[k]} onChange={set(k)} className="h-[18px] w-[18px]" />
          </label>
        ))}
      </div>

      <div className="my-5 space-y-2.5 text-sm">
        {q ? (
          <>
            <Row a={`${aud(car.pricePerDay)} × ${q.days} day${q.days > 1 ? "s" : ""}`} b={aud(q.base, 2)} />
            {q.discount > 0 && <Row a={`${t.longHire} (${Math.round(q.discountRate * 100)}%)`} b={`−${aud(q.discount, 2)}`} accent />}
            <Row a={t.extrasTotal} b={aud(q.extrasTotal, 2)} />
            <Row a={t.includesGst} b={aud(q.gst, 2)} />
          </>
        ) : (
          <p className="text-mute">—</p>
        )}
      </div>
      <div className="flex items-end justify-between border-t border-dashed border-line-2 pt-4">
        <span className="text-mute">{t.total}</span>
        <b ref={totalEl} className="font-display text-3xl">
          —
        </b>
      </div>
      <button className="btn mt-5 w-full" disabled={busy || !q}>
        {busy ? "…" : t.reserve} <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
      <p className="mt-3 text-center text-xs text-mute">{t.freeCancel}</p>
      {booked?.length > 0 && (
        <p className="mt-2 text-xs text-mute">
          {t.booked}: {booked.map((b) => `${fmtDate(b.startDate)} – ${fmtDate(b.endDate)}`).join(", ")}
        </p>
      )}
    </form>
  );
}

function Row({ a, b, accent }) {
  return (
    <div className={`flex justify-between ${accent ? "text-ochre-2" : ""}`}>
      <span className={accent ? "" : "text-mute"}>{a}</span>
      <span>{b}</span>
    </div>
  );
}

/* ---------------- Sale: finance estimate + test drive ---------------- */
function SalePanel({ car, dict, onEnquire }) {
  const t = dict.vehicleDetail;
  const { user, requireLogin } = useAuth();
  const toast = useToast();
  const [date, setDate] = useState("");
  const today = useDay(1);
  const [busy, setBusy] = useState(false);

  const P = car.salePrice * 0.8;
  const r = 0.0749 / 12;
  const weekly = (((P * r) / (1 - (1 + r) ** -60)) * 12) / 52;

  async function testDrive(e) {
    e.preventDefault();
    if (!user) {
      toast(t.loginToBook);
      return requireLogin();
    }
    setBusy(true);
    try {
      const res = await api("/bookings", { method: "POST", body: { carId: car._id, kind: "test-drive", startDate: date, pickupLocation: `${car.city} showroom` } });
      toast(`Test drive requested · Ref ${res.booking.reference}`, "ok");
      setDate("");
    } catch (err) {
      toast(err.message, "err");
    }
    setBusy(false);
  }

  return (
    <div>
      <p className="font-display text-4xl font-bold">
        {aud(car.salePrice)}
        <span className="mt-1 block font-sans text-xs font-medium text-mute">{dict.common.driveAway} · GST & on-road costs incl.</span>
      </p>
      <div className="my-6 space-y-2.5 text-sm">
        <Row a={t.financeFrom} b={`${aud(weekly)}/wk`} />
        <Row a={t.odometer} b={km(car.odometer)} />
        <Row a={t.warranty} b={t.warrantyValue} />
        <Row a="Roadworthy (RWC)" b="✓" />
      </div>
      <form onSubmit={testDrive}>
        <label className="block">
          <span className="field-label">{t.testDrive}</span>
          <input type="date" required className="input [color-scheme:dark]" min={today || undefined} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button className="btn mt-3 w-full" disabled={busy}>
          {t.testDriveCta} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </form>
      <button type="button" onClick={onEnquire} className="btn btn-ghost mt-2.5 w-full">
        {t.enquire}
      </button>
      <p className="mt-4 text-xs leading-relaxed text-mute">
        Finance estimate: 20% deposit, 5 years at 7.49% p.a. Comparison rate, fees and charges apply. Estimate only.
      </p>
    </div>
  );
}

/* ---------------- Enquiry modal ---------------- */
function EnquiryModal({ car, dict, onClose }) {
  const { user } = useAuth();
  const toast = useToast();
  const lenis = useLenis();
  const box = useRef(null);
  const [f, setF] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", message: "", finance: false, tradein: false, website: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const l = lenis.current;
    l?.stop();
    gsap.fromTo(box.current, { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" });
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      l?.start();
      window.removeEventListener("keydown", esc);
    };
  }, [lenis, onClose]);

  async function send(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api("/enquiries", {
        method: "POST",
        body: { kind: "purchase", name: f.name, email: f.email, phone: f.phone, message: f.message, car: car._id, website: f.website, details: { finance: f.finance, tradein: f.tradein, car: car.title } },
      });
      toast(r.message, "ok");
      onClose();
    } catch (err) {
      toast(err.message, "err");
    }
    setBusy(false);
  }
  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div className="fixed inset-0 z-[65] grid place-items-center bg-black/65 p-5 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <form ref={box} onSubmit={send} className="panel max-h-[90svh] w-full max-w-xl overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-2xl font-bold">{dict.vehicleDetail.enquire}</h3>
          <button type="button" onClick={onClose} className="rounded-full border border-line-2 p-2" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-5 text-sm text-mute">{car.title}</p>
        <input className="sr-only" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} aria-hidden />
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="field-label">{dict.auth.name}</span>
            <input className="input" required value={f.name} onChange={set("name")} />
          </label>
          <label>
            <span className="field-label">{dict.auth.phone}</span>
            <input className="input" placeholder="04xx xxx xxx" value={f.phone} onChange={set("phone")} />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="field-label">{dict.auth.email}</span>
          <input type="email" className="input" required value={f.email} onChange={set("email")} />
        </label>
        <label className="mt-3 block">
          <span className="field-label">{dict.contactPage.form.message}</span>
          <textarea className="input min-h-28" value={f.message} onChange={set("message")} />
        </label>
        <label className="mt-3 flex items-center gap-2.5 text-sm text-mute">
          <input type="checkbox" checked={f.finance} onChange={set("finance")} /> I’m interested in finance
        </label>
        <label className="mt-2 flex items-center gap-2.5 text-sm text-mute">
          <input type="checkbox" checked={f.tradein} onChange={set("tradein")} /> I have a car to trade in
        </label>
        <button className="btn mt-5 w-full" disabled={busy}>
          {dict.common.send} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
