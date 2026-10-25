// app/page.tsx — the front door.
// One card describing the restaurant (fetched from the same backend API as
// every other screen — nothing is hardcoded), then two big tappable rows:
// read what people said, or be the next person to say something.
// The average it shows was computed in the backend, live, at request time.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScoreChip, Skeleton } from "@/components/ui";

interface DoorData {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
}

export default function Home() {
  const [data, setData] = useState<DoorData | null>(null);
  const [failed, setFailed] = useState(false);

  // One fetch, same /api/restaurants/[id] contract the other screens use.
  // The demo fronts exactly one restaurant, the seeded one (id 1).
  useEffect(() => {
    fetch("/api/restaurants/1")
      .then((res) => {
        if (!res.ok) {
          setFailed(true);
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => setFailed(true));
  }, []);

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Zomato Lite
      </p>

      {/* Identity card: exactly what the API says — name, cuisine, area, average. */}
      <section className="mt-4 rounded-lg border border-neutral-200 bg-white p-5">
        {failed ? (
          <p className="text-sm text-neutral-500">
            Could not load. Refresh the page.
          </p>
        ) : !data ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="block h-7 w-2/5" />
            <Skeleton className="block h-4 w-1/4" />
            <Skeleton className="block h-6 w-36" />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {data.cuisine} · {data.area}
            </p>
            <div className="mt-4 flex items-center gap-2.5">
              {data.averageRating !== null && <ScoreChip rating={data.averageRating} />}
              <span className="text-sm text-neutral-500">
                {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
              </span>
            </div>
          </>
        )}
      </section>

      {/* The two ways to go — big rows, easy to tap on a phone. */}
      <nav aria-label="Main" className="mt-6 space-y-3">
        <Link
          href="/restaurant/1"
          className="flex h-14 items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium transition-colors hover:border-neutral-500"
        >
          <span>
            See the reviews
            <span className="mt-0.5 block text-xs text-neutral-400">
              Ratings and comments, latest first
            </span>
          </span>
          <span aria-hidden="true" className="text-lg text-neutral-300">
            ›
          </span>
        </Link>
        <Link
          href="/review/1"
          className="flex h-14 items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium transition-colors hover:border-neutral-500"
        >
          <span>
            Write a review
            <span className="mt-0.5 block text-xs text-neutral-400">
              One star pick and a few words
            </span>
          </span>
          <span aria-hidden="true" className="text-lg text-neutral-300">
            ›
          </span>
        </Link>
      </nav>
    </main>
  );
}
