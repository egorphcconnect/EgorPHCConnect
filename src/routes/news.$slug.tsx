import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock, MapPin, Phone, ExternalLink, Megaphone } from "lucide-react";
import { CmsImage } from "@/components/cms-image";
import { RichText } from "@/components/rich-text";
import { EventTimingBadge, NewsCard } from "@/components/news-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatEventDate,
  formatPublishedAt,
  newsBySlugQuery,
  publishedNewsQuery,
} from "@/lib/news";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ context, params }) => {
    const [data] = await Promise.all([
      context.queryClient.ensureQueryData(newsBySlugQuery(params.slug)),
      context.queryClient.ensureQueryData(publishedNewsQuery()),
    ]);
    if (!data) throw notFound();
    return {
      title: data.post.title,
      summary: data.post.summary,
      image: data.post.featured_image,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Announcement unavailable — Egor PHC Connect" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} — Egor PHC Connect`;
    const description =
      loaderData.summary?.slice(0, 155) || "News and announcements from the PHC network in Egor LGA, Edo State.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <NewsMissing message="This announcement could not be loaded." />,
  notFoundComponent: () => <NewsMissing message="This announcement is not available." />,
  component: NewsDetail,
});

function NewsMissing({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-foreground">Announcement not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <Link to="/news">Back to News &amp; Announcements</Link>
      </Button>
    </div>
  );
}

function NewsDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(newsBySlugQuery(slug));
  const { data: all } = useSuspenseQuery(publishedNewsQuery());

  if (!data) return <NewsMissing message="This announcement is not available." />;
  const { post, images } = data;

  const eventDate = formatEventDate(post.event_date);
  const published = formatPublishedAt(post.published_at ?? post.created_at);
  const hasEvent = Boolean(eventDate || post.event_time || post.location || post.contact_information);
  const related = all
    .filter((p) => p.id !== post.id && (!post.category_id || p.category_id === post.category_id))
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/news"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to News &amp; Announcements
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          {post.category ? (
            <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">{post.category.name}</Badge>
          ) : null}
          <EventTimingBadge date={post.event_date} />
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
          {post.title}
        </h1>
        {published ? (
          <p className="mt-2 text-sm text-muted-foreground">Published {published}</p>
        ) : null}
        {post.summary ? (
          <p className="mt-4 text-base leading-relaxed text-foreground/90">{post.summary}</p>
        ) : null}
      </header>

      {post.featured_image ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-primary-soft">
          <CmsImage
            value={post.featured_image}
            alt={post.featured_image_alt || post.title}
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}

      {hasEvent && (
        <section
          aria-label="Event details"
          className="mt-6 rounded-xl border border-primary/20 bg-primary-soft/40 p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Event details</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {eventDate ? (
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Date</dt>
                  <dd className="text-sm font-medium text-foreground">{eventDate}</dd>
                </div>
              </div>
            ) : null}
            {post.event_time ? (
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Time</dt>
                  <dd className="text-sm font-medium text-foreground">{post.event_time}</dd>
                </div>
              </div>
            ) : null}
            {post.location ? (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Location</dt>
                  <dd className="text-sm font-medium text-foreground">{post.location}</dd>
                </div>
              </div>
            ) : null}
            {post.contact_information ? (
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Contact</dt>
                  <dd className="text-sm font-medium text-foreground">{post.contact_information}</dd>
                </div>
              </div>
            ) : null}
          </dl>
        </section>
      )}

      {post.content ? <RichText text={post.content} className="mt-6" /> : null}

      {post.call_to_action_text && post.call_to_action_url ? (
        <div className="mt-6">
          <Button asChild size="lg">
            <a
              href={post.call_to_action_url}
              target={post.call_to_action_url.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              {post.call_to_action_text}
              <ExternalLink className="ml-1 h-4 w-4" aria-hidden />
            </a>
          </Button>
        </div>
      ) : null}

      {images.length > 0 && (
        <section className="mt-8" aria-label="Photographs">
          <h2 className="text-lg font-semibold text-foreground">Photographs</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {images.map((img) => (
              <figure key={img.id} className="overflow-hidden rounded-xl border border-border bg-primary-soft">
                <CmsImage value={img.image_url} alt={img.image_alt || post.title} className="h-full w-full object-cover" />
              </figure>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10 border-t border-border pt-8" aria-label="Related news">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Megaphone className="h-4 w-4 text-primary" aria-hidden /> Related news
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <NewsCard key={p.id} post={p} compact />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Button asChild variant="outline">
          <Link to="/news">
            <ArrowLeft className="mr-1 h-4 w-4" aria-hidden /> Back to News &amp; Announcements
          </Link>
        </Button>
      </div>
    </article>
  );
}
