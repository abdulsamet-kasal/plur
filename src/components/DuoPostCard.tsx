"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  Circle,
  Clock3,
  ExternalLink,
  Flag,
  Gamepad2,
  Globe2,
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Mic,
  Send,
  ShieldCheck,
  Star,
  Swords,
  Trophy,
  UserPlus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export type RankTier =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "ascendant"
  | "immortal"
  | "radiant";

export type PlayerRole =
  | "duelist"
  | "initiator"
  | "controller"
  | "sentinel";

export type DuoPostCardData = {
  id: string;
  userId: string;
  title: string;
  gameMode: string;
  wantedRankTier: RankTier | null;
  wantedRole: PlayerRole | "any" | null;
  server: string;
  city: string | null;
  micRequired: boolean;
  activeHours: string | null;
  description: string;
  createdAt: string;
  profile: {
    id: string;
    username: string;
    tag: string;
    avatarUrl: string;
    city: string | null;
    server: string | null;
    rank: string | null;
    rankTier: RankTier | null;
    role: PlayerRole | null;
    agent: string | null;
    language: string | null;
    mic: boolean;
    verified: boolean;
    online: boolean;
    rating: number;
    reviewCount: number;
    lastActive: string | null;
  };
};

type DuoPostCardProps = {
  post: DuoPostCardData;
};

const rankColors: Record<RankTier, string> = {
  iron: "#737373",
  bronze: "#c47a44",
  silver: "#bec7d1",
  gold: "#f2c94c",
  platinum: "#4fd1c5",
  diamond: "#7cc7ff",
  ascendant: "#39d98a",
  immortal: "#ff5c8a",
  radiant: "#ffe08a",
};

const gameModeLabels: Record<string, string> = {
  competitive: "Rekabetçi",
  unrated: "Derecesiz",
  premier: "Premier",
  swiftplay: "Tam Gaz",
  spike_rush: "Spike'a Hücum",
  deathmatch: "Ölüm Kalım Savaşı",
  custom: "Özel Oyun",
};

const rankLabels: Record<RankTier, string> = {
  iron: "Iron",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
  ascendant: "Ascendant",
  immortal: "Immortal",
  radiant: "Radiant",
};

const roleLabels: Record<PlayerRole | "any", string> = {
  any: "Rol fark etmez",
  duelist: "Duelist",
  initiator: "Initiator",
  controller: "Controller",
  sentinel: "Sentinel",
};

const roleIcons: Record<PlayerRole, string> = {
  duelist: "⚔️",
  initiator: "📡",
  controller: "🌫️",
  sentinel: "🛡️",
};

