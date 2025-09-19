import express, { Request, Response } from "express";
import axios from "axios";
import { initDb } from "../db";
import hostawayMock from "../mock/hostaway.json";
import { normalizeHostawayReview } from "../utils/normalize";
import { HostawayRaw, HostawayReviewRaw } from "../types";
import { HOSTAWAY_ACCOUNT_ID, HOSTAWAY_API_KEY } from "../config";

const router = express.Router();

/**
 * Attempt to fetch from Hostaway sandbox. If the sandbox returns no reviews or
 * an error happens, fall back to the provided mock JSON.
 */
async function fetchHostawayReviews(): Promise<HostawayRaw> {
  // Example endpoint (may differ for real Hostaway sandbox). We try to use account + key, but fallback to mock.
  const url = `https://api.hostaway.com/v1/reviews?accountId=${HOSTAWAY_ACCOUNT_ID}`;

  try {
    // First attempt with X-Hostaway-API-Key header (variant 2 from your curls)
    let resp = await axios.get(url, {
      headers: { "X-Hostaway-API-Key": HOSTAWAY_API_KEY },
      timeout: 4000,
      validateStatus: () => true
    });

    // If forbidden, try generic x-api-key (variant 3)
    if (resp.status === 403) {
      resp = await axios.get(url, {
        headers: { "x-api-key": HOSTAWAY_API_KEY },
        timeout: 4000,
        validateStatus: () => true
      });
    }

    if (resp.status >= 200 && resp.status < 300 && resp.data && Array.isArray(resp.data.result) && resp.data.result.length > 0) {
      return resp.data as HostawayRaw;
    }
    // If non-success or empty result, fall back to mock
    return hostawayMock as HostawayRaw;
  } catch (err) {
    // On any error, return mock data
    return hostawayMock as HostawayRaw;
  }
}

/**
 * GET /api/reviews/hostaway
 * - Fetches Hostaway reviews (or mock), normalizes them, persists to db.
 * - Idempotent: will not duplicate entries with same sourceId.
 */
/**
 * Load & persist Hostaway reviews into DB if not already present.
 * Returns number added and normalized list.
 */
async function loadAndPersistHostaway(db: { data: { reviews: any[] }; write: () => Promise<void> }) {
  const raw = await fetchHostawayReviews();
  const results = raw.result as HostawayReviewRaw[];
  const normalized = results.map(normalizeHostawayReview);
  const source = raw === (hostawayMock as any) ? "mock" : "live";
  db.data.reviews ||= [];
  let added = 0;
  for (const n of normalized) {
    if (!db.data.reviews.find(r => r.sourceId === n.sourceId)) {
      db.data.reviews.push(n);
      added++;
    }
  }
  if (added > 0) await db.write();
  return { added, normalized, source };
}

// Explicit endpoint to fetch & persist Hostaway data
router.get("/hostaway", async (_req: Request, res: Response) => {
  const db = await initDb();
  const { added, normalized, source } = await loadAndPersistHostaway(db);
  res.json({ status: "ok", normalized: true, source, total: normalized.length, items: normalized });
});

/**
 * GET /api/reviews
 * Query params: listing, ratingMin, channel, from, to, approved
 */
router.get("/", async (req: Request, res: Response) => {
  const db = await initDb();

  // Auto-seed if empty and no explicit skip
  if ((!db.data!.reviews || db.data!.reviews.length === 0) && req.query.autoseed !== "false") {
    try {
      await loadAndPersistHostaway(db);
    } catch (e) {
      // swallow seed errors – endpoint should still respond
    }
  }

  let items = (db.data!.reviews || []).slice();

  const { listing, ratingMin, channel, from, to, approved, sort, page, pageSize } = req.query;

  if (listing) {
    const q = String(listing).toLowerCase();
    items = items.filter(i => (i.listingName ?? "").toLowerCase().includes(q));
  }
  if (ratingMin) items = items.filter(i => (i.rating ?? 0) >= Number(ratingMin));
  if (channel) items = items.filter(i => (i.channel ?? "").toLowerCase() === String(channel).toLowerCase());
  if (from) items = items.filter(i => new Date(i.submittedAt) >= new Date(String(from)));
  if (to) items = items.filter(i => new Date(i.submittedAt) <= new Date(String(to)));
  if (approved !== undefined) {
    const flag = String(approved).toLowerCase() === "true";
    items = items.filter(i => Boolean(i.approved) === flag);
  }

  // Optional sorting
  if (sort) {
    const s = String(sort).toLowerCase();
    if (s === "rating_desc") {
      items.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    } else if (s === "rating_asc") {
      items.sort((a, b) => (a.rating ?? 9999) - (b.rating ?? 9999));
    } else if (s === "date_desc") {
      items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } else if (s === "date_asc") {
      items.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    }
  }

  // Aggregation per listing: avgRating & count
  const aggMap: Record<string, { listing: string; avgRating: number; count: number }> = {};
  for (const r of items) {
    const key = r.listingName ?? "Unknown";
    if (!aggMap[key]) aggMap[key] = { listing: key, avgRating: 0, count: 0 };
    const prev = aggMap[key];
    const prevTotal = prev.avgRating * prev.count;
    const nextCount = prev.count + 1;
    const nextTotal = prevTotal + (r.rating ?? 0);
    prev.avgRating = nextCount > 0 ? nextTotal / nextCount : 0;
    prev.count = nextCount;
  }

  // Basic pagination (defaults)
  const pSize = Math.min(Number(pageSize) || 50, 200);
  const p = Math.max((Number(page) || 1), 1);
  const start = (p - 1) * pSize;
  const paged = items.slice(start, start + pSize);

  res.json({ status: "ok", total: items.length, page: p, pageSize: pSize, items: paged, aggregations: Object.values(aggMap) });
});

