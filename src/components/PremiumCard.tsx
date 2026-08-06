"use client";

import {
  ArrowRight,
  Check,
  Crown,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const benefits = [
  "Öncelikli eşleşme",
  "Gelişmiş oyuncu filtreleri",
  "Profilini öne çıkarma",
  "Özel Premium rozeti",
];

export default function PremiumCard() {
  return (
    <section className="group relative min-h-[300px] overflow-hidden rounded-2xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 via-plur-card to-purple-500/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-yellow-400/15 blur-3xl transition duration-500 group-hover:bg-yellow-400/25" />

      <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />

      <div className="relative flex min-h-[250px] flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.12)]">
                <Crown size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-400">
                  Premium üyelik
                </p>

                <h3 className="mt-1 font-rajdhani text-xl font-black text-white">
                  PLUR PREMIUM
                </h3>
              </div>
            </div>

            <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[10px] font-bold text-yellow-300">
              EN POPÜLER
            </span>
          </div>

          <p className="mt-5 max-w-md text-sm leading-6 text-plur-muted">
            Daha hızlı eşleş, profilini öne çıkar ve gelişmiş özelliklerle
            oyun deneyimini güçlendir.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 rounded-xl border border-plur-border bg-plur-bg/50 px-3 py-2.5"
              >
                <Check size={15} className="text-plur-green" />

                <span className="text-xs font-medium text-white">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-plur-border bg-plur-bg/50 p-3 text-center">
              <Zap className="mx-auto text-plur-red" size={17} />
              <p className="mt-2 text-sm font-bold text-white">2x</p>
              <p className="text-[9px] text-plur-muted">Hızlı eşleşme</p>
            </div>

            <div className="rounded-xl border border-plur-border bg-plur-bg/50 p-3 text-center">
              <ShieldCheck className="mx-auto text-cyan-400" size={17} />
              <p className="mt-2 text-sm font-bold text-white">Özel</p>
              <p className="text-[9px] text-plur-muted">Profil rozeti</p>
            </div>

            <div className="rounded-xl border border-plur-border bg-plur-bg/50 p-3 text-center">
              <Sparkles className="mx-auto text-purple-400" size={17} />
              <p className="mt-2 text-sm font-bold text-white">Sınırsız</p>
              <p className="text-[9px] text-plur-muted">Duo isteği</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-plur-muted">Aylık üyelik</p>

            <div className="mt-1 flex items-end gap-1">
              <span className="font-rajdhani text-3xl font-black text-white">
                ₺79
              </span>

              <span className="mb-1 text-xs text-plur-muted">/ ay</span>
            </div>
          </div>

          <button
            type="button"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-6 text-sm font-black text-black transition hover:brightness-110 active:scale-[0.98]"
          >
            Premium&apos;a Geç
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}