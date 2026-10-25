// app/review/[restaurantId]/page.tsx — Screen 1: write a review.
// The restaurant name at top, five clickable stars, a comment box, a Submit button.
// If the backend rejects the request, THIS PAGE displays the backend's own error
// message — it never invents one of its own.

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { FormEvent } from "react";

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
        Reviewing {name ?? "…"}
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <div>
          <p className="text-sm font-medium">Your rating</p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} of 5 stars`}
                onClick={() => setRating(star)}
                className={`text-3xl leading-none transition-colors ${
                  rating !== null && star <= rating
                    ? "text-amber-600"
                    : "text-neutral-300 hover:text-neutral-400"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

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
