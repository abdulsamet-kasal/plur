import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Check,
  Circle,
  Clock3,
  Crown,
  Gamepad2,
  Globe2,
  Headphones,
  History,
  MapPin,
  MessageCircle,
  Mic,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Swords,
  Target,
  Trophy,
  UserPlus,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type PlayerProfilePageProps = {
  params: Promise<{ id: string }>;
};

type ProfileRow = {
  id: string;
  username: string | null;
  tag: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  city: string | null;
  server: string | null;
  rank: string | null;
  rank_tier: string | null;
  role: string | null;
  agent: string | null;
  age: number | null;
  language: string | null;
  mic: boolean | null;
  verified: boolean | null;
  online: boolean | null;
  bio: string | null;
  tags: string[] | null;
  rating: number | null;
  review_count: number | null;
  win_rate: number | null;
  kd: number | null;
  headshot: number | null;
  hours: number | null;
  rr: number | null;
  last_active: string | null;
  riot_puuid: string | null;
  riot_name: string | null;
  riot_tag: string | null;
  riot_region: string | null;
  riot_platform: string | null;
  riot_account_level: number | null;
  riot_rr: number | null;
  riot_peak_rank: string | null;
  riot_peak_rr: number | null;
  riot_card_id: string | null;
  riot_verified_at: string | null;
};

type JsonRecord = Record<string, unknown>;

type LiveRiotData = {
  accountLevel: number | null;
  currentRank: string | null;
  currentRr: number | null;
  peakRank: string | null;
  peakRr: number | null;
  lastChange: number | null;
  matches: MatchSummary[];
  updatedAt: string;
};

type MatchSummary = {
  id: string;
  map: string;
  mode: string;
  agent: string;
  won: boolean | null;
  score: string;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
  playedAt: string | null;
};

