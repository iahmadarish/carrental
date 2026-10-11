import ContactForm from "@/components/contact/ContactForm";
import PageHero from "@/components/shared/PageHero";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";

const offices = [
  { city: "Sydney", address: "Level 12, 1 Example St, Sydney NSW 2000" },
  { city: "Melbourne", address: "88 Southbank Blvd, Southbank VIC 3006" },
  { city: "Brisbane", address: "200 Ann St, Brisbane City QLD 4000" },
  { city: "Perth", address: "1 Airport Dr, Perth Airport WA 6105" },
];

// Locale is prerendered via generateStaticParams; allow the brief param read to block.
export const instant = false;

export default async function ContactPage({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const words = dict.contactPage.title.split(" ");

  return (
    <>
      <PageHero lines={[words.slice(0, -2).join(" ") || words[0], words.slice(-2).join(" ")]} subtitle={dict.contactPage.subtitle} />
      <section className="container-x grid items-start gap-12 pb-20 lg:grid-cols-[1.3fr_1fr]">
        <ContactForm dict={dict} />
        <div className="flex flex-col gap-4 lg:pt-16">
          <div className="panel">
            <p className="panel-title">Call us</p>
            <p className="mt-3 flex items-center gap-3 font-display text-2xl font-semibold">
              <Phone className="h-6 w-6 text-ochre" /> 1300 835 637
            </p>
            <p className="mt-2 text-sm text-mute">Mon–Sat, 7am–8pm AEST · 24/7 roadside on 1800 000 111</p>
          </div>
          <div className="panel">
            <p className="panel-title">Email</p>
            <p className="mt-3 flex items-center gap-3 text-lg font-semibold">
              <Mail className="h-5 w-5 text-ochre" /> hello@velodrive.com.au
            </p>
            <p className="mt-2 text-sm text-mute">We reply within one business day.</p>
          </div>
          <div className="panel">
            <p className="panel-title">{dict.contactPage.offices}</p>
            <ul className="mt-4 space-y-4">
              {offices.map((o) => (
                <li key={o.city} className="flex gap-3 text-sm text-mute">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ochre" aria-hidden />
                  <span>
                    <strong className="font-semibold text-foreground">{o.city}</strong>
                    <br />
                    {o.address}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
