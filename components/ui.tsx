// components/ui.tsx — presentational helpers for the restyled screens.
// Presentation only: colour choices, date wording, skeleton blocks. No fetching,
// no business logic — every piece of data arrives fetched, never invented here.

export function shortDate(iso: string): string {
  // "25 Oct" — the compact wording the design uses on cards and rows.
  return new Date(iso).toLocaleDateString(["en-IN", "en"], {
    day: "numeric",
    month: "short",
  });
}

export function longDate(iso: string): string {
  // The full, unambiguous date — kept for the hover tooltip, so a short label
  // never hides the real fact.
  return new Date(iso).toLocaleDateString(["en-IN", "en"], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// The colour language for individual ratings, straight from the design:
//   4–5 stars  → green (good meal)
//   3 stars    → amber (middle)
//   1–2 stars  → red (bad meal)
// The average's own number and star row stay amber — the brand's warm accent.
export function ratingTone(rating: number): string {
  if (rating <= 2) return "text-red-600";
  if (rating === 3) return "text-amber-500";
  return "text-green-600";
}

interface RatingStarsProps {
  rating: number;
  /** "scale" colours stars by the rating value; "amber" is the brand accent (average row). */
  tone?: "amber" | "scale";
  size?: string;
  className?: string;
}

// A row of five stars: filled up to the rating, muted after.
export function RatingStars({
  rating,
  tone = "scale",
  size = "text-sm",
  className = "",
}: RatingStarsProps) {
  const filled = tone === "amber" ? "text-amber-500" : ratingTone(rating);
  return (
    <span
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className={`inline-flex ${className}`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          aria-hidden="true"
          className={`${size} leading-none ${star <= rating ? filled : "text-neutral-300"}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// A soft placeholder block, shown while data is in flight so the page
// never jumps when content arrives.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-neutral-200 ${className}`}
    />
  );
}
