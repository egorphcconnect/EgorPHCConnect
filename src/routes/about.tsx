import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HeartPulse, MapPin, MessageSquare, Calendar, Navigation,
  Search, Shield, Users, Sparkles, Mail, Phone, Award,
} from "lucide-react";
import nhfLogo from "@/assets/nhf-logo.jpg.asset.json";
import leadPhoto from "@/assets/eseosa-irorere.jpg.asset.json";


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EgorPHCConnect — Primary Healthcare for Egor LGA" },
      { name: "description", content: "EgorPHCConnect is a digital platform helping residents of Egor LGA, Edo State, Nigeria locate Primary Healthcare Centres, view today's clinics and weekly schedules, and access trusted health information." },
      { property: "og:title", content: "About EgorPHCConnect" },
      { property: "og:description", content: "Improving access to Primary Healthcare in Egor LGA, Edo State, Nigeria." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <HeartPulse className="h-3.5 w-3.5" /> Egor LGA · Edo State · Nigeria
          </span>
          <h1 className="mt-4 text-3xl font-bold md:text-5xl">About EgorPHCConnect</h1>
          <p className="mt-3 max-w-3xl text-base text-white/90 md:text-lg">
            EgorPHCConnect is a community digital platform that helps residents of Egor Local
            Government Area find Primary Healthcare Centres, learn what services are available,
            and access primary healthcare with confidence.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-12 md:py-16">
        {/* Mission */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">Our mission</h2>
          <p className="mt-3 text-muted-foreground">
            Many residents are unsure which Primary Healthcare Centre is nearest, which clinic
            runs on which day, or whether a facility is open right now. EgorPHCConnect closes
            that information gap so that every resident — regardless of their familiarity with
            the local healthcare system — can take timely action.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Improve access to reliable PHC information across Egor LGA.",
              "Help residents locate the nearest healthcare facility quickly.",
              "Increase awareness of clinics, immunizations and routine services.",
              "Promote preventive healthcare and timely access to care.",
              "Support informed healthcare decisions for families and caregivers.",
              "Give administrators a simple tool to keep service information accurate.",
            ].map((line) => (
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
          <h2 className="text-2xl font-bold text-foreground">What users can do</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={MapPin} title="Locate nearby PHCs" body="Search by ward, address or service across every PHC in Egor LGA." />
            <Feature icon={Search} title="Smart service search" body="Filter by general service or by a specific clinic running on a specific day." />
            <Feature icon={Calendar} title="See today's clinics" body="Know at a glance which clinics are scheduled for today in Africa/Lagos time." />
            <Feature icon={Navigation} title="Get directions" body="One-tap Google Maps directions to any facility, with optional location sorting." />
            <Feature icon={Phone} title="Contact information" body="Call a PHC directly or copy its address from any device." />
            <Feature icon={MessageSquare} title="Anonymous feedback" body="Share your experience confidentially so services keep improving." />
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">Platform features</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={Search} title="Advanced PHC search" body="Combine name, ward, service, day and open-now filters in any combination." />
            <Feature icon={Calendar} title="Weekly schedules" body="Each PHC publishes a full Monday–Sunday clinic schedule that updates in one place." />
            <Feature icon={HeartPulse} title="Open/Closed status" body="Live status from opening and closing times in Africa/Lagos timezone." />
            <Feature icon={Navigation} title="Maps integration" body="Direct integration with Google Maps for navigation and discovery." />
            <Feature icon={Shield} title="Secure admin management" body="Role-based authentication so only approved staff can edit PHC records." />
            <Feature icon={Users} title="Community feedback" body="Anonymous feedback feeds back to administrators to improve care quality." />
          </div>
        </section>

        {/* Why it matters */}
        <section className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-6">
          <h2 className="text-2xl font-bold text-foreground">Why EgorPHCConnect matters</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-primary">For residents</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li>Quickly locate healthcare services that meet your needs.</li>
                <li>Reduce unnecessary travel to facilities that are closed or unavailable.</li>
                <li>Access the right clinic on the right day, the first time.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary">For healthcare workers</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li>Improve visibility of services offered at each PHC.</li>
                <li>Communicate clinic schedules without paper handouts.</li>
                <li>Receive structured feedback that highlights real concerns.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary">For government and partners</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li>Strengthen public awareness of primary healthcare offerings.</li>
                <li>Encourage greater utilization of preventive care.</li>
                <li>Surface gaps in service distribution across wards.</li>
              </ul>
            </div>
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
              <img
                src={nhfLogo.url}
                alt="National Health Fellows Programme logo"
                width={260}
                height={85}
                className="h-14 w-auto object-contain sm:h-16"
              />
            </a>
            <div className="w-full min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                <Award className="h-3 w-3" /> Programme Support
              </span>
              <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                A National Health Fellows Programme project
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                EgorPHCConnect was developed as a project under the{" "}
                <span className="font-semibold text-foreground">National Health Fellows Programme</span>,
                with the goal of improving access to reliable information about Primary
                Healthcare Centres and available services in Egor Local Government Area,
                Edo State.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                The platform reflects the Programme's commitment to strengthening primary
                healthcare delivery through practical, community-focused digital solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Project Lead */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">Meet the Project Lead</h2>
          <div className="mt-5 grid gap-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 md:grid-cols-[220px_1fr]">
            <div className="mx-auto md:mx-0">
              <img
                src={leadPhoto.url}
                alt="Portrait photograph of Dr. Eseosa Emmanuella Irorere, Project Lead of EgorPHCConnect"
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
                Pharmacist · National Health Fellow, Egor LGA · Project Lead, EgorPHCConnect
              </p>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                Dr. Eseosa Emmanuella Irorere is a pharmacist and the National Health Fellow
                representing Egor Local Government Area. She conceived and led the development
                of EgorPHCConnect as a practical digital solution to improve access to
                information about Primary Healthcare Centres and the services they provide
                across Egor LGA.
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


        {/* How info is managed */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">How information is managed</h2>
          <p className="mt-3 text-muted-foreground">
            PHC records, service lists and weekly schedules are maintained by authorized
            administrators who sign in with secure accounts. Updates are reflected immediately
            on the public site. Feedback submitted by visitors helps administrators identify
            entries that need correction. The platform aims to keep information accurate and up
            to date, but residents are always encouraged to confirm critical details with the
            facility directly.
          </p>
        </section>


        {/* Vision */}
        <section className="rounded-2xl border border-secondary/40 bg-secondary-soft p-6">
          <h2 className="text-2xl font-bold text-foreground">Our vision</h2>
          <p className="mt-3 text-secondary-foreground">
            To become the trusted digital gateway to primary healthcare services in Edo State —
            empowering every resident of Egor LGA with timely, accurate and accessible
            healthcare information.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold text-foreground">Get in touch</h2>
          <p className="mt-3 text-muted-foreground">
            Have a question, correction or partnership idea? We'd love to hear from you.
          </p>
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

function Feature({
  icon: Icon, title, body,
}: { icon: typeof MapPin; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-base font-semibold text-card-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

