"use client";

import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      style={{
        height: "calc(100vh - 80px)",
        minHeight: "calc(100vh - 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 배경 이미지 (그레이스케일) - 사르르 등장 */}
      <div
        className="hero-bg"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/images/place/hi/hi_p13.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 75%",
          filter: "grayscale(100%)",
        }}
      />
      {/* 어두운 오버레이 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }}
      />

      {/* 텍스트 - 사르르 등장 */}
      <div
        className="hero-text"
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          paddingBottom: "12vh",
          marginTop: "30px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-pretendard)",
            fontSize: "clamp(28px, 5vw, 48px)",
            lineHeight: 1.5,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 300 }}>
            ROADMAP은
          </span>
          <br />
          <span className="font-bold" style={{ color: "rgb(255,255,255)" }}>
            차별화된 관리로 변화를 만듭니다
          </span>
        </h1>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
        <div className="hero-chevron select-none">
          <ChevronDown
            className="w-12 h-12 text-white drop-shadow-md md:w-14 md:h-14"
            strokeWidth={2}
          />
        </div>
      </div>
    </section>
  );
}
