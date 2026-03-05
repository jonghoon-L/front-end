import Image from "next/image";
import { ChevronDown } from "lucide-react";
import HomeSections from "@/components/HomeSections";

export default function Home() {
  return (
    <main>
      {/* 히어로 영역 */}
      <section style={{
        height: '92vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 배경 이미지 (그레이스케일) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/images/place/n/n_p1.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 60%',
          filter: 'grayscale(100%)'
        }} />
        {/* 어두운 오버레이 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }} />

        {/* 텍스트 */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          paddingBottom: '12vh'
        }}>
          <h1
            style={{
              fontFamily: 'var(--font-pretendard)',
              fontSize: 'clamp(28px, 5vw, 48px)',
              lineHeight: 1.5,
              letterSpacing: '-0.02em',
            }}
          >
            <span className="font-normal" style={{ color: 'rgba(255,255,255,0.75)' }}>
              ROADMAP은
            </span>
            <br />
            <span className="font-bold" style={{ color: 'rgb(255,255,255)' }}>
              차별화된 관리로 변화를 만듭니다
            </span>
          </h1>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0 animate-bounce select-none">
          <ChevronDown className="w-12 h-12 text-white drop-shadow-md md:w-14 md:h-14" strokeWidth={2} />
        </div>
      </section>

      <HomeSections />
    </main>
  );
}
