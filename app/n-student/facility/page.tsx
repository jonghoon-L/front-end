"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import PageHero from "@/components/PageHero";

const facilities = Array.from({ length: 9 }, (_, index) => ({
  name: `시설 ${index + 1}`,
  image: `/images/place/n/n_p${index + 1}.jpg`,
}));

const N = facilities.length;
const extendedSlides = [facilities[N - 1], ...facilities, facilities[0]];

export default function NStudentFacilityPage() {
  const [slideIndex, setSlideIndex] = useState(1);
  const [disableTransition, setDisableTransition] = useState(false);
  const currentFacility = facilities[((slideIndex - 1) % N + N) % N];

  const goPrev = () => setSlideIndex((prev) => prev - 1);
  const goNext = () => setSlideIndex((prev) => prev + 1);
  const goToIndex = (index: number) => setSlideIndex(index + 1);

  useEffect(() => {
    if (slideIndex === 0) {
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
  }, [slideIndex]);

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
            <p className="mt-16 text-2xl font-semibold tracking-tight md:text-3xl" style={{ letterSpacing: 0 }}>{currentFacility.name}</p>

            <div className="mt-10 flex max-w-[320px] flex-wrap items-center gap-x-4 gap-y-3 text-sm text-white/75">
              {facilities.map((facility, index) => {
                const isActive = slideIndex === index + 1;
                return (
                  <Fragment key={facility.name}>
                    <button
                      type="button"
                      onClick={() => goToIndex(index)}
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
                className="flex"
                style={{
                  transform: `translateX(-${slideIndex * 100}%)`,
                  transition: disableTransition ? "none" : "transform 500ms ease-in-out",
                }}
              >
                {extendedSlides.map((facility, index) => (
                  <div key={`${facility.image}-${index}`} className="relative min-w-full shrink-0 basis-full aspect-[16/10]">
                    <Image
                      src={facility.image}
                      alt={`로드맵 N수생 전용관 ${facility.name}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
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
