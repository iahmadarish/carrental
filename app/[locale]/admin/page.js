import { notFound } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { isValidLocale } from "@/lib/i18n/config";

// Locale is prerendered via generateStaticParams; allow the brief param read to block.
export const instant = false;

export const metadata = { title: "Admin — VeloDrive", robots: { index: false } };

export default async function AdminPage({ params }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  return <AdminDashboard locale={locale} />;
}
