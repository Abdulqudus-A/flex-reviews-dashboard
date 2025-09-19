import apiClient from "./client";
import { Review } from "../types";

export interface ReviewsResponse {
  status: string;
  total: number;
  items: Review[];
  aggregations: { listing: string; avgRating: number; count: number }[];
}

export async function fetchReviews(params: Record<string, any> = {}): Promise<ReviewsResponse> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") search.append(k, String(v));
  }
  const res = await apiClient.get(`/api/reviews${search.toString() ? `?${search.toString()}` : ""}`);
  return res.data;
}

export async function syncHostaway(): Promise<{ added: number }> {
  const res = await apiClient.get("/api/reviews/hostaway");
  return { added: res.data.added };
}

export async function fetchCategoryAggregates(params: Record<string, any> = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") search.append(k, String(v));
  }
  const res = await apiClient.get(`/api/reviews/categories-aggregate${search.toString() ? `?${search.toString()}` : ""}`);
  return res.data;
}

export async function fetchPublicApproved(params: Record<string, any> = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") search.append(k, String(v));
  }
  const res = await apiClient.get(`/api/reviews/public${search.toString() ? `?${search.toString()}` : ""}`);
  return res.data;
}

export async function approveReview(id: string, approved: boolean) {
  const res = await apiClient.patch(`/api/reviews/${id}/approve`, { approved });
  return res.data.item as Review;
}