/**
 * GET /api/reviews/categories-aggregate
 * Same filters as /api/reviews. Returns per-listing per-category averages.
 * Output: { status, totalListings, items: [ { listing, categories: [ { category, avgRating, count } ] } ] }
 */
router.get("/categories-aggregate", async (req: Request, res: Response) => {
  const db = await initDb();
  let items = (db.data!.reviews || []).slice();
  const { listing, ratingMin, channel, from, to, approved } = req.query;

  if (listing) {
    const q = String(listing).toLowerCase();
    items = items.filter(i => (i.listingName ?? "").toLowerCase().includes(q));
  }
  if (ratingMin) items = items.filter(i => (i.rating ?? 0) >= Number(ratingMin));
  if (channel) items = items.filter(i => (i.channel ?? "").toLowerCase() === String(channel).toLowerCase());
  if (from) items = items.filter(i => new Date(i.submittedAt) >= new Date(String(from)));
  if (to) items = items.filter(i => new Date(i.submittedAt) <= new Date(String(to)));
  if (approved !== undefined) {
    const flag = String(approved).toLowerCase() === "true";
    items = items.filter(i => Boolean(i.approved) === flag);
  }

  interface CatAgg { sum: number; count: number; }
  const listingCatMap: Record<string, Record<string, CatAgg>> = {};

  for (const r of items) {
    const l = r.listingName || "Unknown";
    if (!listingCatMap[l]) listingCatMap[l] = {};
    for (const c of (r.categories || [])) {
      if (!listingCatMap[l][c.category]) listingCatMap[l][c.category] = { sum: 0, count: 0 };
      listingCatMap[l][c.category].sum += c.rating ?? 0;
      listingCatMap[l][c.category].count += 1;
    }
  }

  const responseItems = Object.entries(listingCatMap).map(([listingName, cats]) => ({
    listing: listingName,
    categories: Object.entries(cats).map(([category, agg]) => ({
      category,
      avgRating: agg.count ? agg.sum / agg.count : 0,
      count: agg.count
    }))
  }));

  res.json({ status: "ok", totalListings: responseItems.length, items: responseItems });
});

/**
 * GET /api/reviews/public
 * Returns only approved reviews (lightweight) for potential embedding on public site.
 * Supports optional listing filter and pagination.
 */
router.get("/public", async (req: Request, res: Response) => {
  const db = await initDb();
  const { listing, page, pageSize } = req.query;
  let items = (db.data!.reviews || []).filter(r => r.approved);
  if (listing) {
    const q = String(listing).toLowerCase();
    items = items.filter(i => (i.listingName ?? "").toLowerCase().includes(q));
  }
  const pSize = Math.min(Number(pageSize) || 50, 200);
  const p = Math.max((Number(page) || 1), 1);
  const start = (p - 1) * pSize;
  const paged = items.slice(start, start + pSize).map(r => ({
    id: r.id,
    rating: r.rating,
    text: r.text,
    submittedAt: r.submittedAt,
    guestName: r.guestName,
    listingName: r.listingName
  }));
  res.json({ status: "ok", total: items.length, page: p, pageSize: pSize, items: paged });
});

/**
 * GET /api/reviews/issues
 * Lightweight keyword frequency extraction from approved review text.
 */
router.get("/issues", async (_req: Request, res: Response) => {
  const db = await initDb();
  const approved = (db.data!.reviews || []).filter(r => r.approved && r.text);
  const freq: Record<string, number> = {};
  const stop = new Set(["the","and","a","to","of","is","it","was","for","in","on","we","i","our","with","at","this","that","had","were","be","very"]);
  for (const r of approved) {
    const words = String(r.text).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 3 && !stop.has(w));
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
  }
  const items = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,50).map(([word,count])=>({ word, count }));
  res.json({ status: "ok", total: items.length, items });
});

/**
 * PATCH /api/reviews/:id/approve
 * body: { approved: true|false }
 */
router.patch("/:id/approve", async (req: Request, res: Response) => {
  const db = await initDb();
  const { id } = req.params;
  const { approved } = req.body;
  if (approved === undefined) return res.status(400).json({ status: "error", message: "`approved` boolean required" });

  const record = db.data!.reviews.find(r => r.id === id || String(r.sourceId) === id);
  if (!record) return res.status(404).json({ status: "error", message: "review not found" });

  record.approved = Boolean(approved);
  await db.write();
  res.json({ status: "ok", item: record });
});

export default router;
