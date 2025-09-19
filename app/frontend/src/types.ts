export interface ReviewCategory {
  category: string;
  rating: number;
}

// Normalized review structure aligned with backend
export interface Review {
  id: string;           // internal id
  sourceId: number;     // original source id
  type: string;
  status: string;       // published, etc.
  rating: number | null;
  categories: ReviewCategory[]; // from backend 'categories'
  text: string | null;
  submittedAt: string;  // ISO
  guestName?: string;
  listingName?: string;
  channel?: string;
  approved?: boolean;
}

