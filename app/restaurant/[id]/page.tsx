// app/restaurant/[id]/page.tsx — Screen 2: the restaurant page.
// Calls GET /api/restaurants/[id] and prints what it receives.
// This file contains no arithmetic: no adding, no dividing, no sorting.
// The average it shows was computed in the backend, live, at request time.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Stars, ScoreChip, relativeTime, absoluteDate } from "@/components/ui";

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

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 md:px-8 md:py-16">
        <p className="text-sm text-neutral-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[640px] px-5 py-10 md:px-8 md:py-16">
      {/* Identity block: name first, quiet meta second, CTA discovered on the right (desktop) */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="break-words text-[26px] font-semibold leading-tight tracking-tight">
            {data.name}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            {data.cuisine} <span aria-hidden="true">·</span> {data.area}
          </p>
        </div>
        <Link
          href={`/review/${id}`}
          className="hidden h-10 shrink-0 items-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 sm:inline-flex"
        >
          Write a Review
        </Link>
      </header>

      {/* Rating summary: the axis of the page. Backend said 4.4, so 4.4 is printed. */}
      <section aria-label="Rating summary" className="mt-8">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-5xl font-semibold leading-none tracking-tight text-green-700">
            {data.averageRating === null ? "—" : data.averageRating}
          </span>
          <span className="text-sm text-neutral-500">
            {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>
      </section>

      {/* Full-width CTA on phones — same destination, no sticky overlay, nothing obscured */}
      <Link
        href={`/review/${id}`}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-red-600 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 sm:hidden"
      >
        Write a Review
      </Link>

      {/* Latest review: instant side-profile distinct card with green rail */}
      {data.latestReview && (
        <section aria-label="Latest review" className="mt-8">
          <article className="rounded-xl border border-neutral-200 border-l-4 border-l-green-600 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              Latest
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <ScoreChip rating={data.latestReview.rating} />
              <span
                className="ml-auto text-xs text-neutral-400"
                title={absoluteDate(data.latestReview.createdAt)}
              >
                {relativeTime(data.latestReview.createdAt)}
              </span>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed sm:text-base">
              {data.latestReview.comment}
            </p>
          </article>
        </section>
      )}

      {/* Earlier reviews: plain list, one row of meta per review */}
      {data.reviews.length > 0 && (
        <section aria-label="Earlier reviews" className="mt-9">
          <h2 className="text-sm font-semibold text-neutral-600">Earlier reviews</h2>
          <ul className="mt-1 divide-y divide-neutral-100">
            {data.reviews.map((review) => (
              <li key={review.id} className="py-4">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <ScoreChip rating={review.rating} />
                  <Stars rating={review.rating} className="text-xs" />
                  <span
                    className="ml-auto text-xs text-neutral-400"
                    title={absoluteDate(review.createdAt)}
                  >
                    {relativeTime(review.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 text-[15px] leading-relaxed">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Empty state: invites the first review instead of faking a zero */}
      {data.totalReviews === 0 && (
        <section className="mt-8 rounded-xl border border-dashed border-neutral-300 p-6 text-center">
          <p className="text-sm font-medium">No reviews yet.</p>
          <p className="mt-1 text-sm text-neutral-500">
            Be the first to review {data.name}.
          </p>
          <Link
            href={`/review/${id}`}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Write the first review
          </Link>
        </section>
      )}
    </main>
  );
}
