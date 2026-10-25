// app/review/[restaurantId]/page.tsx — Screen 1: write a review.
// A Back link, a centred title and an honest subtitle; five radio stars whose
// colour follows how well the meal went; a quiet comment box; one red button.
// If the backend rejects the request, THIS PAGE displays the backend's own
// error message — it never invents one of its own — and the typed text stays.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Skeleton, ratingTone } from "@/components/ui";

// Colour words for the filled stars and their focus rings, kept as literal
// strings so Tailwind's scanner can find them.
const FILL: Record<number, string> = {
  1: "text-red-600",
  2: "text-red-600",
  3: "text-amber-500",
  4: "text-green-600",
  5: "text-green-600",
};

const RING: Record<number, string> = {
  1: "[&:has(input:focus-visible)]:ring-red-600",
  2: "[&:has(input:focus-visible)]:ring-red-600",
  3: "[&:has(input:focus-visible)]:ring-amber-500",
  4: "[&:has(input:focus-visible)]:ring-green-600",
  5: "[&:has(input:focus-visible)]:ring-green-600",
};

export default function ReviewPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // One fetch, purely to know which restaurant we are reviewing.
  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setName(json.name);
      })
      .catch(() => setNotFound(true));
  }, [restaurantId]);

  const canSubmit =
    rating !== null && comment.trim().length > 0 && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        router.push(`/restaurant/${restaurantId}`);
        return;
      }
      // The backend responded 400 — show ITS words, not ours.
      setError(json.error ?? "Something went wrong.");
    } catch {
      // Network failure — the request never reached any API, so there is no
      // backend message to show; the connection itself is the problem.
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-14">
        <p className="text-sm text-neutral-500">This restaurant does not exist.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-10">
      <header className="relative text-center">
        <Link
          href={`/restaurant/${restaurantId}`}
          className="absolute inset-y-0 left-0 my-auto inline-flex h-8 items-center gap-1.5 text-sm font-medium text-neutral-700"
        >
          <span aria-hidden="true">←</span> Back
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Review</h1>
      </header>
      <p className="mx-auto mt-3 max-w-[420px] text-center text-sm leading-relaxed text-neutral-500">
        One rating, one honest comment. That is all a first review needs to be.
      </p>
      {/* The one context the mock omits: which restaurant is being reviewed. */}
      <p className="mt-1.5 text-center text-xs text-neutral-400">
        For{" "}
        {name ?? (
          <Skeleton className="inline-block h-3 w-28 align-middle" />
        )}
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-10">
        {/* Real radios: arrow keys walk the five stars, screen readers announce
            "1 out of 5 stars", and each tap target is 48px. */}
        <fieldset className="m-0 border-0 p-0">
          <legend className="sr-only">Your rating</legend>
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Rating
            </p>
            <p
              className={`text-sm font-semibold ${
                rating === null ? "text-neutral-400" : ratingTone(rating)
              }`}
            >
              {rating === null ? "– / 5" : `${rating} / 5`}
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <label
                key={star}
                htmlFor={`rating-${star}`}
                className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-md [&:has(input:focus-visible)]:ring-2 [&:has(input:focus-visible)]:ring-offset-2 ${RING[star]}`}
              >
                <input
                  id={`rating-${star}`}
                  type="radio"
                  name="rating"
                  checked={rating === star}
                  onChange={() => setRating(star)}
                  aria-label={`${star} out of 5 stars`}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`text-4xl leading-none transition-colors ${
                    rating !== null && star <= rating
                      ? FILL[rating]
                      : "text-neutral-300"
                  }`}
                >
                  ★
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="comment"
            className="block text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400"
          >
            Comment
          </label>
          <textarea
            id="comment"
            rows={5}
            placeholder="What did you eat, and how was it?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-3 block w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-lg bg-red-600 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none"
          >
            {submitting ? "Saving…" : "Submit review"}
          </button>
          <p className="mt-3 text-center text-xs text-neutral-400">
            Published instantly to the restaurant page.
          </p>
        </div>
      </form>
    </main>
  );
}
