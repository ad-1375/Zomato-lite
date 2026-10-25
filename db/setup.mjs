// db/setup.mjs — applies schema.sql and seed.sql to the Neon database, then prints the rows.
// Run with: npm run db:setup
//
// Why it is safe to re-run:
//   * tables are only created if they don't already exist,
//   * seed data is only inserted when the restaurants table is empty,
//     so reviews written by real users are never wiped by a re-run.

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, "schema.sql"), "utf8");
const seed = readFileSync(join(here, "seed.sql"), "utf8");

// One handle for the whole script. Each call sends a SQL statement to Neon over HTTPS
// and gets plain rows back — the same driver our app will use later.
const sql = neon(process.env.DATABASE_URL);

// The .sql files hold several statements separated by ";" + newline; split them apart.
const splitStatements = (text) =>
  text
    .split(/;[ \t]*(?:\r?\n|\r)+/)
    .map((s) => s.trim())
    .filter(Boolean);

// Which tables already exist? to_regclass returns the table name, or null if absent.
const [tables] = await sql(
  "SELECT to_regclass('public.restaurants') AS restaurants, to_regclass('public.reviews') AS reviews"
);

console.log("1) Schema — create the two tables (skipping ones that already exist)");
for (const statement of splitStatements(schema)) {
  const match = statement.match(/CREATE TABLE\s+(\w+)/i);
  if (!match) {
    console.log("   - ran:", statement.split(/\r?\n/)[0].trim());
    continue;
  }
  const tableName = match[1];
  if (tables[tableName] !== null) {
    console.log(`   - table "${tableName}" already exists, skipping`);
    continue;
  }
  await sql(statement);
  console.log(`   - created table "${tableName}"`);
}

console.log("2) Seed — one restaurant, three reviews (only if the database is empty)");
const [{ count }] = await sql("SELECT COUNT(*)::int AS count FROM restaurants");
if (count === 0) {
  for (const statement of splitStatements(seed)) {
    await sql(statement);
  }
  console.log("   - seeded Ludhiana Burrito + 3 reviews");
} else {
  console.log(
    `   - ${count} restaurant(s) already present, skipping seed so existing data stays untouched`
  );
}

console.log("3) Reading back what the database now actually holds");
const restaurants = await sql("SELECT * FROM restaurants ORDER BY id");
const reviews = await sql(
  `SELECT id, restaurant_id, rating, comment,
          to_char(created_at AT TIME ZONE 'utc', 'YYYY-MM-DD HH24:MI') AS created_utc
   FROM reviews ORDER BY id`
);
console.table(restaurants);
console.table(reviews);

console.log(
  "\nDone. Look closely at the reviews table: no average_rating column, no latest_review column. That is on purpose."
);
