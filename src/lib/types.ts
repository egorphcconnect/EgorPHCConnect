export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

// Legacy operating-hours shape (still on existing rows; kept for compatibility).
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
  facility_type: string | null;
  contact_phone: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  images: string[];
  google_maps_url: string | null;
  services: string[];
  monday_services: string[];
  tuesday_services: string[];
  wednesday_services: string[];
  thursday_services: string[];
  friday_services: string[];
  saturday_services: string[];
  sunday_services: string[];
  opening_time: string | null; // "HH:MM:SS"
  closing_time: string | null;
  operating_hours: OperatingHours; // legacy
  updated_at: string;
  last_updated: string;
  created_at?: string;
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
  "Routine Consultation",
  "Nutrition Clinic",
  "HIV Counselling",
  "Tuberculosis Screening",
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

// --- Africa/Lagos time helpers ---
export function nowLagos(): { dayKey: DayKey; minutes: number } {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  const wd = (parts.weekday ?? "Mon").toLowerCase();
  const map: Record<string, DayKey> = {
    mon: "monday",
    tue: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    fri: "friday",
    sat: "saturday",
    sun: "sunday",
  };
  const dayKey = map[wd.slice(0, 3)] ?? "monday";
  const hh = Number(parts.hour ?? "0");
  const mm = Number(parts.minute ?? "0");
  return { dayKey, minutes: hh * 60 + mm };
}

function parseTimeToMinutes(t: string | null | undefined): number | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function isOpenLagos(
  opening_time: string | null | undefined,
  closing_time: string | null | undefined,
): boolean {
  const open = parseTimeToMinutes(opening_time);
  const close = parseTimeToMinutes(closing_time);
  if (open == null || close == null) return false;
  const { minutes } = nowLagos();
  return minutes >= open && minutes <= close;
}

export function formatTime(t: string | null | undefined): string {
  const m = parseTimeToMinutes(t);
  if (m == null) return "—";
  const h = Math.floor(m / 60);
  const mins = m % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${mins.toString().padStart(2, "0")} ${period}`;
}

export function dayServices(phc: PHC, day: DayKey): string[] {
  switch (day) {
    case "monday": return phc.monday_services ?? [];
    case "tuesday": return phc.tuesday_services ?? [];
    case "wednesday": return phc.wednesday_services ?? [];
    case "thursday": return phc.thursday_services ?? [];
    case "friday": return phc.friday_services ?? [];
    case "saturday": return phc.saturday_services ?? [];
    case "sunday": return phc.sunday_services ?? [];
  }
}

// Legacy compatibility shim (existing callers).
export function isOpenNow(_hours: OperatingHours | null | undefined): boolean {
  return false;
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
