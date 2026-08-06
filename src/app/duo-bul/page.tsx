"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Circle,
  Filter,
  Gamepad2,
  Globe2,
  Headphones,
  LoaderCircle,
  MapPin,
  Mic,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DuoPlayerCard from "@/components/DuoPlayerCard";

import {
  turkishCities,
  valorantServers,
} from "@/lib/data";

import { createClient } from "@/lib/supabase/client";

import type { Player } from "@/lib/data";

type SelectOption = {
  label: string;
  value: string;
};

type SupabaseProfile = {
  id: string;
  username: string;
  tag: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  city: string | null;
  server: string | null;
  rank: string | null;
  rank_tier: Player["rankTier"] | null;
  role: Player["role"] | null;
  agent: string | null;
  age: number | null;
  language: string | null;
  mic: boolean | null;
  verified: boolean | null;
  online: boolean | null;
  bio: string | null;
  tags: string[] | null;
  rating: number | string | null;
  review_count: number | null;
  win_rate: number | string | null;
  kd: number | string | null;
  headshot: number | string | null;
  hours: number | null;
  rr: number | null;
  last_active: string | null;
};

type SupabaseDuoPost = {
  id: string;
  user_id: string;
  title: string;
  game_mode: string;
  wanted_rank_tier: Player["rankTier"] | null;
  wanted_role: Player["role"] | "any" | null;
  server: string;
  city: string | null;
  mic_required: boolean;
  active_hours: string | null;
  description: string;
  status: "active" | "passive" | "closed";
  created_at: string;
};

const rankOptions: SelectOption[] = [
  { label: "Tüm Ranklar", value: "all" },
  { label: "Iron+", value: "iron" },
  { label: "Bronze+", value: "bronze" },
  { label: "Silver+", value: "silver" },
  { label: "Gold+", value: "gold" },
  { label: "Platinum+", value: "platinum" },
  { label: "Diamond+", value: "diamond" },
  { label: "Ascendant+", value: "ascendant" },
  { label: "Immortal+", value: "immortal" },
  { label: "Radiant", value: "radiant" },
];

const roleOptions: SelectOption[] = [
  { label: "Tüm Roller", value: "all" },
  { label: "Duelist", value: "duelist" },
  { label: "Initiator", value: "initiator" },
  { label: "Controller", value: "controller" },
  { label: "Sentinel", value: "sentinel" },
];

const cityOptions: SelectOption[] = [
  {
    label: "Tüm Türkiye",
    value: "all",
  },
  ...turkishCities.map((city) => ({
    label: city,
    value: city,
  })),
];

const serverOptions: SelectOption[] = [
  {
    label: "Tüm Oyun Sunucuları",
    value: "all",
  },
  ...valorantServers.map((server) => ({
    label: server,
    value: server,
  })),
];

const rankOrder: Record<Player["rankTier"], number> = {
  iron: 1,
  bronze: 2,
  silver: 3,
  gold: 4,
  platinum: 5,
  diamond: 6,
  ascendant: 7,
  immortal: 8,
  radiant: 9,
};

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("ı", "i")
    .trim();
}

