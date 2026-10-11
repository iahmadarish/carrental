"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { Fuel, Gauge, Heart, MapPin, Star, Users } from "lucide-react";
import { useAuth, useToast } from "@/components/providers/AppProviders";
import { api } from "@/lib/api";
import { aud, FALLBACK_IMG, IMAGE_BLUR } from "@/lib/format";

export function typeLabel(dict, type) {
  return dict.fleet.categories?.[String(type).toLowerCase()] ?? type;
}

export function SmartImage({ src, alt, className = "", sizes, priority }) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={failed || !src ? FALLBACK_IMG : src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={failed || !src}
      placeholder={src && !failed ? "blur" : "empty"}
      blurDataURL={IMAGE_BLUR}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function FavButton({ carId, className = "" }) {
  const { user, setUser, requireLogin } = useAuth();
  const toast = useToast();
  const ref = useRef(null);
  const saved = user?.favourites?.some((id) => String(id) === String(carId));

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Log in to save favourites");
      return requireLogin();
    }
    try {
      const r = await api(`/auth/favourites/${carId}`, { method: "POST" });
      setUser({ ...user, favourites: r.favourites });
      gsap.fromTo(ref.current, { scale: 0.6 }, { scale: 1, duration: 0.7, ease: "elastic.out(1,.4)" });
      toast(r.saved ? "Saved to your garage ❤" : "Removed from favourites", "ok");
    } catch (err) {
      toast(err.message, "err");
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-label="Save to favourites"
      aria-pressed={!!saved}
      className={`grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition hover:scale-110 ${
        saved ? "border-ochre bg-ochre" : "border-line-2 bg-ink/60"
      } ${className}`}
    >
      <Heart className={`h-[18px] w-[18px] ${saved ? "fill-white" : ""}`} aria-hidden />
    </button>
  );
}

export default function VehicleCard({ car, locale, dict, listing, query = "" }) {
  const cardRef = useRef(null);
  const mode = listing || (car.listing === "sale" ? "sale" : "rent");
  const href = `/${locale}/fleet/${car.slug}${query}`;

  return (
    <article
      ref={cardRef}
      className="vcard group card relative flex flex-col overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-gum/35 hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,.65)]"
    >
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-ink-3 to-[#2c2017]">
        <SmartImage
          src={car.images?.[0]}
          alt={car.title}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
        />
      </Link>
      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
        {car.listing !== "sale" && <span className="badge">{dict.vehicleDetail.rent}</span>}
        {car.listing !== "rent" && <span className="badge badge-ochre">{dict.vehicleDetail.buy}</span>}
        {car.fuel === "Electric" && <span className="badge badge-gum">EV</span>}
      </div>
      <FavButton carId={car._id} className="absolute top-3 right-3" />

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-mute">
              {car.make} · {typeLabel(dict, car.type)}
            </p>
            <Link href={href} className="mt-1 block font-display text-xl leading-tight font-semibold">
              {car.title}
            </Link>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-mute">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> {car.city}, {car.state} · {car.year}
            </p>
          </div>
          <span className="flex items-center gap-1 self-start text-[13px] font-bold whitespace-nowrap">
            <Star className="h-3.5 w-3.5 fill-ochre text-ochre" aria-hidden /> {car.rating?.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-sand">
          {[
            [Fuel, dict.fleet.fuel?.[car.fuel?.toLowerCase()] ?? car.fuel],
            [Gauge, dict.fleet.transmission?.[car.transmission === "Manual" ? "manual" : "auto"] ?? car.transmission],
            [Users, `${car.seats} ${dict.vehicleDetail.seats}`],
          ].map(([Icon, label]) => (
            <span key={label} className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white/[0.04] px-2.5 py-1.5">
              <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
            </span>
          ))}
        </div>

        {mode !== "sale" && (
          <p className="text-xs text-gum/90">{dict.common.rentalIncludes}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-line-2 pt-4">
          {mode === "sale" && car.salePrice ? (
            <p className="font-display text-2xl leading-none font-semibold">
              {aud(car.salePrice)}
              <span className="mt-1.5 block font-sans text-xs font-medium text-mute">{dict.common.driveAway} · {dict.common.gstNote}</span>
            </p>
          ) : (
            <p className="font-display text-2xl leading-none font-semibold">
              {aud(car.pricePerDay)}
              <span className="mt-1.5 block font-sans text-xs font-medium text-mute">{dict.common.perDay} · {dict.common.unlimitedKm}</span>
            </p>
          )}
          {car.listing === "both" && (
            <p className="text-right text-xs text-mute">
              {mode === "sale" ? dict.vehicleDetail.rent : dict.fleet.buyFrom}
              <b className="block text-[15px] text-foreground">
                {mode === "sale" ? `${aud(car.pricePerDay)}/day` : aud(car.salePrice)}
              </b>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function CardSkeletons({ n = 3 }) {
  return Array.from({ length: n }, (_, i) => <div key={i} className="skeleton min-h-[440px]" />);
}
