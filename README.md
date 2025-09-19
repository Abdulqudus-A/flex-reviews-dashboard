# Flex Living Reviews Dashboard

Monorepo-style project containing a lightweight backend API (Express + TypeScript) and a modern React (Vite + TS + MUI) frontend for managing and curating property guest reviews.

## Contents
```
app/
  backend/      # Express + TypeScript API (reviews, normalization, aggregation)
  frontend/     # React + Vite dashboard + property pages
docs/           # Detailed product & exploration docs
  REVIEW_DASHBOARD.md
  GOOGLE_REVIEWS_EXPLORATION.md
```

## Key Features
- Hostaway reviews ingest (mock fallback) + normalization
- Dashboard: filtering, sorting, pagination, approval workflow, rating trend
- Category aggregation & keyword (issue) extraction
- Public/approved feed endpoint for embedding
- Property page with tabs (overview, approved, public embed, analytics, manager tools)

## Quick Start
### Prerequisites
- Node 18+ (see `.nvmrc`)
- npm

### Backend
```bash
cd app/backend
npm install
cp .env.example .env   # optional: provide HOSTAWAY_* vars
npm run start          # starts on http://localhost:4000
```

### Frontend
```bash
cd app/frontend
npm install
# (Optional) echo "VITE_API_URL=http://localhost:4000" > .env
npm run dev            # opens (usually) http://localhost:5173
```

## Environment Variables (Backend)
| Variable | Purpose | Default |
|----------|---------|---------|
| PORT | API port | 4000 |
| HOSTAWAY_ACCOUNT_ID | Sandbox account id | 61148 |
| HOSTAWAY_API_KEY | Sandbox api key | (example provided) |

> Sandbox usually returns no live reviews; mock dataset seeds automatically.

## Core Endpoints (Summary)
| Endpoint | Description |
|----------|-------------|
| GET /api/reviews/hostaway | Fetch + normalize + persist (mock fallback) |
| GET /api/reviews | Filter, sort, paginate; aggregations included |
| GET /api/reviews/categories-aggregate | Per-listing category averages |
| GET /api/reviews/public | Approved-only lightweight feed |
| GET /api/reviews/issues | Keyword frequency (top terms) |
| PATCH /api/reviews/:id/approve | Toggle approval |

For full response schemas see `docs/REVIEW_DASHBOARD.md`.

## Normalized Review Shape
```ts
interface NormalizedReview {
  id: string;
  sourceId: number;
  type: string;
  status: string;
  rating: number | null;          // computed from categories if null
  categories: { category: string; rating: number }[];
  text: string | null;
  submittedAt: string;            // ISO
  guestName?: string;
  listingName?: string;
  channel?: string;               // defaults 'hostaway'
  approved: boolean;              // default false
}
```

## Submission / Review Checklist
- [x] Normalization logic with fallback rating
- [x] Hostaway ingest route implemented
- [x] Filtering: listing, channel, ratingMin, date range, approved
- [x] Sorting & pagination
- [x] Category aggregation + keyword issues
- [x] Public feed endpoint
- [x] Documentation (tech, endpoints, exploration)
- [ ] Automated tests (future enhancement)
- [ ] Auth / RBAC (not required for MVP)

## Development Notes
- Data persisted in `app/backend/db.json`. Safe to delete to force reseed.
- Rating scale assumed 0–10 based on category samples; adapt if upstream changes.
- Keyword extraction is heuristic (stop word filtered frequency), not sentiment.

## Build / Production

### Local (Node only)
Backend (TypeScript -> JS):
```bash
cd app/backend
npm run build     # emits dist/
node dist/server.js
```

Frontend (Vite production bundle):
```bash
cd app/frontend
npm run build     # emits dist/
npx serve dist    # or any static host (configure VITE_API_URL at build time)
```

### Docker (individual)
Backend:
```bash
docker build -t flex-backend ./app/backend
docker run -p 4000:4000 --env-file app/backend/.env flex-backend
```
Frontend:
```bash
docker build -t flex-frontend ./app/frontend
docker run -p 5173:80 -e VITE_API_URL=http://localhost:4000 flex-frontend
```

### Docker Compose (combined)
```bash
docker compose build
docker compose up
# Backend: http://localhost:4000
# Frontend: http://localhost:5173
```

### Environment Overrides
Set `HOSTAWAY_ACCOUNT_ID` / `HOSTAWAY_API_KEY` before container start or in `.env` (backend). Frontend `VITE_API_URL` must point to backend base URL at build time for static deployments.

## Future Enhancements
See `docs/REVIEW_DASHBOARD.md` (Future Enhancements section).

---
MIT or internal use (license not specified).
