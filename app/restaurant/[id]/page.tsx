// app/restaurant/[id]/page.tsx — Screen 2: the restaurant page.
// Calls GET /api/restaurants/[id] and prints what it receives.
// This file contains no arithmetic: no adding, no dividing, no sorting.
// The average it shows was computed in the backend, live, at request time.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ScoreChip, relativeTime, absoluteDate, Skeleton } from "@/components/ui";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RestaurantPageData {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
}

// Presentation only: five glyphs, bright up to the rating, muted after.
// `className` lets callers resize the glyphs (list rows use a smaller size).
function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className={className}>
      <span className="text-amber-600">{"★".repeat(rating)}</span>
      <span className="text-neutral-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RestaurantPageData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-14">
        <p className="text-sm text-neutral-500">
          This restaurant does not exist.
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-14">
        {/* Soft placeholders, shaped like what is coming: heading, meta,
            big number, latest card, two list rows. */}
        <div className="space-y-3" aria-busy="true">
          <p className="sr-only">Loading…</p>
          <Skeleton className="block h-8 w-2/5" />
          <Skeleton className="block h-4 w-1/4" />
          <Skeleton className="mt-9 block h-14 w-full" />
          <Skeleton className="mt-2 block h-28 w-full rounded-lg" />
          <Skeleton className="mt-3 block h-20 w-full" />
          <Skeleton className="mt-3 block h-20 w-full" />
        </div>
      </main>
    );
  }

  // The list under "Earlier" should honestly be earlier: the newest review is
  // left out, because it already has its own card above. Nothing is deleted —
  // this is only a decision about what this list displays.
  const earlier = data.reviews.filter(
    (review) => review.id !== data.latestReview?.id
  );

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-14">
      <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {data.cuisine} · {data.area}
      </p>

      {/* THE line of this screen: the backend said 4.3, so 4.3 gets printed. */}
      <section
        aria-label="Rating summary"
        className="mt-8 flex items-baseline gap-3 border-b border-neutral-200 pb-5"
      >
        <span className="text-6xl font-semibold leading-none tracking-tight">
          {data.averageRating === null ? "—" : data.averageRating}
        </span>
        <span className="text-sm text-neutral-500">
          {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
        </span>
      </section>

      {data.latestReview && (
        <article className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
            Latest
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <ScoreChip rating={data.latestReview.rating} />
            <Stars rating={data.latestReview.rating} className="text-xs" />
          </div>
          <p className="mt-2 text-lg leading-snug">{data.latestReview.comment}</p>
          <p
            className="mt-3 text-xs text-neutral-400"
            title={absoluteDate(data.latestReview.createdAt)}
          >
            {relativeTime(data.latestReview.createdAt)}
          </p>
        </article>
      )}

      {earlier.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-neutral-500">Earlier</h2>
          <ul className="mt-1 divide-y divide-neutral-200">
            {earlier.map((review) => (
              <li key={review.id} className="py-4">
                <div className="flex items-center gap-2.5">
                  <ScoreChip rating={review.rating} />
                  <Stars rating={review.rating} className="text-xs" />
                  <span
                    className="ml-auto text-xs text-neutral-400"
                    title={absoluteDate(review.createdAt)}
                  >
                    {relativeTime(review.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5">{review.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.totalReviews === 0 && (
        <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-center">
          <p className="font-medium">No reviews yet.</p>
          <p className="mt-1 text-sm text-neutral-500">
            Be the first to review {data.name}.
          </p>
        </section>
      )}

      <div className="mt-10 pb-6">
        <Link
          href={`/review/${id}`}
          className="inline-flex h-11 items-center rounded-md border border-neutral-300 px-5 text-sm font-medium hover:border-neutral-500"
        >
          Write a review
        </Link>
      </div>
    </main>
  );
}