const rankColors: Record<string, string> = {
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

const roleIcons: Record<string, string> = {
  duelist: "⚔️",
  initiator: "📡",
  controller: "🌫️",
  sentinel: "🛡️",
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecord(value: unknown, key: string): JsonRecord | null {
  if (!isRecord(value)) return null;
  const nested = value[key];
  return isRecord(nested) ? nested : null;
}

function getString(value: unknown, ...keys: string[]): string | null {
  let current: unknown = value;

  for (const key of keys) {
    if (!isRecord(current)) return null;
    current = current[key];
  }

  return typeof current === "string" ? current : null;
}

function getNumber(value: unknown, ...keys: string[]): number | null {
  let current: unknown = value;

  for (const key of keys) {
    if (!isRecord(current)) return null;
    current = current[key];
  }

  return typeof current === "number" && Number.isFinite(current)
    ? current
    : null;
}

function getArray(value: unknown, ...keys: string[]): unknown[] {
  let current: unknown = value;

  for (const key of keys) {
    if (!isRecord(current)) return [];
    current = current[key];
  }

  return Array.isArray(current) ? current : [];
}

function normalizeRankTier(rank: string | null, fallback: string | null) {
  const text = `${rank ?? ""} ${fallback ?? ""}`.toLocaleLowerCase("en-US");

  return (
    Object.keys(rankColors).find((tier) => text.includes(tier)) ??
    fallback ??
    "iron"
  );
}

function safeDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRelativeDate(value: string | null) {
  const date = safeDate(value);
  if (!date) return "Bilinmiyor";

  const difference = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(difference / 60_000));
  if (minutes < 60) return `${minutes} dk önce`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function findPlayerInMatch(match: JsonRecord, puuid: string) {
  const candidates = [
    ...getArray(match, "players"),
    ...getArray(match, "players", "all_players"),
    ...getArray(match, "players", "red"),
    ...getArray(match, "players", "blue"),
  ];

  return (
    candidates.find(
      (candidate) =>
        isRecord(candidate) &&
        (getString(candidate, "puuid") === puuid ||
          getString(candidate, "account", "puuid") === puuid)
    ) ?? null
  );
}

function mapMatch(rawMatch: unknown, puuid: string, index: number): MatchSummary | null {
  if (!isRecord(rawMatch)) return null;

  const metadata = getRecord(rawMatch, "metadata");
  const player = findPlayerInMatch(rawMatch, puuid);
  if (!isRecord(player)) return null;

  const stats = getRecord(player, "stats") ?? player;
  const teamId =
    getString(player, "team_id") ??
    getString(player, "team") ??
    getString(player, "teamId");

  const teams = getArray(rawMatch, "teams").filter(isRecord);
  const ownTeam = teams.find(
    (team) =>
      getString(team, "team_id") === teamId ||
      getString(team, "team") === teamId ||
      getString(team, "id") === teamId
  );
  const enemyTeam = teams.find((team) => team !== ownTeam);

  const ownRounds =
    (ownTeam &&
      (getNumber(ownTeam, "rounds", "won") ??
        getNumber(ownTeam, "rounds_won") ??
        getNumber(ownTeam, "score"))) ??
    0;
  const enemyRounds =
    (enemyTeam &&
      (getNumber(enemyTeam, "rounds", "won") ??
        getNumber(enemyTeam, "rounds_won") ??
        getNumber(enemyTeam, "score"))) ??
    0;

  const wonValue: boolean | null = ownTeam
    ? typeof ownTeam.won === "boolean"
      ? ownTeam.won
      : typeof ownTeam.has_won === "boolean"
        ? ownTeam.has_won
        : null
    : null;

  const shots = getRecord(stats, "shots") ?? getRecord(player, "shots");

  return {
    id:
      getString(metadata, "match_id") ??
      getString(rawMatch, "match_id") ??
      `match-${index}`,
    map:
      getString(metadata, "map", "name") ??
      getString(metadata, "map") ??
      getString(rawMatch, "map", "name") ??
      "Bilinmeyen Harita",
    mode:
      getString(metadata, "mode", "name") ??
      getString(metadata, "mode") ??
      "Rekabetçi",
    agent:
      getString(player, "agent", "name") ??
      getString(player, "character", "name") ??
      getString(player, "agent") ??
      "Bilinmiyor",
    won: wonValue,
    score: `${ownRounds}-${enemyRounds}`,
    kills: getNumber(stats, "kills") ?? 0,
    deaths: getNumber(stats, "deaths") ?? 0,
    assists: getNumber(stats, "assists") ?? 0,
    headshots: getNumber(shots, "head") ?? getNumber(stats, "headshots") ?? 0,
    bodyshots: getNumber(shots, "body") ?? getNumber(stats, "bodyshots") ?? 0,
    legshots: getNumber(shots, "leg") ?? getNumber(stats, "legshots") ?? 0,
    playedAt:
      getString(metadata, "started_at") ??
      getString(metadata, "game_start_patched") ??
      getString(metadata, "game_start") ??
      null,
  };
}

async function fetchLiveRiotData(profile: ProfileRow): Promise<LiveRiotData | null> {
  // Güvenlik: HENRIKDEV_API_KEY yalnızca sunucuda kullanılır (NEXT_PUBLIC_ öneki yok).
  // Bu dosya bir Server Component'tir; asla "use client" eklenmemeli.
  // Merkezi kural: yeni HenrikDev çağrıları önce /api/valorant/profile rotasına eklenir.
  const apiKey = process.env.HENRIKDEV_API_KEY;
  const riotName = profile.riot_name;
  const riotTag = profile.riot_tag;
  const puuid = profile.riot_puuid;

  if (!apiKey || !riotName || !riotTag || !puuid) return null;

  const region = profile.riot_region || "eu";
  const platform = profile.riot_platform || "pc";
  const name = encodeURIComponent(riotName);
  const tag = encodeURIComponent(riotTag);

  try {
    const [accountResponse, mmrResponse, matchesResponse] = await Promise.all([
      fetch(`https://api.henrikdev.xyz/valorant/v2/account/${name}/${tag}`, {
        headers: { Authorization: apiKey },
        next: { revalidate: 300 },
      }),
      fetch(
        `https://api.henrikdev.xyz/valorant/v3/mmr/${region}/${platform}/${name}/${tag}`,
        {
          headers: { Authorization: apiKey },
          next: { revalidate: 300 },
        }
      ),
      fetch(
        `https://api.henrikdev.xyz/valorant/v4/matches/${region}/${platform}/${name}/${tag}?mode=competitive&size=5`,
        {
          headers: { Authorization: apiKey },
          next: { revalidate: 300 },
        }
      ),
    ]);

    if (!accountResponse.ok || !mmrResponse.ok || !matchesResponse.ok) {
      return null;
    }

    const accountJson = (await accountResponse.json()) as unknown;
    const mmrJson = (await mmrResponse.json()) as unknown;
    const matchesJson = (await matchesResponse.json()) as unknown;

    const account = getRecord(accountJson, "data");
    const mmr = getRecord(mmrJson, "data");
    const matchRows = getArray(matchesJson, "data");

    return {
      accountLevel: getNumber(account, "account_level"),
      currentRank: getString(mmr, "current", "tier", "name"),
      currentRr: getNumber(mmr, "current", "rr"),
      peakRank: getString(mmr, "peak", "tier", "name"),
      peakRr: getNumber(mmr, "peak", "rr"),
      lastChange: getNumber(mmr, "current", "last_change"),
      matches: matchRows
        .map((match, index) => mapMatch(match, puuid, index))
        .filter((match): match is MatchSummary => Boolean(match)),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function calculateMatchStats(matches: MatchSummary[]) {
  if (matches.length === 0) {
    return { winRate: null, kd: null, headshot: null, wins: 0 };
  }

  const totals = matches.reduce(
    (sum, match) => ({
      kills: sum.kills + match.kills,
      deaths: sum.deaths + match.deaths,
      headshots: sum.headshots + match.headshots,
      bodyshots: sum.bodyshots + match.bodyshots,
      legshots: sum.legshots + match.legshots,
      wins: sum.wins + (match.won === true ? 1 : 0),
      decided: sum.decided + (match.won === null ? 0 : 1),
    }),
    {
      kills: 0,
      deaths: 0,
      headshots: 0,
      bodyshots: 0,
      legshots: 0,
      wins: 0,
      decided: 0,
    }
  );

  const allShots = totals.headshots + totals.bodyshots + totals.legshots;

  return {
    winRate:
      totals.decided > 0
        ? Math.round((totals.wins / totals.decided) * 100)
        : null,
    kd:
      totals.deaths > 0
        ? Number((totals.kills / totals.deaths).toFixed(2))
        : totals.kills,
    headshot:
      allShots > 0 ? Math.round((totals.headshots / allShots) * 100) : null,
    wins: totals.wins,
  };
}

export default async function PlayerProfilePage({
  params,
}: PlayerProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, username, tag, avatar_url, banner_url, city, server, rank,
      rank_tier, role, agent, age, language, mic, verified, online,
      bio, tags, rating, review_count, win_rate, kd, headshot, hours,
      rr, last_active, riot_puuid, riot_name, riot_tag, riot_region,
      riot_platform, riot_account_level, riot_rr, riot_peak_rank,
      riot_peak_rr, riot_card_id, riot_verified_at
    `)
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const player = data as ProfileRow;
  const liveRiot = await fetchLiveRiotData(player);
  const recentStats = calculateMatchStats(liveRiot?.matches ?? []);

  const currentRank = liveRiot?.currentRank ?? player.rank ?? "Rank belirtilmemiş";
  const currentRr = liveRiot?.currentRr ?? player.riot_rr ?? player.rr ?? 0;
  const peakRank = liveRiot?.peakRank ?? player.riot_peak_rank ?? "Belirtilmedi";
  const peakRr = liveRiot?.peakRr ?? player.riot_peak_rr ?? 0;
  const accountLevel = liveRiot?.accountLevel ?? player.riot_account_level ?? 0;
  const rankTier = normalizeRankTier(currentRank, player.rank_tier);
  const rankColor = rankColors[rankTier] ?? "#ff4655";

  const winRate = recentStats.winRate ?? player.win_rate;
  const kd = recentStats.kd ?? player.kd;
  const headshot = recentStats.headshot ?? player.headshot;

  const displayName = player.riot_name ?? player.username ?? "Oyuncu";
  const displayTag = player.riot_tag ?? player.tag ?? "TR";

  const avatar =
    player.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`;
  const banner =
    player.banner_url ||
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80";

  const riotVerified = Boolean(player.riot_puuid && player.riot_verified_at);

  return (
    <main className="min-h-screen overflow-hidden bg-plur-bg px-4 py-6 text-white md:px-8">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-48 -top-44 h-[520px] w-[520px] rounded-full bg-plur-red/10 blur-[150px]" />
        <div className="absolute -bottom-52 -right-44 h-[520px] w-[520px] rounded-full bg-cyan-400/7 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/duo-bul"
            className="group inline-flex items-center gap-2 rounded-xl border border-plur-border bg-plur-card/60 px-4 py-2.5 text-xs font-semibold text-plur-muted transition hover:-translate-y-0.5 hover:border-plur-red/40 hover:bg-plur-red/10 hover:text-white"
          >
            <ArrowLeft size={15} className="transition group-hover:-translate-x-1" />
            Duo listesine dön
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/mesajlar?user=${player.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 text-xs font-bold text-cyan-300 transition hover:-translate-y-0.5 hover:border-cyan-400/50"
            >
              <MessageCircle size={15} />
              Mesaj Gönder
            </Link>

            <Link
              href="/duo-bul"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-plur-red px-4 text-xs font-black text-white shadow-[0_12px_30px_rgba(255,70,85,0.22)] transition hover:-translate-y-0.5"
            >
              <UserPlus size={15} />
              Duo Bul
            </Link>
          </div>
        </div>

        <section className="group relative overflow-hidden rounded-[30px] border border-plur-border bg-plur-card/70 shadow-[0_30px_100px_rgba(0,0,0,0.28)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.18] transition duration-700 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url(${banner})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-plur-bg via-plur-bg/95 to-plur-bg/72" />
          <div
            className="pointer-events-none absolute -right-28 -top-32 h-[420px] w-[420px] rounded-full opacity-20 blur-[125px]"
            style={{ backgroundColor: rankColor }}
          />

          <div className="relative grid gap-8 p-6 md:p-10 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div
                  className="rounded-[30px] p-[3px] shadow-2xl"
                  style={{
                    background: `linear-gradient(145deg, ${rankColor}, rgba(255,255,255,.08), transparent)`,
                  }}
                >
                  <img
                    src={avatar}
                    alt={`${displayName} profil fotoğrafı`}
                    className="h-32 w-32 rounded-[27px] bg-plur-bg object-cover md:h-36 md:w-36"
                  />
                </div>

                {player.online && (
                  <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-[4px] border-plur-card bg-plur-green shadow-[0_0_24px_rgba(39,215,123,.5)]">
                    <span className="absolute h-4 w-4 animate-ping rounded-full bg-plur-green opacity-45" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {riotVerified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-cyan-300">
                      <ShieldCheck size={13} /> Riot Verified
                    </span>
                  )}

                  {player.online ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-plur-green/25 bg-plur-green/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-plur-green">
                      <Circle size={6} className="fill-plur-green" /> Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-plur-border bg-plur-bg/70 px-3 py-1.5 text-[9px] font-bold text-plur-muted">
                      <Clock3 size={12} /> {formatRelativeDate(player.last_active)}
                    </span>
                  )}
                </div>

                <h1 className="mt-4 break-words font-rajdhani text-4xl font-black leading-none sm:text-5xl md:text-6xl">
                  {displayName}
                  <span className="ml-2 text-plur-muted">#{displayTag}</span>
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-plur-muted md:text-base">
                  {player.bio || "Bu oyuncu henüz biyografi eklememiş."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <ProfileMeta icon={<MapPin size={14} />} value={player.city || "İl belirtilmemiş"} />
                  <ProfileMeta icon={<Globe2 size={14} />} value={player.server || "Sunucu belirtilmemiş"} />
                  <ProfileMeta icon={<Headphones size={14} />} value={player.language || "Türkçe"} />
                  {player.mic && (
                    <ProfileMeta icon={<Mic size={14} />} value="Mikrofon var" green />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroMetric
                icon={<Trophy size={18} />}
                label="Güncel Rank"
                value={currentRank}
                subValue={`${currentRr} RR`}
                accent={rankColor}
              />
              <HeroMetric
                icon={<Crown size={18} />}
                label="Peak Rank"
                value={peakRank}
                subValue={`${peakRr} RR`}
                accent="#facc15"
              />
              <HeroMetric
                icon={<Zap size={18} />}
                label="Hesap Seviyesi"
                value={String(accountLevel)}
                subValue="Valorant Level"
                accent="#22d3ee"
              />
              <HeroMetric
                icon={<RefreshCw size={18} />}
                label="Son Senkron"
                value={liveRiot ? "Canlı" : "Kayıtlı"}
                subValue={formatRelativeDate(liveRiot?.updatedAt ?? player.riot_verified_at)}
                accent={liveRiot ? "#27d77b" : "#94a3b8"}
              />
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_380px]">
          <div className="space-y-5">
            <InfoPanel
              title="Rekabetçi Performans"
              description={
                liveRiot?.matches.length
                  ? "Son rekabetçi maçlardan hesaplanan canlı değerler."
                  : "Kayıtlı profil istatistikleri."
              }
              icon={<BarChart3 size={18} />}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ProfileMetric label="Win Rate" value={winRate == null ? "—" : `%${Math.round(winRate)}`} icon={<Trophy size={16} />} />
                <ProfileMetric label="K/D" value={kd == null ? "—" : Number(kd).toFixed(2)} icon={<Target size={16} />} />
                <ProfileMetric label="Headshot" value={headshot == null ? "—" : `%${Math.round(headshot)}`} icon={<Activity size={16} />} />
                <ProfileMetric label="Son 5 Galibiyet" value={liveRiot ? `${recentStats.wins}/${liveRiot.matches.length}` : "—"} icon={<Check size={16} />} />
              </div>
            </InfoPanel>

            <InfoPanel
              title="Son Rekabetçi Maçlar"
              description="Valorant hesabından alınan son maçlar."
              icon={<History size={18} />}
            >
              {liveRiot?.matches.length ? (
                <div className="space-y-3">
                  {liveRiot.matches.map((match) => (
                    <MatchCard key={match.id} match={match} rankColor={rankColor} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-plur-border bg-plur-bg/45 px-6 py-10 text-center">
                  <Radio size={28} className="mx-auto text-plur-muted" />
                  <p className="mt-3 text-sm font-bold text-white">Maç verisi şu an alınamadı</p>
                  <p className="mt-2 text-xs leading-5 text-plur-muted">
                    API limiti veya geçici bağlantı sorunu olabilir. Kayıtlı rank bilgileri gösterilmeye devam ediyor.
                  </p>
                </div>
              )}
            </InfoPanel>

            <InfoPanel title="Oyuncu Hakkında" description="Oyun tarzı ve tercihleri." icon={<Sparkles size={18} />}>
              <p className="text-sm leading-7 text-plur-muted">
                {player.bio || "Bu oyuncu henüz biyografi eklememiş."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {(player.tags ?? []).map((tag) => (
                  <span key={tag} className="rounded-lg border border-plur-border bg-plur-bg/70 px-3 py-2 text-xs text-plur-muted">
                    {tag}
                  </span>
                ))}
                {player.mic && (
                  <span className="flex items-center gap-1.5 rounded-lg border border-plur-green/20 bg-plur-green/10 px-3 py-2 text-xs font-semibold text-plur-green">
                    <Mic size={13} /> Mikrofon var
                  </span>
                )}
              </div>
            </InfoPanel>
          </div>

          <div className="space-y-5">
            <InfoPanel title="Rol ve Ajan" description="Oyuncunun tercih ettiği oyun tarzı." icon={<Swords size={18} />}>
              <div className="flex items-center gap-4 rounded-2xl border border-plur-border bg-plur-bg/65 p-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-plur-red/10 text-2xl">
                  {roleIcons[player.role ?? ""] ?? "🎮"}
                </span>
                <div>
                  <p className="font-rajdhani text-xl font-black capitalize text-white">
                    {player.role || "Rol belirtilmemiş"}
                  </p>
                  <p className="mt-1 text-xs text-plur-muted">
                    {player.agent || "Ajan belirtilmemiş"}
                  </p>
                </div>
              </div>
            </InfoPanel>

            <InfoPanel title="Topluluk Puanı" description="PLUR oyuncularının değerlendirmeleri." icon={<Star size={18} />}>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10">
                  <Star size={28} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div>
                  <p className="font-rajdhani text-4xl font-black text-white">
                    {Number(player.rating ?? 0).toFixed(1)}
                  </p>
                  <p className="mt-1 text-xs text-plur-muted">
                    {player.review_count ?? 0} değerlendirme
                  </p>
                </div>
              </div>
            </InfoPanel>

            <InfoPanel title="Profil Detayları" description="Oyuncunun topluluk bilgileri." icon={<Gamepad2 size={18} />}>
              <div className="space-y-3">
                <DetailRow label="Yaş" value={player.age ? String(player.age) : "Belirtilmemiş"} />
                <DetailRow label="İl" value={player.city || "Belirtilmemiş"} />
                <DetailRow label="Sunucu" value={player.server || "Belirtilmemiş"} />
                <DetailRow label="Dil" value={player.language || "Türkçe"} />
                <DetailRow label="Mikrofon" value={player.mic ? "Var" : "Yok"} success={Boolean(player.mic)} />
                <DetailRow label="Riot Hesabı" value={riotVerified ? "Doğrulanmış" : "Bağlı değil"} success={riotVerified} />
                <DetailRow label="Platform" value={(player.riot_platform || "pc").toUpperCase()} />
                <DetailRow label="Bölge" value={(player.riot_region || "eu").toUpperCase()} />
              </div>
            </InfoPanel>

            {riotVerified && (
              <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-plur-card to-plur-red/5 p-5">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <ShieldCheck size={18} />
                    <p className="text-xs font-black uppercase tracking-[0.14em]">Doğrulanmış Valorant Hesabı</p>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-plur-muted">
                    Rank ve rekabetçi maç bilgileri bağlı Riot hesabından alınır. Elle değiştirilemez.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function MatchCard({ match, rankColor }: { match: MatchSummary; rankColor: string }) {
  const totalShots = match.headshots + match.bodyshots + match.legshots;
  const hs = totalShots > 0 ? Math.round((match.headshots / totalShots) * 100) : 0;

  return (
    <article className="group grid gap-4 rounded-2xl border border-plur-border bg-plur-bg/60 p-4 transition hover:-translate-y-0.5 hover:border-plur-red/30 sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:items-center">
      <div className={`flex h-16 items-center justify-center rounded-xl border text-center ${
        match.won === true
          ? "border-plur-green/25 bg-plur-green/10"
          : match.won === false
            ? "border-plur-red/25 bg-plur-red/10"
            : "border-plur-border bg-plur-card"
      }`}>
        <div>
          <p className={`text-[9px] font-black uppercase tracking-wider ${
            match.won === true ? "text-plur-green" : match.won === false ? "text-plur-red" : "text-plur-muted"
          }`}>
            {match.won === true ? "GALİBİYET" : match.won === false ? "MAĞLUBİYET" : "MAÇ"}
          </p>
          <p className="mt-1 font-rajdhani text-xl font-black text-white">{match.score}</p>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-rajdhani text-lg font-black text-white">{match.map}</p>
          <span className="rounded-full border border-plur-border bg-plur-card px-2 py-1 text-[8px] font-bold text-plur-muted">
            {match.mode}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-plur-muted">
          <span>{match.agent}</span>
          <span>{formatRelativeDate(match.playedAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:min-w-[245px]">
        <MiniMetric label="K/D/A" value={`${match.kills}/${match.deaths}/${match.assists}`} accent={rankColor} />
        <MiniMetric label="K/D" value={(match.kills / Math.max(1, match.deaths)).toFixed(2)} />
        <MiniMetric label="HS" value={`%${hs}`} />
      </div>
    </article>
  );
}

function HeroMetric({
  icon,
  label,
  value,
  subValue,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  accent: string;
}) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-plur-border bg-plur-bg/65 p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/15">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl transition group-hover:opacity-25" style={{ backgroundColor: accent }} />
      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ color: accent, backgroundColor: `${accent}18` }}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-plur-muted">{label}</p>
          <p className="mt-1 truncate font-rajdhani text-lg font-black text-white">{value}</p>
          <p className="mt-1 truncate text-[9px] text-plur-muted">{subValue}</p>
        </div>
      </div>
    </div>
  );
}

function ProfileMeta({ icon, value, green = false }: { icon: React.ReactNode; value: string; green?: boolean }) {
  return (
    <span className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${green ? "border-plur-green/20 bg-plur-green/10 text-plur-green" : "border-plur-border bg-plur-bg/60 text-plur-muted"}`}>
      {icon}
      {value}
    </span>
  );
}

function InfoPanel({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-plur-border bg-plur-card/60 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.12)] md:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plur-red/10 text-plur-red">{icon}</span>
        <div>
          <h2 className="font-rajdhani text-lg font-black uppercase tracking-[0.08em] text-white">{title}</h2>
          <p className="mt-1 text-[10px] leading-5 text-plur-muted">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ProfileMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="group rounded-xl border border-plur-border bg-plur-bg/70 p-4 transition hover:-translate-y-1 hover:border-plur-red/25">
      <div className="flex items-center justify-between gap-2">
        <span className="text-plur-red">{icon}</span>
        <span className="font-rajdhani text-2xl font-black text-white">{value}</span>
      </div>
      <p className="mt-3 text-[8px] font-black uppercase tracking-[0.14em] text-plur-muted">{label}</p>
    </div>
  );
}

function MiniMetric({ label, value, accent = "#ff4655" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-plur-border bg-plur-card/65 px-3 py-2 text-center">
      <p className="text-xs font-black text-white" style={{ color: accent }}>{value}</p>
      <p className="mt-1 text-[7px] font-bold uppercase tracking-wider text-plur-muted">{label}</p>
    </div>
  );
}

function DetailRow({ label, value, success = false }: { label: string; value: string; success?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-plur-border bg-plur-bg/60 px-4 py-3">
      <span className="text-xs text-plur-muted">{label}</span>
      <span className={`flex items-center gap-1.5 text-xs font-semibold ${success ? "text-plur-green" : "text-white"}`}>
        {success && <Check size={13} />}
        {value}
      </span>
    </div>
  );
}
