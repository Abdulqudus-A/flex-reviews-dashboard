export type HostawayRaw = {
  status: string;
  result: HostawayReviewRaw[];
};

export type HostawayReviewRaw = {
  id: number;
  type: string;
  status: string;
  rating: number | null;
  publicReview: string | null;
  reviewCategory?: { category: string; rating: number }[];
  submittedAt: string; // e.g. "2020-08-21 22:45:14"
  guestName?: string;
  listingName?: string;
  channel?: string;
};

export type NormalizedReview = {
  id: string; // internal nanoid
  sourceId: number; // original hostaway id
  type: string;
  status: string;
  rating: number | null;
  categories: { category: string; rating: number }[];
  text: string | null;
  submittedAt: string; // ISO string
  guestName?: string;
  listingName?: string;
  channel?: string;
  approved?: boolean;
};
