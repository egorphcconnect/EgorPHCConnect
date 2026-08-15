import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Megaphone, Search } from "lucide-react";
import { NewsCard } from "@/components/news-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { eventTiming, newsCategoriesQuery, publishedNewsQuery } from "@/lib/news";

const TITLE = "News & Announcements — Egor PHC Connect";
const DESCRIPTION =
  "Outreaches, immunization campaigns, free screenings, clinic schedule changes and public health notices from the Primary Healthcare Centres of Egor LGA, Edo State.";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(publishedNewsQuery()),
      context.queryClient.ensureQueryData(newsCategoriesQuery),
    ]);
  },
  component: NewsIndex,
});

const PAGE_SIZE = 9;

function NewsIndex() {
  const { data: posts } = useSuspenseQuery(publishedNewsQuery());
  const { data: categories = [] } = useQuery(newsCategoriesQuery);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [timing, setTiming] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== "all" && p.category_id !== category) return false;
      if (timing === "upcoming" && eventTiming(p.event_date) !== "upcoming") return false;
      if (timing === "past" && eventTiming(p.event_date) !== "past") return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.summary.toLowerCase().includes(needle) ||
        p.content.toLowerCase().includes(needle) ||
        (p.location ?? "").toLowerCase().includes(needle)
      );
    });
  }, [posts, q, category, timing]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Megaphone className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            News &amp; Announcements
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Outreaches, immunization campaigns, free screenings, clinic updates and public health
            notices from across Egor Local Government Area.
          </p>
        </div>
      </header>

      {/* FILTERS */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setVisible(PAGE_SIZE); }}
            placeholder="Search announcements"
            aria-label="Search announcements by title or content"
            className="pl-9"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="news-category">Filter by category</label>
          <Select value={category} onValueChange={(v) => { setCategory(v); setVisible(PAGE_SIZE); }}>
            <SelectTrigger id="news-category" className="w-full sm:w-56"><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="sr-only" htmlFor="news-timing">Filter by activity timing</label>
          <Select value={timing} onValueChange={(v) => { setTiming(v); setVisible(PAGE_SIZE); }}>
            <SelectTrigger id="news-timing" className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All announcements</SelectItem>
              <SelectItem value="upcoming">Upcoming events</SelectItem>
              <SelectItem value="past">Past activities</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" role="status">
        {filtered.length} announcement{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No announcements match your search yet. Please check back soon.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <NewsCard key={p.id} post={p} />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more announcements
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
