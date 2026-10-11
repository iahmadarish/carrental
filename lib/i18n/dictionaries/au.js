// Australian English — layered on top of en.js + extra-en.js (see get-dictionary.js),
// so only the Australia-specific copy lives here.
const au = {
  meta: {
    title: "VeloDrive — Car Rental & Cars for Sale Across Australia",
    description:
      "Rent or buy premium cars in Sydney, Melbourne, Brisbane, Perth, Adelaide and beyond. Unlimited kilometres, GST-inclusive pricing, finance and trade-ins.",
  },
  nav: { sales: "Buy", bookNow: "Book now" },
  hero: {
    badge: "Rent · Buy · Finance — Australia-wide",
    title: "Premium cars across",
    titleAccent: "Australia.",
    subtitle:
      "Unlimited kilometres on every rental, GST-inclusive pricing, and free cancellation up to 48 hours — from Sydney CBD to the Kimberley.",
    ctaRent: "Start a rental",
    ctaSales: "Cars for sale",
    stats: { fleet: "1,450+ vehicles", cities: "12 locations", rating: "4.9 from 2,148 reviews" },
  },
  services: {
    label: "What we offer",
    title: "Everything you need to hit the road",
    rent: { title: "Car rental", desc: "Daily, weekly and monthly hire with unlimited kms, Zero-Excess cover and toll tags." },
    sales: { title: "Cars for sale", desc: "Certified pre-owned and new arrivals with drive-away pricing, finance, trade-in and RWC included." },
    concierge: { title: "Concierge", desc: "Airport pick-up, door-to-door delivery, corporate accounts and novated leasing." },
  },
  fleet: {
    buyFrom: "Drive-away",
    categories: { "4wd": "4WD", ute: "Ute", hatch: "Hatch", van: "People mover", convertible: "Convertible", sedan: "Sedan" },
  },
  rentPage: {
    subtitle: "Unlimited kilometres, GST-inclusive prices, free cancellation up to 48 hours.",
    form: { locationPlaceholder: "Sydney, Melbourne, Perth…" },
    benefits: { flexible: "Free cancellation 48h", delivery: "Airport & CBD pick-up" },
  },
  salesPage: {
    subtitle: "Drive-away prices incl. GST & on-road costs. Finance, trade-in and roadworthy included.",
    finance: "Finance from 7.49% p.a.",
    warranty: "12-month warranty",
    inspection: "150-point inspection + RWC",
  },
  contactPage: {
    subtitle: "Rentals, sales, finance, trade-ins or corporate fleets — a local specialist replies within one business day.",
    offices: "Our hubs",
  },
  footer: {
    tagline: "Premium mobility across Australia — rent, buy, delivered.",
    trust: "Comprehensive rental insurance available · 24/7 roadside assistance · Licensed motor dealer (NSW)",
  },
};

export default au;
