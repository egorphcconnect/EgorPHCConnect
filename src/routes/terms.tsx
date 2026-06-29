import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — Egor PHC Connect" },
      { name: "description", content: "Terms and Conditions governing the use of EgorPHCConnect, the community Primary Healthcare directory for Egor LGA." },
      { property: "og:title", content: "Terms and Conditions — EgorPHCConnect" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">Terms and Conditions</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 29 June 2026</p>

      <Section title="1. Acceptance of terms">
        By accessing or using EgorPHCConnect ("the platform"), you agree to be bound by these
        Terms and Conditions. If you do not agree, please do not use the platform.
      </Section>

      <Section title="2. About the platform">
        EgorPHCConnect is a community digital directory of Primary Healthcare Centres in Egor
        Local Government Area, Edo State, Nigeria. It provides facility listings, clinic
        schedules, public health information and a feedback channel.
      </Section>

      <Section title="3. Acceptable use">
        <ul>
          <li>Use the platform lawfully and for its intended community-health purpose.</li>
          <li>Do not attempt to gain unauthorized access to any part of the platform or its data.</li>
          <li>Do not upload or submit content that is unlawful, defamatory, harassing, deceptive or harmful.</li>
          <li>Do not impersonate another person or facility.</li>
          <li>Do not interfere with the platform's security, performance or availability.</li>
        </ul>
      </Section>

      <Section title="4. Accuracy of PHC information">
        We work with administrators to keep facility names, addresses, hours, weekly schedules
        and contact details up to date. However information may change without notice and may
        contain errors or omissions. Always confirm critical details directly with the facility
        before travel or treatment.
      </Section>

      <Section title="5. User responsibilities">
        You are responsible for evaluating the information on the platform and deciding whether
        it meets your needs. You are responsible for any content you submit through the
        feedback channel and confirm that you have the right to submit it.
      </Section>

      <Section title="6. Intellectual property">
        The platform's design, code and original content are protected by intellectual property
        laws. The names of PHCs, ward names and government information remain the property of
        their respective owners and authorities. You may not copy, redistribute or repurpose
        substantial portions of the platform without our written permission.
      </Section>

      <Section title="7. Feedback submissions">
        By submitting feedback you grant us a non-exclusive, royalty-free licence to use that
        feedback to improve services, including sharing aggregated insights with relevant PHC
        administrators and local health authorities. Anonymous feedback is the default.
      </Section>

      <Section title="8. Limitation of liability">
        The platform and its contents are provided on an "as is" and "as available" basis,
        without warranties of any kind. To the maximum extent permitted by law, we are not
        liable for any direct, indirect, incidental or consequential damages arising from your
        use of, or inability to use, the platform — including reliance on information that
        turns out to be outdated, incomplete or incorrect.
      </Section>

      <Section title="9. Medical information">
        Information on the platform is intended for general informational purposes only and is
        not a substitute for professional medical advice, diagnosis or treatment. Always
        consult a qualified healthcare professional regarding any medical condition. In an
        emergency, contact emergency services or visit the nearest health facility immediately.
        See our <Link to="/medical-disclaimer" className="text-primary hover:underline">Medical Disclaimer</Link>.
      </Section>

      <Section title="10. Availability of services">
        We aim to keep the platform available at all times but cannot guarantee uninterrupted
        access. The platform may be unavailable due to maintenance, upgrades or events outside
        our control.
      </Section>

      <Section title="11. Modification of content">
        We may add, change, suspend or remove any feature or content on the platform at any
        time without notice. We may also revise these Terms and Conditions; continued use of
        the platform after a revision constitutes acceptance of the updated terms.
      </Section>

      <Section title="12. Third-party services">
        The platform integrates with third-party services such as map providers and
        authentication providers. Your use of those services is also governed by their
        respective terms and privacy policies.
      </Section>

      <Section title="13. Governing law">
        These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria.
        Any disputes will be resolved in the competent courts of Edo State, Nigeria.
      </Section>

      <Section title="14. Contact">
        Questions about these terms can be sent via our <Link to="/contact" className="text-primary hover:underline">Contact Us</Link> page.
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
