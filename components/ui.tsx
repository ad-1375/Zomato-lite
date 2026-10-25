// components/ui.tsx — one presentational helper, shared by both screens:
// the full, unambiguous date the review cards print ("Oct 8, 2026").
// Presentation only. No fetching, no business logic, no arithmetic.

export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString(["en-IN", "en"], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
