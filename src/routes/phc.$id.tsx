import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, Navigation, MessageSquarePlus, ArrowLeft, CheckCircle2, Calendar } from "lucide-react";
import { getPhc } from "@/lib/phcs.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isOpenLagos, formatTime, dayServices, DAY_KEYS, DAY_LABELS, nowLagos, type PHC } from "@/lib/types";

export const Route = createFileRoute("/phc/$id")({
  loader: async ({ context, params }) => {
    const phc = await context.queryClient.ensureQueryData({
      queryKey: ["phc", params.id],
      queryFn: () => getPhc({ data: { id: params.id } }),
    });
    if (!phc) throw notFound();
    return phc;
  },
  head: ({ loaderData }) => {
    const phc = loaderData as PHC | undefined;
    return {
      meta: [
        { title: phc ? `${phc.name} — Egor PHC Connect` : "PHC — Egor PHC Connect" },
        {
          name: "description",
          content: phc
            ? `${phc.name} in ${phc.ward} ward. Weekly clinic schedule, hours and directions for this Primary Healthcare Centre in Egor LGA.`
            : "Primary Healthcare Centre details.",
        },
        { property: "og:title", content: phc?.name ?? "PHC details" },
        { property: "og:description", content: phc?.address ?? "" },
        ...(phc?.image_url ? [{ property: "og:image", content: phc.image_url }] : []),
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-destructive">
      Couldn't load this PHC: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">PHC not found</h1>
      <p className="mt-2 text-muted-foreground">This facility may have been removed.</p>
      <Link to="/directory" className="mt-4 inline-block text-primary hover:underline">
        Back to directory
      </Link>
    </div>
  ),
  component: PhcDetails,
});

function PhcDetails() {
  const { id } = Route.useParams();
  const { data: phc } = useSuspenseQuery({
    queryKey: ["phc", id],
    queryFn: () => getPhc({ data: { id } }),
  });
  if (!phc) return null;

  const open = isOpenLagos(phc.opening_time, phc.closing_time);
  const { dayKey: todayKey } = nowLagos();

  const fallbackMapQuery = phc.latitude && phc.longitude
    ? `${phc.latitude},${phc.longitude}`
    : encodeURIComponent(`${phc.name}, ${phc.address}, Egor LGA, Edo State, Nigeria`);
  const mapsLink = phc.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${fallbackMapQuery}`;
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${fallbackMapQuery}`;
  const embedSrc = `https://www.google.com/maps?q=${fallbackMapQuery}&output=embed`;

  const hoursLabel = phc.opening_time && phc.closing_time
    ? `${formatTime(phc.opening_time)} – ${formatTime(phc.closing_time)}`
    : "Hours not set";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <Link to="/directory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to directory
      </Link>

      {phc.image_url && (
        <img
          src={phc.image_url}
          alt={phc.name}
          className="mt-4 h-56 w-full rounded-xl object-cover"
          loading="lazy"
        />
      )}

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{phc.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {phc.address} · {phc.ward} Ward
            {phc.facility_type ? ` · ${phc.facility_type}` : ""}
          </p>
        </div>
        <Badge
          variant="outline"
          className={open
            ? "border-success/30 bg-success/10 text-success"
            : "border-muted-foreground/20 bg-muted text-muted-foreground"}
        >
          {open ? "Open now" : "Closed"}
        </Badge>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild className="h-11">
          <a href={directionsLink} target="_blank" rel="noopener noreferrer">
            <Navigation className="mr-2 h-4 w-4" /> Get directions
          </a>
        </Button>
        <Button asChild variant="outline" className="h-11">
          <a href={mapsLink} target="_blank" rel="noopener noreferrer">
            <MapPin className="mr-2 h-4 w-4" /> Open in Google Maps
          </a>
        </Button>
        {phc.contact_phone && (
          <Button asChild variant="outline" className="h-11">
            <a href={`tel:${phc.contact_phone}`}>
              <Phone className="mr-2 h-4 w-4" /> Call PHC
            </a>
          </Button>
        )}
        <Button asChild variant="secondary" className="h-11">
          <Link to="/feedback" search={{ phcId: phc.id } as never}>
            <MessageSquarePlus className="mr-2 h-4 w-4" /> Leave feedback
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Weekly schedule */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="flex items-center gap-2 text-base font-semibold text-card-foreground">
              <Calendar className="h-4 w-4" /> Weekly clinic schedule
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Daily hours: <span className="font-medium text-foreground">{hoursLabel}</span> (Africa/Lagos time)
            </p>
            <ul className="mt-4 divide-y divide-border">
              {DAY_KEYS.map((d) => {
                const list = dayServices(phc, d);
                const isToday = d === todayKey;
                return (
                  <li key={d} className={`flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4 ${isToday ? "bg-primary-soft/40 -mx-2 px-2 rounded" : ""}`}>
                    <div className="w-32 shrink-0 text-sm font-medium text-foreground">
                      {DAY_LABELS[d]}
                      {isToday && <span className="ml-2 text-xs text-primary">(today)</span>}
                    </div>
                    {list.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No scheduled clinic</p>
                    ) : (
                      <ul className="flex flex-wrap gap-1.5">
                        {list.map((s) => (
                          <li key={s} className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                            <CheckCircle2 className="h-3 w-3" /> {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* General services */}
          {phc.services && phc.services.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-base font-semibold text-card-foreground">General services offered</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {phc.services.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-secondary" /> {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Map */}
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="border-b border-border p-4">
              <h2 className="text-base font-semibold text-card-foreground">Facility location</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {phc.latitude && phc.longitude
                  ? "Tap directions for turn-by-turn navigation."
                  : "Approximate location based on address."}
              </p>
            </div>
            <div className="aspect-[16/10] w-full bg-muted">
              <iframe
                title={`Map of ${phc.name}`}
                src={embedSrc}
                loading="lazy"
                className="h-full w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="flex items-center gap-2 text-base font-semibold text-card-foreground">
              <Clock className="h-4 w-4" /> Daily hours
            </h2>
            <p className="mt-2 text-sm text-foreground">{hoursLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open/Closed updates live in Africa/Lagos time.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold text-card-foreground">Contact</h2>
            <div className="mt-3 space-y-2 text-sm">
              {phc.contact_phone ? (
                <a href={`tel:${phc.contact_phone}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="h-4 w-4" /> {phc.contact_phone}
                </a>
              ) : (
                <p className="text-muted-foreground">No phone number on record.</p>
              )}
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {phc.address}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
