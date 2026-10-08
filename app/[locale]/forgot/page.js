import { notFound } from "next/navigation";
import { ForgotForm } from "@/components/auth/AuthForms";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";

// Locale is prerendered via generateStaticParams; allow the brief param read to block.
export const instant = false;

export default async function Page({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  return <ForgotForm locale={locale} dict={dict} />;
}
