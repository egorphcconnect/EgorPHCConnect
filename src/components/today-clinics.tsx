import { CalendarClock, CheckCircle2 } from "lucide-react";
import { nowLagos, dayServices, DAY_LABELS, type PHC } from "@/lib/types";

export function TodayClinics({ phc, className = "" }: { phc: PHC; className?: string }) {
  const { dayKey } = nowLagos();
  const list = dayServices(phc, dayKey);
  return (
    <section
      aria-label={`Today's clinics (${DAY_LABELS[dayKey]})`}
      className={`rounded-xl border border-primary/30 bg-primary-soft/60 p-5 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Today's clinics
          </p>
          <p className="text-sm font-semibold text-foreground">{DAY_LABELS[dayKey]}</p>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No scheduled clinic today. General consultation may still be available — please call ahead.
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {list.map((s) => (
            <li
              key={s}
              className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-medium text-primary shadow-sm"
            >
              <CheckCircle2 className="h-3 w-3" /> {s}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
