import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Egor PHC Connect</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A community health directory for Egor Local Government Area, Edo State, Nigeria.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Quick links</h4>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li><Link to="/directory" className="hover:text-foreground">Find a PHC</Link></li>
            <li><Link to="/health" className="hover:text-foreground">Health information</Link></li>
            <li><Link to="/feedback" className="hover:text-foreground">Leave feedback</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About this service</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Emergency</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            For medical emergencies, call <a href="tel:112" className="font-medium text-primary">112</a> or
            visit the nearest health facility immediately.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Egor PHC Connect · Community health directory
      </div>
    </footer>
  );
}
