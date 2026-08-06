"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  FileWarning,
  Gamepad2,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Swords,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Stats = {
  users: number;
  online: number;
  posts: number;
  messagesToday: number;
  pendingRequests: number;
  pendingReports: number;
};

type RecentUser = {
  id: string;
  username: string | null;
  tag: string | null;
  avatar_url: string | null;
  created_at: string;
  online: boolean | null;
};

type RecentPost = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

const emptyStats: Stats = {
  users: 0,
  online: 0,
  posts: 0,
  messagesToday: 0,
  pendingRequests: 0,
  pendingReports: 0,
};

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [stats, setStats] = useState<Stats>(emptyStats);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard(initial = false) {
    if (initial) setLoading(true);
    else setRefreshing(true);

    setErrorMessage("");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      users,
      online,
      posts,
      messagesToday,
      pendingRequests,
      pendingReports,
      latestUsers,
      latestPosts,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("online", true),
      supabase
        .from("duo_posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString()),
      supabase
        .from("duo_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("user_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("profiles")
        .select("id, username, tag, avatar_url, created_at, online")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("duo_posts")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const allResults = [
      users,
      online,
      posts,
      messagesToday,
      pendingRequests,
      pendingReports,
      latestUsers,
      latestPosts,
    ];

    const firstError = allResults.find((result) => result.error)?.error;
    if (firstError) {
      setErrorMessage(firstError.message);
    }

    setStats({
      users: users.count ?? 0,
      online: online.count ?? 0,
      posts: posts.count ?? 0,
      messagesToday: messagesToday.count ?? 0,
      pendingRequests: pendingRequests.count ?? 0,
      pendingReports: pendingReports.count ?? 0,
    });

    setRecentUsers((latestUsers.data ?? []) as RecentUser[]);
    setRecentPosts((latestPosts.data ?? []) as RecentPost[]);

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    void loadDashboard(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onlineRate =
    stats.users > 0 ? Math.round((stats.online / stats.users) * 100) : 0;

  if (loading) {
    return <Loading text="Admin paneli yükleniyor..." />;
  }

  return (
    <main className="px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1500px]">
        <section className="relative overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/70 p-6 md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-plur-red/15 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-[100px]" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-plur-red">
                Yönetim Merkezi
              </p>
              <h1 className="mt-3 font-rajdhani text-4xl font-black md:text-5xl">
                Admin Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-plur-muted">
                Kullanıcıları, ilanları, şikâyetleri ve platform hareketlerini tek
                ekrandan takip et.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard(false)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg px-4 text-xs font-bold text-white transition hover:border-plur-red/40 hover:bg-plur-red/10 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin text-plur-red" : ""}
              />
              {refreshing ? "Yenileniyor..." : "Verileri Yenile"}
            </button>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200">
            Bazı veriler okunamadı: {errorMessage}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard
            href="/admin/kullanicilar"
            title="Toplam Kullanıcı"
            value={stats.users}
            icon={<Users />}
          />
          <StatCard
            href="/admin/kullanicilar"
            title="Online Kullanıcı"
            value={stats.online}
            subtitle={`%${onlineRate} aktif`}
            icon={<Users />}
            green
          />
          <StatCard
            href="/admin/ilanlar"
            title="Aktif İlan"
            value={stats.posts}
            icon={<Gamepad2 />}
          />
          <StatCard
            title="Bugünkü Mesaj"
            value={stats.messagesToday}
            icon={<MessageSquare />}
          />
          <StatCard
            title="Bekleyen İstek"
            value={stats.pendingRequests}
            icon={<Swords />}
          />
          <StatCard
            href="/admin/sikayetler"
            title="Bekleyen Şikâyet"
            value={stats.pendingReports}
            icon={<FileWarning />}
            danger
          />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          <Panel
            title="Son Kayıt Olanlar"
            description="Platforma en son katılan kullanıcılar"
            href="/admin/kullanicilar"
          >
            {recentUsers.length === 0 ? (
              <EmptyText text="Henüz kullanıcı bulunmuyor." />
            ) : (
              <div className="divide-y divide-plur-border">
                {recentUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/oyuncu/${user.id}`}
                    className="flex items-center gap-3 py-3 transition hover:bg-white/[0.025]"
                  >
                    <div className="relative">
                      <img
                        src={
                          user.avatar_url ??
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                        }
                        alt=""
                        className="h-11 w-11 rounded-xl border border-plur-border bg-plur-bg"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-plur-card ${
                          user.online ? "bg-plur-green" : "bg-plur-muted"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">
                        {user.username ?? "Oyuncu"}
                        <span className="text-plur-muted">
                          #{user.tag ?? "TR"}
                        </span>
                      </p>
                      <p className="mt-1 text-[10px] text-plur-muted">
                        {formatDate(user.created_at)}
                      </p>
                    </div>

                    <ArrowUpRight size={15} className="text-plur-muted" />
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Son İlanlar"
            description="En son oluşturulan duo ilanları"
            href="/admin/ilanlar"
          >
            {recentPosts.length === 0 ? (
              <EmptyText text="Henüz ilan bulunmuyor." />
            ) : (
              <div className="divide-y divide-plur-border">
                {recentPosts.map((post) => (
                  <div key={post.id} className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="line-clamp-2 text-sm font-black">{post.title}</p>
                      <StatusBadge status={post.status} />
                    </div>
                    <p className="mt-1 text-[10px] text-plur-muted">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickLink
            href="/admin/kullanicilar"
            title="Kullanıcı Yönetimi"
            description="Kullanıcıları ara ve incele."
            icon={<Users />}
          />
          <QuickLink
            href="/admin/ilanlar"
            title="İlan Yönetimi"
            description="İlanları ve durumlarını görüntüle."
            icon={<Gamepad2 />}
          />
          <QuickLink
            href="/admin/sikayetler"
            title="Şikâyet Yönetimi"
            description="Bekleyen bildirimleri incele."
            icon={<FileWarning />}
          />
          <QuickLink
            href="/admin/bildirim"
            title="Bildirim Merkezi"
            description="Son sistem bildirimlerini görüntüle."
            icon={<Bell />}
          />
        </section>
      </div>
    </main>
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

function StatCard({
  href,
  title,
  value,
  subtitle,
  icon,
  green = false,
  danger = false,
}: {
  href?: string;
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  green?: boolean;
  danger?: boolean;
}) {
  const content = (
    <>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          green
            ? "bg-plur-green/10 text-plur-green"
            : danger
              ? "bg-yellow-400/10 text-yellow-300"
              : "bg-plur-red/10 text-plur-red"
        }`}
      >
        {icon}
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-plur-muted">
        {title}
      </p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="font-rajdhani text-3xl font-black">{value}</p>
        {subtitle && <span className="text-[10px] text-plur-green">{subtitle}</span>}
      </div>
    </>
  );

  const className =
    "group rounded-2xl border border-plur-border bg-plur-card/60 p-5 transition hover:-translate-y-1 hover:border-plur-red/40 hover:shadow-[0_18px_45px_rgba(255,70,85,0.08)]";

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}

function Panel({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-plur-border bg-plur-card/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-rajdhani text-xl font-black">{title}</h2>
          <p className="mt-1 text-[11px] text-plur-muted">{description}</p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-plur-red transition hover:text-white"
        >
          Tümünü gör
          <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-plur-border bg-plur-card/60 p-5 transition hover:-translate-y-1 hover:border-plur-red/40 hover:bg-plur-red/[0.04]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-plur-red/10 text-plur-red transition group-hover:bg-plur-red group-hover:text-white">
        {icon}
      </div>
      <h2 className="mt-4 font-rajdhani text-xl font-black">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-plur-muted">{description}</p>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";

  return (
    <span
      className={`rounded-lg px-2 py-1 text-[9px] font-bold ${
        isActive
          ? "bg-plur-green/10 text-plur-green"
          : "bg-plur-red/10 text-plur-red"
      }`}
    >
      {status}
    </span>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-plur-border px-4 py-10 text-center text-xs text-plur-muted">
      {text}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
