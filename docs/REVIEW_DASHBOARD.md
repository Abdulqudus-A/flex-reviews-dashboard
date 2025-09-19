# Flex Living Reviews Dashboard

## 1. Tech Stack
- Backend: Node.js, Express, TypeScript, filesystem JSON persistence (no external DB) for simplicity.
- Frontend: React + Vite + TypeScript, Material UI (theme customization), Recharts for basic trend visualization, Axios for API calls.
- Tooling: dotenv for configuration, lightweight custom normalization utilities.

## 2. Data Flow & Normalization
1. Client triggers `GET /api/reviews/hostaway` (or first `GET /api/reviews` autoseeds if empty).
2. Server attempts Hostaway sandbox fetch (currently sandbox has no reviews). If empty or forbidden it falls back to bundled mock JSON dataset.
3. Raw Hostaway review objects are normalized:
   - Compute `rating` from `reviewCategory` average if `rating` is null.
   - Convert `submittedAt` (e.g. `2020-08-21 22:45:14`) to ISO string.
   - Map fields: `publicReview` -> `text`, keep `type`, `status`, `guestName`, `listingName`.
   - Add internal `id` (random), keep `sourceId` (original Hostaway id).
   - Default `channel` to `hostaway` if absent; initialize `approved=false`.
4. Normalized reviews stored in `db.json` with idempotent insert (no duplicates by `sourceId`).

## 3. Key API Endpoints
- `GET /api/reviews/hostaway` : Fetch + normalize + persist.
  - Response:
  ```
  { status: "ok", normalized: true, source: "mock"|"live", total: number, items: NormalizedReview[] }
  ```
- `GET /api/reviews`
  - Query params: `listing`, `ratingMin`, `channel`, `from`, `to`, `approved`, `sort` (rating_desc|rating_asc|date_desc|date_asc), `page`, `pageSize`
  - Pagination: `page` (default 1), `pageSize` (default 50, max 200)
  - Response:
  ```
  { status, total, page, pageSize, items, aggregations:[{ listing, avgRating, count }] }
  ```
- `GET /api/reviews/categories-aggregate`
  - Same filters (ignores `sort`, pagination)
  - Response:
  ```
  { status, totalListings, items:[{ listing, categories:[{ category, avgRating, count }] }] }
  ```
- `GET /api/reviews/public`
  - Approved-only, lightweight feed for embedding.
  - Query params: `listing`, `page`, `pageSize`
  - Response:
  ```
  { status, total, page, pageSize, items:[{ id, rating, text, submittedAt, guestName, listingName }] }
  ```
- `GET /api/reviews/issues`
  - Keyword frequency (top ~50) from approved review text.
  - Response:
  ```
  { status, total, items:[{ word, count }] }
  ```
- `PATCH /api/reviews/:id/approve` : Toggle approval `{ approved: true|false }`.

## 4. UI / UX Decisions
- Clean, card-based dashboard with summary metrics (Total, Approved, Pending, Avg Rating).
- Filters: Channel, Listing, Min Rating, Date range; server-driven sorting + pagination.
- Sort selector (date/rating asc/desc) + page size control; server pagination reduces payload.
- Trend chart (line) for rating progression.
- Category breakdown panel (top listings with category averages) powered by `/categories-aggregate`.
- Frequent Keywords (issues) panel using `/issues` for quick qualitative signal.
- Approval toggle inline on each review card for curation.
- Property detail page includes hero, metrics bar, rating trend, approved-only reviews, placeholder amenities.
- Public feed endpoint prepared for embedding (only approved, trimmed fields).

## 5. Google Reviews Exploration (Preliminary)
- Google Places API offers `place/details` with review snippets but Terms of Service limit storing & displaying reviews outside immediate context; caching and display must respect branding.
- Requires Place ID per property (needs address → geocode → place search flow).
- Quotas & billing: Places Details is a billable request; would need API key & usage limits considered.
- Review objects do not include per-category ratings aligned with Hostaway categories (only overall rating + text + author).
- For MVP, integration deferred: mismatch in category granularity and legal display constraints.
- Future path: Map each property to Place ID, fetch top N recent reviews server-side with caching layer (ttl), merge into unified normalized shape (flag source='google').

## 6. Future Enhancements
- Add richer visualizations (radar / stacked bars) for category scores.
- Advanced sentiment / NLP (beyond simple frequency) for issue detection.
- Diagnostics mode for Hostaway live attempts (expose attempt metadata).
- Authentication / roles (manager vs viewer).
- Caching / ETag for public feed.
- Optional Google Places integration with Place ID mapping.

## 7. Running Locally
1. Backend: `npm install` (backend folder) then `npm run dev` (if a script is configured) or `ts-node src/server.ts`.
2. Frontend: `npm install` then `npm run dev`, ensure `VITE_API_URL=http://localhost:4000`.
3. Visit dashboard at frontend dev URL (usually `http://localhost:5173`).

## 8. Data Contract (NormalizedReview)
```
{
  id: string,
  sourceId: number,
  type: string,
  status: string,
  rating: number | null,
  categories: { category: string; rating: number }[],
  text: string | null,
  submittedAt: string (ISO),
  guestName?: string,
  listingName?: string,
  channel?: string,
  approved: boolean
}
```

## 9. Decision Log (Highlights)
- Chose filesystem JSON for speed over DB (MVP simplicity; replaceable with a repository pattern later).
- Normalization computes fallback rating from categories to ensure consistent sortable metric.
- Added sorting server-side to avoid heavy client sorting across large lists.
- Category aggregate endpoint isolated to keep main list lightweight.

## 10. Limitations
- Live Hostaway sandbox currently yields no data; mock dataset drives insights.
- No authentication/authorization layer (internal prototype assumption).
- Keyword extraction is simplistic (stop-word filter + frequency) – not true sentiment.
- Silent fallback to mock for Hostaway live fetch may obscure connectivity issues.
- Public feed not yet rate-limited or cached.

---
Document version: 1.1
