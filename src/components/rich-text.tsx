import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Minimal, safe markdown renderer for admin-authored copy.
 * Supports: ## / ### headings, - bullets, 1. numbered lists, **bold**,
 * *italic*, [links](/path) and blank-line separated paragraphs.
 * Nothing is rendered as raw HTML.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    const key = `${keyPrefix}-i${i++}`;
    if (token.startsWith("**")) {
      nodes.push(<strong key={key} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("[")) {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("](") + 2, -1);
      nodes.push(
        href.startsWith("/") ? (
          <Link key={key} to={href} className="text-primary underline underline-offset-2 hover:no-underline">
            {label}
          </Link>
        ) : (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            {label}
          </a>
        ),
      );
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const lines = (text ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  let numbers: string[] = [];
  let k = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(
      <p key={`p${k++}`} className="text-muted-foreground">
        {renderInline(paragraph.join(" "), `p${k}`)}
      </p>,
    );
    paragraph = [];
  };
  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`u${k++}`} className="list-disc space-y-1.5 pl-5 text-muted-foreground">
        {bullets.map((li, idx) => (
          <li key={idx}>{renderInline(li, `u${k}-${idx}`)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  const flushNumbers = () => {
    if (!numbers.length) return;
    blocks.push(
      <ol key={`o${k++}`} className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
        {numbers.map((li, idx) => (
          <li key={idx}>{renderInline(li, `o${k}-${idx}`)}</li>
        ))}
      </ol>,
    );
    numbers = [];
  };
  const flushAll = () => {
    flushParagraph();
    flushBullets();
    flushNumbers();
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushAll();
      continue;
    }
    if (/^###\s+/.test(line)) {
      flushAll();
      blocks.push(
        <h4 key={`h${k++}`} className="pt-1 text-base font-semibold text-foreground">
          {renderInline(line.replace(/^###\s+/, ""), `h${k}`)}
        </h4>,
      );
    } else if (/^##\s+/.test(line)) {
      flushAll();
      blocks.push(
        <h3 key={`h${k++}`} className="pt-2 text-lg font-semibold text-foreground">
          {renderInline(line.replace(/^##\s+/, ""), `h${k}`)}
        </h3>,
      );
    } else if (/^#\s+/.test(line)) {
      flushAll();
      blocks.push(
        <h3 key={`h${k++}`} className="pt-2 text-xl font-bold text-foreground">
          {renderInline(line.replace(/^#\s+/, ""), `h${k}`)}
        </h3>,
      );
    } else if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      flushNumbers();
      bullets.push(line.replace(/^[-*]\s+/, ""));
    } else if (/^\d+[.)]\s+/.test(line)) {
      flushParagraph();
      flushBullets();
      numbers.push(line.replace(/^\d+[.)]\s+/, ""));
    } else {
      flushBullets();
      flushNumbers();
      paragraph.push(line);
    }
  }
  flushAll();

  return <div className={`space-y-3 leading-relaxed ${className}`}>{blocks}</div>;
}

/** Parse "- **Title** — body" lines used by the About page card grids. */
export function parseCardList(text: string): { title: string; body: string }[] {
  return (text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => l.replace(/^[-*]\s+/, ""))
    .map((l) => {
      const bold = l.match(/^\*\*(.+?)\*\*\s*[—–-]?\s*(.*)$/);
      if (bold) return { title: bold[1].trim(), body: bold[2].trim() };
      const dash = l.split(/\s[—–]\s/);
      if (dash.length > 1) return { title: dash[0].trim(), body: dash.slice(1).join(" — ").trim() };
      return { title: l, body: "" };
    })
    .filter((c) => c.title.length > 0);
}

/** Parse simple bullet lines into plain strings. */
export function parseBullets(text: string): string[] {
  return (text ?? "")
    .split("\n")
    .map((l) => l.trim().replace(/^[-*]\s+/, ""))
    .filter((l) => l.length > 0);
}
