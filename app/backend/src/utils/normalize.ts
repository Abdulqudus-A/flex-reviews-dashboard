import { HostawayReviewRaw, NormalizedReview } from "../types";

// Simple id generator to avoid ESM nanoid issues in CommonJS setup
function genId(len = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * Normalizes Hostaway raw review to our internal NormalizedReview format.
 */
export function normalizeHostawayReview(r: HostawayReviewRaw): NormalizedReview {
  let rating = r.rating;

  // If rating is null but categories exist, compute category average (rounded).
  if ((rating === null || rating === undefined) && Array.isArray(r.reviewCategory) && r.reviewCategory.length > 0) {
    const avg = r.reviewCategory.reduce((s, c) => s + (c.rating ?? 0), 0) / r.reviewCategory.length;
    rating = Math.round(avg);
  }

  // Try parse submittedAt; if fails, use now
  const submittedAtIso = (() => {
    try {
      // Hostaway example uses "2020-08-21 22:45:14" -> convert to ISO
      const t = r.submittedAt?.trim().replace(" ", "T");
      const d = new Date(t ?? "");
      if (isNaN(d.getTime())) return new Date().toISOString();
      return d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  })();

  return {
  id: genId(),
    sourceId: r.id,
    type: r.type,
    status: r.status,
    rating: rating ?? null,
    categories: r.reviewCategory ?? [],
    text: r.publicReview ?? null,
    submittedAt: submittedAtIso,
    guestName: r.guestName,
    listingName: r.listingName,
    channel: r.channel ?? "hostaway",
    approved: false
  };
}
