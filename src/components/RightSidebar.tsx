"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Crown,
  Gamepad2,
  Headphones,
  MessageCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Swords,
  Users,
  Zap,
} from "lucide-react";

import { agents, reviews } from "@/lib/data";

export default function RightSidebar() {
  return (
    <aside className="space-y-4">
      {/* Profil kartı */}
      <section className="group relative overflow-hidden rounded-2xl border border-plur-border bg-plur-card/60 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-plur-red/15 blur-3xl" />

        <div className="relative">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="rounded-full bg-gradient-to-br from-plur-red via-pink-500 to-purple-500 p-[2px]">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=emirhan"
                  alt="Emirhan kullanıcı avatarı"
                  className="h-16 w-16 rounded-full bg-plur-bg object-cover"
                />
              </div>

              <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-plur-card bg-plur-green">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-sm font-bold text-white">
                  Emirhan
                  <span className="font-medium text-plur-muted">#TR</span>
                </h2>

                <ShieldCheck size={15} className="shrink-0 text-cyan-400" />
              </div>

              <p className="mt-1 text-xs font-semibold text-cyan-300">
                Diamond 2
              </p>

              <div className="mt-2 flex items-center gap-3 text-[10px] text-plur-muted">
                <span>K/D 1.32</span>
                <span>•</span>
                <span>%58 Win Rate</span>
              </div>
            </div>

            <button
              type="button"
              className="rounded-lg border border-plur-border bg-plur-bg p-2 text-plur-muted transition hover:border-plur-red/50 hover:text-white"
              aria-label="Profil ayarları"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-plur-border rounded-xl border border-plur-border bg-plur-bg/70 py-3 text-center">
            <div>
              <p className="text-sm font-bold text-white">186</p>
              <p className="mt-0.5 text-[8px] uppercase tracking-wider text-plur-muted">
                Maç
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-white">42</p>
              <p className="mt-0.5 text-[8px] uppercase tracking-wider text-plur-muted">
                Duo
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-white">4.9</p>
              <p className="mt-0.5 text-[8px] uppercase tracking-wider text-plur-muted">
                Puan
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg text-xs font-semibold text-plur-muted transition hover:border-plur-red/50 hover:text-white"
            >
              Profilim
            </button>

            <button
              type="button"
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-plur-red text-xs font-bold text-white transition hover:brightness-110"
            >
              İstatistikler
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Hızlı eşleşme */}
      <section className="relative overflow-hidden rounded-2xl border border-plur-red/25 bg-gradient-to-br from-plur-red/15 via-plur-card to-purple-500/10 p-4">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-plur-red/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Zap size={17} className="fill-plur-red text-plur-red" />

                <h3 className="font-rajdhani text-base font-black tracking-[0.08em] text-white">
                  HEMEN DUO BUL
                </h3>
              </div>

              <p className="mt-1 text-[11px] leading-5 text-plur-muted">
                Sana en uygun çevrimiçi oyuncuyla saniyeler içinde eşleş.
              </p>
            </div>

            <span className="rounded-full border border-plur-green/20 bg-plur-green/10 px-2 py-1 text-[9px] font-bold text-plur-green">
              452 ONLINE
            </span>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-plur-muted">
              Ajanını seç
            </p>

            <div className="grid grid-cols-6 gap-2">
              {agents.slice(0, 6).map((agent, index) => (
                <button
                  key={agent}
                  type="button"
                  title={agent}
                  className={`flex aspect-square items-center justify-center rounded-xl border text-[10px] font-bold transition ${
                    index === 0
                      ? "border-plur-red bg-plur-red/15 text-white shadow-[0_0_20px_rgba(255,70,85,0.15)]"
                      : "border-plur-border bg-plur-bg text-plur-muted hover:border-plur-red/50 hover:text-white"
                  }`}
                >
                  {agent.slice(0, 2).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-plur-border bg-plur-bg/70 px-3 py-2.5">
              <Swords size={14} className="text-plur-red" />

              <div>
                <p className="text-[9px] text-plur-muted">Mod</p>
                <p className="text-[11px] font-semibold text-white">
                  Rekabetçi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-plur-border bg-plur-bg/70 px-3 py-2.5">
              <Headphones size={14} className="text-cyan-400" />

              <div>
                <p className="text-[9px] text-plur-muted">Mikrofon</p>
                <p className="text-[11px] font-semibold text-white">
                  Gerekli
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-plur-red text-sm font-black text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            <Gamepad2 size={17} />
            Hemen Eşleş
          </button>

          <p className="mt-2 text-center text-[9px] text-plur-muted">
            Ortalama eşleşme süresi: 30 saniye
          </p>
        </div>
      </section>

      {/* Son değerlendirmeler */}
      <section className="rounded-2xl border border-plur-border bg-plur-card/60 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-rajdhani text-sm font-black tracking-[0.08em] text-white">
              SON DEĞERLENDİRMELER
            </h3>

            <p className="mt-1 text-[10px] text-plur-muted">
              Topluluktaki son oyuncu yorumları
            </p>
          </div>

          <button
            type="button"
            className="text-[10px] font-semibold text-plur-red transition hover:text-white"
          >
            Tümünü Gör
          </button>
        </div>

        <div className="space-y-3">
          {reviews.slice(0, 3).map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-plur-border bg-plur-bg/60 p-3 transition hover:border-plur-red/30"
            >
              <div className="flex items-start gap-3">
                <img
                  src={review.avatar}
                  alt={`${review.username} avatarı`}
                  className="h-9 w-9 shrink-0 rounded-full bg-plur-card object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-white">
                      {review.username}
                    </p>

                    <div className="flex shrink-0 items-center gap-1">
                      <Star
                        size={11}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="text-[10px] font-semibold text-white">
                        {review.rating}
                      </span>
                    </div>
                  </div>

                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-plur-muted">
                    {review.comment}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[9px] text-plur-green">
                    <Check size={10} />
                    Doğrulanmış eşleşme
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Discord topluluğu */}
      <section className="relative overflow-hidden rounded-2xl border border-[#5865F2]/35 bg-gradient-to-br from-[#5865F2]/20 via-plur-card to-purple-500/10 p-4">
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-36 w-36 rounded-full bg-[#5865F2]/30 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5865F2] text-white shadow-[0_0_28px_rgba(88,101,242,0.35)]">
              <MessageCircle size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white">
                PLUR Discord
              </p>

              <div className="mt-1 flex items-center gap-2 text-[10px] text-plur-muted">
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  2.4K+ üye
                </span>

                <span>•</span>

                <span className="flex items-center gap-1 text-plur-green">
                  <Radio size={10} />
                  386 online
                </span>
              </div>
            </div>

            <Sparkles size={17} className="text-purple-300" />
          </div>

          <p className="mt-4 text-[11px] leading-5 text-plur-muted">
            Topluluğa katıl, yeni oyuncularla tanış, özel etkinliklere ve
            turnuvalara katıl.
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md border border-[#5865F2]/25 bg-[#5865F2]/10 px-2 py-1 text-[9px] text-purple-200">
              Duo Kanalları
            </span>

            <span className="rounded-md border border-[#5865F2]/25 bg-[#5865F2]/10 px-2 py-1 text-[9px] text-purple-200">
              Turnuvalar
            </span>

            <span className="rounded-md border border-[#5865F2]/25 bg-[#5865F2]/10 px-2 py-1 text-[9px] text-purple-200">
              Çekilişler
            </span>
          </div>

          <button
            type="button"
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] text-xs font-bold text-white transition hover:bg-[#4752C4]"
          >
            Discord&apos;a Katıl
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Premium küçük kart */}
      <section className="relative overflow-hidden rounded-2xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 via-plur-card to-orange-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
            <Crown size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white">
              PLUR Premium
            </p>

            <p className="mt-0.5 text-[10px] text-plur-muted">
              Profilini öne çıkar ve daha hızlı eşleş.
            </p>
          </div>

          <ChevronRight size={17} className="text-yellow-400" />
        </div>
      </section>
    </aside>
  );
}