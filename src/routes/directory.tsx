import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Filter, SearchX, LocateFixed, X, CalendarClock } from "lucide-react";
import { z } from "zod";
import { listPhcs } from "@/lib/phcs.functions";
import { listServicesCatalog } from "@/lib/services.functions";
import { PhcCard } from "@/components/phc-card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  isOpenLagos, nowLagos, dayServices, haversineKm,
  DAY_KEYS, DAY_LABELS, type DayKey,
} from "@/lib/types";
import { useGeolocation } from "@/hooks/use-geolocation";

type DayMode = "today" | "day" | "any";

const searchSchema = z.object({
  q: z.string().optional(),
  service: z.string().optional(),
  ward: z.string().optional(),
  dayMode: z.string().optional(),
  day: z.string().optional(),
  openNow: z.coerce.number().int().optional(),
  status: z.string().optional(),
  nearest: z.coerce.number().int().optional(),
});

export const Route = createFileRoute("/directory")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "PHC Directory — Egor PHC Connect" },
      { name: "description", content: "Browse all Primary Healthcare Centres in Egor LGA. Filter by service, ward, day, or open status, and find the nearest PHC offering the service today." },
      { property: "og:title", content: "PHC Directory — Egor LGA" },
      { property: "og:description", content: "Browse Primary Healthcare Centres in Egor LGA, Edo State." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: ["phcs"], queryFn: () => listPhcs() }),
      context.queryClient.ensureQueryData({ queryKey: ["services_catalog"], queryFn: () => listServicesCatalog() }),
    ]);
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-destructive">
      Couldn't load directory: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="px-4 py-10 text-center">Not found.</div>,
  component: Directory,
});

function formatLagosDate(dayKey: DayKey): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "long", day: "numeric", month: "long",
  });
  return fmt.format(new Date());
  // ignore dayKey — used only for typing/context
  void dayKey;
}

