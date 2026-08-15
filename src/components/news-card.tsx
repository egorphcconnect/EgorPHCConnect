import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { CmsImage } from "@/components/cms-image";
import { Badge } from "@/components/ui/badge";
import {
  eventTiming,
  formatEventDate,
  formatPublishedAt,
  type NewsPostWithCategory,
} from "@/lib/news";

export function EventTimingBadge({ date }: { date: string | null }) {
  const timing = eventTiming(date);
  if (!timing) return null;
  return (
    <Badge
      variant="outline"
      className={
        timing === "upcoming"
          ? "border-success/30 bg-success/10 text-success"
          : "border-muted-foreground/20 bg-muted text-muted-foreground"
      }
    >
      <span
        aria-hidden
        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
          timing === "upcoming" ? "bg-success" : "bg-muted-foreground"
        }`}
      />
      {timing === "upcoming" ? "Upcoming event" : "Past activity"}
    </Badge>
  );
}

export function NewsCard({ post, compact = false }: { post: NewsPostWithCategory; compact?: boolean }) {
  const eventDate = formatEventDate(post.event_date);
  const published = formatPublishedAt(post.published_at ?? post.created_at);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
      <Link
        to="/news/$slug"
        params={{ slug: post.slug }}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Read: ${post.title}`}
      >
        <div className="aspect-[16/9] w-full overflow-hidden bg-primary-soft">
          <CmsImage
            value={post.featured_image}
            alt={post.featured_image_alt || post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {post.category ? (
            <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">{post.category.name}</Badge>
          ) : null}
          <EventTimingBadge date={post.event_date} />
        </div>
        <h3 className="text-base font-semibold leading-snug text-card-foreground">
          <Link to="/news/$slug" params={{ slug: post.slug }} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        {!compact && post.summary ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">{post.summary}</p>
        ) : null}
        <dl className="mt-auto space-y-1 pt-2 text-xs text-muted-foreground">
          {eventDate ? (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <dt className="sr-only">Event date</dt>
              <dd>
                {eventDate}
                {post.event_time ? ` · ${post.event_time}` : ""}
              </dd>
            </div>
          ) : null}
          {post.location ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <dt className="sr-only">Location</dt>
              <dd className="truncate">{post.location}</dd>
            </div>
          ) : null}
          {published ? (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <dt className="sr-only">Published</dt>
              <dd>Published {published}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
