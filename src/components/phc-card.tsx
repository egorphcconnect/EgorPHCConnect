import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Phone, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PHC } from "@/lib/types";
import { isOpenNow } from "@/lib/types";

export function PhcCard({ phc, distanceKm }: { phc: PHC; distanceKm?: number | null }) {
  const open = isOpenNow(phc.operating_hours);
  const todayHours =
    new Date().getDay() === 0
      ? phc.operating_hours.sun
      : new Date().getDay() === 6
      ? phc.operating_hours.sat
      : phc.operating_hours.mon_fri;

  return (
    <Link
      to="/phc/$id"
      params={{ id: phc.id }}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">{phc.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {phc.ward} Ward
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            open
              ? "border-success/30 bg-success/10 text-success"
              : "border-muted-foreground/20 bg-muted text-muted-foreground"
          }
        >
          {open ? "Open now" : "Closed"}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {phc.services.slice(0, 4).map((s) => (
          <span
            key={s}
            className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary"
          >
            {s}
          </span>
        ))}
        {phc.services.length > 4 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            +{phc.services.length - 4} more
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {todayHours && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Today: {todayHours}
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

      <span className="mt-4 inline-flex items-center text-sm font-medium text-primary group-hover:gap-2">
        View details <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
