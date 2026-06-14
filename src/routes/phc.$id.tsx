import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, Navigation, MessageSquarePlus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { getPhc } from "@/lib/phcs.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isOpenNow, type PHC } from "@/lib/types";

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
            ? `${phc.name} in ${phc.ward} ward. Services, hours and directions for this Primary Healthcare Centre in Egor LGA.`
            : "Primary Healthcare Centre details.",
        },
        { property: "og:title", content: phc?.name ?? "PHC details" },
        { property: "og:description", content: phc?.address ?? "" },
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

  const open = isOpenNow(phc.operating_hours);
  const mapQuery =
    phc.latitude && phc.longitude
      ? `${phc.latitude},${phc.longitude}`
      : encodeURIComponent(`${phc.name}, ${phc.address}, Egor LGA, Edo State, Nigeria`);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
  const embedSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <Link
        to="/directory"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to directory
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{phc.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {phc.address} · {phc.ward} Ward
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

      {/* Action buttons */}
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
          {/* Services */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold text-card-foreground">Services offered</h2>
            {phc.services.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No service list available.</p>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {phc.services.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-secondary" /> {s}
                  </li>
                ))}
              </ul>
            )}
          </section>

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
          {/* Schedule */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="flex items-center gap-2 text-base font-semibold text-card-foreground">
              <Clock className="h-4 w-4" /> Clinic schedule
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <ScheduleRow label="Mon – Fri" value={phc.operating_hours.mon_fri} />
              <ScheduleRow label="Saturday" value={phc.operating_hours.sat} />
              <ScheduleRow label="Sunday" value={phc.operating_hours.sun} />
            </dl>
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

function ScheduleRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value ?? "Not available"}</dd>
    </div>
  );
}