function formatLastActive(value: string | null, online: boolean) {
  if (online) {
    return "Şimdi aktif";
  }

  if (!value) {
    return "Yakın zamanda aktif";
  }

  const date = new Date(value);
  const difference = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(difference / 60000));

  if (minutes < 60) {
    return `${minutes} dakika önce`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} saat önce`;
  }

  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

const gameModeLabels: Record<string, string> = {
  competitive: "Rekabetçi",
  unrated: "Derecesiz",
  premier: "Premier",
  swiftplay: "Tam Gaz",
  spike_rush: "Spike'a Hücum",
  deathmatch: "Ölüm Kalım Savaşı",
  custom: "Özel Oyun",
};

function mapPostToPlayer(
  post: SupabaseDuoPost,
  profile: SupabaseProfile
): Player {
  const online = profile.online ?? false;

  const postTags = [
    gameModeLabels[post.game_mode] ?? post.game_mode,
    post.active_hours,
    post.mic_required ? "Mikrofon zorunlu" : null,
    post.wanted_rank_tier
      ? `Aranan rank: ${post.wanted_rank_tier}`
      : "Rank fark etmez",
    post.wanted_role && post.wanted_role !== "any"
      ? `Aranan rol: ${post.wanted_role}`
      : "Rol fark etmez",
  ].filter(Boolean) as string[];

  return {
    id: profile.id,
    username: profile.username,
    tag: profile.tag ?? "TR",
    rank: profile.rank ?? "Rank belirtilmedi",
    rankTier: profile.rank_tier ?? "iron",
    role: profile.role ?? "duelist",
    agent: profile.agent ?? "Belirtilmedi",
    city: post.city ?? profile.city ?? "Belirtilmedi",
    server: post.server ?? profile.server ?? "Belirtilmedi",
    tags: [...postTags, ...(profile.tags ?? [])].slice(0, 6),
    online,
    avatar:
      profile.avatar_url ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
    banner:
      profile.banner_url ??
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    age: profile.age ?? 18,
    language: profile.language ?? "Türkçe",
    mic: profile.mic ?? false,
    verified: profile.verified ?? false,
    rating: Number(profile.rating ?? 0),
    reviewCount: profile.review_count ?? 0,
    winRate: Number(profile.win_rate ?? 0),
    kd: Number(profile.kd ?? 0),
    headshot: Number(profile.headshot ?? 0),
    hours: profile.hours ?? 0,
    rr: profile.rr ?? 0,
    lastActive: formatLastActive(profile.last_active, online),
    bio: `${post.title} — ${post.description}`,
  };
}

export default function DuoFindPage() {
  const supabase = useMemo(() => createClient(), []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedRank, setSelectedRank] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedServer, setSelectedServer] = useState("all");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortMode, setSortMode] = useState<"online" | "rating" | "rank">("online");

  useEffect(() => {
    async function loadPlayers() {
      setPlayersLoading(true);
      setPlayersError("");

      const { data: feedData, error: feedError } = await supabase.rpc(
        "get_active_duo_feed"
      );

      if (feedError) {
        setPlayersError(`İlanlar yüklenemedi: ${feedError.message}`);
        setPlayers([]);
        setPlayersLoading(false);
        return;
      }

      const rows = (feedData ?? []) as Array<{
        post: SupabaseDuoPost;
        profile: SupabaseProfile;
      }>;

      const mappedPlayers = rows
        .filter((row) => row.post && row.profile)
        .map((row) => mapPostToPlayer(row.post, row.profile));

      setPlayers(mappedPlayers);
      setPlayersLoading(false);
    }

    loadPlayers();
  }, [supabase]);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const normalizedSearch = normalizeText(search);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeText(player.username).includes(normalizedSearch) ||
        normalizeText(player.tag).includes(normalizedSearch) ||
        normalizeText(player.agent).includes(normalizedSearch) ||
        normalizeText(player.city).includes(normalizedSearch) ||
        normalizeText(player.server).includes(normalizedSearch);

      const matchesRank =
        selectedRank === "all" ||
        rankOrder[player.rankTier] >=
          rankOrder[selectedRank as Player["rankTier"]];

      const matchesRole =
        selectedRole === "all" || player.role === selectedRole;

      const matchesCity =
        selectedCity === "all" || player.city === selectedCity;

      const matchesServer =
        selectedServer === "all" || player.server === selectedServer;

      const matchesOnline = !onlineOnly || player.online;

      return (
        matchesSearch &&
        matchesRank &&
        matchesRole &&
        matchesCity &&
        matchesServer &&
        matchesOnline
      );
    });
  }, [
    players,
    search,
    selectedRank,
    selectedRole,
    selectedCity,
    selectedServer,
    onlineOnly,
  ]);

  const sortedPlayers = useMemo(() => {
    const result = [...filteredPlayers];

    if (sortMode === "online") {
      return result.sort((a, b) => Number(b.online) - Number(a.online));
    }

    if (sortMode === "rating") {
      return result.sort((a, b) => b.rating - a.rating);
    }

    return result.sort(
      (a, b) => rankOrder[b.rankTier] - rankOrder[a.rankTier]
    );
  }, [filteredPlayers, sortMode]);

  const scrollToPlayers = () => {
    document.getElementById("oyuncular")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedRank("all");
    setSelectedRole("all");
    setSelectedCity("all");
    setSelectedServer("all");
    setOnlineOnly(false);
  };

  const activeFilterCount = [
    selectedRank !== "all",
    selectedRole !== "all",
    selectedCity !== "all",
    selectedServer !== "all",
    onlineOnly,
  ].filter(Boolean).length;

  const onlineCount = players.filter((player) => player.online).length;
  const verifiedCount = players.filter((player) => player.verified).length;

  return (
    <div className="min-h-screen bg-plur-bg text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="px-4 py-5 md:px-6 lg:py-7">
          <div className="mx-auto max-w-[1600px]">
            {/* Kompakt ürün başlığı */}
            <section className="relative overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/70 px-5 py-7 shadow-[0_22px_80px_rgba(0,0,0,0.2)] md:px-8 md:py-9">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-plur-red/15 blur-[110px]" />
                <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px]" />
                <div
                  className="absolute inset-0 opacity-[0.025]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                    backgroundSize: "42px 42px",
                  }}
                />
              </div>

              <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-plur-red/30 bg-plur-red/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-plur-red">
                    <Sparkles size={12} className="animate-pulse" />
                    Canlı oyuncu ağı
                  </div>

                  <h1 className="mt-5 font-rajdhani text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
                    Yeni takım arkadaşın
                    <span className="mt-1 block bg-gradient-to-r from-plur-red via-red-300 to-plur-red bg-clip-text text-transparent">
                      seni bekliyor.
                    </span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-sm leading-7 text-plur-muted md:text-base">
                    Rankına, rolüne, şehrine ve oyun sunucuna uygun aktif
                    oyuncuları keşfet. Duo isteği gönder, sohbete geç ve birlikte
                    kazanmaya başla.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[580px]">
                  <HeroStat icon={<Users size={16} />} value={String(players.length)} label="Aktif ilan" />
                  <HeroStat icon={<Circle size={11} className="fill-plur-green" />} value={String(onlineCount)} label="Şu an online" green />
                  <HeroStat icon={<ShieldCheck size={16} />} value={String(verifiedCount)} label="Doğrulanmış" />
                  <HeroStat icon={<MapPin size={16} />} value="81" label="İlde erişim" />
                </div>
              </div>
            </section>

            {/* Mobil filtre açıcı */}
            <div className="mt-5 flex items-center gap-3 min-[1450px]:hidden">
              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-card text-xs font-bold text-white transition hover:border-plur-red/40"
              >
                <SlidersHorizontal size={16} className="text-plur-red" />
                Filtreler
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-plur-red px-2 py-0.5 text-[9px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <Link
                href="/profil/tamamla"
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-plur-red px-4 text-xs font-black text-white shadow-[0_12px_30px_rgba(255,70,85,0.22)]"
              >
                <UserPlus size={16} />
                İlan Oluştur
              </Link>
            </div>

            <div className="mt-5 grid min-w-0 items-start gap-5 min-[1450px]:grid-cols-[250px_minmax(0,1fr)]">
              {/* Sol filtre paneli */}
              <aside
                className={`${filtersOpen ? "block" : "hidden"} rounded-2xl border border-plur-border bg-plur-card/65 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.14)] min-[1450px]:sticky min-[1450px]:top-24 min-[1450px]:block`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-rajdhani text-lg font-black tracking-[0.08em]">FİLTRELER</p>
                    <p className="mt-1 text-[10px] text-plur-muted">Sana uygun oyuncuyu daralt</p>
                  </div>

                  {activeFilterCount > 0 && (
                    <span className="rounded-full border border-plur-red/30 bg-plur-red/10 px-2.5 py-1 text-[9px] font-black text-plur-red">
                      {activeFilterCount} AKTİF
                    </span>
                  )}
                </div>

                <div className="mt-4 border-t border-plur-border pt-4">
                  <label className="text-[9px] font-black uppercase tracking-[0.14em] text-plur-muted">Oyuncu ara</label>
                  <div className="group/search relative mt-2">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-plur-muted group-focus-within/search:text-plur-red" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="İsim, ajan, şehir..."
                      className="h-11 w-full rounded-xl border border-plur-border bg-plur-bg pl-10 pr-3 text-xs text-white outline-none transition placeholder:text-plur-muted focus:border-plur-red/55"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <FilterGroup label="Rank">
                    <FilterSelect label="Rank" value={selectedRank} options={rankOptions} onChange={setSelectedRank} />
                  </FilterGroup>
                  <FilterGroup label="Rol">
                    <FilterSelect label="Rol" value={selectedRole} options={roleOptions} onChange={setSelectedRole} />
                  </FilterGroup>
                  <FilterGroup label="Şehir">
                    <FilterSelect label="İl" value={selectedCity} options={cityOptions} onChange={setSelectedCity} icon={<MapPin size={13} />} />
                  </FilterGroup>
                  <FilterGroup label="Oyun sunucusu">
                    <FilterSelect label="Oyun Sunucusu" value={selectedServer} options={serverOptions} onChange={setSelectedServer} icon={<Globe2 size={13} />} />
                  </FilterGroup>
                </div>

                <button
                  type="button"
                  onClick={() => setOnlineOnly((current) => !current)}
                  className={`mt-4 flex h-11 w-full items-center justify-between rounded-xl border px-3 text-xs font-bold transition ${
                    onlineOnly
                      ? "border-plur-green/35 bg-plur-green/10 text-plur-green"
                      : "border-plur-border bg-plur-bg text-plur-muted hover:border-plur-green/25 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {onlineOnly && <span className="absolute h-full w-full animate-ping rounded-full bg-plur-green opacity-50" />}
                      <span className={`relative h-2.5 w-2.5 rounded-full ${onlineOnly ? "bg-plur-green" : "bg-plur-muted"}`} />
                    </span>
                    Sadece online
                  </span>
                  <span>{onlineOnly ? "Açık" : "Kapalı"}</span>
                </button>

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0 && !search}
                  className="group/clear mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg text-xs font-bold text-plur-muted transition hover:border-plur-red/35 hover:bg-plur-red/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw size={14} className="transition group-hover/clear:-rotate-180" />
                  Filtreleri Temizle
                </button>

                <Link
                  href="/profil/tamamla"
                  className="mt-3 hidden h-11 w-full items-center justify-center gap-2 rounded-xl bg-plur-red text-xs font-black text-white shadow-[0_12px_28px_rgba(255,70,85,0.2)] transition hover:-translate-y-0.5 min-[1450px]:flex"
                >
                  <UserPlus size={15} />
                  İlan Oluştur
                </Link>
              </aside>

              {/* Sonuç alanı */}
              <section id="oyuncular" className="min-w-0 scroll-mt-24">
                <div className="rounded-2xl border border-plur-border bg-plur-card/55 p-4 md:p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-rajdhani text-xl font-black tracking-[0.08em]">AKTİF DUO İLANLARI</h2>
                        {!playersLoading && !playersError && (
                          <span className="rounded-full border border-plur-red/25 bg-plur-red/10 px-2.5 py-1 text-[9px] font-black text-plur-red">
                            {sortedPlayers.length}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-plur-muted">Gerçek oyuncular, güncel ilanlar ve anlık eşleşme</p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="relative sm:min-w-[190px]">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-plur-muted" />
                        <input
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Hızlı ara..."
                          className="h-10 w-full rounded-xl border border-plur-border bg-plur-bg pl-9 pr-3 text-xs text-white outline-none placeholder:text-plur-muted focus:border-plur-red/50"
                        />
                      </div>

                      <label className="relative sm:min-w-[160px]">
                        <span className="sr-only">Sıralama</span>
                        <SlidersHorizontal size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-plur-red" />
                        <select
                          value={sortMode}
                          onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
                          className="h-10 w-full appearance-none rounded-xl border border-plur-border bg-plur-bg pl-9 pr-8 text-xs font-bold text-white outline-none focus:border-plur-red/50"
                        >
                          <option value="online">Önce Online</option>
                          <option value="rating">En Yüksek Puan</option>
                          <option value="rank">En Yüksek Rank</option>
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-plur-muted" />
                      </label>
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-plur-border pt-4">
                      <span className="mr-1 flex items-center gap-1.5 text-[10px] font-bold text-plur-muted">
                        <Filter size={13} className="text-plur-red" /> Aktif:
                      </span>
                      {selectedRank !== "all" && <ActiveFilter icon={<Gamepad2 size={11} />} label={rankOptions.find((option) => option.value === selectedRank)?.label ?? selectedRank} onRemove={() => setSelectedRank("all")} />}
                      {selectedRole !== "all" && <ActiveFilter icon={<Users size={11} />} label={roleOptions.find((option) => option.value === selectedRole)?.label ?? selectedRole} onRemove={() => setSelectedRole("all")} />}
                      {selectedCity !== "all" && <ActiveFilter icon={<MapPin size={11} />} label={selectedCity} onRemove={() => setSelectedCity("all")} />}
                      {selectedServer !== "all" && <ActiveFilter icon={<Globe2 size={11} />} label={selectedServer} onRemove={() => setSelectedServer("all")} />}
                      {onlineOnly && <ActiveFilter icon={<Circle size={7} className="fill-plur-green" />} label="Sadece online" onRemove={() => setOnlineOnly(false)} />}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {playersLoading ? (
                    <PlayerSkeletonList />
                  ) : playersError ? (
                    <div className="rounded-2xl border border-plur-red/30 bg-plur-red/10 px-6 py-12 text-center">
                      <LoaderCircle size={30} className="mx-auto text-plur-red" />
                      <h3 className="mt-4 text-lg font-bold">Oyuncular yüklenemedi</h3>
                      <p className="mt-2 text-sm text-red-300">{playersError}</p>
                    </div>
                  ) : sortedPlayers.length > 0 ? (
                    <div className="min-w-0 space-y-4 [&>*]:w-full [&>*]:max-w-full">
                      {sortedPlayers.map((player, index) => (
                        <DuoPlayerCard key={`${player.id}-${index}`} player={player} />
                      ))}
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-dashed border-plur-border bg-plur-card/45 px-6 py-16 text-center">
                      <div className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-plur-red/10 blur-[70px]" />
                      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-plur-border bg-plur-bg text-plur-muted">
                        <Search size={28} />
                      </div>
                      <h3 className="relative mt-5 font-rajdhani text-2xl font-black">OYUNCU BULUNAMADI</h3>
                      <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-plur-muted">Aradığın kriterlerde aktif bir ilan bulunamadı. Filtreleri esneterek tekrar deneyebilirsin.</p>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="relative mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-plur-red px-5 text-xs font-black text-white shadow-[0_12px_30px_rgba(255,70,85,0.22)] transition hover:-translate-y-0.5"
                      >
                        <RotateCcw size={14} /> Filtreleri Temizle
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <InfoCard icon={<ShieldCheck size={19} />} title="Güvenli eşleşme" description="Profil bilgilerini incele, doğrulanmış oyuncularla iletişime geç." />
                  <InfoCard icon={<Mic size={19} />} title="İletişim uyumu" description="Mikrofon ve oyun tarzı tercihine göre doğru duo adayını bul." />
                  <InfoCard icon={<Globe2 size={19} />} title="Sunucu uyumu" description="Aynı sunucuda oynayan oyuncularla daha stabil maçlara gir." />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
};

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.14em] text-plur-muted">{label}</p>
      {children}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange, icon }: FilterSelectProps) {
  return (
    <label className="group/select relative block min-w-0">
      <span className="sr-only">{label}</span>
      {icon && <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-plur-muted group-focus-within/select:text-plur-red">{icon}</span>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 w-full cursor-pointer appearance-none rounded-xl border border-plur-border bg-plur-bg pr-9 text-xs font-semibold text-white outline-none transition hover:border-white/15 focus:border-plur-red/55 ${icon ? "pl-9" : "pl-3"}`}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-plur-muted" />
    </label>
  );
}

function ActiveFilter({ icon, label, onRemove }: { icon: React.ReactNode; label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="group/tag flex items-center gap-1.5 rounded-full border border-plur-red/25 bg-plur-red/10 px-2.5 py-1.5 text-[9px] font-bold text-plur-red transition hover:border-plur-red/50"
    >
      {icon}<span>{label}</span><X size={11} className="transition group-hover/tag:rotate-90" />
    </button>
  );
}

function HeroStat({ icon, value, label, green = false }: { icon: React.ReactNode; value: string; label: string; green?: boolean }) {
  return (
    <div className="group/stat relative overflow-hidden rounded-2xl border border-plur-border bg-plur-bg/65 p-3 backdrop-blur-md transition hover:-translate-y-1 hover:border-plur-red/30">
      <div className={`flex items-center gap-2 ${green ? "text-plur-green" : "text-plur-red"}`}>
        <span className="transition group-hover/stat:scale-110">{icon}</span>
        <span className="font-rajdhani text-xl font-black text-white">{value}</span>
      </div>
      <p className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.13em] text-plur-muted">{label}</p>
    </div>
  );
}

function PlayerSkeletonList() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="overflow-hidden rounded-2xl border border-plur-border bg-plur-card/55 p-5">
          <div className="flex animate-pulse items-start gap-4">
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-white/[0.06]" />
            <div className="flex-1">
              <div className="h-3 w-24 rounded bg-white/[0.06]" />
              <div className="mt-4 h-6 w-2/5 rounded bg-white/[0.07]" />
              <div className="mt-3 h-3 w-full rounded bg-white/[0.05]" />
              <div className="mt-2 h-3 w-3/4 rounded bg-white/[0.05]" />
              <div className="mt-4 flex gap-2">
                <div className="h-7 w-24 rounded-lg bg-white/[0.05]" />
                <div className="h-7 w-28 rounded-lg bg-white/[0.05]" />
                <div className="h-7 w-20 rounded-lg bg-white/[0.05]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <article className="group/info relative overflow-hidden rounded-2xl border border-plur-border bg-plur-card/50 p-4 transition hover:-translate-y-1 hover:border-plur-red/30">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-plur-red/10 text-plur-red transition group-hover/info:bg-plur-red group-hover/info:text-white">{icon}</div>
      <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-plur-muted">{description}</p>
    </article>
  );
}