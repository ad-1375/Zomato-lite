// app/review/[restaurantId]/page.tsx — Screen 1: write a review.
// The restaurant name at top, five star radios (arrow keys and screen readers
// included), a comment box, a Submit button.
// If the backend rejects the request, THIS PAGE displays the backend's own error
// message — it never invents one of its own.

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Skeleton } from "@/components/ui";

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
    <main className="mx-auto w-full max-w-[560px] px-6 py-14">
      <h1 className="text-2xl font-semibold tracking-tight">Leave a review</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Reviewing{" "}
        {name ?? (
          <Skeleton className="inline-block h-3 w-24 align-middle" />
        )}
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <fieldset className="m-0 border-0 p-0">
          {/* Real radios: a keyboard moves between the five stars with the
              arrow keys, screen readers announce "1 of 5 stars, radio", and
              each tap target is 48px. Visually the same amber stars. */}
          <legend className="text-sm font-medium">Your rating</legend>
          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <label
                key={star}
                htmlFor={`rating-${star}`}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-md [&:has(input:focus-visible)]:ring-2 [&:has(input:focus-visible)]:ring-amber-600 [&:has(input:focus-visible)]:ring-offset-2"
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
                  className={`text-3xl leading-none transition-colors ${
                    rating !== null && star <= rating
                      ? "text-amber-600"
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
          <label htmlFor="comment" className="block text-sm font-medium">
            Your review
          </label>
          <textarea
            id="comment"
            rows={4}
            placeholder="What did you eat, and how was it?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-3 block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-11 w-full rounded-md bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {submitting ? "Saving…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
