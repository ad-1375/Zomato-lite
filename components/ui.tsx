// components/ui.tsx — small presentational helpers shared by both screens.
// Presentation only: colour, glyph repetition, and time formatting. No business logic.

interface StarsProps {
  rating: number;
  className?: string;
}

// Five glyphs: bright up to the rating, muted after. Green = rating indicator.
export function Stars({ rating, className = "" }: StarsProps) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`}>
      <span className={`text-green-600 ${className}`}>{"★".repeat(rating)}</span>
      <span className={`text-neutral-300 ${className}`}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

// The Zomato-style score pill: small, green, easy to scan.
export function ScoreChip({ rating }: { rating: number }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md border border-green-200 bg-green-50 px-2 text-xs font-semibold text-green-700">
      {rating}
    </span>
  );
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

// "2 days ago" — for AT users and hover, the absolute date is kept alongside (see absoluteDate).
export function relativeTime(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  if (delta < 45 * 1000) return "just now";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (delta < HOUR) return rtf.format(-Math.max(1, Math.round(delta / MINUTE)), "minute");
  if (delta < DAY) return rtf.format(-Math.round(delta / HOUR), "hour");
  if (delta < WEEK) return rtf.format(-Math.round(delta / DAY), "day");
  if (delta < 4 * WEEK) return rtf.format(-Math.round(delta / WEEK), "week");
  return absoluteDate(iso);
}

export function absoluteDate(iso: string): string {
  return new Date(iso).toLocaleDateString(["en-IN", "en"], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
