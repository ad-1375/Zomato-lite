// app/restaurant/[id]/page.tsx — Screen 2: the restaurant page.
// Same DOM shape as the reference screen, word for word, class for class —
// the only difference is that the words and numbers come from OUR api and
// OUR database. This file contains no arithmetic and no sorting: the
// average, the count and the order of reviews were computed in the backend,
// live, at request time. (data.reviews is already "everything except the
// newest, newest first" — exactly what "Earlier reviews" should print.)

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { longDate } from "@/components/ui";

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
      <main className="page-shell">
        <p className="muted">This restaurant does not exist.</p>
      </main>
    );
  }

  if (!data) {
    // One honest line while the facts are in flight — no placeholders.
    return (
      <main className="page-shell">
        <p className="muted">Loading restaurant…</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="screen-topbar">
        <div className="screen-kicker">
          <span className="brand-mark" aria-hidden="true">Z</span>
          <span>RESTAURANT REVIEWS</span>
        </div>
        <div className="wordmark" aria-label="Zomato Lite">
          <span>zomato</span>
          <small>lite</small>
        </div>
      </div>

      <header className="restaurant-heading">
        <h1>{data.name}</h1>
        <p className="muted restaurant-meta">
          <span>{data.cuisine}</span>
          <span className="meta-divider" aria-hidden="true"></span>
          <span>{data.area}</span>
        </p>
      </header>

      {data.latestReview ? (
        <>
          <section className="rating-summary" aria-label="Restaurant rating">
            <div className="rating-copy">
              <p className="eyebrow">COMMUNITY RATING</p>
              <p className="review-count">
                Based on {data.totalReviews}{" "}
                {data.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
            <div className="rating-pill" aria-label="Average restaurant rating">
              <span className="average-rating">
                {data.averageRating === null ? "—" : data.averageRating}
              </span>
              <span className="rating-star" aria-hidden="true">★</span>
            </div>
          </section>

          <section className="latest-review" aria-labelledby="latest-heading">
            <div className="latest-card-top">
              <div>
                <p className="eyebrow">FRESH FROM THE COMMUNITY</p>
                <h2 id="latest-heading">Latest review</h2>
              </div>
              <span
                className="review-rating-chip"
                aria-label={`${data.latestReview.rating} out of 5 stars`}
              >
                {data.latestReview.rating}
                <span aria-hidden="true"> ★</span>
              </span>
            </div>
            <p className="review-comment">{data.latestReview.comment}</p>
            <time className="review-date" dateTime={data.latestReview.createdAt}>
              {longDate(data.latestReview.createdAt)}
            </time>
          </section>

          {data.reviews.length > 0 && (
            <section className="older-reviews" aria-labelledby="older-heading">
              <div className="older-heading-row">
                <div>
                  <p className="eyebrow">MORE TO EXPLORE</p>
                  <h2 id="older-heading" className="section-heading">
                    Earlier reviews
                  </h2>
                </div>
                {/* The bubble shows exactly the cards printed below. */}
                <span className="older-count">{data.reviews.length}</span>
              </div>
              <ul className="review-list">
                {data.reviews.map((review) => (
                  <li className="review-item" key={review.id}>
                    <div className="section-label-row">
                      <span
                        className="review-rating-chip small"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {review.rating}
                        <span aria-hidden="true"> ★</span>
                      </span>
                      <time className="review-date" dateTime={review.createdAt}>
                        {longDate(review.createdAt)}
                      </time>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <section className="empty-state" aria-labelledby="empty-heading">
          <div className="empty-mark" aria-hidden="true">★</div>
          <h2 id="empty-heading">No reviews yet</h2>
          <p>Be the first to share your experience at {data.name}.</p>
        </section>
      )}

      <Link href={`/review/${id}`} className="text-link">
        <span>Share your experience</span>
        <span className="link-arrow" aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
