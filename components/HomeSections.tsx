"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import NaverMapSection from "@/components/NaverMapSection";
const N_FACILITIES = Array.from({ length: 6 }, (_, i) => ({
  name: `N수관 시설 ${i + 1}`,
  image: `/images/place/n/n_p${i + 1}.jpg`,
}));

const H_FACILITIES = Array.from({ length: 4 }, (_, i) => ({
  name: `하이엔드관 시설 ${i + 1}`,
  image: `/images/place/n/n_p${i + 6}.jpg`,
}));

const DIFF_CARDS = [
  {
    title: "실시간 밀착 관리",
    desc: "20분·30분 단위 순찰이 아닌, 학업 전 과정을 초 단위로 실시간 관리합니다.",
    icon: "/images/icon-care.png",
  },
  {
    title: "체계적인 데이터 관리",
    desc: "출결사항 및 의무학습 내 관리 내역들을 데이터화하며, 주간 학습 리포트로 정리하여 매주 월요일에 제공합니다.",
    icon: "/images/icon-data.png",
  },
  {
    title: "1:1 맞춤 케어",
    desc: "ROADMAP 학습 컨설팅 전문 선생님과 학업, 입시, 멘탈 관련 1:1 학업 상담을 경험할 수 있습니다.",
    icon: "/images/icon-consult.png",
  },
];

function useFadeIn(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

const SLIDER_INTERVAL_MS = 3000;

function FadeSlider({ facilities, initialDelayMs = 0 }: { facilities: { name: string; image: string }[]; initialDelayMs?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      setCurrentIndex((p) => (p + 1) % facilities.length);
      intervalId = setInterval(() => {
        setCurrentIndex((p) => (p + 1) % facilities.length);
      }, SLIDER_INTERVAL_MS);
    }, initialDelayMs);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [facilities.length, initialDelayMs]);

  return (
    <div className="relative aspect-[16/10] min-h-[200px] overflow-hidden rounded-xl shadow-lg">
      {facilities.map((f, i) => (
        <div
          key={f.image}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === currentIndex ? 1 : 0.001,
            zIndex: i === currentIndex ? 2 : 1,
          }}
          aria-hidden={i !== currentIndex}
        >
          <Image src={f.image} alt={f.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 60vw" />
        </div>
      ))}
    </div>
  );
}

export default function HomeSections() {
  const s1 = useFadeIn(0.15);
  const s2 = useFadeIn(0.1);
  const s3 = useFadeIn(0.1);
  const s4 = useFadeIn(0.1);

  return (
    <>
      {/* Section 1: 명예의 전당 - 배경 고정, 제목과 이미지만 모션 */}
      <section ref={s1.ref} className="pt-16 pb-28 md:pt-20 md:pb-32" style={{ backgroundColor: "#0a1e32", marginTop: 0 }}>
        <div className={`mx-auto max-w-6xl px-6 transition-all duration-700 ${s1.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="mb-12 text-center text-4xl font-bold text-white md:text-5xl">
            <span className="block">ROADMAP은</span>
            <span className="block">실적으로 증명합니다</span>
          </h2>
          <div className="mx-auto flex max-w-4xl justify-center">
            <Image
              src="/images/chart.jpg"
              alt="명예의 전당"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Section 2: 차별화 포인트 */}
      <section ref={s2.ref} className={`bg-[#ebecee] py-24 md:py-32 transition-all duration-700 ${s2.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-16 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl">
            <span className="block">일반 관리형 독서실과</span>
            <span className="block mt-2">이런 점이 다릅니다</span>
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {DIFF_CARDS.map((card, i) => (
              <div
                key={i}
                className="rounded-2xl border border-emerald-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400 hover:shadow-xl"
              >
                <Image
                  src={card.icon}
                  alt={card.title}
                  width={160}
                  height={160}
                  className="mx-auto mb-8 h-32 w-32 object-contain md:h-40 md:w-40"
                />
                <h3 className="mb-4 text-center text-xl font-bold text-emerald-700">{card.title}</h3>
                <p className="text-center text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: 관별 시설 소개 (지그재그 레이아웃, Full Bleed 배경) */}
      <section ref={s3.ref} className={`overflow-hidden bg-white py-24 pb-40 md:py-32 md:pb-44 transition-all duration-700 ${s3.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-28 text-center text-3xl font-bold leading-tight text-gray-900 md:mb-32 md:text-4xl lg:text-5xl">
            <span className="block">학생의 유형에 따라</span>
            <span className="mt-2 block">2개의 관에서 최적의 학습을 할 수 있습니다</span>
          </h2>
        </div>

        {/* 콘텐츠 중앙 래퍼 (max-w-6xl mx-auto) */}
        <div className="mx-auto max-w-6xl px-6">
          {/* Row 1: N수관 - Full Bleed 파랑/보라 배경 (왼쪽 화면 끝까지) */}
          <div className="relative mb-16 py-8 md:mb-20 md:py-10">
            <div
              className="absolute inset-y-0 right-0 -z-10 hidden rounded-r-full bg-indigo-50 md:block"
              style={{ left: "calc(-50vw + 50%)" }}
              aria-hidden
            />
            <div className="relative flex flex-col gap-12 md:flex-row md:items-center md:gap-12 md:pr-16">
              <div className="min-w-0 flex-[3]">
                <FadeSlider facilities={N_FACILITIES} />
              </div>
              <div className="flex flex-[2] flex-col justify-center md:pl-6 md:pr-4">
                <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">N수생 전용관</h3>
                <p className="mt-3 text-base text-gray-700 md:text-lg">N수생들을 위한 공간입니다</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">3월 오픈부터 수능 전날까지 변동 없이 운영되며, 08:30부터 21:50까지 의무학습으로 진행됩니다</p>
              </div>
            </div>
          </div>

          {/* Row 2: 고2·고3 전용관 - Full Bleed 로즈/빨강 배경 (오른쪽 화면 끝까지) */}
          <div className="relative py-8 md:py-10">
            <div
              className="absolute inset-y-0 left-0 -z-10 hidden rounded-l-full bg-rose-50 md:block"
              style={{ right: "calc(-50vw + 50%)" }}
              aria-hidden
            />
            <div className="relative flex flex-col gap-12 md:flex-row md:items-center md:gap-12 md:pl-16">
              <div className="order-2 flex flex-[2] flex-col justify-center md:order-1 md:pl-4 md:pr-6">
                <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">고2·고3 전용관</h3>
                <p className="mt-3 text-base text-gray-700 md:text-lg">고2·고3 현역 학생들을 위한 공간입니다</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">학기 중에는 하교 시간에 맞춰 16시부터 1시까지 운영되며, 방학기간에는 09:30부터 21:50까지 의무학습으로 진행됩니다.</p>
              </div>
              <div className="order-1 min-w-0 flex-[3] md:order-2">
                <FadeSlider facilities={H_FACILITIES} initialDelayMs={SLIDER_INTERVAL_MS / 2} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 오시는 길 (네이버 지도 단일 레이아웃) */}
      <div ref={s4.ref} className={`transition-all duration-700 ${s4.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <NaverMapSection />
      </div>
    </>
  );
}
