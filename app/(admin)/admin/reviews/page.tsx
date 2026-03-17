"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Star, X, MessageSquare } from "lucide-react";
import { reviewPosts } from "@/app/board/reviews/data";

type ReviewItem = {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
  isExcellent: boolean;
  imageUrls?: string[];
};

const DUMMY_REVIEWS: ReviewItem[] = reviewPosts
  .map((post) => ({
    id: post.id,
    title: post.title,
    author: post.author,
    content: post.content.join("\n\n"),
    createdAt: post.createdAt,
    isApproved: true,
    isExcellent: !!post.isTop,
    imageUrls: post.imageUrls,
  }))
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked ? "bg-blue-600" : "bg-slate-200"}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block mt-0.5 h-5 w-5 transform rounded-full bg-white shadow
          transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0.5"}
        `}
      />
    </button>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(DUMMY_REVIEWS);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastExiting, setToastExiting] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastExiting(false);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastExiting(true);
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null);
        setToastExiting(false);
        toastTimeoutRef.current = null;
      }, 700);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handleTitleClick = (review: ReviewItem) => {
    setSelectedReview(review);
  };

  const handleApprovalToggle = (id: number) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isApproved: !r.isApproved } : r
      )
    );
    const nextState = reviews.find((r) => r.id === id)?.isApproved ? false : true;
    console.log(`[API 호출] PATCH /reviews/${id} - 승인 상태: ${nextState ? "승인됨" : "미승인"}`);
    showToast(nextState ? "✅ 후기가 승인되었습니다." : "✅ 후기가 해제되었습니다.");
  };

  const handleExcellentToggle = (id: number) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isExcellent: !r.isExcellent } : r
      )
    );
    const nextState = reviews.find((r) => r.id === id)?.isExcellent ? false : true;
    console.log(`[API 호출] PATCH /reviews/${id} - 우수 후기: ${nextState ? "설정" : "해제"}`);
    showToast(nextState ? "✅ 우수 후기가 지정되었습니다." : "✅ 우수 후기가 해제되었습니다.");
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <MessageSquare className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">이용 후기 관리</h1>
        </div>
        <p className="mt-2 text-slate-600">
          고객이 작성한 이용 후기를 검토하고 승인·우수 후기 지정을 관리합니다.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                번호
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                제목
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                작성자
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                작성일
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                승인 여부
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                우수 후기
              </th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review, index) => (
              <tr
                key={review.id}
                className="border-b border-slate-100 last:border-0 transition-colors hover:bg-gray-50"
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleTitleClick(review)}
                    className="cursor-pointer text-left text-sm text-slate-800 hover:underline"
                  >
                    {review.title}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {review.author}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {review.createdAt}
                </td>
                <td className="px-6 py-4">
                  <ToggleSwitch
                    checked={review.isApproved}
                    onChange={() => handleApprovalToggle(review.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleExcellentToggle(review.id)}
                    className="cursor-pointer p-1 transition-transform hover:scale-110"
                    aria-label={review.isExcellent ? "우수 후기 해제" : "우수 후기 지정"}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        review.isExcellent
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[logo-transition-fade-in_0.25s_ease-out]"
          onClick={() => setSelectedReview(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <div
            className="flex mx-4 w-full max-w-2xl max-h-[85vh] flex-col overflow-hidden rounded-xl bg-white shadow-xl animate-[confirm-modal-appear_0.6s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: fixed */}
            <div className="shrink-0 border-b border-slate-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="review-modal-title"
                    className="text-xl font-bold text-slate-800"
                  >
                    {selectedReview.title}
                  </h2>
                  <div className="mt-2 flex gap-4 pl-2 text-sm text-slate-500">
                    <span>{selectedReview.author}</span>
                    <span>{selectedReview.createdAt}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="닫기"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body: scrollable */}
            <div className="min-h-0 flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-6 text-slate-700 leading-relaxed">
                {selectedReview.content}
                {selectedReview.imageUrls?.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`후기 이미지 ${i + 1}`}
                    className="mt-4 max-w-full h-auto rounded-lg mb-4"
                  />
                ))}
              </div>
            </div>

            {/* Footer: fixed */}
            <div className="shrink-0 flex justify-end border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {(toastMessage || toastExiting) && (
        <div
          className={`fixed bottom-5 right-5 z-[60] rounded-lg bg-slate-800 px-5 py-3.5 text-sm font-medium text-white shadow-lg ${
            toastExiting
              ? "translate-x-4 opacity-0 pointer-events-none transition-all duration-700 ease-out"
              : "animate-[toast-slide-in_0.5s_ease-out]"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
