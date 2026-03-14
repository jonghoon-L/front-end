"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const HEADER_HEIGHT = 88;
/** #location 섹션 pt-24(96px) - 타이틀 상단 여백을 숨기고 헤더 하단 직후에 회색 영역이 보이도록 */
const LOCATION_SECTION_TOP_PADDING = 96;

function scrollToHash() {
  const hash = window.location.hash?.slice(1);
  if (!hash) return;
  const el = document.getElementById(hash);
  if (!el) return;

  if (hash === "location") {
    const rect = el.getBoundingClientRect();
    /** '로드맵 오시는 길' 제목이 화면 위로 숨겨지도록 약간 위로 스크롤 */
    const TITLE_OFFSET = 110;
    const targetY = window.scrollY + rect.top - HEADER_HEIGHT + LOCATION_SECTION_TOP_PADDING - TITLE_OFFSET;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/** URL 해시(#location 등)가 있으면 해당 요소로 부드럽게 스크롤 */
export default function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    scrollToHash();
  }, [pathname]);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return null;
}
