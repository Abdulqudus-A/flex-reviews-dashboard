# Google Reviews Exploration (Stub)

## Summary
Integration not implemented in MVP. This document captures feasibility considerations, constraints, and a phased approach for future work.

## 1. Objective
Assess viability of augmenting Hostaway (or mock) reviews with Google user reviews for each property to enrich feedback and social proof.

## 2. Data Source
Google Places API (Places Details endpoint) returns up to 5 most relevant reviews per request including rating (1-5), author info, relative time, and text.

## 3. Constraints & Considerations
- Terms of Service: Display must include proper attribution; storing reviews long-term or altering content may violate policies.
- Rate Limits & Billing: Places Details is billed; budget planning needed for periodic refresh.
- Matching: Requires reliable Place ID per property (needs address normalization + geocoding + search). Ambiguity risk for generic names.
- Category Parity: Google reviews lack subcategory ratings (cleanliness, communication, etc.) so cannot contribute to category aggregates without heuristic inference (not recommended initially).
- Moderation: Google content cannot be selectively edited; only filter by rating or presence of text.

## 4. Proposed Normalized Shape (Extension)
```
{
  id: string,
  sourceId: string,              // Google review id
  source: 'google',
  rating: number,                // 1-5
  text: string,
  submittedAt: string,           // ISO (converted from Unix or relative)
  guestName: string | null,
  listingName: string | null,    // mapped via property Place ID mapping
  channel: 'google',
  approved: boolean              // manager curated flag
}
```

## 5. Minimal Integration Flow
1. Maintain mapping table: internalListingId -> googlePlaceId.
2. Nightly job: for each placeId call Places Details with `fields=reviews`.
3. Normalize & upsert (avoid duplicates by sourceId).
4. Expose combined feed endpoint `/api/reviews?source=google|hostaway|all`.
5. UI: toggle to include/exclude Google reviews, badge them with provider icon.

## 6. Caching Strategy
- Cache raw responses for TTL (e.g., 12h) to reduce billing.
- Store ETag / last fetch timestamp for conditional refresh.

## 7. Open Questions
- Legal confirmation for storing beyond short term caching window.
- Need for language filtering or translation (multilingual guests).
- Handling spam or inappropriate content (cannot delete via API).

## 8. Future Enhancements
- Sentiment analysis cross-source.
- Weighting Hostaway vs Google ratings for composite scores.
- Add review keywords tag cloud.

## 9. Decision
Deferred until legal & billing constraints clarified and Place ID mapping established.

Document version: 0.1
