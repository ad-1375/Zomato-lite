// app/api/reviews/route.ts — POST /api/reviews
// "Here, take this." The order window for reviews.
//
// Contract:
//   In:  { "restaurantId": 1, "rating": 4, "comment": "Good, but slow service" }
//   Out: 201 { "success": true, "reviewId": <id> }
//   Or:  400 { "error": "<plain English reason>" } — first validation failure wins.
//
// Validation order matters and is specified: rating, then comment, then existence.

import { NextResponse } from "next/server";
import { sql } from "@/db";

export async function POST(request: Request) {
  let body: object | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { rating, comment, restaurantId } = (body ?? {}) as {
    rating?: unknown;
    comment?: unknown;
    restaurantId?: unknown;
  };

  // Check 1 — rating: a whole number from 1 to 5. (500 people, we see you.)
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 }
    );
  }

  // Check 2 — comment: not empty once surrounding whitespace is trimmed.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment must include some text — it cannot be empty." },
      { status: 400 }
    );
  }

  // Check 3 — restaurantId: an integer that actually exists in the database.
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "Restaurant ID must be a whole number." },
      { status: 400 }
    );
  }
  const existing = await sql`SELECT 1 FROM restaurants WHERE id = ${restaurantId}`;
  if (existing.length === 0) {
    return NextResponse.json(
      { error: "That restaurant does not exist." },
      { status: 400 }
    );
  }

  // The write: exactly one row into reviews. Nothing else in the database changes.
  const [inserted] = (await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment})
    RETURNING id
  `) as unknown as { id: number }[];

  return NextResponse.json(
    { success: true, reviewId: inserted.id },
    { status: 201 }
  );
}
