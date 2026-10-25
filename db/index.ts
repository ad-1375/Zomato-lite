// db/index.ts — the one connection handle shared by every backend endpoint.
// The whole app talks to the database through this single export.
//
// DATABASE_URL lives in .env.local (never in Git). Next.js injects it into
// process.env automatically when the dev server or the production build runs.

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing. Local dev: check that .env.local contains it. " +
      "On Vercel: add it under Project Settings > Environment Variables."
  );
}

// Defence: strip stray whitespace/control characters (or accidental wrapping
// quotes) before the driver parses the string. Untrusted input, always.
const databaseUrl = (process.env.DATABASE_URL ?? "")
  .trim()
  .replace(/^["']+|["']+$/g, "");

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is empty after trimming. Check the value stored in .env.local or in Vercel's environment variables."
  );
}

export const sql = neon(databaseUrl);
