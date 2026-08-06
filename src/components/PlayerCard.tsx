"use client";

import type { Player } from "@/lib/data";
import { rankColors, roleIcons } from "@/lib/data";

import {
  Circle,
  Gamepad2,
  MapPin,
  MessageCircle,
  Mic,
  MoreHorizontal,
  ShieldCheck,
  Star,
  UserPlus,
} from "lucide-react";

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const rankColor = rankColors[player.rankTier] ?? "#ff4655";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-plur-border bg-plur-bg transition duration-300 hover:-translate-y-1 hover:border-plur-red/50 hover:shadow-[0_18px_50px_rgba(255,70,85,0.12)]">
      {/* Üst dekoratif parıltı */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[2px] w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${rankColor}, transparent)`,
        }}
      />

      <div
        className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: rankColor }}
      />

      <div className="relative p-4">
        {/* Üst alan */}
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <div
                className="rounded-full p-[2px]"
                style={{
                  background: `linear-gradient(135deg, ${rankColor}, transparent)`,
                }}
              >
                <img
                  src={player.avatar}
                  alt={`${player.username} oyuncu avatarı`}
                  className="h-14 w-14 rounded-full bg-plur-card object-cover"
                />
              </div>

              {player.online && (
                <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-plur-bg bg-plur-green">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-sm font-bold text-white">
                  {player.username}
                  <span className="font-medium text-plur-muted">
                    #{player.tag}
                  </span>
                </h3>

                <ShieldCheck
                  size={14}
                  className="shrink-0 text-cyan-400"
                  aria-label="Doğrulanmış oyuncu"
                />
              </div>

              <p className="mt-1 truncate text-xs text-plur-muted">
                {player.agent} oyuncusu
              </p>

              <div className="mt-1.5 flex items-center gap-1">
                <Star
                  size={12}
                  className="fill-yellow-400 text-yellow-400"
                />
                <span className="text-[11px] font-semibold text-white">
                  4.8
                </span>
                <span className="text-[10px] text-plur-muted">
                  (24 değerlendirme)
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Oyuncu seçenekleri"
            className="rounded-lg p-1.5 text-plur-muted transition hover:bg-plur-card hover:text-white"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Rank ve rol */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-plur-border bg-plur-card/50 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-plur-muted">
              Rank
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
                style={{
                  backgroundColor: `${rankColor}18`,
                  color: rankColor,
                }}
              >
                ◆
              </span>

              <div className="min-w-0">
                <p
                  className="truncate text-xs font-bold"
                  style={{ color: rankColor }}
                >
                  {player.rank}
                </p>

                <p className="text-[9px] text-plur-muted">
                  72 RR
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-plur-border bg-plur-card/50 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-plur-muted">
              Rol
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-plur-red/10 text-base text-plur-red">
                {roleIcons[player.role]}
              </span>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">
                  {player.role}
                </p>

                <p className="text-[9px] text-plur-muted">
                  Ana rol
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Özellikler */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {player.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-plur-border bg-plur-card px-2 py-1 text-[9px] font-medium text-plur-muted"
            >
              {tag}
            </span>
          ))}

          <span className="flex items-center gap-1 rounded-md border border-plur-green/20 bg-plur-green/10 px-2 py-1 text-[9px] font-semibold text-plur-green">
            <Mic size={10} />
            Mikrofon
          </span>
        </div>

        {/* Konum ve durum */}
        <div className="mt-4 flex items-center justify-between border-t border-plur-border pt-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-plur-muted">
            <MapPin size={13} />
            <span>{player.city}</span>
          </div>

          {player.online ? (
            <div className="flex items-center gap-1.5 font-semibold text-plur-green">
              <Circle
                size={7}
                className="fill-plur-green text-plur-green"
              />
              Çevrimiçi
            </div>
          ) : (
            <span className="text-plur-muted">Çevrimdışı</span>
          )}
        </div>

        {/* İstatistik alanı */}
        <div className="mt-3 grid grid-cols-3 divide-x divide-plur-border rounded-xl border border-plur-border bg-plur-card/40 py-2.5 text-center">
          <div>
            <p className="text-xs font-bold text-white">%63</p>
            <p className="mt-0.5 text-[8px] uppercase tracking-wider text-plur-muted">
              Win Rate
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-white">1.42</p>
            <p className="mt-0.5 text-[8px] uppercase tracking-wider text-plur-muted">
              K/D
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-white">186</p>
            <p className="mt-0.5 text-[8px] uppercase tracking-wider text-plur-muted">
              Maç
            </p>
          </div>
        </div>

        {/* Butonlar */}
        <div className="mt-3 grid grid-cols-[1fr_42px] gap-2">
          <button
            type="button"
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-plur-red text-xs font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            <UserPlus size={15} />
            Duo İsteği Gönder
          </button>

          <button
            type="button"
            aria-label="Mesaj gönder"
            className="flex h-10 items-center justify-center rounded-xl border border-plur-border bg-plur-card text-plur-muted transition hover:border-plur-red/50 hover:text-white"
          >
            <MessageCircle size={16} />
          </button>
        </div>

        {/* Oyun durumu */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-plur-red/5 px-3 py-2">
          <Gamepad2 size={13} className="text-plur-red" />

          <p className="truncate text-[10px] text-plur-muted">
            Rekabetçi oynamak için duo arıyor
          </p>
        </div>
      </div>
    </article>
  );
}