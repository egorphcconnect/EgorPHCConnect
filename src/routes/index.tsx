import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Search, MapPin, Megaphone, ArrowRight, Syringe, Baby, Pill, HeartPulse,
  ShieldPlus, Users, CalendarClock, Navigation, LocateFixed,
} from "lucide-react";
import { listPhcs, listArticles } from "@/lib/phcs.functions";
import { PhcCard } from "@/components/phc-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SERVICE_CATEGORIES, nowLagos, dayServices, DAY_LABELS, haversineKm, isOpenLagos } from "@/lib/types";
import { useGeolocation } from "@/hooks/use-geolocation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Egor PHC Connect — Primary Healthcare in Egor LGA, Edo State" },
      {
        name: "description",
        content:
          "Find Primary Healthcare Centres, today's clinics, and trusted health information for residents of Egor LGA, Edo State, Nigeria.",
      },
      { property: "og:title", content: "Egor PHC Connect" },
      {
        property: "og:description",
        content: "Find Primary Healthcare Centres and today's clinics in Egor LGA.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: ["phcs"], queryFn: () => listPhcs() }),
      context.queryClient.ensureQueryData({ queryKey: ["articles"], queryFn: () => listArticles() }),
    ]);
  },
  component: Index,
});

const SERVICE_ICONS: Record<string, typeof Syringe> = {
  "Antenatal Care": HeartPulse,
  "Immunization": Syringe,
  "Family Planning": Users,
  "Child Welfare": Baby,
  "Malaria Treatment": Pill,
  "HIV Services": ShieldPlus,
};

function Index() {
  const [q, setQ] = useState("");
  const navigate = Route.useNavigate();
  const { data: phcs } = useSuspenseQuery({ queryKey: ["phcs"], queryFn: () => listPhcs() });
  const { data: articles } = useSuspenseQuery({ queryKey: ["articles"], queryFn: () => listArticles() });
  const geo = useGeolocation();

  const { dayKey } = nowLagos();
  const announcement = articles[0];

  const todayPhcs = useMemo(() => {
    const list = phcs
      .map((p) => ({ phc: p, services: dayServices(p, dayKey) }))
      .filter((x) => x.services.length > 0);
    if (geo.coords) {
      return list
        .map((x) => ({
          ...x,
          distance: x.phc.latitude != null && x.phc.longitude != null
            ? haversineKm(
                { lat: geo.coords!.latitude, lng: geo.coords!.longitude },
                { lat: x.phc.latitude, lng: x.phc.longitude },
              )
            : null,
        }))
        .sort((a, b) => {
          if (a.distance == null) return 1;
          if (b.distance == null) return -1;
          return a.distance - b.distance;
        });
    }
    return list.map((x) => ({ ...x, distance: null as number | null }));
  }, [phcs, dayKey, geo.coords]);

  const nearby = phcs.slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="hero-gradient text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              Egor LGA · Edo State · Nigeria
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
              Find healthcare near you in Egor LGA
            </h1>
            <p className="mt-3 text-base text-white/90 md:text-lg">
              Locate Primary Healthcare Centres, see today's clinics, get directions and read trusted health information.
            </p>

            <form
              className="mt-6 flex flex-col gap-2 rounded-xl bg-white p-2 shadow-lg sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/directory", search: { q } as never });
              }}
            >
              <div className="flex flex-1 items-center gap-2 px-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search PHC, ward or service…"
                  className="border-0 text-foreground shadow-none focus-visible:ring-0"
                  aria-label="Search PHCs"
                />
              </div>
              <Button type="submit" size="lg" className="h-12">Search</Button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Link
                to="/directory"
                search={{ nearest: 1 } as never}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 font-medium text-white backdrop-blur hover:bg-white/25"
              >
                <LocateFixed className="h-3.5 w-3.5" /> Find nearest PHC
              </Link>
              <Link
                to="/directory"
                search={{ openNow: 1 } as never}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 font-medium text-white backdrop-blur hover:bg-white/25"
              >
                Open right now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SERVICES */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-semibold text-foreground">Quick services</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tap a service to find PHCs that offer it.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SERVICE_CATEGORIES.map((s) => {
            const Icon = SERVICE_ICONS[s] ?? HeartPulse;
            return (
              <Link
                key={s}
                to="/directory"
                search={{ service: s } as never}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-card-foreground">{s}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TODAY'S AVAILABLE CLINICS */}
      <section className="mx-auto max-w-6xl px-4 pb-2">
        <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <CalendarClock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Today's available clinics</h2>
                <p className="text-sm text-muted-foreground">
                  PHCs scheduled to run a clinic on {DAY_LABELS[dayKey]}.
                </p>
              </div>
            </div>
            {geo.status !== "granted" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={geo.request}
                disabled={geo.status === "prompting"}
              >
                <LocateFixed className="mr-1 h-4 w-4" />
                {geo.status === "prompting" ? "Locating…" : "Use my location"}
              </Button>
            ) : (
              <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                Sorted by distance
              </Badge>
            )}
          </div>
          {geo.status === "denied" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Location access is denied. You can still browse and search manually.
            </p>
          )}

          {todayPhcs.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No PHCs report a scheduled clinic today. Many still run general consultation — call ahead to confirm.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {todayPhcs.slice(0, 6).map(({ phc, services, distance }) => {
                const open = isOpenLagos(phc.opening_time, phc.closing_time);
                const mapQuery = phc.latitude && phc.longitude
                  ? `${phc.latitude},${phc.longitude}`
                  : encodeURIComponent(`${phc.name}, ${phc.address}, Egor LGA, Edo State, Nigeria`);
                return (
                  <div key={phc.id} className="flex flex-col rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-semibold text-card-foreground">{phc.name}</p>
                      <Badge
                        variant="outline"
                        className={open
                          ? "shrink-0 border-success/30 bg-success/10 text-success"
                          : "shrink-0 border-muted-foreground/20 bg-muted text-muted-foreground"}
                      >
                        {open ? "Open" : "Closed"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {phc.ward} Ward{distance != null ? ` · ${distance.toFixed(1)} km` : ""}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1">
                      {services.slice(0, 4).map((s) => (
                        <li key={s} className="rounded-full bg-secondary-soft px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                          {s}
                        </li>
                      ))}
                      {services.length > 4 && (
                        <li className="text-xs text-muted-foreground">+{services.length - 4}</li>
                      )}
                    </ul>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Link
                        to="/phc/$id"
                        params={{ id: phc.id }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View details
                      </Link>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs font-medium hover:bg-accent"
                      >
                        <Navigation className="h-3 w-3" /> Directions
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ANNOUNCEMENT */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        {announcement ? (
          <div className="flex flex-col gap-3 rounded-xl border border-secondary/40 bg-secondary-soft p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <Megaphone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground/80">
                  Public health announcement
                </p>
                <p className="mt-0.5 text-base font-semibold text-foreground">{announcement.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{announcement.summary}</p>
              </div>
            </div>
            <Link
              to="/health"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Read more <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </section>

      {/* NEARBY PHCs */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Featured PHCs</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> Showing facilities in Egor LGA
            </p>
          </div>
          <Link to="/directory" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nearby.map((p) => (
            <PhcCard key={p.id} phc={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
