import Link from "next/link";
import { CarFront } from "lucide-react";

export default function Footer({ locale, dict }) {
  const base = `/${locale}`;
  const year = 2026;

  const cols = [
    {
      title: dict.nav.rent,
      links: [
        [dict.nav.bookNow, `${base}/rent`],
        [dict.nav.fleet, `${base}/fleet`],
        ["Electric vehicles", `${base}/fleet?type=Electric`],
        ["4WD & outback", `${base}/fleet?type=4WD`],
      ],
    },
    {
      title: dict.nav.sales,
      links: [
        [dict.nav.browseSales, `${base}/sales`],
        [dict.contactForm.finance, `${base}/contact#finance`],
        [dict.contactForm.tradeIn, `${base}/contact#trade-in`],
        [dict.contactForm.corporate, `${base}/contact#corporate`],
      ],
    },
    {
      title: dict.nav.contact,
      links: [
        ["1300 835 637", "tel:1300835637"],
        ["hello@velodrive.com.au", "mailto:hello@velodrive.com.au"],
        ["Mon–Sat · 7am–8pm AEST", null],
        ["Roadside 24/7 · 1800 000 111", null],
      ],
    },
  ];

  return (
    <footer className="mt-16 border-t border-line pt-20 pb-8">
      <div className="container-x">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href={base} className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ochre text-white">
                <CarFront className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                Velo<span className="text-ochre">Drive</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mute">{dict.footer.tagline}</p>
            {dict.footer.trust && <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand/80">{dict.footer.trust}</p>}
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-mute/80">
              VeloDrive acknowledges the Traditional Custodians of the lands on which we operate, and pays respect to Elders past and present.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="mb-5 text-sm font-medium text-mute">{c.title}</p>
              <ul className="space-y-3 text-[15px]">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    {href ? (
                      <Link href={href} className="link-u text-foreground/90 hover:text-foreground">
                        {label}
                      </Link>
                    ) : (
                      <span className="text-mute">{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          aria-hidden
          className="mt-20 overflow-hidden font-display text-[15vw] leading-[0.85] font-semibold tracking-[-0.04em] whitespace-nowrap text-ink-3 select-none xl:text-[11rem]"
        >
          VeloDrive
        </div>

        <div className="flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-xs text-mute">
          <span>
            © {year} VeloDrive Australia Pty Ltd · ABN 00 000 000 000 · Licensed motor dealer · {dict.footer.rights}
          </span>
          <span>
            {dict.common.gstNote} · {dict.footer.links.privacy} · {dict.footer.links.terms} · {dict.footer.links.careers}
          </span>
        </div>
      </div>
    </footer>
  );
}
