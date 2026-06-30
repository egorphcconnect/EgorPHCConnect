import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Egor PHC Connect" },
      { name: "description", content: "Get in touch with EgorPHCConnect — corrections, partnership ideas, accessibility issues or feedback about Primary Healthcare Centres in Egor LGA." },
      { property: "og:title", content: "Contact Us — EgorPHCConnect" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">Contact us</h1>
      <p className="mt-3 text-muted-foreground">
        We welcome corrections, partnership ideas and accessibility reports. The best way to
        reach the team depends on what you'd like to share.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card
          icon={MessageSquare}
          title="Share feedback about a PHC"
          body="Use the anonymous feedback form to rate a facility and share comments. Feedback is reviewed regularly to improve service quality."
          action={<Link to="/feedback" className="text-sm font-medium text-primary hover:underline">Open feedback form →</Link>}
        />
        <Card
          icon={Mail}
          title="General enquiries"
          body="For partnership ideas, corrections to PHC information or accessibility reports, please reach us through the feedback form."
          action={<Link to="/feedback" className="text-sm font-medium text-primary hover:underline">Open feedback form →</Link>}
        />
        <Card
          icon={Phone}
          title="Medical emergencies"
          body="For urgent medical issues, do not contact us — call emergency services immediately or visit the nearest healthcare facility."
          action={<a href="tel:112" className="text-sm font-medium text-primary hover:underline">Call 112</a>}
        />
        <Card
          icon={MapPin}
          title="Egor LGA"
          body="EgorPHCConnect serves residents of Egor Local Government Area, Edo State, Nigeria. Browse the directory to find facilities near you."
          action={<Link to="/directory" className="text-sm font-medium text-primary hover:underline">Open directory →</Link>}
        />
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        The email address above is monitored on a best-effort basis. For privacy questions please
        see our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
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