export default function DuoPostCard({
  post,
}: DuoPostCardProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);

  const profile = post.profile;
  const rankTier = profile.rankTier ?? "iron";
  const rankColor = rankColors[rankTier];

  useEffect(() => {
    let mounted = true;

    async function loadUserActions() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setFavoriteLoading(false);
        setRequestLoading(false);
        return;
      }

      const [favoriteResult, requestResult] = await Promise.all([
        supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("post_id", post.id)
          .maybeSingle(),
        user.id === post.userId
          ? Promise.resolve({ data: null, error: null })
          : supabase
              .from("duo_requests")
              .select("id")
              .eq("sender_id", user.id)
              .eq("receiver_id", post.userId)
              .eq("post_id", post.id)
              .eq("status", "pending")
              .maybeSingle(),
      ]);

      if (!mounted) return;

      if (favoriteResult.error) {
        console.error(
          "Favori durumu alınamadı:",
          favoriteResult.error.message
        );
      }

      if (requestResult.error) {
        console.error(
          "Duo isteği durumu alınamadı:",
          requestResult.error.message
        );
      }

      setIsFavorite(Boolean(favoriteResult.data));
      setRequestSent(Boolean(requestResult.data));
      setFavoriteLoading(false);
      setRequestLoading(false);
    }

    void loadUserActions();

    return () => {
      mounted = false;
    };
  }, [post.id, post.userId, supabase]);

  async function handleFavorite() {
    if (favoriteLoading) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/giris");
      return;
    }

    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", post.id);

        if (error) {
          console.error("Favori kaldırılamadı:", error.message);
          return;
        }

        setIsFavorite(false);
        return;
      }

      const { error: favoriteError } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          post_id: post.id,
        });

      if (favoriteError) {
        console.error("İlan favorilere eklenemedi:", favoriteError.message);
        return;
      }

      setIsFavorite(true);

      // Kullanıcı kendi ilanını favorilerse bildirim oluşturma.
      if (user.id === post.userId) {
        return;
      }

      const { data: actorProfile, error: actorProfileError } = await supabase
        .from("profiles")
        .select("username, tag")
        .eq("id", user.id)
        .maybeSingle();

      if (actorProfileError) {
        console.error(
          "Favoriye ekleyen kullanıcının profili alınamadı:",
          actorProfileError.message
        );
      }

      const actorName =
        actorProfile?.username ||
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "Bir oyuncu";

      const actorTag = actorProfile?.tag ? `#${actorProfile.tag}` : "";

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: post.userId,
          actor_id: user.id,
          type: "favorite",
          title: "İlanın favorilere eklendi",
          message: `${actorName}${actorTag} “${post.title}” ilanını favorilerine ekledi.`,
          link: `/oyuncu/${user.id}`,
        });

      // Bildirim başarısız olsa bile favori işlemi geçerli kalır.
      if (notificationError) {
        console.error(
          "Favori bildirimi oluşturulamadı:",
          notificationError.message
        );
      }
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleMessage() {
    if (messageLoading) {
      return;
    }

    setMessageLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessageLoading(false);
      router.push("/giris");
      return;
    }

    if (user.id === profile.id) {
      setMessageLoading(false);
      window.alert("Kendi kendine mesaj gönderemezsin.");
      return;
    }

    router.push(`/mesajlar?user=${profile.id}`);
  }

  async function handleDuoRequest() {
    if (requestLoading || requestSent) {
      return;
    }

    setRequestLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/giris");
        return;
      }

      if (user.id === post.userId) {
        window.alert("Kendi ilanına duo isteği gönderemezsin.");
        return;
      }

      const { error: requestError } = await supabase.rpc(
        "send_duo_request_with_notification",
        {
          target_post_id: post.id,
        }
      );

      if (requestError) {
        if (
          requestError.message
            .toLocaleLowerCase("tr-TR")
            .includes("zaten")
        ) {
          setRequestSent(true);
          return;
        }

        console.error("Duo isteği gönderilemedi:", requestError.message);
        window.alert(`Duo isteği gönderilemedi: ${requestError.message}`);
        return;
      }

      setRequestSent(true);
    } finally {
      setRequestLoading(false);
    }
  }

  const createdLabel = formatRelativeDate(post.createdAt);
  const lastActiveLabel = formatLastActive(
    profile.lastActive,
    profile.online
  );

  const wantedRankLabel = post.wantedRankTier
    ? rankLabels[post.wantedRankTier]
    : "Fark etmez";

  const wantedRoleLabel =
    roleLabels[post.wantedRole ?? "any"] ?? "Fark etmez";

  const playerRoleLabel = profile.role
    ? roleLabels[profile.role]
    : "Rol belirtilmedi";

  return (
    <article
      className="group/card relative overflow-hidden rounded-[24px] border border-plur-border bg-plur-card/65 shadow-[0_16px_55px_rgba(0,0,0,0.16)] transition-all duration-500 hover:-translate-y-1 hover:border-plur-red/45 hover:shadow-[0_24px_80px_rgba(255,70,85,0.13)]"
      style={{
        ["--rank-color" as string]: rankColor,
      }}
    >
      {/* Kart arka plan efektleri */}
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full opacity-[0.08] blur-[95px] transition duration-500 group-hover/card:scale-125 group-hover/card:opacity-[0.18]"
        style={{ backgroundColor: rankColor }}
      />
      <div className="pointer-events-none absolute -bottom-40 left-[28%] h-72 w-72 rounded-full bg-plur-red/[0.035] blur-[110px] transition duration-500 group-hover/card:bg-plur-red/[0.07]" />
      <div className="pointer-events-none absolute inset-0 translate-x-[-140%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/[0.025] to-transparent transition-transform duration-1000 group-hover/card:translate-x-[140%]" />
      <div
        className="pointer-events-none absolute inset-x-10 top-0 h-px opacity-40 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${rankColor}, transparent)`,
        }}
      />

      <div className="relative grid gap-0 xl:grid-cols-[minmax(0,1fr)_280px_238px]">
        {/* Oyuncu ve ilan bilgisi */}
        <div className="min-w-0 p-5 md:p-6">
          <div className="flex items-start gap-4">
            <Link
              href={`/oyuncu/${profile.id}`}
              className="group/avatar relative shrink-0"
            >
              <div
                className="relative rounded-[20px] p-[2px] transition duration-500 group-hover/card:scale-[1.04]"
                style={{
                  background: `linear-gradient(145deg, ${rankColor}, rgba(255,255,255,.05) 58%, transparent)`,
                }}
              >
                <div className="overflow-hidden rounded-[18px] bg-plur-bg">
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.username} oyuncu avatarı`}
                    className="h-[82px] w-[82px] object-cover transition duration-500 group-hover/avatar:scale-110"
                  />
                </div>
              </div>

              <span
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-plur-border bg-plur-bg/95 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.13em] shadow-xl"
                style={{ color: rankColor }}
              >
                {rankLabels[rankTier]}
              </span>

              {profile.online && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-plur-card bg-plur-green shadow-[0_0_16px_rgba(39,215,123,0.6)]">
                  <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-plur-green opacity-50" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-plur-red/25 bg-plur-red/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-plur-red">
                  {gameModeLabels[post.gameMode] ?? post.gameMode}
                </span>

                <span className="flex items-center gap-1 rounded-full border border-plur-border bg-plur-bg/70 px-2.5 py-1 text-[8px] font-semibold text-plur-muted">
                  <CalendarDays size={10} />
                  {createdLabel}
                </span>

                {profile.online && (
                  <span className="flex items-center gap-1 rounded-full border border-plur-green/20 bg-plur-green/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-plur-green">
                    <Circle size={5} className="fill-plur-green" />
                    Online
                  </span>
                )}
              </div>

              <h2 className="mt-3 line-clamp-1 font-rajdhani text-2xl font-black leading-none text-white transition-colors duration-300 group-hover/card:text-plur-red md:text-[28px]">
                {post.title}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  href={`/oyuncu/${profile.id}`}
                  className="font-rajdhani text-base font-black text-white transition hover:text-plur-red"
                >
                  {profile.username}
                  <span className="text-plur-muted">#{profile.tag}</span>
                </Link>

                {profile.verified && (
                  <ShieldCheck size={15} className="text-cyan-400" />
                )}

                <span className="text-[10px] text-plur-muted">•</span>

                <span className="text-[10px] font-semibold text-plur-muted">
                  {playerRoleLabel}
                  {profile.agent ? ` · ${profile.agent}` : ""}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 max-w-3xl text-xs leading-5 text-plur-muted transition-colors duration-300 group-hover/card:text-white/70">
                {post.description}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <InfoPill
              icon={<MapPin size={12} />}
              text={post.city || profile.city || "İl fark etmez"}
            />
            <InfoPill
              icon={<Globe2 size={12} />}
              text={post.server}
            />
            <InfoPill
              icon={<Clock3 size={12} />}
              text={post.activeHours || "Saat fark etmez"}
            />
            <InfoPill
              icon={<Mic size={12} />}
              text={
                post.micRequired
                  ? "Mikrofon zorunlu"
                  : "Mikrofon fark etmez"
              }
              green={post.micRequired}
            />
          </div>
        </div>

        {/* Aranan kriterler */}
        <div className="border-t border-plur-border/80 bg-plur-bg/25 p-5 md:p-6 xl:border-l xl:border-t-0">
          <p className="mb-3 text-[8px] font-black uppercase tracking-[0.18em] text-plur-muted">
            Eşleşme kriterleri
          </p>

          <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
            <CompactDetail
              icon={<Trophy size={15} />}
              label="Aranan Rank"
              value={wantedRankLabel}
              accent={rankColor}
            />
            <CompactDetail
              icon={
                <span className="text-sm leading-none">
                  {post.wantedRole && post.wantedRole !== "any"
                    ? roleIcons[post.wantedRole]
                    : "🎯"}
                </span>
              }
              label="Aranan Rol"
              value={wantedRoleLabel}
            />
            <CompactDetail
              icon={<Gamepad2 size={15} />}
              label="Oyuncu Rankı"
              value={profile.rank || rankLabels[rankTier]}
              accent={rankColor}
            />
            <CompactDetail
              icon={<Star size={15} className="fill-current" />}
              label="Topluluk Puanı"
              value={`${profile.rating.toFixed(1)} / 5`}
              subValue={`${profile.reviewCount} değerlendirme`}
              accent="#facc15"
            />
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-plur-border bg-plur-bg/65 px-3 py-2">
            <span className="text-[9px] text-plur-muted">Aktiflik</span>
            <span
              className={`truncate pl-3 text-right text-[9px] font-bold ${
                profile.online ? "text-plur-green" : "text-white/70"
              }`}
            >
              {lastActiveLabel}
            </span>
          </div>
        </div>

        {/* İşlem alanı */}
        <div className="border-t border-plur-border/80 p-5 md:p-6 xl:border-l xl:border-t-0">
          <button
            type="button"
            onClick={handleDuoRequest}
            disabled={requestLoading || requestSent}
            className={`group/request relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 text-xs font-black transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed ${
              requestSent
                ? "border-plur-green/35 bg-plur-green/10 text-plur-green"
                : "border-plur-red/50 bg-plur-red text-white shadow-[0_12px_32px_rgba(255,70,85,0.24)] hover:shadow-[0_18px_44px_rgba(255,70,85,0.38)]"
            }`}
          >
            <ButtonShine stronger />

            {requestLoading ? (
              <LoaderCircle size={16} className="relative animate-spin" />
            ) : requestSent ? (
              <Check size={16} className="relative" />
            ) : (
              <UserPlus size={16} className="relative" />
            )}

            <span className="relative">
              {requestSent ? "İstek Gönderildi" : "Duo İsteği Gönder"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleMessage}
            disabled={messageLoading}
            className="group/message relative mt-2 flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-plur-border bg-plur-bg text-xs font-bold text-plur-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/35 hover:bg-cyan-400/10 hover:text-cyan-300 active:scale-[0.97] disabled:cursor-wait disabled:opacity-60"
          >
            <ButtonShine />
            {messageLoading ? (
              <LoaderCircle size={15} className="relative animate-spin" />
            ) : (
              <MessageCircle size={15} className="relative" />
            )}
            <span className="relative">
              {messageLoading ? "Açılıyor..." : "Mesaj Gönder"}
            </span>
          </button>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link
              href={`/oyuncu/${profile.id}`}
              className="group/profile relative flex h-10 items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-plur-border bg-plur-bg/75 text-[10px] font-bold text-plur-muted transition hover:border-white/20 hover:text-white"
            >
              <ButtonShine />
              <ExternalLink size={13} className="relative" />
              <span className="relative">Profil</span>
            </Link>

            <button
              type="button"
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className={`group/favorite relative flex h-10 items-center justify-center gap-1.5 overflow-hidden rounded-xl border text-[10px] font-bold transition disabled:cursor-wait ${
                isFavorite
                  ? "border-plur-red/45 bg-plur-red/10 text-plur-red"
                  : "border-plur-border bg-plur-bg/75 text-plur-muted hover:border-plur-red/35 hover:text-plur-red"
              }`}
            >
              <ButtonShine />
              {favoriteLoading ? (
                <LoaderCircle size={13} className="relative animate-spin" />
              ) : (
                <Heart
                  size={13}
                  className={`relative transition group-hover/favorite:scale-110 ${
                    isFavorite ? "fill-plur-red" : ""
                  }`}
                />
              )}
              <span className="relative">
                {isFavorite ? "Favoride" : "Favori"}
              </span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-4 border-t border-plur-border/70 pt-3">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  `${window.location.origin}/oyuncu/${profile.id}`
                );
                window.alert("Profil bağlantısı kopyalandı.");
              }}
              className="flex items-center gap-1.5 text-[9px] font-semibold text-plur-muted transition hover:text-white"
            >
              <Send size={12} />
              Paylaş
            </button>

            <span className="h-3 w-px bg-plur-border" />

            <button
              type="button"
              onClick={() =>
                window.alert(
                  "Şikâyet sistemi bir sonraki adımda aktif olacak."
                )
              }
              className="flex items-center gap-1.5 text-[9px] font-semibold text-plur-muted transition hover:text-yellow-300"
            >
              <Flag size={12} />
              Şikâyet
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function InfoPill({
  icon,
  text,
  green = false,
}: {
  icon: React.ReactNode;
  text: string;
  green?: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${
        green
          ? "border-plur-green/20 bg-plur-green/10 text-plur-green"
          : "border-plur-border bg-plur-bg/70 text-plur-muted"
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{text}</span>
    </span>
  );
}

function CompactDetail({
  icon,
  label,
  value,
  subValue,
  accent = "#ff4655",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  accent?: string;
}) {
  return (
    <div className="group/detail relative min-w-0 overflow-hidden rounded-xl border border-plur-border bg-plur-bg/65 px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15">
      <div
        className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full opacity-[0.08] blur-xl transition group-hover/detail:opacity-20"
        style={{ backgroundColor: accent }}
      />

      <div className="relative flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            color: accent,
            backgroundColor: `${accent}16`,
          }}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-plur-muted">
            {label}
          </p>
          <p className="mt-1 truncate text-[11px] font-black text-white">
            {value}
          </p>
          {subValue && (
            <p className="mt-0.5 truncate text-[7px] text-plur-muted">
              {subValue}
            </p>
          )}
        </div>
      </div>
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
      className={`pointer-events-none absolute inset-0 -translate-x-[130%] skew-x-[-18deg] bg-gradient-to-r from-transparent ${
        stronger ? "via-white/25" : "via-white/10"
      } to-transparent transition-transform duration-700 group-hover:translate-x-[130%]`}
    />
  );
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const difference = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(difference / 60000));

  if (minutes < 60) return `${minutes} dk önce`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatLastActive(
  value: string | null,
  online: boolean
) {
  if (online) return "Şimdi aktif";
  if (!value) return "Son aktiflik bilinmiyor";

  return `Son aktif: ${formatRelativeDate(value)}`;
}