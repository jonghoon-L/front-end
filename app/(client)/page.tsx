import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* 히어로 영역 */}
      <section className="-mt-16" style={{
        height: '100vh',
        backgroundImage: "url('/images/main.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
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
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1
            className="-mt-16"
            style={{
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

        <div className="absolute bottom-30 left-1/2 -translate-x-1/2 animate-bounce text-white text-3xl select-none">
        ∨
        </div>
      </section>
    </main>
  );
}
