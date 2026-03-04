"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import PageHero from "@/components/PageHero";

const facilities = Array.from({ length: 9 }, (_, index) => ({
  name: `시설 ${index + 1}`,
  image: `/images/place/n/n_p${index + 1}.jpg`,
}));

export default function High2High3FacilityPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentFacility = facilities[currentIndex];

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + facilities.length) % facilities.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % facilities.length);
  };

  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p7.jpg"
        lines={["로드맵 고2.고3 전용관", "시설 둘러보기"]}
        crumbs={[
          { label: "로드맵 고2.고3 전용관" },
          { label: "시설 사진", href: "/high2-high3/facility" },
        ]}
      />

      <section className="bg-emerald-950 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:items-center">
          <div className="text-white">
            <p className="text-4xl font-bold leading-tight md:text-5xl">시설 둘러보기</p>
            <p className="mt-8 text-3xl font-extrabold md:text-4xl">{currentFacility.name}</p>

            <div className="mt-6 flex max-w-[320px] flex-wrap items-center gap-x-4 gap-y-3 text-sm text-white/75">
              {facilities.map((facility, index) => {
                const isActive = currentIndex === index;
                return (
                  <Fragment key={facility.name}>
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={[
                        "border-b border-transparent pb-0.5 transition",
                        isActive
                          ? "font-semibold text-white border-white"
                          : "hover:text-white",
                      ].join(" ")}
                      aria-label={`${facility.name} 사진 보기`}
                    >
                      {facility.name}
                    </button>
                    {index < facilities.length - 1 && <span aria-hidden="true">|</span>}
                  </Fragment>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {facilities.map((facility, index) => (
                  <div key={facility.image} className="w-full shrink-0">
                    <Image
                      src={facility.image}
                      alt={`로드맵 고2.고3 전용관 ${facility.name}`}
                      width={1600}
                      height={1000}
                      className="h-auto w-full object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/75 px-4 py-5 text-3xl leading-none text-white transition hover:bg-black"
              aria-label="이전 시설 사진"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/75 px-4 py-5 text-3xl leading-none text-white transition hover:bg-black"
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
