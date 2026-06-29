import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

const APP_VERSION = "1.1.0";
const LAST_UPDATED = "29 June 2026";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/40">
      {/* Medical disclaimer strip */}
      <div className="border-b border-border bg-secondary-soft">
        <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 text-sm text-secondary-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold">Medical disclaimer:</span> Egor PHC Connect is an
            information service and does not replace professional medical advice. In an
            emergency call <a href="tel:112" className="underline font-medium">112</a> or
            visit the nearest healthcare facility.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <h3 className="text-sm font-semibold text-foreground">Egor PHC Connect</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A community health directory for Egor Local Government Area, Edo State, Nigeria.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Explore</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li><Link to="/directory" className="hover:text-foreground">Find a PHC</Link></li>
            <li><Link to="/health" className="hover:text-foreground">Health information</Link></li>
            <li><Link to="/feedback" className="hover:text-foreground">Leave feedback</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About EgorPHCConnect</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Legal</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground">Terms and Conditions</Link></li>
            <li><Link to="/medical-disclaimer" className="hover:text-foreground">Medical Disclaimer</Link></li>
            <li><Link to="/accessibility" className="hover:text-foreground">Accessibility Statement</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Emergency</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            For medical emergencies call{" "}
            <a href="tel:112" className="font-medium text-primary">112</a> or visit the
            nearest health facility immediately.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Egor PHC Connect · Community health directory</p>
          <p>Version {APP_VERSION} · Last updated {LAST_UPDATED}</p>
        </div>
      </div>
    </footer>
  );
}
