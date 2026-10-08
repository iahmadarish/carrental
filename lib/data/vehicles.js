export const vehicles = [
  {
    id: "veloce-gt",
    name: "Veloce GT",
    brand: "Aurora",
    category: "sport",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    rentPerDay: 189,
    salePrice: 68400,
    fuel: "hybrid",
    transmission: "auto",
    seats: 2,
    featured: true,
    availableForRent: true,
    availableForSale: true,
  },
  {
    id: "horizon-suv",
    name: "Horizon SUV",
    brand: "Summit",
    category: "suv",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
    rentPerDay: 129,
    salePrice: 42800,
    fuel: "petrol",
    transmission: "auto",
    seats: 7,
    featured: true,
    availableForRent: true,
    availableForSale: true,
  },
  {
    id: "nova-e",
    name: "Nova E",
    brand: "Pulse",
    category: "electric",
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
    rentPerDay: 149,
    salePrice: 38900,
    fuel: "electric",
    transmission: "auto",
    seats: 5,
    featured: true,
    availableForRent: true,
    availableForSale: false,
  },
  {
    id: "metro-compact",
    name: "Metro Compact",
    brand: "Urban",
    category: "compact",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    rentPerDay: 59,
    salePrice: 18200,
    fuel: "petrol",
    transmission: "manual",
    seats: 5,
    featured: false,
    availableForRent: true,
    availableForSale: true,
  },
  {
    id: "crown-luxe",
    name: "Crown Luxe",
    brand: "Regent",
    category: "luxury",
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
    rentPerDay: 249,
    salePrice: 92800,
    fuel: "hybrid",
    transmission: "auto",
    seats: 5,
    featured: true,
    availableForRent: true,
    availableForSale: true,
  },
  {
    id: "trail-pro",
    name: "Trail Pro 4x4",
    brand: "Ridge",
    category: "suv",
    image:
      "https://images.unsplash.com/photo-1533473357864-89d9122780e8?auto=format&fit=crop&w=1200&q=80",
    rentPerDay: 139,
    salePrice: 51200,
    fuel: "diesel",
    transmission: "auto",
    seats: 5,
    featured: false,
    availableForRent: true,
    availableForSale: true,
  },
];

export function getVehicleById(id) {
  return vehicles.find((v) => v.id === id);
}

export function getFeaturedVehicles() {
  return vehicles.filter((v) => v.featured);
}

export function getRentableVehicles() {
  return vehicles.filter((v) => v.availableForRent);
}

export function getSaleVehicles() {
  return vehicles.filter((v) => v.availableForSale);
}
