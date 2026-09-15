import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  HeartPulse, MapPin, MessageSquare, Sparkles, Mail, Award,
} from "lucide-react";

import { siteContentQuery, pageSectionsQuery, stakeholdersQuery, pageText } from "@/lib/cms";
import { RichText, parseCardList, parseBullets } from "@/components/rich-text";
import { CmsImage } from "@/components/cms-image";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EgorPHCConnect — Primary Healthcare for Egor LGA" },
      { name: "description", content: "EgorPHCConnect is a digital platform helping residents of Egor LGA, Edo State, Nigeria locate Primary Healthcare Centres, view today's clinics and weekly schedules, and access trusted health information." },
      { property: "og:title", content: "About EgorPHCConnect" },
      { property: "og:description", content: "Improving access to Primary Healthcare in Egor LGA, Edo State, Nigeria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(siteContentQuery),
      context.queryClient.ensureQueryData(pageSectionsQuery("about")),
      context.queryClient.ensureQueryData(stakeholdersQuery),
    ]);
  },
  component: About,
});

function About() {
  const { data: content } = useQuery(siteContentQuery);
  const { data: sections = [] } = useQuery(pageSectionsQuery("about"));
  const { data: stakeholders = [] } = useQuery(stakeholdersQuery);
  const t = pageText(content, "about");

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <HeartPulse className="h-3.5 w-3.5" /> {t("hero_eyebrow")}
          </span>
          <h1 className="mt-4 text-3xl font-bold md:text-5xl">{t("title")}</h1>
          <p className="mt-3 max-w-3xl text-base text-white/90 md:text-lg">{t("intro")}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-12 md:py-16">
        {/* Mission */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">{t("mission_heading")}</h2>
          <p className="mt-3 text-muted-foreground">{t("mission_body")}</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {parseBullets(t("mission_points")).map((line) => (
              <li key={line} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <Sparkles className="h-3 w-3" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* What users can do */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">{t("users_heading")}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {parseCardList(t("users_items")).map((c) => (
              <Feature key={c.title} title={c.title} body={c.body} />
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">{t("features_heading")}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {parseCardList(t("features_items")).map((c) => (
              <Feature key={c.title} title={c.title} body={c.body} />
            ))}
          </div>
        </section>

        {/* Why it matters */}
        <section className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-6">
          <h2 className="text-2xl font-bold text-foreground">{t("why_heading")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <h3 className="text-sm font-semibold text-primary">{t(`why_col${n}_heading`)}</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {parseBullets(t(`why_col${n}_body`)).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Programme Support */}
        <section className="rounded-2xl border border-primary/20 bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex flex-col items-start gap-5 md:flex-row md:gap-6">
            <a
              href="https://nationalhealthfellows.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto shrink-0 rounded-lg border border-border bg-white p-3 shadow-sm md:mx-0"
              aria-label="Visit the National Health Fellows Programme website"
            >
              <CmsImage
                value={t("programme_logo")}
                fallbackSrc="/images/nhf-logo.jpg"
                alt={t("programme_logo_alt")}
                width={260}
                height={85}
                className="h-14 w-auto object-contain sm:h-16"
              />
            </a>
            <div className="w-full min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                <Award className="h-3 w-3" /> {t("programme_label")}
              </span>
              <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                {t("programme_heading")}
              </h2>
              <RichText text={t("programme_body")} className="mt-3 text-sm sm:text-base" />
            </div>
          </div>
        </section>

        {/* Project Visionary — fixed content, not admin-editable */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">Meet the Project Visionary</h2>
          <div className="mt-5 grid gap-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 md:grid-cols-[220px_1fr]">
            <div className="mx-auto md:mx-0">
              <img
                src="/images/eseosa-irorere.jpg"
                alt="Portrait photograph of Dr. Eseosa Emmanuella Irorere, Project Visionary of EgorPHCConnect"
                width={220}
                height={260}
                className="h-56 w-52 rounded-xl border border-border object-cover shadow-sm"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-foreground">
                Dr. Eseosa Emmanuella Irorere, PharmD
              </h3>
              <p className="mt-1 text-sm font-medium text-primary">
                Pharmacist · National Health Fellow, Egor LGA · Project Visionary, EgorPHCConnect
              </p>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                Dr. Eseosa Emmanuella Irorere is a Doctor of Pharmacy and the National Health
                Fellow representing Egor Local Government Area for 2026. She conceived and led
                the development of EgorPHCConnect as a practical digital solution to improve
                access to information about Primary Healthcare Centres and the services they
                provide across Egor LGA.
              </p>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Her focus is on making primary healthcare more visible, more accessible and
                easier to navigate for the residents her community serves — helping families
                reach the right facility, on the right day, for the right service.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                EgorPHCConnect was developed as a project under the National Health Fellows Programme.
              </p>
            </div>
          </div>
        </section>

        {/* Stakeholders */}
        {stakeholders.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground">{t("stakeholders_heading")}</h2>
            <p className="mt-2 text-muted-foreground">{t("stakeholders_intro")}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {stakeholders.map((s) => (
                <article key={s.id} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-start gap-4">
                    {s.image_url ? (
                      <CmsImage
                        value={s.image_url}
                        alt={s.image_alt || `Photograph of ${s.name}`}
                        width={96}
                        height={96}
                        className="h-20 w-20 shrink-0 rounded-lg border border-border object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-card-foreground">{s.name}</h3>
                      {s.role_title || s.organization ? (
                        <p className="mt-0.5 text-sm text-primary">
                          {[s.role_title, s.organization].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                      {s.statement ? (
                        <blockquote className="mt-2 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
                          {s.statement}
                        </blockquote>
                      ) : null}
                    </div>
                  </div>
                  {s.description ? <RichText text={s.description} className="mt-3 text-sm" /> : null}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Admin-added custom sections */}
        {sections.map((sec) => (
          <section key={sec.id}>
            <h2 className="text-2xl font-bold text-foreground">{sec.heading}</h2>
            {sec.image_url ? (
              <CmsImage
                value={sec.image_url}
                alt={sec.image_alt || sec.heading}
                className="mt-4 w-full rounded-xl border border-border object-cover"
              />
            ) : null}
            <RichText text={sec.body} className="mt-3" />
          </section>
        ))}

        {/* How info is managed */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">{t("managed_heading")}</h2>
          <RichText text={t("managed_body")} className="mt-3" />
        </section>

        {/* Vision */}
        <section className="rounded-2xl border border-secondary/40 bg-secondary-soft p-6">
          <h2 className="text-2xl font-bold text-foreground">{t("vision_heading")}</h2>
          <RichText text={t("vision_body")} className="mt-3" />
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">{t("contact_heading")}</h2>
          <p className="mt-3 text-muted-foreground">{t("contact_body")}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Mail className="mr-2 h-4 w-4" /> Contact us
            </Link>
            <Link to="/feedback" className="inline-flex h-11 items-center rounded-md border border-input bg-background px-5 text-sm font-medium hover:bg-accent">
              <MessageSquare className="mr-2 h-4 w-4" /> Leave feedback
            </Link>
            <Link to="/privacy" className="inline-flex h-11 items-center rounded-md border border-input bg-background px-5 text-sm font-medium hover:bg-accent">
              Privacy Policy
            </Link>
            <Link to="/terms" className="inline-flex h-11 items-center rounded-md border border-input bg-background px-5 text-sm font-medium hover:bg-accent">
              Terms
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
        <MapPin className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-base font-semibold text-card-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
