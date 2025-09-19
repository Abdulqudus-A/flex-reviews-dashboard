# Flex Living — Reviews Backend

## Overview
This backend provides:
- `GET /api/reviews/hostaway` — fetch & normalize Hostaway reviews (mock fallback when sandbox empty).
- `GET /api/reviews` — filter + sort + paginate reviews (aggregations included).
- `GET /api/reviews/categories-aggregate` — per-listing per-category averages.
- `GET /api/reviews/public` — approved-only lightweight feed for embedding.
- `GET /api/reviews/issues` — keyword frequency from approved review text.
- `PATCH /api/reviews/:id/approve` — toggle approval.
- `GET /health`

Persistence: simple JSON file `db.json` (filesystem). Idempotent inserts by `sourceId`.

## Requirements
- Node 18+ recommended
- npm

## Setup & Run
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and update if you want to try the real Hostaway sandbox.
4. `npm run start`
   - Server runs on `http://localhost:4000` by default.

## Seed
Call: GET http://localhost:4000/api/reviews/hostaway

This fetches (or falls back to mock) and persists normalized reviews to `db.json`.

## Endpoints (Summary)
| Endpoint | Purpose | Key Query Params |
|----------|---------|------------------|
| GET /api/reviews/hostaway | Fetch & normalize + persist | — |
| GET /api/reviews | List reviews | listing, ratingMin, channel, from, to, approved, sort (rating_desc|rating_asc|date_desc|date_asc), page, pageSize |
| GET /api/reviews/categories-aggregate | Category averages | same filters (no sort, pagination) |
| GET /api/reviews/public | Approved feed | listing, page, pageSize |
| GET /api/reviews/issues | Keyword frequency | — |
| PATCH /api/reviews/:id/approve | Toggle approval | body { approved:boolean } |
| GET /health | Health probe | — |

Pagination defaults: `page=1`, `pageSize=50` (max 200).

