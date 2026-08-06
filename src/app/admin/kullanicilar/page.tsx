"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Circle,
  ExternalLink,
  FileWarning,
  Gamepad2,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type UserRow = {
  id: string;
  username: string | null;
  tag: string | null;
  avatar_url: string | null;
  created_at: string;
  online: boolean | null;
  last_active: string | null;
  city: string | null;
  server: string | null;
  rank: string | null;
  rank_tier: string | null;
  role: string | null;
  agent: string | null;
  verified: boolean | null;
};

type UserStats = {
  posts: number;
  reportsReceived: number;
  reportsSent: number;
};

type StatusFilter = "all" | "online" | "offline";

export default function AdminUsersPage() {
  const supabase = useMemo(() => createClient(), []);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [selectedStats, setSelectedStats] = useState<UserStats | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadUsers(initial = false) {
    if (initial) setLoading(true);
    else setRefreshing(true);

    setErrorMessage("");

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
          id,
          username,
          tag,
          avatar_url,
          created_at,
          online,
          last_active,
          city,
          server,
          rank,
          rank_tier,
          role,
          agent,
          verified
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setUsers([]);
    } else {
      setUsers((data ?? []) as UserRow[]);
    }

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    void loadUsers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openUserDetails(user: UserRow) {
    setSelectedUser(user);
    setSelectedStats(null);
    setDetailsLoading(true);

    const [posts, reportsReceived, reportsSent] = await Promise.all([
      supabase
        .from("duo_posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("user_reports")
        .select("id", { count: "exact", head: true })
        .eq("reported_id", user.id),
      supabase
        .from("user_reports")
        .select("id", { count: "exact", head: true })
        .eq("reporter_id", user.id),
    ]);

    setSelectedStats({
      posts: posts.count ?? 0,
      reportsReceived: reportsReceived.count ?? 0,
      reportsSent: reportsSent.count ?? 0,
    });

    setDetailsLoading(false);
  }

  const filteredUsers = useMemo(() => {
    const q = normalize(search);

    return users.filter((user) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "online" && Boolean(user.online)) ||
        (statusFilter === "offline" && !user.online);

      const matchesSearch =
        !q ||
        [
          user.username,
          user.tag,
          user.city,
          user.server,
          user.rank,
          user.rank_tier,
          user.role,
          user.agent,
          user.id,
        ].some((value) => normalize(value ?? "").includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, users]);

  const onlineCount = users.filter((user) => user.online).length;

  if (loading) {
    return <Loading text="Kullanıcılar yükleniyor..." />;
  }

  return (
    <>
      <main className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-[1500px]">
          <section className="relative overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/70 p-6 md:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-plur-red/15 blur-[100px]" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-plur-red">
                  Yönetim Merkezi
                </p>
                <h1 className="mt-3 font-rajdhani text-4xl font-black md:text-5xl">
                  Kullanıcı Yönetimi
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-plur-muted">
                  Kullanıcıları ara, durumlarını görüntüle ve detaylarını tek
                  ekrandan incele.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadUsers(false)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg px-4 text-xs font-bold text-white transition hover:border-plur-red/40 hover:bg-plur-red/10 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin text-plur-red" : ""}
                />
                {refreshing ? "Yenileniyor..." : "Listeyi Yenile"}
              </button>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <Summary title="Toplam Kullanıcı" value={users.length} icon={<Users />} />
            <Summary
              title="Online Kullanıcı"
              value={onlineCount}
              icon={<Circle className="fill-plur-green" />}
              green
            />
            <Summary
              title="Offline Kullanıcı"
              value={Math.max(0, users.length - onlineCount)}
              icon={<Circle className="fill-plur-muted" />}
              muted
            />
          </section>

          <section className="mt-6 rounded-2xl border border-plur-border bg-plur-card/60 p-4 md:p-5">
            <label className="relative block">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-plur-muted"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Kullanıcı adı, tag, şehir, rank, ajan veya ID ara..."
                className="h-12 w-full rounded-xl border border-plur-border bg-plur-bg pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-plur-muted focus:border-plur-red/50"
              />
            </label>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={statusFilter === "all"}
                  onClick={() => setStatusFilter("all")}
                  label="Tümü"
                />
                <FilterButton
                  active={statusFilter === "online"}
                  onClick={() => setStatusFilter("online")}
                  label="Online"
                />
                <FilterButton
                  active={statusFilter === "offline"}
                  onClick={() => setStatusFilter("offline")}
                  label="Offline"
                />
              </div>

              <p className="text-[11px] text-plur-muted">
                {filteredUsers.length} kullanıcı gösteriliyor
              </p>
            </div>
          </section>

          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-plur-red/30 bg-plur-red/10 px-4 py-3 text-sm text-red-300">
              Kullanıcılar yüklenemedi: {errorMessage}
            </div>
          )}

          <section className="mt-5 overflow-hidden rounded-2xl border border-plur-border bg-plur-card/60">
            {filteredUsers.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-plur-border">
                {filteredUsers.map((user) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    onDetails={() => void openUserDetails(user)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <UserDetailsModal
        user={selectedUser}
        stats={selectedStats}
        loading={detailsLoading}
        onClose={() => {
          setSelectedUser(null);
          setSelectedStats(null);
        }}
      />
    </>
  );
}

function UserItem({
  user,
  onDetails,
}: {
  user: UserRow;
  onDetails: () => void;
}) {
  const avatar =
    user.avatar_url ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

  return (
    <article className="group p-4 transition hover:bg-white/[0.025] md:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={avatar}
              alt=""
              className="h-13 w-13 rounded-xl border border-plur-border bg-plur-bg object-cover"
            />
            <span
              className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-plur-card ${
                user.online ? "bg-plur-green" : "bg-plur-muted"
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-black">
                {user.username ?? "Oyuncu"}
                <span className="text-plur-muted">#{user.tag ?? "TR"}</span>
              </p>

              {user.verified && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[9px] font-bold text-cyan-300">
                  <ShieldCheck size={11} />
                  Doğrulanmış
                </span>
              )}
            </div>

            <p className="mt-1 truncate text-[10px] text-plur-muted">
              {user.id}
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
          <Info label="Rank" value={user.rank ?? user.rank_tier ?? "-"} />
          <Info label="Rol" value={user.role ?? "-"} />
          <Info label="Şehir" value={user.city ?? "-"} />
          <Info label="Sunucu" value={user.server ?? "-"} />
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={onDetails}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-plur-red/30 bg-plur-red/10 px-3 text-xs font-bold text-red-200 transition hover:border-plur-red/60 hover:bg-plur-red/15 hover:text-white"
          >
            <UserRound size={14} />
            Detayları Aç
          </button>

          <Link
            href={`/oyuncu/${user.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg px-3 text-xs font-bold text-plur-muted transition hover:text-white"
          >
            <ExternalLink size={14} />
            Profil
          </Link>
        </div>
      </div>
    </article>
  );
}

function UserDetailsModal({
  user,
  stats,
  loading,
  onClose,
}: {
  user: UserRow | null;
  stats: UserStats | null;
  loading: boolean;
  onClose: () => void;
}) {
  if (!user) return null;

  const avatar =
    user.avatar_url ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <section className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-plur-border bg-plur-card p-5 shadow-[0_30px_100px_rgba(0,0,0,0.6)] md:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-plur-border bg-plur-bg text-plur-muted transition hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <img
            src={avatar}
            alt=""
            className="h-20 w-20 rounded-2xl border border-plur-border bg-plur-bg object-cover"
          />

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-rajdhani text-3xl font-black">
              {user.username ?? "Oyuncu"}
              <span className="text-plur-muted">#{user.tag ?? "TR"}</span>
            </h2>

            <p
              className={`mt-1 flex items-center gap-2 text-xs ${
                user.online ? "text-plur-green" : "text-plur-muted"
              }`}
            >
              <Circle
                size={7}
                className={user.online ? "fill-plur-green" : "fill-plur-muted"}
              />
              {user.online ? "Şu anda online" : formatLastActive(user.last_active)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Detail icon={<Gamepad2 />} label="Rank" value={user.rank ?? user.rank_tier ?? "-"} />
          <Detail icon={<ShieldCheck />} label="Rol" value={user.role ?? "-"} />
          <Detail icon={<MapPin />} label="Şehir" value={user.city ?? "-"} />
          <Detail icon={<Server />} label="Sunucu" value={user.server ?? "-"} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Detail icon={<UserRound />} label="Ajan" value={user.agent ?? "-"} />
          <Detail
            icon={<CalendarDays />}
            label="Kayıt Tarihi"
            value={formatDate(user.created_at)}
          />
        </div>

        <div className="mt-6">
          <h3 className="font-rajdhani text-xl font-black">Hesap Özeti</h3>

          {loading ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-plur-border bg-plur-bg px-4 py-8 text-sm text-plur-muted">
              <LoaderCircle size={18} className="animate-spin text-plur-red" />
              Kullanıcı istatistikleri yükleniyor...
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric
                icon={<Gamepad2 />}
                label="Toplam İlan"
                value={stats?.posts ?? 0}
              />
              <Metric
                icon={<FileWarning />}
                label="Aldığı Şikâyet"
                value={stats?.reportsReceived ?? 0}
                danger
              />
              <Metric
                icon={<FileWarning />}
                label="Gönderdiği Şikâyet"
                value={stats?.reportsSent ?? 0}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/oyuncu/${user.id}`}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg text-xs font-bold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          >
            <ExternalLink size={15} />
            Kullanıcı Profiline Git
          </Link>

          <Link
            href={`/admin/ilanlar?user=${user.id}`}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg text-xs font-bold text-white transition hover:border-plur-red/40 hover:bg-plur-red/10"
          >
            <Gamepad2 size={15} />
            Kullanıcının İlanları
          </Link>
        </div>
      </section>
    </div>
  );
}

function Summary({
  title,
  value,
  icon,
  green = false,
  muted = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  green?: boolean;
  muted?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-plur-border bg-plur-card/60 p-5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          green
            ? "bg-plur-green/10 text-plur-green"
            : muted
              ? "bg-white/[0.04] text-plur-muted"
              : "bg-plur-red/10 text-plur-red"
        }`}
      >
        {icon}
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-plur-muted">
        {title}
      </p>
      <p className="mt-1 font-rajdhani text-3xl font-black">{value}</p>
    </article>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-xl border px-3 text-[10px] font-bold transition ${
        active
          ? "border-plur-red/40 bg-plur-red/15 text-white"
          : "border-plur-border bg-plur-bg text-plur-muted hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-plur-border/70 bg-plur-bg/60 px-3 py-2.5">
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-plur-muted">
        {label}
      </p>
      <p className="mt-1 truncate text-[11px] font-bold text-white">{value}</p>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-plur-border bg-plur-bg p-4">
      <div className="flex items-center gap-2 text-plur-red">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>
      <p className="mt-3 text-sm font-black">{value}</p>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-plur-border bg-plur-bg p-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          danger
            ? "bg-yellow-400/10 text-yellow-300"
            : "bg-plur-red/10 text-plur-red"
        }`}
      >
        {icon}
      </div>
      <p className="mt-3 text-[9px] uppercase tracking-[0.12em] text-plur-muted">
        {label}
      </p>
      <p className="mt-1 font-rajdhani text-2xl font-black">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-plur-red/10 text-plur-red">
        <Users size={27} />
      </div>
      <h2 className="mt-4 text-lg font-black">Kullanıcı bulunamadı</h2>
      <p className="mt-2 text-sm text-plur-muted">
        Arama kelimesini veya durum filtresini değiştir.
      </p>
    </div>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-plur-muted">
        <LoaderCircle size={22} className="animate-spin text-plur-red" />
        {text}
      </div>
    </main>
  );
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLastActive(value: string | null) {
  if (!value) return "Son görülme bilinmiyor";

  const date = new Date(value);
  const difference = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(difference / 60_000));

  if (minutes < 1) return "Az önce aktifti";
  if (minutes < 60) return `${minutes} dakika önce aktifti`;

  return `Son görülme: ${formatDate(value)}`;
}
