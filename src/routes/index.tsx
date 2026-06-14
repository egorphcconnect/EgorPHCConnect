import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, MapPin, Megaphone, ArrowRight, Syringe, Baby, Pill, HeartPulse, ShieldPlus, Users } from "lucide-react";
import { listPhcs, listArticles } from "@/lib/phcs.functions";
import { PhcCard } from "@/components/phc-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICE_CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Egor PHC Connect — Primary Healthcare in Egor LGA, Edo State" },
      {
        name: "description",
        content:
          "Find Primary Healthcare Centres, services, and trusted health information for residents of Egor LGA, Edo State, Nigeria.",
      },
      { property: "og:title", content: "Egor PHC Connect" },
      {
        property: "og:description",
        content: "Find Primary Healthcare Centres and trusted health information in Egor LGA.",
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
  const { data: phcs = [] } = useQuery({ queryKey: ["phcs"], queryFn: () => listPhcs() });
  const { data: articles = [] } = useQuery({ queryKey: ["articles"], queryFn: () => listArticles() });

  const nearby = phcs.slice(0, 3);
  const announcement = articles[0];

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
              Locate Primary Healthcare Centres, check services and hours, get directions, and read trusted public health information.
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
              <Button type="submit" size="lg" className="h-12">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* QUICK SERVICES */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-semibold text-foreground">Quick services</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap a service to find PHCs that offer it.
        </p>
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

      {/* ANNOUNCEMENT */}
      {announcement && (
        <section className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-3 rounded-xl border border-secondary/30 bg-secondary-soft p-5 md:flex-row md:items-center md:justify-between">
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
        </section>
      )}

      {/* NEARBY PHCs */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Nearby PHCs</h2>
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
