import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Filter, SearchX } from "lucide-react";
import { z } from "zod";
import { listPhcs } from "@/lib/phcs.functions";
import { PhcCard } from "@/components/phc-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICE_CATEGORIES, isOpenNow } from "@/lib/types";

const searchSchema = z.object({
  q: z.string().optional(),
  service: z.string().optional(),
  ward: z.string().optional(),
});

export const Route = createFileRoute("/directory")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "PHC Directory — Egor PHC Connect" },
      { name: "description", content: "Browse all Primary Healthcare Centres in Egor LGA. Filter by service, ward, or opening status." },
      { property: "og:title", content: "PHC Directory — Egor LGA" },
      { property: "og:description", content: "Browse Primary Healthcare Centres in Egor LGA, Edo State." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({ queryKey: ["phcs"], queryFn: () => listPhcs() });
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-destructive">
      Couldn't load directory: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="px-4 py-10 text-center">Not found.</div>,
  component: Directory,
});

function Directory() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: phcs, isLoading } = useQuery({ queryKey: ["phcs"], queryFn: () => listPhcs() });

  const [q, setQ] = useState(search.q ?? "");
  const [service, setService] = useState(search.service ?? "all");
  const [ward, setWard] = useState(search.ward ?? "all");
  const [openOnly, setOpenOnly] = useState(false);
  const [sort, setSort] = useState<"name" | "ward">("name");

  const wards = useMemo(
    () => Array.from(new Set((phcs ?? []).map((p) => p.ward))).sort(),
    [phcs],
  );

  const filtered = useMemo(() => {
    let list = phcs ?? [];
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(qq) ||
          p.ward.toLowerCase().includes(qq) ||
          p.services.some((s) => s.toLowerCase().includes(qq)),
      );
    }
    if (service !== "all") list = list.filter((p) => p.services.includes(service));
    if (ward !== "all") list = list.filter((p) => p.ward === ward);
    if (openOnly) list = list.filter((p) => isOpenNow(p.operating_hours));
    list = [...list].sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : a.ward.localeCompare(b.ward),
    );
    return list;
  }, [phcs, q, service, ward, openOnly, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-2 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">PHC Directory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All Primary Healthcare Centres in Egor LGA.
          </p>
        </div>
      </div>

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
                onChange={(e) => {
                  setQ(e.target.value);
                  navigate({ search: (s) => ({ ...s, q: e.target.value || undefined }) });
                }}
                placeholder="Search by name, ward, or service"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <Select value={service} onValueChange={(v) => { setService(v); navigate({ search: (s) => ({ ...s, service: v === "all" ? undefined : v }) }); }}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Service" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                {SERVICE_CATEGORIES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Select value={ward} onValueChange={(v) => { setWard(v); navigate({ search: (s) => ({ ...s, ward: v === "all" ? undefined : v }) }); }}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Ward" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All wards</SelectItem>
                {wards.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Select value={sort} onValueChange={(v) => setSort(v as "name" | "ward")}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort: Name</SelectItem>
                <SelectItem value="ward">Sort: Ward</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Switch id="open" checked={openOnly} onCheckedChange={setOpenOnly} />
          <Label htmlFor="open" className="text-sm">Open now</Label>
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-14 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold text-foreground">No PHCs match your filters</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different ward or service, or clear the search.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PhcCard key={p.id} phc={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
