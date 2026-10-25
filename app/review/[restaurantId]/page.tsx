// app/review/[restaurantId]/page.tsx — Screen 1: write a review.
// The restaurant name up top, a native radio-based star group (touch, keyboard,
// assistive tech), a bounded comment box with a live character count, and clearly
// separated disabled / saving / saved / error states.
// If the backend rejects the request, THIS PAGE displays the backend's own error
// message — it never invents one of its own — and the typed text is preserved.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { FormEvent } from "react";

const MAX_COMMENT_LENGTH = 500;

export default function ReviewPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
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

  const commentHasText = comment.trim().length > 0;
  const canSubmit =
    rating !== null && commentHasText && !submitting && !saved;

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
        setSaved(true);
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
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 md:px-8 md:py-16">
        <p className="text-sm text-neutral-500">This restaurant does not exist.</p>
        <Link
          href="/"
          className="mt-3 inline-block text-sm font-medium text-red-700 hover:underline"
        >
          Go to the start page
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[640px] px-5 py-10 md:px-8 md:py-16">
      {/* Which restaurant am I reviewing? The name is the headline. */}
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Leave a review
      </p>
      <h1 className="mt-1.5 text-[24px] font-semibold leading-snug tracking-tight">
        {name ?? "…"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-9">
        {/* Rating: real radio inputs — arrow keys, screen readers, 48px touch targets */}
        <fieldset className="m-0 border-0 p-0">
          <legend className="text-sm font-semibold">Your rating</legend>
          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <label
                key={star}
                htmlFor={`rating-${star}`}
                className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-md [&:has(input:focus-visible)]:ring-2 [&:has(input:focus-visible)]:ring-red-600 [&:has(input:focus-visible)]:ring-offset-2"
              >
                <input
                  id={`rating-${star}`}
                  type="radio"
                  name="rating"
                  checked={rating === star}
                  onChange={() => setRating(star)}
                  aria-label={`${star} of 5 stars`}
                  className="sr-only peer"
                />
                <span
                  aria-hidden="true"
                  className={`text-3xl leading-none transition-colors ${
                    rating !== null && star <= rating
                      ? "text-green-600"
                      : rating !== null && star > rating
                        ? "group-hover:text-neutral-400"
                        : "text-neutral-300"
                  }`}
                >
                  ★
                </span>
              </label>
            ))}
          </div>
          {rating === null && (
            <p className="mt-2.5 text-xs text-neutral-400">
              Tap a star — arrow keys work too.
            </p>
          )}
        </fieldset>

        {/* Review text with live character count */}
        <div className="mt-8">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="comment" className="text-sm font-semibold">
              Your review
            </label>
            <span
              id="charcount"
              className={`text-xs tabular-nums ${
                comment.length >= MAX_COMMENT_LENGTH - 20
                  ? "text-red-600"
                  : "text-neutral-400"
              }`}
            >
              {comment.length}/{MAX_COMMENT_LENGTH}
            </span>
          </div>
          <textarea
            id="comment"
            rows={5}
            maxLength={MAX_COMMENT_LENGTH}
            aria-describedby="charcount"
            placeholder="What did you eat, and how was it?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2.5 block w-full resize-y rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm transition-colors placeholder:text-neutral-400 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/15"
          />
          {rating !== null && !commentHasText && comment.length > 0 && (
            <p className="mt-2 text-xs text-neutral-400">
              Spaces-only text won&apos;t submit — add a few words.
            </p>
          )}
        </div>

        {/* Backend's own words, shown verbatim when it says no */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none ${
            saved ? "bg-green-700" : submitting ? "bg-red-700" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {submitting && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
          )}
          {saved
            ? "Saved — opening your review"
            : submitting
              ? "Saving…"
              : "Submit Review"}
        </button>
      </form>
    </main>
  );
}
