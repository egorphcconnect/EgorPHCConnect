import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Phone, ArrowRight, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PhcImage } from "@/components/phc-image";
import type { PHC } from "@/lib/types";
import { isOpenLagos, nowLagos, dayServices, formatTime, DAY_LABELS } from "@/lib/types";


export function PhcCard({ phc, distanceKm }: { phc: PHC; distanceKm?: number | null }) {
  const open = isOpenLagos(phc.opening_time, phc.closing_time);
  const { dayKey } = nowLagos();
  const today = dayServices(phc, dayKey);
  const hoursLabel =
    phc.opening_time && phc.closing_time
      ? `${formatTime(phc.opening_time)} – ${formatTime(phc.closing_time)}`
      : null;
  const mapQuery = phc.latitude && phc.longitude
    ? `${phc.latitude},${phc.longitude}`
    : encodeURIComponent(`${phc.name}, ${phc.address}, Egor LGA, Edo State, Nigeria`);
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:shadow-md">
      <Link to="/phc/$id" params={{ id: phc.id }} className="flex flex-col">
        <PhcImage phc={phc} aspect="aspect-[16/9]" className="rounded-none" />
        <div className="flex items-start justify-between gap-3 p-5 pb-0">

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-card-foreground">{phc.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {phc.ward} Ward
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              open
                ? "shrink-0 border-success/30 bg-success/10 text-success"
                : "shrink-0 border-muted-foreground/20 bg-muted text-muted-foreground"
            }
          >
            {open ? "Open now" : "Closed"}
          </Badge>
        </div>

        <div className="px-5 pt-3">
          <p className="text-xs font-medium text-primary">Today ({DAY_LABELS[dayKey]})</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {today.length === 0 ? (
              <span className="text-xs text-muted-foreground">No scheduled clinic today</span>
            ) : (
              <>
                {today.slice(0, 4).map((s) => (
                  <span key={s} className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                    {s}
                  </span>
                ))}
                {today.length > 4 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    +{today.length - 4} more
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 px-5 text-xs text-muted-foreground">
          {hoursLabel && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {hoursLabel}
            </span>
          )}
          {phc.contact_phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {phc.contact_phone}
            </span>
          )}
          {distanceKm != null && (
            <span className="font-medium text-foreground">{distanceKm.toFixed(1)} km away</span>
          )}
        </div>
      </Link>

      <div className="mt-4 flex items-center justify-between gap-2 px-5 pb-5">

        <Link
          to="/phc/$id"
          params={{ id: phc.id }}
          className="inline-flex items-center text-sm font-medium text-primary hover:gap-2"
        >
          View details <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <a
          href={directionsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Navigation className="h-3.5 w-3.5" /> Directions
        </a>
      </div>
    </article>
  );
}
