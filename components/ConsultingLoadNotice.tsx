"use client";

import { useState } from "react";
import { X, Info } from "lucide-react";
import { CONSULTING_LOAD_NOTICE_LINES } from "@/lib/bookingAvailability";

export default function ConsultingLoadNotice() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consulting-load-notice-title"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[28vh] animate-[logo-transition-fade-in_0.3s_ease-out] md:pt-[32vh]"
    >
      <div
        className="portal-notice-in relative mx-4 flex w-full max-w-md flex-col justify-center rounded-lg border border-gray-200 bg-white px-6 py-8 text-center break-keep shadow-xl"
      >
        {/* 우측 상단 닫기 (X) 버튼 */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 cursor-pointer rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="알림 닫기"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 1. 시선 유도용 Info 아이콘 */}
        <Info className="mx-auto mb-4 h-12 w-12 text-slate-400" strokeWidth={1.5} />

        {/* 2. 텍스트 계층 분리 렌더링 */}
        <div id="consulting-load-notice-title" className="px-2">
          {CONSULTING_LOAD_NOTICE_LINES.length > 0 && (
            <p className="mb-3 text-lg font-bold text-gray-800">
              {/* 배열의 첫 번째 문구는 크고 진한 타이틀로 */}
              {CONSULTING_LOAD_NOTICE_LINES[0]}
            </p>
          )}
          
          {CONSULTING_LOAD_NOTICE_LINES.length > 1 && (
            <div className="text-sm font-medium leading-relaxed text-gray-500">
              {/* 배열의 나머지 문구들은 작고 연한 서브 텍스트로 */}
              {CONSULTING_LOAD_NOTICE_LINES.slice(1).map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. 명시적인 하단 확인 버튼 */}
        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex w-full justify-center rounded-md bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 sm:w-auto sm:px-12"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}