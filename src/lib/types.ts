export type OperatingHours = {
  mon_fri?: string;
  sat?: string;
  sun?: string;
};

export type PHC = {
  id: string;
  name: string;
  address: string;
  ward: string;
  services: string[];
  operating_hours: OperatingHours;
  contact_phone: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  status: string;
  last_updated: string;
};

export type HealthArticle = {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  created_at: string;
};

export const SERVICE_CATEGORIES = [
  "Antenatal Care",
  "Immunization",
  "Family Planning",
  "Child Welfare",
  "Malaria Treatment",
  "HIV Services",
] as const;

export const HEALTH_CATEGORIES = [
  "Maternal Health",
  "Child Health",
  "Immunization",
  "Malaria",
  "Tuberculosis",
  "HIV/AIDS",
  "Nutrition",
  "Hygiene and Sanitation",
] as const;

export function isOpenNow(hours: OperatingHours, now: Date = new Date()): boolean {
  const day = now.getDay(); // 0 Sun, 6 Sat
  let range: string | undefined;
  if (day === 0) range = hours.sun;
  else if (day === 6) range = hours.sat;
  else range = hours.mon_fri;
  if (!range || !/^\d/.test(range)) return false;
  const [start, end] = range.split("-");
  if (!start || !end) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return cur >= sh * 60 + sm && cur <= eh * 60 + em;
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}
