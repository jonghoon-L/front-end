import { apiGet } from "@/api/apiClient";

export interface AdminReviewListItem {
  reviewId: number;
  title: string;
  authorName: string;
  createdAt: string;
  isApproved: boolean;
  isBest: boolean;
}

export interface AdminReviewsResponse {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  reviews: AdminReviewListItem[];
}

/** GET /v1/admin/reviews/{reviewId} 응답 */
export interface AdminReviewDetail {
  reviewId: number;
  title: string;
  content: string;
  authorName: string;
  imageUrls: string[];
  viewCount: number;
  isApproved: boolean;
  isBest: boolean;
  createdAt: string;
}

/**
 * GET /v1/admin/reviews?page={page}
 */
export async function fetchAdminReviews(
  page: number
): Promise<AdminReviewsResponse> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  return apiGet<AdminReviewsResponse>(`/v1/admin/reviews?${qs.toString()}`, {
    useRelativePath: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * GET /v1/admin/reviews/{reviewId}
 */
export async function fetchAdminReviewDetail(
  reviewId: number
): Promise<AdminReviewDetail> {
  return apiGet<AdminReviewDetail>(`/v1/admin/reviews/${reviewId}`, {
    useRelativePath: true,
  });
}
