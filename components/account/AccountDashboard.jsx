"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAuth, useToast } from "@/components/providers/AppProviders";
import VehicleCard, { SmartImage } from "@/components/shared/VehicleCard";
import { api } from "@/lib/api";
import { AU_STATES, aud, fmtDate } from "@/lib/format";

const TABS = ["bookings", "favourites", "profile", "security"];

export default function AccountDashboard({ locale, dict }) {
  const a = dict.account;
  const { user, ready, requireLogin, logout, setUser } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState(() => {
    const h = typeof window === "undefined" ? "" : window.location.hash.slice(1);
    return TABS.includes(h) ? h : "bookings";
  });
  const [bookings, setBookings] = useState(null);
  const [favs, setFavs] = useState(null);
  const pane = useRef(null);

  useEffect(() => {
    if (ready && !user) requireLogin();
  }, [ready, user, requireLogin]);
  useEffect(() => {
    if (!user) return;
    if (tab === "bookings") api("/bookings/mine").then((d) => setBookings(d.bookings)).catch(() => setBookings([]));
    if (tab === "favourites") api("/auth/favourites").then((d) => setFavs(d.cars)).catch(() => setFavs([]));
    if (pane.current) gsap.fromTo(pane.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
  }, [tab, user]);
  useEffect(() => {
    if (bookings?.length) gsap.fromTo(".booking-item", { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.6, ease: "power3.out" });
  }, [bookings]);

  if (!user) return <div className="container-x min-h-[60svh] pt-40"><div className="skeleton h-40" /></div>;

  async function cancel(id) {
    if (!confirm(a.cancelConfirm)) return;
    try {
      await api(`/bookings/${id}/cancel`, { method: "PATCH" });
      toast("Booking cancelled", "ok");
      setBookings((list) => list.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)));
    } catch (e) {
      toast(e.message, "err");
    }
  }

  const upcoming = (bookings || []).filter((b) => ["pending", "confirmed"].includes(b.status) && new Date(b.endDate) >= new Date()).length;
  const spend = (bookings || []).filter((b) => b.status !== "cancelled").reduce((s, b) => s + (b.total || 0), 0);

  return (
    <div className="container-x pt-36 pb-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="eyebrow">{a.label}</span>
          <h1 className="h-lg mt-4">
            {a.hello}, {user.name.split(" ")[0]}.
          </h1>
        </div>
        <button type="button" onClick={logout} className="btn btn-ghost">
          {dict.nav.logout}
        </button>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:sticky lg:top-28 lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                history.replaceState(null, "", `#${t}`);
              }}
              className={`rounded-xl px-4 py-3 text-left font-semibold whitespace-nowrap transition ${
                tab === t ? "bg-ink-2 text-foreground shadow-[inset_3px_0_0_#e8642c]" : "text-mute hover:bg-ink-2 hover:text-foreground"
              }`}
            >
              {a[t]}
            </button>
          ))}
        </nav>

        <div ref={pane}>
          {tab === "bookings" && (
            <>
              <div className="mb-6 grid gap-3.5 sm:grid-cols-3">
                {[
                  [a.total, bookings?.length ?? "—"],
                  [a.upcoming, bookings ? upcoming : "—"],
                  [a.spend, bookings ? aud(spend) : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-line bg-ink-2 p-5">
                    <span className="text-xs tracking-[0.1em] text-mute uppercase">{k}</span>
                    <b className="mt-1.5 block font-display text-3xl">{v}</b>
                  </div>
                ))}
              </div>
              {!bookings ? (
                <div className="skeleton h-32" />
              ) : bookings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-line-2 p-14 text-center">
                  <h3 className="text-2xl font-bold">{a.noBookings}</h3>
                  <p className="mt-2 text-mute">{a.noBookingsHint}</p>
                  <Link href={`/${locale}/fleet`} className="btn mt-6">
                    {a.browse}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b._id} className="booking-item grid items-center gap-5 rounded-2xl border border-line bg-ink-2 p-4 sm:grid-cols-[120px_1fr_auto]">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-ink-3">
                        <SmartImage src={b.car?.images?.[0]} alt="" sizes="120px" className="object-cover" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Link href={`/${locale}/fleet/${b.car?.slug}`} className="font-display text-xl font-bold">
                            {b.car?.title || "Vehicle"}
                          </Link>
                          <span className={`status status-${b.status}`}>{b.status}</span>
                        </div>
                        <p className="mt-1.5 text-sm text-mute">
                          {b.kind === "rental" ? a.rental : a.testDrive} · {fmtDate(b.startDate)}
                          {b.kind === "rental" && ` → ${fmtDate(b.endDate)} · ${b.days} ${a.days}`} · {b.pickupLocation}
                        </p>
                        <p className="mt-1 text-xs text-mute">
                          {a.ref} {b.reference}
                        </p>
                      </div>
                      <div className="text-right">
                        {b.kind === "rental" && <p className="font-display text-xl font-bold">{aud(b.total, 2)}</p>}
                        {["pending", "confirmed"].includes(b.status) && (
                          <button type="button" onClick={() => cancel(b._id)} className="btn btn-ghost btn-sm mt-2">
                            {dict.common.cancel}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "favourites" && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {!favs ? (
                <div className="skeleton h-96" />
              ) : favs.length ? (
                favs.map((c) => <VehicleCard key={c._id} car={c} locale={locale} dict={dict} />)
              ) : (
                <p className="col-span-full rounded-3xl border border-dashed border-line-2 p-14 text-center text-mute">{a.noFavs}</p>
              )}
            </div>
          )}

          {tab === "profile" && <Profile user={user} setUser={setUser} dict={dict} toast={toast} />}
          {tab === "security" && <Security dict={dict} toast={toast} />}
        </div>
      </div>
    </div>
  );
}

