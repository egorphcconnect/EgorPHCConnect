import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { siteContentQuery, pageText } from "@/lib/cms";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Egor PHC Connect" },
      { name: "description", content: "Get in touch with EgorPHCConnect — corrections, partnership ideas, accessibility issues or feedback about Primary Healthcare Centres in Egor LGA." },
      { property: "og:title", content: "Contact Us — EgorPHCConnect" },
      { property: "og:description", content: "Reach the EgorPHCConnect team about PHC corrections, partnerships or accessibility." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteContentQuery);
  },
  component: Contact,
});

function Contact() {
  const { data: content } = useQuery(siteContentQuery);
  const t = pageText(content, "contact");
  const emergency = t("emergency_number");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("intro")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card
          icon={MessageSquare}
          title={t("card1_title")}
          body={t("card1_body")}
          action={<Link to="/feedback" className="text-sm font-medium text-primary hover:underline">{t("card1_action")}</Link>}
        />
        <Card
          icon={Mail}
          title={t("card2_title")}
          body={t("card2_body")}
          action={<Link to="/feedback" className="text-sm font-medium text-primary hover:underline">{t("card2_action")}</Link>}
        />
        <Card
          icon={Phone}
          title={t("card3_title")}
          body={t("card3_body")}
          action={<a href={`tel:${emergency}`} className="text-sm font-medium text-primary hover:underline">{t("card3_action")}</a>}
        />
        <Card
          icon={MapPin}
          title={t("card4_title")}
          body={t("card4_body")}
          action={<Link to="/directory" className="text-sm font-medium text-primary hover:underline">{t("card4_action")}</Link>}
        />
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        {t("footnote")}{" "}
        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}

function Card({
  icon: Icon, title, body, action,
}: {
  icon: typeof Mail; title: string; body: string; action: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-3 text-base font-semibold text-card-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-3">{action}</div>
    </div>
  );
}
