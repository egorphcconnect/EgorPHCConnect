import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { siteContentQuery, pageText } from "@/lib/cms";
import { RichText } from "@/components/rich-text";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Egor PHC Connect" },
      { name: "description", content: "How EgorPHCConnect collects, uses and protects information including feedback submissions, administrator accounts and optional location data." },
      { property: "og:title", content: "Privacy Policy — EgorPHCConnect" },
      { property: "og:description", content: "How EgorPHCConnect handles feedback, admin accounts and optional location data." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteContentQuery);
  },
  component: Privacy,
});

function Privacy() {
  const { data: content } = useQuery(siteContentQuery);
  const t = pageText(content, "privacy");
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {t("last_updated")}</p>
      <RichText text={t("body")} className="mt-6" />
    </article>
  );
}
