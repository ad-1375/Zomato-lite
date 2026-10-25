// components/ui.tsx — tiny presentational helpers shared by the screens.
// Presentation only: glyphs, gentle colour, and time wording. No fetching,
// no business logic, no arithmetic beyond comparing elapsed time to fixed cutoffs.

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

// "2 days ago" — the wording people actually want. The exact date is never
// thrown away: callers keep it in a title attribute (see absoluteDate), so
// hover and screen readers still get the full fact.
export function relativeTime(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  if (delta < 45 * 1000) return "just now";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (delta < HOUR) {
    return rtf.format(-Math.max(1, Math.round(delta / MINUTE)), "minute");
  }
  if (delta < DAY) return rtf.format(-Math.round(delta / HOUR), "hour");
  if (delta < WEEK) return rtf.format(-Math.round(delta / DAY), "day");
  if (delta < 4 * WEEK) return rtf.format(-Math.round(delta / WEEK), "week");
  return absoluteDate(iso);
}

// The full, unambiguous date — displayed on hover and heard from screen readers.
export function absoluteDate(iso: string): string {
  return new Date(iso).toLocaleDateString(["en-IN", "en"], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// The score bubble: small, amber, easy to scan — same warm family as the stars.
export function ScoreChip({ rating }: { rating: number }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md border border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-700">
      {rating}
    </span>
  );
}

// A soft placeholder block, shown while data is in flight instead of a dead
// "Loading…" sentence. It keeps the page from jumping when content arrives.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`animate-pulse rounded bg-neutral-200 ${className}`}
    />
  );
}
