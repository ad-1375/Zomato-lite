// app/api/restaurants/[id]/route.ts — GET /api/restaurants/<id>
// "Give me something." Everything the restaurant screen needs, shaped like the screen.
//
// The counts that decide the page are computed HERE, at request time, from facts:
//   averageRating -> AVG(rating)   WHERE restaurant_id = <id>
//   totalReviews  -> COUNT(*)      WHERE restaurant_id = <id>
//   latestReview  -> newest by created_at, take one
//   reviews       -> everything except the latest, newest first
// There is no average column and no latest column. They were never stored.

import { NextResponse } from "next/server";
import { sql } from "@/db";

interface ReviewRow {
  id: number;
  rating: number;
  comment: string;
  created_at: string | Date;
}

function toReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const [restaurant] =
    await sql`SELECT name, cuisine, area FROM restaurants WHERE id = ${restaurantId}`;
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  // One pass for the numbers, one for the list — plainly visible SQL for each.
  const [stats] = (await sql`
    SELECT COUNT(*)::int AS "totalReviews", AVG(rating) AS "averageRating"
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
  `) as unknown as { totalReviews: number; averageRating: string | null }[];
  const rows = (await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC, id DESC
  `) as unknown as ReviewRow[];

  const empty = stats.totalReviews === 0;
  const response = {
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    // When there is nothing yet: null, not 0. Unknown is unknown — 0 would be a lie.
    averageRating: empty
      ? null
      : Math.round(Number(stats.averageRating) * 10) / 10,
    totalReviews: stats.totalReviews,
    latestReview: empty ? null : toReview(rows[0]),
    reviews: empty ? [] : rows.slice(1).map(toReview),
  };

  return NextResponse.json(response, { status: 200 });
}
