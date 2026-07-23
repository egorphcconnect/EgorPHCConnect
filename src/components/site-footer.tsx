import { Link } from "@tanstack/react-router";
import nhfLogo from "@/assets/nhf-logo.jpg.asset.json";

const APP_VERSION = "1.2.0";
const LAST_UPDATED = "23 July 2026";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <h3 className="text-sm font-semibold text-foreground">EgorPHCConnect</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A community health directory for Egor Local Government Area, Edo State, Nigeria.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Explore</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li><Link to="/directory" className="hover:text-foreground">Find a PHC</Link></li>
            <li><Link to="/health" className="hover:text-foreground">Health information</Link></li>
            <li><Link to="/feedback" className="hover:text-foreground">Feedback</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Legal</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground">Terms and Conditions</Link></li>
            <li><Link to="/medical-disclaimer" className="hover:text-foreground">Medical Disclaimer</Link></li>
            <li><Link to="/accessibility" className="hover:text-foreground">Accessibility</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Programme support</h4>
          <p className="mt-2 text-xs text-muted-foreground">
            Powered by the National Health Fellows Programme.
          </p>
          <a
            href="https://nationalhealthfellows.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-md border border-border bg-card p-2 shadow-sm transition-shadow hover:shadow-md"
            aria-label="Visit the National Health Fellows Programme website"
          >
            <img
              src={nhfLogo.url}
              alt="National Health Fellows Programme logo"
              width={200}
              height={65}
              className="h-10 w-auto object-contain"
              loading="lazy"
            />
          </a>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} EgorPHCConnect · A National Health Fellows Programme project</p>
          <p>Version {APP_VERSION} · Last updated {LAST_UPDATED}</p>
        </div>
      </div>
    </footer>
  );
}
