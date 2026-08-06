"use client";

import Link from "next/link";
import { useState } from "react";

import type { Player } from "@/lib/data";
import { rankColors, roleIcons } from "@/lib/data";

import {
  Check,
  Circle,
  Clock3,
  ExternalLink,
  Globe2,
  Headphones,
  Heart,
  MapPin,
  MessageCircle,
  Mic,
  ShieldCheck,
  Star,
  UserPlus,
} from "lucide-react";

type DuoPlayerCardProps = {
  player: Player;
};

export default function DuoPlayerCard({
  player,
}: DuoPlayerCardProps) {
  const rankColor = rankColors[player.rankTier] ?? "#ff4655";

  const [isFavorite, setIsFavorite] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  return (
    <article className="group/card relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-plur-border bg-plur-card/65 p-4 transition-all duration-500 hover:-translate-y-1.5 hover:border-plur-red/40 hover:shadow-[0_24px_70px_rgba(255,70,85,0.14)] sm:p-5">
      {/* Rank ışığı */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-10 blur-3xl transition-all duration-500 group-hover/card:scale-125 group-hover/card:opacity-25"
        style={{
          backgroundColor: rankColor,
        }}
      />

      {/* Sol alt kırmızı ışık */}
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-plur-red/[0.04] blur-[90px] transition-all duration-500 group-hover/card:bg-plur-red/[0.08]" />

      {/* Kart üzerinden geçen parlama */}
      <div className="pointer-events-none absolute inset-0 translate-x-[-130%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/[0.035] to-transparent transition-transform duration-1000 group-hover/card:translate-x-[130%]" />

      {/* Üst rank çizgisi */}
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px opacity-0 transition-opacity duration-500 group-hover/card:opacity-80"
        style={{
          background: `linear-gradient(90deg, transparent, ${rankColor}, transparent)`,
        }}
      />

      <div className="relative grid min-w-0 gap-5 md:grid-cols-2 min-[1850px]:grid-cols-[minmax(320px,1fr)_280px_240px_300px] min-[1850px]:items-center">
        {/* Oyuncu bilgileri */}
        <div className="flex min-w-0 items-start gap-4 md:col-span-2 min-[1850px]:col-span-1">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Link
              href={`/oyuncu/${player.id}`}
              className="block"
            >
              <div
                className="relative overflow-hidden rounded-2xl p-[2px] transition-all duration-500 group-hover/card:scale-[1.04]"
                style={{
                  background: `linear-gradient(135deg, ${rankColor}, transparent 75%)`,
                }}
              >
                <div className="absolute inset-0 translate-x-[-140%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover/card:translate-x-[140%]" />

                <img
                  src={player.avatar}
                  alt={`${player.username} oyuncu avatarı`}
                  className="relative h-20 w-20 rounded-2xl bg-plur-bg object-cover transition-all duration-500 group-hover/card:scale-[1.08]"
                />
              </div>
            </Link>

            {player.online && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-plur-card bg-plur-green shadow-[0_0_14px_rgba(39,215,123,0.55)]">
                <span className="absolute h-3 w-3 animate-ping rounded-full bg-plur-green opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-white" />
              </span>
            )}

            <span
              className="pointer-events-none absolute inset-x-2 -bottom-3 h-5 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover/card:opacity-50"
              style={{
                backgroundColor: rankColor,
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            {/* İsim ve rozetler */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/oyuncu/${player.id}`}
                className="min-w-0"
              >
                <h3 className="truncate font-rajdhani text-xl font-black text-white transition-colors duration-300 hover:text-plur-red">
                  {player.username}

                  <span className="ml-0.5 font-semibold text-plur-muted">
                    #{player.tag}
                  </span>
                </h3>
              </Link>

              {player.verified && (
                <span title="Doğrulanmış oyuncu">
                  <ShieldCheck
                    size={16}
                    className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]"
                  />
                </span>
              )}

              {player.online && (
                <span className="flex items-center gap-1 rounded-full border border-plur-green/20 bg-plur-green/10 px-2 py-1 text-[9px] font-bold text-plur-green transition-all duration-300 hover:border-plur-green/40 hover:bg-plur-green/15">
                  <Circle
                    size={6}
                    className="fill-plur-green"
                  />
                  ONLINE
                </span>
              )}
            </div>

            {/* Konum ve bilgiler */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-plur-muted">
              <MetaItem
                icon={<MapPin size={13} />}
                text={player.city}
                hoverColor="group-hover/meta:text-plur-red"
              />

              <MetaItem
                icon={<Globe2 size={13} />}
                text={player.server}
                hoverColor="group-hover/meta:text-cyan-400"
              />

              <MetaItem
                icon={<Clock3 size={13} />}
                text={player.lastActive}
                hoverColor="group-hover/meta:text-plur-red"
              />

              <span className="group/rating flex items-center gap-1.5 whitespace-nowrap text-yellow-400 transition-transform duration-300 hover:scale-105">
                <Star
                  size={13}
                  className="fill-yellow-400 transition-transform duration-300 group-hover/rating:rotate-12 group-hover/rating:scale-110"
                />

                {player.rating}

                <span className="text-plur-muted">
                  ({player.reviewCount})
                </span>
              </span>
            </div>

            {/* Bio */}
            <p className="mt-3 line-clamp-2 max-w-xl text-xs leading-5 text-plur-muted transition-colors duration-300 group-hover/card:text-white/65">
              {player.bio}
            </p>

            {/* Etiketler */}
            <div className="mt-3 flex flex-wrap gap-2">
              {player.tags.map((tag) => (
                <span
                  key={tag}
                  className="group/tag relative overflow-hidden rounded-lg border border-plur-border bg-plur-bg/70 px-2.5 py-1.5 text-[10px] font-medium text-plur-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-plur-red/30 hover:bg-plur-red/5 hover:text-white"
                >
                  <span className="pointer-events-none absolute inset-0 translate-x-[-130%] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-transform duration-500 group-hover/tag:translate-x-[130%]" />

                  <span className="relative whitespace-nowrap">
                    {tag}
                  </span>
                </span>
              ))}

              {player.mic && (
                <span className="group/mic flex items-center gap-1 whitespace-nowrap rounded-lg border border-plur-green/20 bg-plur-green/10 px-2.5 py-1.5 text-[10px] font-semibold text-plur-green transition-all duration-300 hover:-translate-y-0.5 hover:border-plur-green/40 hover:bg-plur-green/15">
                  <Mic
                    size={11}
                    className="transition-transform duration-300 group-hover/mic:scale-110"
                  />

                  Mikrofon
                </span>
              )}

              <span className="group/language flex items-center gap-1 whitespace-nowrap rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-cyan-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-400/15">
                <Headphones
                  size={11}
                  className="transition-transform duration-300 group-hover/language:scale-110"
                />

                {player.language}
              </span>
            </div>
          </div>
        </div>

        {/* Rank ve rol */}
        <div className="grid grid-cols-2 gap-3">
          <div className="group/rank relative min-w-0 overflow-hidden rounded-xl border border-plur-border bg-plur-bg/70 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-white/15">
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl transition-all duration-300 group-hover/rank:scale-125 group-hover/rank:opacity-25"
              style={{
                backgroundColor: rankColor,
              }}
            />

            <div className="pointer-events-none absolute inset-0 translate-x-[-130%] bg-gradient-to-r from-transparent via-white/[0.045] to-transparent transition-transform duration-700 group-hover/rank:translate-x-[130%]" />

            <p className="relative text-[9px] uppercase tracking-[0.16em] text-plur-muted">
              Rank
            </p>

            <div className="relative mt-2 flex items-center gap-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-300 group-hover/rank:rotate-6 group-hover/rank:scale-110"
                style={{
                  color: rankColor,
                  backgroundColor: `${rankColor}18`,
                  boxShadow: `0 0 16px ${rankColor}14`,
                }}
              >
                ◆
              </span>

              <div className="min-w-0">
                <p
                  className="truncate whitespace-nowrap text-sm font-bold"
                  style={{
                    color: rankColor,
                  }}
                >
                  {player.rank}
                </p>

                <p className="mt-0.5 whitespace-nowrap text-[9px] text-plur-muted">
                  {player.rr} RR
                </p>
              </div>
            </div>
          </div>

          <div className="group/role relative min-w-0 overflow-hidden rounded-xl border border-plur-border bg-plur-bg/70 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-plur-red/30">
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-plur-red/10 opacity-0 blur-2xl transition-all duration-300 group-hover/role:opacity-100" />

            <div className="pointer-events-none absolute inset-0 translate-x-[-130%] bg-gradient-to-r from-transparent via-white/[0.045] to-transparent transition-transform duration-700 group-hover/role:translate-x-[130%]" />

            <p className="relative text-[9px] uppercase tracking-[0.16em] text-plur-muted">
              Rol
            </p>

            <div className="relative mt-2 flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-plur-red/10 text-lg text-plur-red transition-all duration-300 group-hover/role:rotate-6 group-hover/role:scale-110 group-hover/role:bg-plur-red/15">
                {roleIcons[player.role]}
              </span>

              <div className="min-w-0">
                <p className="truncate whitespace-nowrap text-sm font-bold capitalize text-white">
                  {player.role}
                </p>

                <p className="mt-0.5 truncate whitespace-nowrap text-[9px] text-plur-muted">
                  {player.agent}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-2">
          <Metric
            value={`%${player.winRate}`}
            label="Win Rate"
          />

          <Metric
            value={player.kd.toFixed(2)}
            label="K/D"
          />

          <Metric
            value={`%${player.headshot}`}
            label="HS%"
          />
        </div>

        {/* 2x2 buton düzeni */}
        <div className="grid min-w-0 grid-cols-2 gap-2 md:col-span-2 min-[1850px]:col-span-1">
          <Link
            href={`/oyuncu/${player.id}`}
            className="group/profile relative flex h-11 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-xl border border-plur-border bg-plur-bg px-3 text-xs font-bold text-plur-muted transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 hover:shadow-[0_14px_35px_rgba(34,211,238,0.12)] active:translate-y-0 active:scale-[0.96]"
          >
            <ButtonShine />

            <ExternalLink
              size={15}
              className="relative shrink-0 transition-all duration-300 group-hover/profile:-translate-y-0.5 group-hover/profile:translate-x-0.5 group-hover/profile:scale-110"
            />

            <span className="relative whitespace-nowrap">
              Profili Gör
            </span>
          </Link>

          <button
            type="button"
            onClick={() =>
              setRequestSent((current) => !current)
            }
            className={`group/request relative flex h-11 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 text-xs font-bold transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-[0.96] ${
              requestSent
                ? "border-plur-green/40 bg-plur-green/15 text-plur-green shadow-[0_12px_30px_rgba(39,215,123,0.14)] hover:border-plur-green/60"
                : "border-plur-red/40 bg-plur-red text-white shadow-[0_12px_30px_rgba(255,70,85,0.22)] hover:border-red-300/70 hover:shadow-[0_18px_45px_rgba(255,70,85,0.38)]"
            }`}
          >
            <ButtonShine stronger />

            {requestSent ? (
              <Check
                size={15}
                className="relative shrink-0 transition-transform duration-300 group-hover/request:scale-110"
              />
            ) : (
              <UserPlus
                size={15}
                className="relative shrink-0 transition-all duration-300 group-hover/request:rotate-6 group-hover/request:scale-110"
              />
            )}

            <span className="relative whitespace-nowrap">
              {requestSent
                ? "Gönderildi"
                : "Duo İsteği"}
            </span>
          </button>

          <button
            type="button"
            aria-label={`${player.username} adlı oyuncuya mesaj gönder`}
            className="group/message relative flex h-11 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-xl border border-plur-border bg-plur-bg px-3 text-xs font-bold text-plur-muted transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 hover:shadow-[0_12px_30px_rgba(34,211,238,0.12)] active:translate-y-0 active:scale-[0.96]"
          >
            <ButtonShine />

            <MessageCircle
              size={15}
              className="relative shrink-0 transition-all duration-300 group-hover/message:-translate-y-0.5 group-hover/message:rotate-[-6deg] group-hover/message:scale-110"
            />

            <span className="relative whitespace-nowrap">
              Mesaj
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setIsFavorite((current) => !current)
            }
            aria-label={
              isFavorite
                ? `${player.username} adlı oyuncuyu favorilerden çıkar`
                : `${player.username} adlı oyuncuyu favorilere ekle`
            }
            className={`group/favorite relative flex h-11 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 text-xs font-bold transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-[0.96] ${
              isFavorite
                ? "border-plur-red/50 bg-plur-red/15 text-plur-red shadow-[0_12px_30px_rgba(255,70,85,0.15)]"
                : "border-plur-border bg-plur-bg text-plur-muted hover:border-plur-red/40 hover:bg-plur-red/10 hover:text-plur-red hover:shadow-[0_12px_30px_rgba(255,70,85,0.12)]"
            }`}
          >
            <ButtonShine />

            <Heart
              size={15}
              className={`relative shrink-0 transition-all duration-300 group-hover/favorite:rotate-6 group-hover/favorite:scale-110 ${
                isFavorite
                  ? "fill-plur-red text-plur-red"
                  : ""
              }`}
            />

            <span className="relative whitespace-nowrap">
              {isFavorite ? "Favoride" : "Favori"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

function MetaItem({
  icon,
  text,
  hoverColor,
}: {
  icon: React.ReactNode;
  text: string;
  hoverColor: string;
}) {
  return (
    <span className="group/meta flex items-center gap-1.5 whitespace-nowrap transition-colors duration-300 hover:text-white">
      <span
        className={`transition-all duration-300 group-hover/meta:scale-110 ${hoverColor}`}
      >
        {icon}
      </span>

      {text}
    </span>
  );
}

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="group/metric relative min-w-0 overflow-hidden rounded-xl border border-plur-border bg-plur-bg/70 p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-plur-red/30 hover:bg-plur-red/[0.04] hover:shadow-[0_12px_28px_rgba(255,70,85,0.08)]">
      <span className="pointer-events-none absolute inset-0 translate-x-[-130%] bg-gradient-to-r from-transparent via-white/[0.055] to-transparent transition-transform duration-700 group-hover/metric:translate-x-[130%]" />

      <p className="relative whitespace-nowrap font-rajdhani text-lg font-black text-white transition-all duration-300 group-hover/metric:scale-105 group-hover/metric:text-plur-red">
        {value}
      </p>

      <p className="relative mt-1 whitespace-nowrap text-[8px] uppercase tracking-[0.08em] text-plur-muted">
        {label}
      </p>
    </div>
  );
}

function ButtonShine({
  stronger = false,
}: {
  stronger?: boolean;
}) {
  return (
    <span
      className={`pointer-events-none absolute inset-0 translate-x-[-130%] skew-x-[-18deg] bg-gradient-to-r from-transparent ${
        stronger ? "via-white/25" : "via-white/10"
      } to-transparent transition-transform duration-700 group-hover:translate-x-[130%]`}
    />
  );
}