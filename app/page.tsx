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
          <p style={{ fontSize: 40 }}>
            독학재수전문 수능선배는
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 'bold', marginTop: 16 }}>
            성공 노하우를<br />
            전수하기 위해 존재합니다
          </h1>
        </div>

        <div className="absolute bottom-30 left-1/2 -translate-x-1/2 animate-bounce text-white text-3xl select-none">
        ∨
        </div>
      </section>
    </main>
  );
}
