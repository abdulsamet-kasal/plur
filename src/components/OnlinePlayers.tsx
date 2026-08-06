"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Circle,
  SlidersHorizontal,
} from "lucide-react";

import { onlinePlayers } from "@/lib/data";
import PlayerCard from "./PlayerCard";

export default function OnlinePlayers() {
  return (
    <section className="overflow-hidden rounded-2xl border border-plur-border bg-plur-card/40">
      {/* Üst başlık */}
      <div className="flex flex-col gap-4 border-b border-plur-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div>
          <div className="flex items-center gap-2">
            <Circle
              size={9}
              className="fill-plur-green text-plur-green"
            />

            <h2 className="font-rajdhani text-xl font-black tracking-[0.08em] text-white">
              ONLINE OYUNCULAR
            </h2>

            <span className="rounded-full border border-plur-green/20 bg-plur-green/10 px-2 py-0.5 text-[10px] font-bold text-plur-green">
              {onlinePlayers.length} AKTİF
            </span>
          </div>

          <p className="mt-1 text-xs text-plur-muted">
            Filtrelerine uygun ve şu anda çevrimiçi olan oyuncular
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-plur-border bg-plur-bg text-plur-muted transition hover:border-plur-red/50 hover:text-white"
            aria-label="Önceki oyuncular"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-plur-border bg-plur-bg text-plur-muted transition hover:border-plur-red/50 hover:text-white"
            aria-label="Sonraki oyuncular"
          >
            <ChevronRight size={17} />
          </button>

          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg border border-plur-border bg-plur-bg px-3 text-xs font-semibold text-plur-muted transition hover:border-plur-red/50 hover:text-white"
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Sırala</span>
          </button>

          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg bg-plur-red px-4 text-xs font-bold text-white transition hover:brightness-110"
          >
            Tümünü Gör
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Oyuncu kartları */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 md:p-5">
        {onlinePlayers.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </section>
  );
}