import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, PhoneCall, HeartPulse } from "lucide-react";

export const Route = createFileRoute("/medical-disclaimer")({
  head: () => ({
    meta: [
      { title: "Medical Disclaimer — Egor PHC Connect" },
      { name: "description", content: "EgorPHCConnect provides information only and does not replace professional medical advice. In an emergency call 112 or visit the nearest healthcare facility." },
      { property: "og:title", content: "Medical Disclaimer — EgorPHCConnect" },
    ],
  }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-warning/15 text-warning">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Disclaimer</h1>
          <p className="text-sm text-muted-foreground">Please read carefully before using the information on this platform.</p>
        </div>
      </div>

      <section className="mt-8 space-y-4 text-sm leading-relaxed text-foreground">
        <p>
          <strong>EgorPHCConnect is an information platform.</strong> It is designed to help
          residents of Egor Local Government Area locate Primary Healthcare Centres and learn
          about the services they provide.
        </p>
        <p>
          The content on this platform — including PHC listings, weekly clinic schedules,
          opening hours and public health articles — is provided for general information only.
          It does <strong>not</strong> constitute medical advice, diagnosis or treatment, and
          should not be used as a substitute for professional healthcare.
        </p>
        <p>
          Always seek the advice of a qualified healthcare professional with any questions you
          may have about a medical condition or treatment. Never disregard professional medical
          advice or delay seeking it because of something you read on EgorPHCConnect.
        </p>
        <p>
          While we and our administrators make reasonable efforts to keep PHC information
          accurate and current, services, schedules and contact details may change without
          notice. Please confirm critical details directly with the facility before travel or
          treatment.
        </p>
      </section>

      <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-destructive">
          <PhoneCall className="h-4 w-4" /> In a medical emergency
        </h2>
        <p className="mt-2 text-sm text-foreground">
          If you or someone near you is experiencing a medical emergency, do not rely on this
          platform. Call <a href="tel:112" className="font-semibold underline">112</a> immediately,
          or go to the nearest hospital or healthcare facility without delay.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-primary/30 bg-primary-soft/40 p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-primary">
          <HeartPulse className="h-4 w-4" /> When to consult a healthcare professional
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
          <li>Any new, severe or worsening symptoms.</li>
          <li>Pregnancy-related concerns, fever in a child or a chronic condition that feels different.</li>
          <li>Before starting, stopping or changing any medication or treatment.</li>
          <li>Mental health concerns including thoughts of self-harm.</li>
        </ul>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        By using EgorPHCConnect you acknowledge and accept this disclaimer. See also our{" "}
        <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link> and{" "}
        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
