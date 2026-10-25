// app/restaurant/[id]/page.tsx — Screen 2: the restaurant page.
// Calls GET /api/restaurants/[id] and prints what it receives.
// This file contains no arithmetic: no adding, no dividing, no sorting.
// The average it shows was computed in the backend, live, at request time.
// (Rounding appears once, for presentation: a 4.3 average becomes a row of
// 4 filled stars — the exact 4.3 is printed in full right beside them.)

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RatingStars, shortDate, longDate, Skeleton } from "@/components/ui";

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
      <main className="mx-auto w-full max-w-[560px] px-6 py-14">
        <p className="text-sm text-neutral-500">
          This restaurant does not exist.
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-12">
        {/* Soft placeholders, shaped like what is coming. */}
        <div className="space-y-3" aria-busy="true">
          <p className="sr-only">Loading…</p>
          <Skeleton className="block h-3 w-28 rounded-full" />
          <Skeleton className="block h-8 w-56" />
          <div className="flex gap-2">
            <Skeleton className="block h-9 w-24 rounded-full" />
            <Skeleton className="block h-9 w-28 rounded-full" />
          </div>
          <Skeleton className="mt-9 block h-16 w-64" />
          <Skeleton className="mt-6 block h-36 w-full rounded-xl" />
          <Skeleton className="mt-6 block h-16 w-full" />
          <Skeleton className="mt-4 block h-16 w-full" />
        </div>
      </main>
    );
  }

  // The list should honestly be earlier: the newest review already has the
  // blush card above, so it is not repeated here. Nothing is deleted —
  // this is only a decision about what this list displays.
  const earlier = data.reviews.filter(
    (review) => review.id !== data.latestReview?.id
  );

  // Presentation-only rounding for the star row; the exact average prints too.
  const avgStars =
    data.averageRating === null ? 0 : Math.round(data.averageRating);

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-12">
      {/* Identity: brand eyebrow, name, pill chips, and a stand-in tile. */}
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-red-700">
            Zomato-Lite
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{data.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-neutral-600">
              {data.cuisine}
            </span>
            <span className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-neutral-600">
              {data.area}
            </span>
          </div>
        </div>
        {/* No photo exists in our data — a letter tile stands in for the food shot. */}
        <div
          aria-hidden="true"
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-2xl font-bold text-neutral-300"
        >
          {data.name.slice(0, 1)}
        </div>
      </div>

      {/* THE line of this screen: the backend said 4.3, so 4.3 gets printed. */}
      <section
        aria-label="Rating summary"
        className="mt-10 border-b border-neutral-200 pb-7"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Average rating
        </p>
        <div className="mt-3 flex items-center gap-4">
          <p className="text-6xl font-bold leading-none tracking-tight text-amber-600">
            {data.averageRating === null ? "—" : data.averageRating}
          </p>
          <div>
            <RatingStars rating={avgStars} tone="amber" size="text-xl" />
            <p className="mt-1 text-[13px] text-neutral-500">
              out of 5 · {data.totalReviews}{" "}
              {data.totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Reviews
        </p>

        {data.latestReview && (
          <article className="relative mt-4 rounded-xl border border-[#f0d9d5] bg-[#faf0ee] p-5">
            <span
              aria-hidden="true"
              className="absolute right-5 top-3 font-serif text-6xl leading-none text-[#f2c9c4]"
            >
              &rdquo;
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
              Latest review
            </p>
            <p className="mt-3 text-lg leading-snug text-neutral-900">
              {data.latestReview.comment}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <RatingStars rating={data.latestReview.rating} size="text-base" />
              <span
                className="text-sm text-neutral-500"
                title={longDate(data.latestReview.createdAt)}
              >
                {shortDate(data.latestReview.createdAt)}
              </span>
            </div>
          </article>
        )}

        {earlier.length > 0 && (
          <ul className="mt-2 divide-y divide-neutral-200">
            {earlier.map((review) => (
              <li key={review.id} className="py-4">
                <p className="text-[15px] text-neutral-800">{review.comment}</p>
                <div className="mt-2 flex items-center gap-3">
                  <RatingStars rating={review.rating} size="text-sm" />
                  <span
                    className="text-sm text-neutral-500"
                    title={longDate(review.createdAt)}
                  >
                    {shortDate(review.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {data.totalReviews === 0 && (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6 text-center">
            <p className="font-medium">No reviews yet.</p>
            <p className="mt-1 text-sm text-neutral-500">
              Be the first to review {data.name}.
            </p>
          </div>
        )}
      </section>

      <div className="mt-10 pb-6">
        <Link
          href={`/review/${id}`}
          className="inline-flex h-11 items-center rounded-lg bg-red-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          Write a review
        </Link>
      </div>
    </main>
  );
}
