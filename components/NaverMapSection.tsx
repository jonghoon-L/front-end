"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Phone } from "lucide-react";

/** 용인 골드프라자 좌표 - 랜드마크 기반 상가 건물 정중앙 */
const MAP_CENTER = { lat: 37.27785, lng: 127.15380 };
const HIGH23_COORDS = { lat: 37.27805, lng: 127.15340 }; // 고2·고3 전용관 (A동) - 써브웨이 좌측 상단 건물
const NSU_COORDS = { lat: 37.27765, lng: 127.15410 }; // N수관 (B동) - 우리은행 우측 상단 건물

const NSU_INFO = {
  label: "N수생 전용관 (B동)",
  address: "경기도 용인시 기흥구 동백중앙로 283 골드프라자 B동 10층",
  phone: "TEL 070-4833-5678",
};

const HIGH23_INFO = {
  label: "고2·고3 전용관 (A동)",
  address: "경기도 용인시 기흥구 동백중앙로 283 골드프라자 A동 6층",
  phone: "TEL 031-281-5678",
};

/** 세련된 핀 형태 마커 HTML (fill 색상으로 구분) */
const PIN_SVG =
  '<path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="{FILL}" stroke="white" stroke-width="1.5" style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.25));"/><circle cx="12" cy="9" r="3" fill="white"/>';

const BOUNCE_STYLE =
  '<style>@keyframes marker-pin-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}.marker-pin-bounce{animation:marker-pin-bounce 1.5s ease-in-out infinite}</style>';

function createPinMarkerHtml(label: string, fillColor: string, includeStyle = false) {
  const svgContent = PIN_SVG.replace("{FILL}", fillColor);
  return `<div style="display:flex;flex-direction:column;align-items:center;width:140px;pointer-events:none">${includeStyle ? BOUNCE_STYLE : ""}
<div class="marker-pin-bounce"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg></div>
<div style="margin-top:4px;background:#fff;color:#333;padding:4px 10px;border-radius:8px;font-weight:800;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid #eee;white-space:nowrap">${label}</div>
</div>`;
}

function NaverMapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markerRefsRef = useRef<naver.maps.Marker[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    if (!clientId) {
      setLoadError("네이버 지도 API 키가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_NAVER_CLIENT_ID를 설정해 주세요.");
      return;
    }

    if (typeof window === "undefined" || !mapRef.current) return;

    const scriptId = "naver-maps-script";

    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function injectMarkerBounceStyle() {
      if (document.getElementById("naver-marker-bounce-style")) return;
      const style = document.createElement("style");
      style.id = "naver-marker-bounce-style";
      style.textContent = `@keyframes marker-pin-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}.marker-pin-bounce{animation:marker-pin-bounce 1.5s ease-in-out infinite;animation-delay:0ms}`;
      document.head.appendChild(style);
    }

    function initMap() {
      if (mapInstanceRef.current || !mounted) return;
      if (!window.naver?.maps || !mapRef.current) return;

      injectMarkerBounceStyle();

      const map = new naver.maps.Map(mapRef.current, {
        center: new naver.maps.LatLng(MAP_CENTER.lat, MAP_CENTER.lng),
        zoom: 18,
        scrollWheel: true,
        draggable: true,
        zoomControl: false,
      });
      mapInstanceRef.current = map;

      // 마커 기준점: 핀 하단 뾰족한 끝이 LatLng에 고정 (고정 width 140px → x=70, pin tip viewBox y=22→36px에서 y≈33)
      const ANCHOR = new naver.maps.Point(70, 33);

      const marker1 = new naver.maps.Marker({
        position: new naver.maps.LatLng(HIGH23_COORDS.lat, HIGH23_COORDS.lng),
        map,
        icon: {
          content: createPinMarkerHtml(HIGH23_INFO.label, "#f87171", true), // 옅은 빨간색 + 스타일(iframe 대비)
          anchor: ANCHOR,
        },
      });

      const marker2 = new naver.maps.Marker({
        position: new naver.maps.LatLng(NSU_COORDS.lat, NSU_COORDS.lng),
        map,
        icon: {
          content: createPinMarkerHtml(NSU_INFO.label, "#60a5fa"), // 옅은 파란색
          anchor: ANCHOR,
        },
      });

      markerRefsRef.current = [marker1, marker2];
    }

    if (window.naver?.maps) {
      initMap();
    } else if (document.getElementById(scriptId)) {
      intervalId = setInterval(() => {
        if (window.naver?.maps) {
          if (intervalId) clearInterval(intervalId);
          intervalId = null;
          initMap();
        }
      }, 100);
    } else {
      window.navermap_authFailure = () => {
        setLoadError("네이버 지도 API 인증에 실패했습니다. Client ID를 확인해 주세요.");
      };
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
      script.async = true;
      script.onload = initMap;
      script.onerror = () => setLoadError("네이버 지도 스크립트를 불러오는 데 실패했습니다.");
      document.head.appendChild(script);
    }

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
      markerRefsRef.current.forEach((m) => m.setMap(null));
      markerRefsRef.current = [];
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as unknown as { destroy?: () => void }).destroy?.();
        mapInstanceRef.current = null;
      }
      const scriptEl = document.getElementById(scriptId);
      if (scriptEl) scriptEl.remove();
      const styleEl = document.getElementById("naver-marker-bounce-style");
      if (styleEl) styleEl.remove();
    };
  }, []);

  return (
    <section id="location" className="bg-[#ebecee] pt-12 pb-32 md:pt-16 md:pb-40">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-24 text-center text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
          로드맵 오시는 길
        </h2>

        {/* 단일 지도 영역 */}
        <div
          className="relative mx-auto overflow-hidden rounded-none shadow-lg"
          style={{ height: "560px", maxWidth: "1152px" }}
        >
          {loadError ? (
            <div
              className="flex h-full items-center justify-center bg-gray-200 text-center text-gray-600"
              style={{ minHeight: "560px" }}
            >
              <p className="px-4">{loadError}</p>
            </div>
          ) : (
            <div
              ref={mapRef}
              id="roadmap-naver-map"
              className="h-full w-full"
              role="img"
              aria-label="로드맵 N수생 전용관 및 고2·고3 전용관 위치 지도"
            />
          )}
        </div>

        {/* 하단 상세 정보 2단 레이아웃 */}
        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-12">
          {/* 고2·고3 전용관 (왼쪽) */}
          <div className="rounded-xl bg-white p-8 shadow-md">
            <h3 className="mb-6 text-xl font-bold text-gray-900">고2·고3 전용관(하이엔드관)</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-rose-400" />
                <span className="text-gray-700">{HIGH23_INFO.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-rose-400" />
                <span className="font-bold text-gray-900">{HIGH23_INFO.phone}</span>
              </div>
            </div>
          </div>

          {/* N수생 전용관 (오른쪽) */}
          <div className="rounded-xl bg-white p-8 shadow-md">
            <h3 className="mb-6 text-xl font-bold text-gray-900">N수생 전용관</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-blue-400" />
                <span className="text-gray-700">{NSU_INFO.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-blue-400" />
                <span className="font-bold text-gray-900">{NSU_INFO.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NaverMapSection;
