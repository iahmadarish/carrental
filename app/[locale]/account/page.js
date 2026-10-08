import { notFound } from "next/navigation";
import AccountDashboard from "@/components/account/AccountDashboard";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";

// Locale is prerendered via generateStaticParams; allow the brief param read to block.
export const instant = false;

export const metadata = { robots: { index: false } };

export default async function AccountPage({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  return <AccountDashboard locale={locale} dict={dict} />;
}
