// app/review/[restaurantId]/page.tsx — Screen 1: write a review.
// Same DOM shape as the reference screen: back link, kicker topbar, the
// restaurant's name as the heading, five square star buttons that fill
// up to the pick, a comment box, one red submit. The state machine,
// the validation display and the POST contract are ours and unchanged:
// if the backend says 400, THIS PAGE prints the backend's own words and
// keeps the typed text.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      // Network failure — there is no backend message to show.
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <main className="page-shell">
        <p className="muted">This restaurant does not exist.</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Link href={`/restaurant/${restaurantId}`} className="back-link">
        <span className="back-arrow" aria-hidden="true">←</span> Back to
        restaurant
      </Link>

      <div className="screen-topbar review-kicker">
        <div className="screen-kicker">
          <span className="brand-mark" aria-hidden="true">Z</span>
          <span>WRITE A REVIEW</span>
        </div>
        <div className="wordmark" aria-label="Zomato Lite">
          <span>zomato</span>
          <small>lite</small>
        </div>
      </div>

      <header className="restaurant-heading form-heading">
        <h1>{name ?? "Loading restaurant…"}</h1>
        <p className="muted">How was your experience?</p>
      </header>

      <form className="review-form" onSubmit={handleSubmit}>
        <fieldset className="rating-picker">
          <legend className="field-label">Your rating</legend>
          <p className="field-hint">
            Choose a star rating for this restaurant.
          </p>
          <div className="star-options">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-button${rating === star ? " selected" : ""}`}
                aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                aria-pressed={rating === star}
                onClick={() => setRating(star)}
              >
                {/* Dialogue with the picker: stars up to the pick turn solid. */}
                {rating !== null && star <= rating ? "★" : "☆"}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="field-label comment-label" htmlFor="comment">
          Your review
        </label>
        <textarea
          id="comment"
          className="comment-input"
          rows={6}
          placeholder="What stood out about your visit?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}

        <button className="submit-button" type="submit" disabled={!canSubmit}>
          {submitting ? "Saving…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
