"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import PageHero from "@/components/PageHero";

const SECTIONS = [
  {
    name: "열람실 1",
    description: "답답함이 1%도 허용되지 않는 넓은 공간에서\n쾌적하게 학습할 수 있습니다",
    items: [
      { image: "/images/place/n/n_p2.jpg", label: "열람실 1 전경" },
      { image: "/images/place/n/n_p19.jpg", label: "열람실 1 중앙 뷰" },
      { image: "/images/place/n/n_p20.jpg", label: "열람실 1 전면 뷰" },
      { image: "/images/place/n/n_p18.jpg", label: "열람실 1 후면 뷰" },
      { image: "/images/place/n/n_p17.jpg", label: "열람실 1 측면 뷰" },
    ],
  },
  {
    name: "열람실 2",
    description: "소음과 방해 요소를 완벽히 차단한 공간에서\n목표에 집중할 수 있습니다",
    items: [
      { image: "/images/place/n/n_p3.jpg", label: "열람실 2 전경" },
      { image: "/images/place/n/n_p12.jpg", label: "열람실 2 측면 뷰" },
    ],
  },
  {
    name: "로비",
    description: "리프레시를 위한 야외 스탠드석이 제공되며\n라운지 및 휴게 공간에서 휴식을 취할 수 있습니다",
    items: [
      { image: "/images/place/n/n_p10.jpg", label: "로비 전경" },
      { image: "/images/place/n/n_p5.jpg", label: "로비 야외 스탠드 석" },
      { image: "/images/place/n/n_p15.jpg", label: "로비 휴게 공간" },
      { image: "/images/place/n/n_p14.jpg", label: "로비 라운지" },
    ],
  },
];

export default function NStudentFacilityPage() {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [displaySectionIndex, setDisplaySectionIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(1);
  const [disableTransition, setDisableTransition] = useState(false);
  const [sliderOpacity, setSliderOpacity] = useState(1);
  const pendingSectionRef = useRef<number | null>(null);

  const displayedSection = SECTIONS[displaySectionIndex];
  const items = displayedSection.items;
  const N = items.length;
  const extendedSlides = [items[N - 1], ...items, items[0]];
  const isTransitioning = pendingSectionRef.current !== null;

  const goPrev = () => setSlideIndex((prev) => prev - 1);
  const goNext = () => setSlideIndex((prev) => prev + 1);

  const goToSection = (index: number) => {
    if (index === sectionIndex) return;
    setSectionIndex(index);
    pendingSectionRef.current = index;
    setSliderOpacity(0);
  };

  useEffect(() => {
    if (sliderOpacity === 0 && pendingSectionRef.current !== null) {
      const targetIndex = pendingSectionRef.current;
      const t = setTimeout(() => {
        setDisplaySectionIndex(targetIndex);
        setSlideIndex(1);
        setDisableTransition(true);
        pendingSectionRef.current = null;
        setSliderOpacity(1);
        requestAnimationFrame(() => requestAnimationFrame(() => setDisableTransition(false)));
      }, 350);
      return () => clearTimeout(t);
    }
  }, [sliderOpacity]);

  const currentItem = isTransitioning
    ? SECTIONS[sectionIndex].items[0]
    : items[((slideIndex - 1) % N + N) % N];

  useEffect(() => {
    if (slideIndex === 0 && !disableTransition) {
      const t = setTimeout(() => {
        setDisableTransition(true);
        setSlideIndex(N);
        requestAnimationFrame(() => requestAnimationFrame(() => setDisableTransition(false)));
      }, 520);
      return () => clearTimeout(t);
    } else if (slideIndex === extendedSlides.length - 1) {
      const t = setTimeout(() => {
        setDisableTransition(true);
        setSlideIndex(1);
        requestAnimationFrame(() => requestAnimationFrame(() => setDisableTransition(false)));
      }, 520);
      return () => clearTimeout(t);
    }
  }, [slideIndex, N, extendedSlides.length]);

  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p7.jpg"
        lines={["로드맵 N수생 전용관", "시설 둘러보기"]}
        heroStyle={{ backgroundPosition: "center 60%" }}
        crumbs={[
          { label: "로드맵 N수생 전용관" },
          { label: "시설 사진", href: "/n-student/facility" },
        ]}
      />

      <section className="bg-emerald-950 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:items-center">
            <div className="flex flex-col items-start text-left text-white">
              <div className="-mt-12 md:-mt-16">
                <p className="text-xl font-medium tracking-tight text-white/90 md:text-2xl" style={{ letterSpacing: 0 }}>N수관</p>
                <p className="mt-2 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl" style={{ letterSpacing: 0 }}>시설 둘러보기</p>
              </div>
              <p className="mt-16 text-2xl font-semibold tracking-tight md:text-3xl" style={{ letterSpacing: 0 }}>
                {currentItem.label}
              </p>

              <p
                className="mt-4 max-w-[320px] text-sm leading-relaxed text-white/80 md:text-base"
                style={{ whiteSpace: "pre-line" }}
              >
                {SECTIONS[sectionIndex].description}
              </p>

              <div
                className="mt-4 flex max-w-[320px] flex-wrap items-center gap-x-4 gap-y-3 text-sm text-white/75 md:text-base"
                style={{ transform: "translateY(2rem)" }}
              >
                {SECTIONS.map((section, index) => {
                  const isActive = sectionIndex === index;
                  return (
                    <Fragment key={section.name}>
                      <button
                        type="button"
                        onClick={() => goToSection(index)}
                        className={[
                          "cursor-pointer border-b border-transparent pb-0.5 transition",
                          isActive ? "font-semibold text-white border-white" : "hover:text-white",
                        ].join(" ")}
                        aria-label={`${section.name} 사진 보기`}
                      >
                        {section.name}
                      </button>
                      {index < SECTIONS.length - 1 && <span aria-hidden="true">|</span>}
                    </Fragment>
                  );
                })}
              </div>
            </div>

            <div
              className="relative"
              style={{
                opacity: sliderOpacity,
                transition: "opacity 300ms ease-out",
              }}
            >
              <div className="overflow-hidden">
                <div
                  className="flex"
                  style={{
                    transform: `translateX(-${slideIndex * 100}%)`,
                    transition: disableTransition ? "none" : "transform 500ms ease-in-out",
                  }}
                >
                  {extendedSlides.map((item, index) => (
                    <div key={`${item.image}-${index}`} className="relative min-w-full shrink-0 basis-full aspect-[16/10]">
                      <Image
                        src={item.image}
                        alt={`로드맵 N수생 전용관 ${item.label}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                        priority={index <= 1}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={goPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer bg-black/75 px-4 py-5 text-3xl leading-none text-white transition hover:bg-black"
                aria-label="이전 시설 사진"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer bg-black/75 px-4 py-5 text-3xl leading-none text-white transition hover:bg-black"
                aria-label="다음 시설 사진"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
