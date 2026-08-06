"use client";

export default function HeroBanner() {
  return (
    <section className="card relative min-h-[300px] overflow-hidden rounded-2xl">
      {/* Arka plan */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=85')",
        }}
      />

      {/* Koyu katman */}
      <div className="absolute inset-0 bg-[#050811]/65" />

      {/* Sol tarafta okunabilirlik */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#12080d] via-[#12080d]/90 to-transparent" />

      {/* Kırmızı vurgu */}
      <div className="absolute inset-0 bg-gradient-to-r from-plur-red/15 via-transparent to-cyan-400/10" />

      {/* Dekoratif şekiller */}
      <div className="absolute -right-16 -top-20 h-72 w-72 rotate-12 bg-plur-red/20 blur-3xl" />
      <div className="absolute bottom-0 right-20 h-40 w-40 bg-cyan-400/10 blur-3xl" />

      {/* İçerik */}
      <div className="relative z-10 flex min-h-[300px] max-w-2xl flex-col justify-center px-8 py-10 md:px-10">
        <span className="mb-4 w-fit rounded-full border border-plur-red/30 bg-plur-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-plur-red">
          Takım arkadaşını bul
        </span>

        <h1 className="font-rajdhani text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl">
          DOĞRU DUO.
          <br />
          <span className="text-plur-red">DAHA İYİ OYUN.</span>
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-6 text-plur-muted md:text-base">
          Valorant&apos;ta seninle aynı seviyede ve aynı hedefe sahip
          oyuncuları bul. Doğru duo ile iletişimini güçlendir, rank kas ve daha
          iyi oyna.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary rounded-lg px-6 py-3 text-sm font-semibold"
          >
            Duo Bul
          </button>

          <button
            type="button"
            className="btn-ghost rounded-lg border border-white/10 bg-black/30 px-6 py-3 text-sm font-semibold backdrop-blur-sm"
          >
            Nasıl Çalışır?
          </button>
        </div>

        <div className="mt-7 flex flex-wrap gap-5 text-xs text-plur-muted">
          <div>
            <span className="font-bold text-white">452+</span> çevrimiçi oyuncu
          </div>

          <div>
            <span className="font-bold text-white">1.200+</span> başarılı eşleşme
          </div>

          <div>
            <span className="font-bold text-white">4.9/5</span> oyuncu puanı
          </div>
        </div>
      </div>
    </section>
  );
}