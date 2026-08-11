import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { siteContentQuery, pageText } from "@/lib/cms";
import { RichText } from "@/components/rich-text";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — Egor PHC Connect" },
      { name: "description", content: "The terms governing use of EgorPHCConnect, the primary healthcare directory for Egor LGA, Edo State, Nigeria." },
      { property: "og:title", content: "Terms and Conditions — EgorPHCConnect" },
      { property: "og:description", content: "Terms governing use of the EgorPHCConnect primary healthcare directory." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteContentQuery);
  },
  component: Terms,
});

function Terms() {
  const { data: content } = useQuery(siteContentQuery);
  const t = pageText(content, "terms");
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {t("last_updated")}</p>
      <RichText text={t("body")} className="mt-6" />
    </article>
  );
}
