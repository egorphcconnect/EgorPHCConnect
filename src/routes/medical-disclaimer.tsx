import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, PhoneCall, HeartPulse } from "lucide-react";
import { siteContentQuery, pageText } from "@/lib/cms";
import { RichText, parseBullets } from "@/components/rich-text";

export const Route = createFileRoute("/medical-disclaimer")({
  head: () => ({
    meta: [
      { title: "Medical Disclaimer — Egor PHC Connect" },
      { name: "description", content: "EgorPHCConnect provides information only and does not replace professional medical advice. In an emergency call 112 or visit the nearest healthcare facility." },
      { property: "og:title", content: "Medical Disclaimer — EgorPHCConnect" },
      { property: "og:description", content: "EgorPHCConnect provides information only and is not a substitute for professional medical advice." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteContentQuery);
  },
  component: Disclaimer,
});

function Disclaimer() {
  const { data: content } = useQuery(siteContentQuery);
  const t = pageText(content, "medical-disclaimer");
  const emergency = t("emergency_number");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <RichText text={t("body")} className="mt-8" />

      <section className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <PhoneCall className="h-5 w-5 text-destructive" /> {t("emergency_heading")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("emergency_body")}</p>
        <a
          href={`tel:${emergency}`}
          className="mt-4 inline-flex h-11 items-center rounded-md bg-destructive px-5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
        >
          <PhoneCall className="mr-2 h-4 w-4" /> Call {emergency}
        </a>
      </section>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <HeartPulse className="h-5 w-5 text-primary" /> {t("consult_heading")}
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {parseBullets(t("consult_body")).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        {t("footnote")}{" "}
        <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link>{" · "}
        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
