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

export const sql = neon(process.env.DATABASE_URL);
