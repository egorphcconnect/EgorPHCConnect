import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, MapPin, MessageSquare, BookOpen } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Egor PHC Connect" },
      { name: "description", content: "About the Egor PHC Connect community health directory for Egor LGA, Edo State, Nigeria." },
      { property: "og:title", content: "About Egor PHC Connect" },
      { property: "og:description", content: "Improving access to Primary Healthcare Centres in Egor LGA." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">About Egor PHC Connect</h1>
      <p className="mt-3 text-muted-foreground">
        Egor PHC Connect is a community health directory built to help residents of Egor Local
        Government Area, Edo State, Nigeria find Primary Healthcare Centres (PHCs), understand
        what services are available, and share feedback that helps local administrators improve care.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Feature icon={MapPin} title="Find facilities" body="Search PHCs by name, ward or service. Get directions and contact information." />
        <Feature icon={HeartPulse} title="Know your services" body="Antenatal, immunization, family planning, malaria, HIV and more." />
        <Feature icon={BookOpen} title="Trusted information" body="Plain-language public health guidance from your local health network." />
        <Feature icon={MessageSquare} title="Anonymous feedback" body="Tell us about your visit — confidentially — so services can improve." />
      </div>

      <div className="mt-10 rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
        <p>
          The PHC data in this app is placeholder information for demonstration. Final entries will be
          updated from field visits across Egor LGA.
        </p>
        <p className="mt-2">
          For medical emergencies, call <a href="tel:112" className="font-medium text-primary">112</a> or
          visit the nearest health facility immediately.
        </p>
      </div>

      <div className="mt-8">
        <Link
          to="/directory"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Find a PHC near you
        </Link>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof MapPin;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-base font-semibold text-card-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