function Directory() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: phcs, isLoading } = useQuery({ queryKey: ["phcs"], queryFn: () => listPhcs() });
  const { data: catalog = [] } = useQuery({ queryKey: ["services_catalog"], queryFn: () => listServicesCatalog() });
  const geo = useGeolocation();
  const { dayKey: todayKey } = nowLagos();

  const [q, setQ] = useState(search.q ?? "");
  const [service, setService] = useState(search.service ?? "all");
  const [ward, setWard] = useState(search.ward ?? "all");
  const [dayMode, setDayMode] = useState<DayMode>(
    (search.dayMode as DayMode) ?? "today",
  );
  const [day, setDay] = useState<DayKey>((search.day as DayKey) ?? todayKey);
  const [status, setStatus] = useState<"all" | "open" | "closed">(
    (search.status as "all" | "open" | "closed") ?? (search.openNow ? "open" : "all"),
  );

  const [sort, setSort] = useState<"name" | "ward" | "distance">(
    search.nearest ? "distance" : "name",
  );

  useMemo(() => {
    if (search.nearest && geo.status === "idle") geo.request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.nearest]);

  const wards = useMemo(
    () => Array.from(new Set((phcs ?? []).map((p) => p.ward))).sort(),
    [phcs],
  );

  const allServices = useMemo(() => {
    const fromPhcs = (phcs ?? []).flatMap((p) => [
      ...p.services,
      ...DAY_KEYS.flatMap((d) => dayServices(p, d)),
    ]);
    return Array.from(new Set([...catalog, ...fromPhcs])).sort();
  }, [phcs, catalog]);

  // Effective day used for filtering when the user is in a day-scoped mode.
  const effectiveDay: DayKey | null =
    dayMode === "today" ? todayKey : dayMode === "day" ? day : null;

  const filtered = useMemo(() => {
    let list = phcs ?? [];
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter((p) => {
        const haystack = [
          p.name, p.ward, p.address,
          ...(p.services ?? []),
          ...DAY_KEYS.flatMap((d) => dayServices(p, d)),
        ].join(" ").toLowerCase();
        return haystack.includes(qq);
      });
    }

    // DAY-AWARE SERVICE + SCHEDULE FILTERING
    if (effectiveDay) {
      // In "today" or "specific day" mode, always require a scheduled clinic that day.
      list = list.filter((p) => dayServices(p, effectiveDay).length > 0);
      if (service !== "all") {
        list = list.filter((p) =>
          dayServices(p, effectiveDay).some(
            (s) => s.toLowerCase() === service.toLowerCase(),
          ),
        );
      }
    } else if (service !== "all") {
      // "Any day" mode: at least one day of the week runs this clinic.
      list = list.filter((p) =>
        DAY_KEYS.some((d) =>
          dayServices(p, d).some((s) => s.toLowerCase() === service.toLowerCase()),
        ),
      );
    }

    if (ward !== "all") list = list.filter((p) => p.ward === ward);
    if (status === "open") list = list.filter((p) => isOpenLagos(p.opening_time, p.closing_time));
    else if (status === "closed") list = list.filter((p) => !isOpenLagos(p.opening_time, p.closing_time));

    let withDist = list.map((p) => {
      const distance =
        geo.coords && p.latitude != null && p.longitude != null
          ? haversineKm(
              { lat: geo.coords.latitude, lng: geo.coords.longitude },
              { lat: p.latitude, lng: p.longitude },
            )
          : null;
      return { phc: p, distance };
    });

    if (sort === "distance" && geo.coords) {
      withDist = [...withDist].sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
    } else if (sort === "ward") {
      withDist = [...withDist].sort((a, b) => a.phc.ward.localeCompare(b.phc.ward));
    } else {
      withDist = [...withDist].sort((a, b) => a.phc.name.localeCompare(b.phc.name));
    }
    return withDist;
  }, [phcs, q, service, ward, effectiveDay, dayMode, openOnly, sort, geo.coords]);

  function updateUrl(patch: Record<string, string | number | undefined>) {
    navigate({ search: (s: Record<string, unknown>) => ({ ...s, ...patch }) });
  }

  function clearAll() {
    setQ(""); setService("all"); setWard("all"); setDayMode("today"); setDay(todayKey);
    setOpenOnly(false); setSort("name");
    navigate({ search: {} as never });
  }

  const activeFilters =
    (search.q ? 1 : 0) + (service !== "all" ? 1 : 0) + (ward !== "all" ? 1 : 0) +
    (dayMode !== "today" ? 1 : 0) + (openOnly ? 1 : 0) + (sort === "distance" ? 1 : 0);

  // Human context banner
  const dayContextLabel =
    dayMode === "today"
      ? `Showing services available today · ${formatLagosDate(todayKey)}`
      : dayMode === "day"
      ? `Showing services available on ${DAY_LABELS[day]}`
      : "Showing PHCs offering the service on any day of the week";

  const serviceLabel = service !== "all" ? service : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">PHC Directory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search by service, ward or day. Results default to services available today
            in Africa/Lagos time.
          </p>
        </div>
        {geo.status === "granted" ? (
          <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
            <LocateFixed className="mr-1 h-3 w-3" /> Location active
          </Badge>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={geo.request} disabled={geo.status === "prompting"}>
            <LocateFixed className="mr-1 h-4 w-4" />
            {geo.status === "prompting" ? "Locating…" : "Use my location"}
          </Button>
        )}
      </div>

      {geo.status === "denied" && (
        <p className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
          Location permission was denied. You can still search by name, ward, service or day.
        </p>
      )}

      {/* Filters */}
      <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <Label htmlFor="search" className="sr-only">Search</Label>
            <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                id="search"
                value={q}
                onChange={(e) => { setQ(e.target.value); updateUrl({ q: e.target.value || undefined }); }}
                placeholder="Search by name, ward, address or service"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="md:col-span-4">
            <Select value={service} onValueChange={(v) => { setService(v); updateUrl({ service: v === "all" ? undefined : v }); }}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Service" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                {allServices.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={ward} onValueChange={(v) => { setWard(v); updateUrl({ ward: v === "all" ? undefined : v }); }}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Ward" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All wards</SelectItem>
                {wards.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Day mode toggle */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Availability:</span>
          <div className="inline-flex rounded-md border border-input bg-background p-0.5">
            {(["today", "day", "any"] as DayMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setDayMode(m);
                  updateUrl({
                    dayMode: m === "today" ? undefined : m,
                    day: m === "day" ? day : undefined,
                  });
                }}
                className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors ${
                  dayMode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                {m === "today" ? "Available today" : m === "day" ? "Specific day" : "Any day"}
              </button>
            ))}
          </div>
          {dayMode === "day" && (
            <Select value={day} onValueChange={(v) => { setDay(v as DayKey); updateUrl({ day: v }); }}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAY_KEYS.map((d) => (
                  <SelectItem key={d} value={d}>{DAY_LABELS[d]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="open"
              checked={openOnly}
              onCheckedChange={(v) => { setOpenOnly(v); updateUrl({ openNow: v ? 1 : undefined }); }}
            />
            <Label htmlFor="open" className="text-sm">Open now</Label>
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as "name" | "ward" | "distance")}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort: Name</SelectItem>
              <SelectItem value="ward">Sort: Ward</SelectItem>
              <SelectItem value="distance" disabled={!geo.coords}>
                Sort: Nearest {!geo.coords ? "(needs location)" : ""}
              </SelectItem>
            </SelectContent>
          </Select>
          {activeFilters > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
              <X className="mr-1 h-3 w-3" /> Clear filters
            </Button>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Result context banner */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary-soft/40 px-3 py-2 text-sm text-primary">
        <CalendarClock className="h-4 w-4" />
        <span className="font-medium">
          {serviceLabel
            ? dayMode === "today"
              ? `${serviceLabel} available today`
              : dayMode === "day"
              ? `${serviceLabel} available on ${DAY_LABELS[day]}`
              : `${serviceLabel} — any day of the week`
            : dayContextLabel}
        </span>
        {serviceLabel && dayMode === "today" && (
          <span className="text-xs text-primary/80">· {formatLagosDate(todayKey)}</span>
        )}
      </div>

      {/* List */}
      <div className="mt-4">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-14 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold text-foreground">
              {serviceLabel
                ? dayMode === "today"
                  ? `No PHCs were found offering ${serviceLabel} today.`
                  : dayMode === "day"
                  ? `No PHCs offer ${serviceLabel} on ${DAY_LABELS[day]}.`
                  : `No PHCs currently offer ${serviceLabel}.`
                : "No PHCs match your filters"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different day, ward or service — or view the full weekly schedule.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {serviceLabel && dayMode !== "any" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDayMode("any");
                    updateUrl({ dayMode: "any", day: undefined });
                  }}
                >
                  View PHCs offering it on any day
                </Button>
              )}
              {serviceLabel && dayMode !== "day" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDayMode("day");
                    updateUrl({ dayMode: "day", day });
                  }}
                >
                  Pick a specific day
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ phc, distance }) => (
              <PhcCard key={phc.id} phc={phc} distanceKm={distance} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
