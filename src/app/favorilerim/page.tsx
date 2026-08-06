"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  LoaderCircle,
  RefreshCcw,
  Search,
  Sparkles,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DuoPostCard from "@/components/DuoPostCard";
import type {
  DuoPostCardData,
  PlayerRole,
  RankTier,
} from "@/components/DuoPostCard";

import { createClient } from "@/lib/supabase/client";

type FavoriteRow = {
  id: string;
  post_id: string;
  created_at: string;
};

type SupabaseDuoPost = {
  id: string;
  user_id: string;
  title: string;
  game_mode: string;
  wanted_rank_tier: RankTier | null;
  wanted_role: PlayerRole | "any" | null;
  server: string;
  city: string | null;
  mic_required: boolean;
  active_hours: string | null;
  description: string;
  status: "active" | "passive" | "closed";
  created_at: string;
};

type SupabaseProfile = {
  id: string;
  username: string;
  tag: string | null;
  avatar_url: string | null;
  city: string | null;
  server: string | null;
  rank: string | null;
  rank_tier: RankTier | null;
  role: PlayerRole | null;
  agent: string | null;
  language: string | null;
  mic: boolean | null;
  verified: boolean | null;
  online: boolean | null;
  rating: number | string | null;
  review_count: number | null;
  last_active: string | null;
};

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("ı", "i")
    .trim();
}

function mapPost(
  post: SupabaseDuoPost,
  profile: SupabaseProfile
): DuoPostCardData {
  return {
    id: post.id,
    userId: post.user_id,
    title: post.title,
    gameMode: post.game_mode,
    wantedRankTier: post.wanted_rank_tier,
    wantedRole: post.wanted_role,
    server: post.server,
    city: post.city,
    micRequired: post.mic_required,
    activeHours: post.active_hours,
    description: post.description,
    createdAt: post.created_at,
    profile: {
      id: profile.id,
      username: profile.username,
      tag: profile.tag ?? "TR",
      avatarUrl:
        profile.avatar_url ??
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
      city: profile.city,
      server: profile.server,
      rank: profile.rank,
      rankTier: profile.rank_tier,
      role: profile.role,
      agent: profile.agent,
      language: profile.language,
      mic: profile.mic ?? false,
      verified: profile.verified ?? false,
      online: profile.online ?? false,
      rating: Number(profile.rating ?? 0),
      reviewCount: profile.review_count ?? 0,
      lastActive: profile.last_active,
    },
  };
}

