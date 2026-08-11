import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { siteContentQuery, pageText } from "@/lib/cms";
import { RichText } from "@/components/rich-text";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement — Egor PHC Connect" },
      { name: "description", content: "Our commitment to making EgorPHCConnect accessible to every resident of Egor LGA, including people using assistive technologies." },
      { property: "og:title", content: "Accessibility Statement — EgorPHCConnect" },
      { property: "og:description", content: "How EgorPHCConnect works towards accessible primary healthcare information." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteContentQuery);
  },
  component: Accessibility,
});

function Accessibility() {
  const { data: content } = useQuery(siteContentQuery);
  const t = pageText(content, "accessibility");
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {t("last_updated")}</p>
      <RichText text={t("body")} className="mt-6" />
      <p className="mt-8 text-sm text-muted-foreground">
        Report a problem via the{" "}
        <Link to="/contact" className="text-primary hover:underline">Contact Us</Link> page or the{" "}
        <Link to="/feedback" className="text-primary hover:underline">Feedback</Link> page.
      </p>
    </article>
  );
}
