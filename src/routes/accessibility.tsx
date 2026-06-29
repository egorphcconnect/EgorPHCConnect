import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement — Egor PHC Connect" },
      { name: "description", content: "Our commitment to making EgorPHCConnect accessible to every resident of Egor LGA, including people using assistive technologies." },
      { property: "og:title", content: "Accessibility Statement — EgorPHCConnect" },
    ],
  }),
  component: Accessibility,
});

function Accessibility() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">Accessibility Statement</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 29 June 2026</p>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          EgorPHCConnect is committed to making primary healthcare information accessible to
          every resident of Egor Local Government Area, including people using assistive
          technology, people on low-bandwidth connections and people using older mobile devices.
        </p>
      </section>

      <Section title="What we do">
        <ul>
          <li>Use semantic HTML with clear headings, lists and landmarks so screen readers can navigate easily.</li>
          <li>Provide visible focus states and keyboard navigation for all interactive elements.</li>
          <li>Maintain colour contrast that meets recognised accessibility guidelines for body text and key controls.</li>
          <li>Use ARIA labels on icon-only buttons so they are announced clearly by assistive technologies.</li>
          <li>Design responsive layouts that work on small mobile screens as well as larger desktops.</li>
          <li>Use plain, direct language and avoid unnecessary jargon.</li>
        </ul>
      </Section>

      <Section title="Standards we aim for">
        We aim to meet WCAG 2.1 Level AA where reasonably practicable. We continuously test the
        platform and address accessibility issues as part of our normal release process.
      </Section>

      <Section title="Known limitations">
        Some content on the platform — such as the embedded Google Maps view — is provided by
        third parties. We work to ensure these elements include accessible alternatives, but
        their accessibility may vary outside of our control.
      </Section>

      <Section title="Tell us about a problem">
        If you encounter a part of EgorPHCConnect that is difficult to use with assistive
        technology, please let us know via the{" "}
        <Link to="/contact" className="text-primary hover:underline">Contact Us</Link> page or
        the <Link to="/feedback" className="text-primary hover:underline">Feedback</Link> page.
        We will work to resolve reported issues as quickly as possible.
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 text-sm leading-relaxed text-foreground">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-2 text-muted-foreground [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {typeof children === "string" ? <p>{children}</p> : children}
      </div>
    </section>
  );
}