export default function FavorilerimPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<DuoPostCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  async function loadFavorites(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/giris");
      return;
    }

    const { data: favoritesData, error: favoritesError } = await supabase
      .from("favorites")
      .select("id, post_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (favoritesError) {
      setErrorMessage(
        `Favoriler yüklenemedi: ${favoritesError.message}`
      );
      setPosts([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const favorites = (favoritesData ?? []) as FavoriteRow[];

    if (favorites.length === 0) {
      setPosts([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const postIds = favorites.map((favorite) => favorite.post_id);

    const { data: postsData, error: postsError } = await supabase
      .from("duo_posts")
      .select(`
        id,
        user_id,
        title,
        game_mode,
        wanted_rank_tier,
        wanted_role,
        server,
        city,
        mic_required,
        active_hours,
        description,
        status,
        created_at
      `)
      .in("id", postIds)
      .eq("status", "active");

    if (postsError) {
      setErrorMessage(
        `Favori ilanlar yüklenemedi: ${postsError.message}`
      );
      setPosts([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const favoritePosts = (postsData ?? []) as SupabaseDuoPost[];

    if (favoritePosts.length === 0) {
      setPosts([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const userIds = [
      ...new Set(favoritePosts.map((post) => post.user_id)),
    ];

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        tag,
        avatar_url,
        city,
        server,
        rank,
        rank_tier,
        role,
        agent,
        language,
        mic,
        verified,
        online,
        rating,
        review_count,
        last_active
      `)
      .in("id", userIds);

    if (profilesError) {
      setErrorMessage(
        `Oyuncu profilleri yüklenemedi: ${profilesError.message}`
      );
      setPosts([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const profileMap = new Map(
      ((profilesData ?? []) as SupabaseProfile[]).map((profile) => [
        profile.id,
        profile,
      ])
    );

    const postMap = new Map(
      favoritePosts.map((post) => [post.id, post])
    );

    const mappedPosts = favorites.flatMap((favorite) => {
      const post = postMap.get(favorite.post_id);

      if (!post) {
        return [];
      }

      const profile = profileMap.get(post.user_id);

      return profile ? [mapPost(post, profile)] : [];
    });

    setPosts(mappedPosts);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    if (!normalizedSearch) {
      return posts;
    }

    return posts.filter((post) => {
      return (
        normalizeText(post.title).includes(normalizedSearch) ||
        normalizeText(post.description).includes(normalizedSearch) ||
        normalizeText(post.profile.username).includes(normalizedSearch) ||
        normalizeText(post.profile.agent ?? "").includes(normalizedSearch) ||
        normalizeText(post.city ?? post.profile.city ?? "").includes(
          normalizedSearch
        ) ||
        normalizeText(post.server).includes(normalizedSearch)
      );
    });
  }, [posts, search]);

  return (
    <div className="min-h-screen bg-plur-bg text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-[240px]">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="px-4 py-5 md:px-6">
          <div className="mx-auto max-w-[1600px]">
            <section className="relative overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/65 p-6 md:p-8">
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-plur-red/15 blur-[110px]" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-plur-red/25 bg-plur-red/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-plur-red">
                    <Sparkles size={13} />
                    Kaydettiğin ilanlar
                  </div>

                  <h1 className="mt-5 font-rajdhani text-4xl font-black uppercase md:text-5xl">
                    Favorilerim
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-plur-muted">
                    Beğendiğin duo ilanlarını tek yerde görüntüle ve
                    istediğin zaman yeniden incele.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/duo-bul"
                    className="group flex h-11 items-center gap-2 rounded-xl border border-plur-border bg-plur-bg/70 px-4 text-xs font-bold text-plur-muted transition hover:-translate-y-0.5 hover:border-plur-red/40 hover:bg-plur-red/10 hover:text-white"
                  >
                    <ArrowLeft
                      size={15}
                      className="transition-transform group-hover:-translate-x-1"
                    />
                    Duo İlanlarına Dön
                  </Link>

                  <button
                    type="button"
                    onClick={() => loadFavorites(true)}
                    disabled={refreshing}
                    className="flex h-11 items-center gap-2 rounded-xl border border-plur-red/40 bg-plur-red px-4 text-xs font-bold text-white shadow-[0_12px_32px_rgba(255,70,85,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCcw
                      size={15}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    Yenile
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-plur-border bg-plur-card/60 p-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-plur-muted"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Favorilerinde ilan, oyuncu, ajan veya şehir ara..."
                  className="h-12 w-full rounded-xl border border-plur-border bg-plur-bg pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-plur-muted focus:border-plur-red/60"
                />
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-plur-muted">
                <Heart
                  size={14}
                  className="fill-plur-red text-plur-red"
                />

                <strong className="text-white">
                  {filteredPosts.length}
                </strong>

                favori ilan
              </div>
            </section>

            <section className="mt-5">
              {loading ? (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-plur-border bg-plur-card/40 px-6 py-16">
                  <LoaderCircle
                    size={24}
                    className="animate-spin text-plur-red"
                  />

                  <span className="text-sm text-plur-muted">
                    Favorilerin yükleniyor...
                  </span>
                </div>
              ) : errorMessage ? (
                <div className="rounded-2xl border border-plur-red/30 bg-plur-red/10 px-6 py-10 text-center">
                  <h2 className="text-lg font-bold">
                    Favoriler yüklenemedi
                  </h2>

                  <p className="mt-2 text-sm text-red-300">
                    {errorMessage}
                  </p>
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <DuoPostCard
                      key={post.id}
                      post={post}
                    />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="rounded-2xl border border-dashed border-plur-border bg-plur-card/40 px-6 py-16 text-center">
                  <Search
                    size={34}
                    className="mx-auto text-plur-muted"
                  />

                  <h2 className="mt-4 text-lg font-bold">
                    Aramana uygun favori bulunamadı
                  </h2>

                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 rounded-xl border border-plur-red/40 bg-plur-red px-5 py-3 text-xs font-bold text-white"
                  >
                    Aramayı Temizle
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-plur-border bg-plur-card/40 px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-plur-red/10 text-plur-red">
        <Heart size={30} />
      </div>

      <h2 className="mt-5 font-rajdhani text-2xl font-black">
        Henüz favori ilanın yok
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-plur-muted">
        Duo ilanlarındaki kalp butonuna basarak beğendiğin ilanları
        burada biriktirebilirsin.
      </p>

      <Link
        href="/duo-bul"
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-plur-red/50 bg-plur-red px-5 text-xs font-bold text-white shadow-[0_12px_32px_rgba(255,70,85,0.24)] transition hover:-translate-y-1"
      >
        <Heart size={16} />
        Duo İlanlarını Keşfet
      </Link>
    </div>
  );
}