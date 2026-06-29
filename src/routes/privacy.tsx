import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Egor PHC Connect" },
      { name: "description", content: "How EgorPHCConnect collects, uses and protects information including feedback submissions, administrator accounts and optional location data." },
      { property: "og:title", content: "Privacy Policy — EgorPHCConnect" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 prose-egor">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 29 June 2026</p>

      <Section title="Introduction">
        EgorPHCConnect ("we", "our", "the platform") is a community digital directory of Primary
        Healthcare Centres serving Egor Local Government Area, Edo State, Nigeria. We respect
        your privacy and are committed to handling any information you share with care.
      </Section>

      <Section title="Information we collect">
        <ul>
          <li>
            <strong>Feedback submissions.</strong> When you submit feedback about a PHC we
            collect the facility you visited, ratings (overall, staff professionalism, waiting
            time, cleanliness), the optional service used, and any free-text comments. Feedback
            is anonymous by default — we do not require your name or contact details.
          </li>
          <li>
            <strong>Administrator accounts.</strong> Approved administrators authenticate using
            email and password or a third-party identity provider (such as Google). For
            authenticated users we store the email address, an internal user identifier and a
            role indicating administrator status. Passwords are managed by our authentication
            provider and are never stored by us in plain text.
          </li>
          <li>
            <strong>Uploaded PHC information.</strong> Administrators may upload PHC details
            including names, addresses, wards, opening and closing times, weekly clinic
            schedules, phone numbers, coordinates and photos. This information is intended for
            public display.
          </li>
          <li>
            <strong>Optional device location.</strong> If you choose to use "Find nearest PHC",
            your browser asks your permission to share your approximate location with this
            website. We use it only in your browser to sort PHCs by distance — your location is
            not sent to our servers or stored on our systems.
          </li>
          <li>
            <strong>Technical logs.</strong> Like most web services, our hosting infrastructure
            may collect short-lived technical logs (such as IP address, browser type and request
            URLs) for operational, security and abuse-prevention purposes.
          </li>
        </ul>
      </Section>

      <Section title="How we use information">
        <ul>
          <li>To display the PHC directory, today's clinics and weekly schedules to the public.</li>
          <li>To allow administrators to manage PHC records, images and health articles securely.</li>
          <li>To analyze feedback in aggregate so PHC services can be improved.</li>
          <li>To compute the nearest PHC to your device when you grant location permission.</li>
          <li>To maintain the security, integrity and performance of the platform.</li>
        </ul>
      </Section>

      <Section title="Location data">
        Location access is always optional. The browser prompt only appears after you choose
        "Find nearest PHC" or click "Use my location". You can revoke permission at any time in
        your browser settings — the rest of the platform continues to work normally and you can
        keep using all manual search and filter features.
      </Section>

      <Section title="Sharing of information">
        We do not sell personal information. PHC records, weekly schedules and uploaded photos
        are intended for public display. Anonymous feedback may be shared with the relevant PHC
        administrators and local health authorities to improve services. We may share
        information when required by law or to protect the rights and safety of users.
      </Section>

      <Section title="Data security">
        Information is stored on managed cloud infrastructure with industry-standard
        protections including encryption in transit (HTTPS), encryption at rest, access control
        through Row Level Security and role-based authentication for administrative actions.
        While we take reasonable steps to protect information, no system can be guaranteed
        completely secure.
      </Section>

      <Section title="Data retention">
        <ul>
          <li>PHC records and health articles are retained for as long as they remain useful to the public, and are updated or removed by administrators.</li>
          <li>Feedback submissions are retained to inform service improvement; aggregated insights may be retained indefinitely.</li>
          <li>Administrator account data is retained while the account is active and for a reasonable period after deactivation to meet operational and audit requirements.</li>
          <li>Optional location data is processed only in your browser session and is not retained on our servers.</li>
        </ul>
      </Section>

      <Section title="Your privacy rights">
        You may contact us to request access to, correction of or deletion of any information
        you have provided. Because feedback is anonymous by design, deletion of a specific
        feedback entry may only be possible if you can help us identify it.
      </Section>

      <Section title="Children">
        EgorPHCConnect is intended for adults and parents/guardians acting on behalf of
        children. We do not knowingly collect personal information from children.
      </Section>

      <Section title="Changes to this policy">
        We may update this policy from time to time to reflect changes to the platform, the law
        or our practices. The "Last updated" date at the top of this page reflects the most
        recent revision.
      </Section>

      <Section title="Contact">
        For privacy-related enquiries, please use the <Link to="/contact" className="text-primary hover:underline">Contact Us</Link> page
        or submit anonymous feedback via the <Link to="/feedback" className="text-primary hover:underline">Feedback</Link> page.
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
