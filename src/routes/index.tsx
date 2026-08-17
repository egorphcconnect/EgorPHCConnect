import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Search, MapPin, Megaphone, ArrowRight, Syringe, Baby, Pill, HeartPulse,
  ShieldPlus, Users, CalendarClock, Navigation, LocateFixed, ChevronDown,
} from "lucide-react";
import { listPhcs, listArticles } from "@/lib/phcs.functions";
import { PhcCard } from "@/components/phc-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SERVICE_CATEGORIES, nowLagos, dayServices, DAY_LABELS, haversineKm, isOpenLagos } from "@/lib/types";
import { useGeolocation } from "@/hooks/use-geolocation";
import phcHero from "@/assets/phc-hero.png.asset.json";
import { siteContentQuery, pageText } from "@/lib/cms";
import { featuredNewsQuery } from "@/lib/news";
import { NewsCard } from "@/components/news-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Egor PHC Connect — Primary Healthcare in Egor LGA, Edo State" },
      {
        name: "description",
        content:
          "Find Primary Healthcare Centres, today's clinics, and trusted health information for residents of Egor LGA, Edo State, Nigeria.",
      },
      { property: "og:title", content: "Egor PHC Connect — Primary Healthcare in Egor LGA, Edo State" },
      {
        property: "og:description",
        content: "Find Primary Healthcare Centres, today's clinics, and trusted health information for residents of Egor LGA, Edo State, Nigeria.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: ["phcs"], queryFn: () => listPhcs() }),
      context.queryClient.ensureQueryData({ queryKey: ["articles"], queryFn: () => listArticles() }),
      context.queryClient.ensureQueryData(siteContentQuery),
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
  const { data: content } = useQuery(siteContentQuery);
  const t = pageText(content, "home");

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
      <section
        aria-label="Welcome to Egor PHC Connect"
        className="relative isolate flex min-h-[60vh] items-center overflow-hidden md:min-h-[65vh] lg:min-h-[70vh]"
      >
        <img
          src={phcHero.url}
          alt="Entrance to a Primary Healthcare Centre in Egor Local Government Area."
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        {/* Dark green overlay for legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-br from-[oklch(0.30_0.10_158/0.78)] via-[oklch(0.30_0.10_158/0.60)] to-[oklch(0.20_0.08_158/0.55)]"
        />

        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-2xl text-primary-foreground">
            <span className="inline-flex animate-in fade-in slide-in-from-bottom-3 items-center rounded-full border border-secondary/40 bg-secondary/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur duration-500">
              {t("hero_eyebrow")}
            </span>
            <h1 className="mt-4 animate-in fade-in slide-in-from-bottom-4 text-3xl font-bold leading-tight text-white drop-shadow-md duration-700 sm:text-4xl md:text-5xl lg:text-6xl">
              {t("hero_heading")}
            </h1>
            <p className="mt-4 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-base leading-relaxed text-white/95 drop-shadow duration-700 [animation-delay:150ms] sm:text-lg">
              {t("hero_subheading")}
            </p>

            <div className="mt-7 flex animate-in fade-in slide-in-from-bottom-4 flex-wrap gap-3 duration-700 [animation-delay:300ms]">
              <Button
                asChild
                size="lg"
                className="h-12 bg-secondary px-6 text-secondary-foreground shadow-lg hover:bg-secondary/90"
              >
                <Link to="/directory">
                  <Search className="h-4 w-4" /> {t("hero_primary_cta")}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/70 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <Link to="/directory" search={{ nearest: 1 } as never}>
                  <LocateFixed className="h-4 w-4" /> {t("hero_secondary_cta")}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#quick-services"
          aria-label="Scroll to explore services"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/40 bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      {/* QUICK SERVICES */}
      <section id="quick-services" className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-semibold text-foreground">{t("services_heading")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("services_intro")}</p>
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
                <h2 className="text-xl font-semibold text-foreground">{t("today_heading")}</h2>
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
              {t("today_empty")}
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
                        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${open ? "bg-success" : "bg-muted-foreground"}`} aria-hidden />
                        {open ? "Currently open" : "Currently closed"}
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
                  {t("announcement_label")}
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
            <h2 className="text-xl font-semibold text-foreground">{t("featured_heading")}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {t("featured_intro")}
            </p>
          </div>
          <Link to="/directory" className="text-sm font-medium text-primary hover:underline">
            {t("featured_link")}
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
