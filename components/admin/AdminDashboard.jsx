"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Plus, X } from "lucide-react";
import { useAuth, useToast } from "@/components/providers/AppProviders";
import { SmartImage } from "@/components/shared/VehicleCard";
import { api } from "@/lib/api";
import { AU_STATES, aud, fmtDate } from "@/lib/format";

const TABS = ["overview", "bookings", "cars", "enquiries", "customers"];
const TYPES = ["SUV", "4WD", "Ute", "Electric", "Luxury", "Sedan", "Hatch", "Van", "Convertible"];

function Table({ head, children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-line bg-ink-2 px-4 py-3.5 text-left text-[11px] font-bold tracking-[0.1em] text-mute uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:border-b [&_td]:border-line [&_td]:px-4 [&_td]:py-3.5 [&_tr:last-child_td]:border-0">{children}</tbody>
      </table>
    </div>
  );
}

function StatusSelect({ id, value, options, type, toast }) {
  const [v, setV] = useState(value);
  return (
    <select
      className="input w-auto px-3 py-1.5"
      value={v}
      onChange={async (e) => {
        const next = e.target.value;
        setV(next);
        try {
          await api(`/admin/${type}/${id}`, { method: "PATCH", body: { status: next } });
          toast("Status updated", "ok");
        } catch (err) {
          toast(err.message, "err");
        }
      }}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export default function AdminDashboard({ locale }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(null); // null | {} | car

  useEffect(() => {
    if (!ready) return;
    if (!user) router.push(`/${locale}/login?next=/${locale}/admin`);
    else if (user.role !== "admin") router.push(`/${locale}/account`);
  }, [ready, user, router, locale]);

  const [version, setVersion] = useState(0); // bump to reload the current tab
  const load = useCallback(() => setVersion((v) => v + 1), []);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;
    const path = { overview: "/admin/stats", bookings: "/admin/bookings", cars: "/admin/cars", enquiries: "/admin/enquiries", customers: "/admin/users" }[tab];
    let alive = true;
    api(path)
      .then((d) => alive && setData(d))
      .catch((e) => toast(e.message, "err"));
    return () => {
      alive = false;
    };
  }, [isAdmin, tab, version, toast]);

  useEffect(() => {
    if (!data) return;
    gsap.fromTo(".admin-pane > *", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5 });
    document.querySelectorAll("[data-count]").forEach((el) => {
      const o = { v: 0 };
      const money = el.hasAttribute("data-money");
      gsap.to(o, { v: Number(el.dataset.count), duration: 1.4, ease: "power3.out", onUpdate: () => (el.textContent = money ? aud(o.v) : Math.round(o.v)) });
    });
  }, [data]);

  if (user?.role !== "admin") return <div className="container-x min-h-[60svh] pt-40"><div className="skeleton h-40" /></div>;

  async function del(id) {
    if (!confirm("Delete this car permanently?")) return;
    try {
      await api(`/cars/${id}`, { method: "DELETE" });
      toast("Car deleted", "ok");
      load();
    } catch (e) {
      toast(e.message, "err");
    }
  }

  return (
    <div className="container-x pt-36 pb-16">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="eyebrow">Control room</span>
          <h1 className="h-lg mt-4">Admin dashboard</h1>
        </div>
        <button type="button" className="btn" onClick={() => setEditing({})}>
          <Plus className="h-4 w-4" /> Add car
        </button>
      </div>
      <div className="grid items-start gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:sticky lg:top-28 lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setData(null);
                setTab(t);
              }}
              className={`rounded-xl px-4 py-3 text-left font-semibold capitalize whitespace-nowrap transition ${
                tab === t ? "bg-ink-2 shadow-[inset_3px_0_0_#e8642c]" : "text-mute hover:bg-ink-2 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <div className="admin-pane">
          {!data && <div className="skeleton h-72" />}

          {data && tab === "overview" && (
            <>
              <div className="mb-8 grid grid-cols-2 gap-3.5 md:grid-cols-3">
                {[
                  ["Confirmed revenue", data.revenue, true],
                  ["Bookings", data.bookings],
                  ["Cars", data.cars],
                  ["Customers", data.users],
                  ["New enquiries", data.enquiries],
                  ["Subscribers", data.subscribers],
                ].map(([k, v, money]) => (
                  <div key={k} className="rounded-2xl border border-line bg-ink-2 p-5">
                    <span className="text-xs tracking-[0.1em] text-mute uppercase">{k}</span>
                    <b className="mt-1.5 block font-display text-3xl" data-count={v} data-money={money || undefined}>
                      0
                    </b>
                  </div>
                ))}
              </div>
              <h3 className="mb-4 text-xl font-bold">Latest bookings</h3>
              <Table head={["Ref", "Customer", "Car", "Type", "Total", "Status"]}>
                {data.recent.map((b) => (
                  <tr key={b._id}>
                    <td>{b.reference}</td>
                    <td>{b.user?.name || "—"}</td>
                    <td>{b.car?.title || "—"}</td>
                    <td>{b.kind}</td>
                    <td>{b.total ? aud(b.total, 2) : "—"}</td>
                    <td>
                      <span className={`status status-${b.status}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </Table>
            </>
          )}

          {data && tab === "bookings" && (
            <Table head={["Ref", "Customer", "Car", "Dates", "Total", "Status"]}>
              {data.bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    {b.reference}
                    <div className="text-xs text-mute">{b.kind}</div>
                  </td>
                  <td>
                    {b.user?.name}
                    <div className="text-xs text-mute">
                      {b.user?.email} {b.user?.phone}
                    </div>
                  </td>
                  <td>
                    {b.car?.title}
                    <div className="text-xs text-mute">{b.pickupLocation}</div>
                  </td>
                  <td>
                    {fmtDate(b.startDate)}
                    {b.kind === "rental" && <div className="text-xs text-mute">→ {fmtDate(b.endDate)}</div>}
                  </td>
                  <td>{b.total ? aud(b.total, 2) : "—"}</td>
                  <td>
                    <StatusSelect id={b._id} value={b.status} type="bookings" toast={toast} options={["pending", "confirmed", "active", "completed", "cancelled"]} />
                  </td>
                </tr>
              ))}
            </Table>
          )}

          {data && tab === "cars" && (
            <Table head={["", "Car", "Listing", "Per day", "Sale", "City", ""]}>
              {data.cars.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="relative aspect-[16/10] w-20 overflow-hidden rounded-lg bg-ink-3">
                      <SmartImage src={c.images?.[0]} alt="" sizes="80px" className="object-cover" />
                    </div>
                  </td>
                  <td>
                    <b>{c.title}</b>
                    <div className="text-xs text-mute">
                      {c.year} · {c.type} {c.featured && "· ★ featured"} {!c.available && "· hidden"}
                    </div>
                  </td>
                  <td>{c.listing}</td>
                  <td>{c.pricePerDay ? aud(c.pricePerDay) : "—"}</td>
                  <td>{c.salePrice ? aud(c.salePrice) : "—"}</td>
                  <td>{c.city}</td>
                  <td className="whitespace-nowrap">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(c)}>
                      Edit
                    </button>{" "}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => del(c._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          )}

          {data && tab === "enquiries" && (
            <Table head={["Date", "Type", "From", "Message", "Status"]}>
              {data.enquiries.map((q) => (
                <tr key={q._id}>
                  <td>{fmtDate(q.createdAt)}</td>
                  <td>
                    <span className="badge">{q.kind}</span>
                  </td>
                  <td>
                    {q.name}
                    <div className="text-xs text-mute">
                      {q.email} {q.phone} {q.state}
                    </div>
                  </td>
                  <td className="max-w-sm">
                    {q.car && <b className="block">{q.car.title}</b>}
                    {q.message}
                    {Object.entries(q.details || {})
                      .filter(([, v]) => v !== "" && v !== false)
                      .map(([k, v]) => (
                        <div key={k} className="text-xs text-mute">
                          {k}: {String(v)}
                        </div>
                      ))}
                  </td>
                  <td>
                    <StatusSelect id={q._id} value={q.status} type="enquiries" toast={toast} options={["new", "contacted", "closed"]} />
                  </td>
                </tr>
              ))}
            </Table>
          )}

          {data && tab === "customers" && (
            <Table head={["Name", "Email", "Phone", "State", "Verified", "Marketing", "Joined"]}>
              {data.users.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.name} {u.role === "admin" && <span className="badge badge-ochre">admin</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.state}</td>
                  <td>{u.isVerified ? "✅" : "—"}</td>
                  <td>{u.marketingOptIn ? "Yes" : "No"}</td>
                  <td>{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>

      {editing && (
        <CarForm
          car={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            if (tab === "cars") load();
            else {
              setData(null);
              setTab("cars");
            }
          }}
          toast={toast}
        />
      )}
    </div>
  );
}

function CarForm({ car, onClose, onSaved, toast }) {
  const [f, setF] = useState({
    title: car.title || "",
    make: car.make || "",
    model: car.model || "",
    year: car.year || 2025,
    type: car.type || "SUV",
    listing: car.listing || "rent",
    fuel: car.fuel || "Petrol",
    transmission: car.transmission || "Automatic",
    pricePerDay: car.pricePerDay || 0,
    salePrice: car.salePrice || 0,
    city: car.city || "Sydney",
    state: car.state || "NSW",
    seats: car.seats || 5,
    odometer: car.odometer || 0,
    engine: car.engine || "",
    images: (car.images || []).join("\n"),
    features: (car.features || []).join(", "),
    description: car.description || "",
    featured: !!car.featured,
    available: car.available ?? true,
  });
  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function save(e) {
    e.preventDefault();
    const body = {
      ...f,
      images: f.images.split("\n").map((s) => s.trim()).filter(Boolean),
      features: f.features.split(",").map((s) => s.trim()).filter(Boolean),
    };
    ["year", "pricePerDay", "salePrice", "seats", "odometer"].forEach((k) => (body[k] = Number(body[k] || 0)));
    try {
      if (car._id) await api(`/cars/${car._id}`, { method: "PUT", body });
      else await api("/cars", { method: "POST", body });
      toast("Car saved", "ok");
      onSaved();
    } catch (err) {
      toast(err.message, "err");
    }
  }

  const input = (k, label, type = "text") => (
    <label>
      <span className="field-label">{label}</span>
      <input type={type} className="input" value={f[k]} onChange={set(k)} required={["title", "make", "model"].includes(k)} />
    </label>
  );
  const select = (k, label, options) => (
    <label>
      <span className="field-label">{label}</span>
      <select className="input" value={f[k]} onChange={set(k)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="fixed inset-0 z-[65] grid place-items-center bg-black/65 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={save} className="panel max-h-[90svh] w-full max-w-3xl overflow-y-auto" data-lenis-prevent>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-2xl font-bold">{car._id ? "Edit car" : "Add car"}</h3>
          <button type="button" onClick={onClose} className="rounded-full border border-line-2 p-2" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{input("title", "Title")}</div>
          {input("make", "Make")}
          {input("model", "Model")}
          {input("year", "Year", "number")}
          {select("type", "Type", TYPES)}
          {select("listing", "Listing", ["rent", "sale", "both"])}
          {select("fuel", "Fuel", ["Petrol", "Diesel", "Hybrid", "Electric"])}
          {input("pricePerDay", "Price / day (AUD)", "number")}
          {input("salePrice", "Sale price (AUD)", "number")}
          {input("city", "City")}
          {select("state", "State", AU_STATES)}
          {input("seats", "Seats", "number")}
          {input("odometer", "Odometer (km)", "number")}
          {select("transmission", "Transmission", ["Automatic", "Manual"])}
          {input("engine", "Engine")}
        </div>
        <label className="mt-4 block">
          <span className="field-label">Image URLs (one per line)</span>
          <textarea className="input min-h-24" value={f.images} onChange={set("images")} />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Features (comma separated)</span>
          <input className="input" value={f.features} onChange={set("features")} />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Description</span>
          <textarea className="input min-h-24" value={f.description} onChange={set("description")} />
        </label>
        <div className="mt-4 flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.featured} onChange={set("featured")} /> Featured on home
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.available} onChange={set("available")} /> Available
          </label>
        </div>
        <button className="btn mt-6 w-full">Save car</button>
      </form>
    </div>
  );
}