function Profile({ user, setUser, dict, toast }) {
  const [f, setF] = useState({ name: user.name, phone: user.phone || "", state: user.state || "", licenceNumber: user.licenceNumber || "", marketingOptIn: user.marketingOptIn });
  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  async function save(e) {
    e.preventDefault();
    try {
      const r = await api("/auth/me", { method: "PATCH", body: f });
      setUser(r.user);
      toast(r.message, "ok");
    } catch (err) {
      toast(err.message, "err");
    }
  }
  return (
    <form onSubmit={save} className="panel max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="field-label">{dict.auth.name}</span>
          <input className="input" value={f.name} onChange={set("name")} />
        </label>
        <label>
          <span className="field-label">{dict.auth.phone}</span>
          <input className="input" value={f.phone} onChange={set("phone")} />
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
        <label>
          <span className="field-label">{dict.account.licence}</span>
          <input className="input" value={f.licenceNumber} onChange={set("licenceNumber")} />
        </label>
      </div>
      <label className="block">
        <span className="field-label">{dict.auth.email}</span>
        <input className="input opacity-60" value={user.email} disabled />
      </label>
      <label className="flex items-center gap-2.5 text-sm text-mute">
        <input type="checkbox" checked={f.marketingOptIn} onChange={set("marketingOptIn")} /> {dict.account.marketing}
      </label>
      <button className="btn">{dict.common.save}</button>
    </form>
  );
}

function Security({ dict, toast }) {
  const [f, setF] = useState({ currentPassword: "", newPassword: "" });
  async function save(e) {
    e.preventDefault();
    try {
      const r = await api("/auth/change-password", { method: "POST", body: f });
      toast(r.message, "ok");
      setF({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast(err.message, "err");
    }
  }
  return (
    <form onSubmit={save} className="panel max-w-lg space-y-4">
      <label className="block">
        <span className="field-label">{dict.account.currentPassword}</span>
        <input type="password" required className="input" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} />
      </label>
      <label className="block">
        <span className="field-label">{dict.auth.newPassword}</span>
        <input type="password" required className="input" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} />
      </label>
      <button className="btn">{dict.auth.updatePassword}</button>
    </form>
  );
}
