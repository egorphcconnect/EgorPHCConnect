import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { listArticles } from "@/lib/phcs.functions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { HealthArticle } from "@/lib/types";
import { HEALTH_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Health Information — Egor PHC Connect" },
      {
        name: "description",
        content: "Trusted public health information for residents of Egor LGA: maternal health, immunization, malaria, HIV, nutrition and more.",
      },
      { property: "og:title", content: "Health Information — Egor LGA" },
      { property: "og:description", content: "Practical public health guidance from your local PHC network." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({ queryKey: ["articles"], queryFn: () => listArticles() });
  },
  component: Health,
});

function Health() {
  const { data: articles = [] } = useQuery({ queryKey: ["articles"], queryFn: () => listArticles() });
  const [category, setCategory] = useState<string>("all");
  const [active, setActive] = useState<HealthArticle | null>(null);

  const cats = useMemo(
    () => ["all", ...Array.from(new Set([...HEALTH_CATEGORIES, ...articles.map((a) => a.category)]))],
    [articles],
  );
  const filtered = category === "all" ? articles : articles.filter((a) => a.category === category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Health information</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Practical, plain-language guidance to keep your family healthy.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {c === "all" ? "All topics" : c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <article
            key={a.id}
            className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary-soft px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              <BookOpen className="h-3 w-3" /> {a.category}
            </span>
            <h2 className="mt-3 text-base font-semibold text-card-foreground">{a.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.summary}</p>
            <Button
              variant="ghost"
              className="mt-3 w-fit px-0 text-primary hover:bg-transparent hover:underline"
              onClick={() => setActive(a)}
            >
              Read more →
            </Button>
          </article>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <span className="text-xs font-medium text-secondary">{active.category}</span>
                <DialogTitle className="text-xl">{active.title}</DialogTitle>
                <DialogDescription>{active.summary}</DialogDescription>
              </DialogHeader>
              <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
                {active.content}
              </div>
              {active.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {active.tags.map((t) => (
                    <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
