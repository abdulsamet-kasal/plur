"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  Edit3,
  Gamepad2,
  Globe2,
  LoaderCircle,
  MapPin,
  Mic,
  Plus,
  Power,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";

type PostStatus = "active" | "passive" | "closed";

type DuoPost = {
  id: string;
  user_id: string;
  title: string;
  game_mode: string;
  wanted_rank_tier: string | null;
  wanted_role: string | null;
  server: string;
  city: string | null;
  mic_required: boolean;
  active_hours: string | null;
  description: string;
  status: PostStatus;
  created_at: string;
  updated_at: string;
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

const rankLabels: Record<string, string> = {
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

const roleLabels: Record<string, string> = {
  any: "Fark etmez",
  duelist: "Duelist",
  initiator: "Initiator",
  controller: "Controller",
  sentinel: "Sentinel",
};

export default function IlanlarimPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<DuoPost[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DuoPost | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadPosts(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setPageLoading(true);
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

    const { data, error } = await supabase
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
        created_at,
        updated_at
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(`İlanlar yüklenemedi: ${error.message}`);
    } else {
      setPosts((data ?? []) as DuoPost[]);
    }

    setPageLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function togglePostStatus(post: DuoPost) {
    const newStatus: PostStatus =
      post.status === "active" ? "passive" : "active";

    setProcessingId(post.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("duo_posts")
      .update({ status: newStatus })
      .eq("id", post.id)
      .eq("user_id", post.user_id);

    if (error) {
      setErrorMessage(`İlan durumu değiştirilemedi: ${error.message}`);
      setProcessingId(null);
      return;
    }

    setPosts((current) =>
      current.map((item) =>
        item.id === post.id
          ? {
              ...item,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );

    setSuccessMessage(
      newStatus === "active"
        ? "İlan yeniden yayına alındı."
        : "İlan pasife alındı ve duo listesinde gizlendi."
    );

    setProcessingId(null);
  }

  async function deletePost() {
    if (!deleteTarget) {
      return;
    }

    setProcessingId(deleteTarget.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("duo_posts")
      .delete()
      .eq("id", deleteTarget.id)
      .eq("user_id", deleteTarget.user_id);

    if (error) {
      setErrorMessage(`İlan silinemedi: ${error.message}`);
      setProcessingId(null);
      setDeleteTarget(null);
      return;
    }

    setPosts((current) =>
      current.filter((post) => post.id !== deleteTarget.id)
    );

    setSuccessMessage("İlan kalıcı olarak silindi.");
    setProcessingId(null);
    setDeleteTarget(null);
  }

  const activeCount = posts.filter(
    (post) => post.status === "active"
  ).length;

  const passiveCount = posts.filter(
    (post) => post.status === "passive"
  ).length;

  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-plur-bg text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-plur-border bg-plur-card/70 px-6 py-5">
          <LoaderCircle
            size={22}
            className="animate-spin text-plur-red"
          />

          <span className="text-sm text-plur-muted">
            İlanların yükleniyor...
          </span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-plur-bg text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-[240px]">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="px-4 py-5 md:px-6">
          <div className="mx-auto max-w-[1450px]">
            {/* Başlık alanı */}
            <section className="relative overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/65 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] md:p-8">
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-plur-red/15 blur-[110px]" />
              <div className="pointer-events-none absolute -bottom-40 left-[25%] h-80 w-80 rounded-full bg-cyan-400/5 blur-[120px]" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-plur-red/25 bg-plur-red/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-plur-red">
                    <ShieldCheck size={13} />
                    İlan yönetim merkezi
                  </div>

                  <h1 className="mt-5 font-rajdhani text-4xl font-black uppercase md:text-5xl">
                    İlanlarım
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-plur-muted">
                    Yayındaki ilanlarını yönet, geçici olarak pasife al,
                    düzenle veya artık kullanmadığın ilanları sil.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => loadPosts(true)}
                    disabled={refreshing}
                    className="group flex h-11 items-center gap-2 rounded-xl border border-plur-border bg-plur-bg/70 px-4 text-xs font-bold text-plur-muted transition hover:-translate-y-0.5 hover:border-plur-red/40 hover:bg-plur-red/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCcw
                      size={15}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    Yenile
                  </button>

                  <Link
                    href="/ilan-olustur"
                    className="group relative flex h-11 items-center gap-2 overflow-hidden rounded-xl border border-plur-red/50 bg-plur-red px-5 text-xs font-bold text-white shadow-[0_12px_32px_rgba(255,70,85,0.24)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(255,70,85,0.4)]"
                  >
                    <span className="absolute inset-0 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[130%]" />
                    <Plus size={16} className="relative" />
                    <span className="relative">Yeni İlan Oluştur</span>
                  </Link>
                </div>
              </div>
            </section>

            {/* Özet */}
            <section className="mt-5 grid gap-4 sm:grid-cols-3">
              <SummaryCard
                icon={<Users size={20} />}
                value={String(posts.length)}
                label="Toplam İlan"
              />

              <SummaryCard
                icon={<Circle size={16} className="fill-plur-green" />}
                value={String(activeCount)}
                label="Aktif İlan"
                green
              />

              <SummaryCard
                icon={<Power size={20} />}
                value={String(passiveCount)}
                label="Pasif İlan"
              />
            </section>

            {errorMessage && (
              <MessageBox
                type="error"
                message={errorMessage}
                onClose={() => setErrorMessage("")}
              />
            )}

            {successMessage && (
              <MessageBox
                type="success"
                message={successMessage}
                onClose={() => setSuccessMessage("")}
              />
            )}

            {/* İlan listesi */}
            <section className="mt-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-rajdhani text-xl font-black uppercase tracking-[0.08em]">
                    Kendi ilanların
                  </h2>

                  <p className="mt-1 text-xs text-plur-muted">
                    En yeni ilanlar önce gösterilir.
                  </p>
                </div>
              </div>

              {posts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      processing={processingId === post.id}
                      onToggle={() => togglePostStatus(post)}
                      onDelete={() => setDeleteTarget(post)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {deleteTarget && (
        <DeleteModal
          post={deleteTarget}
          loading={processingId === deleteTarget.id}
          onCancel={() => {
            if (!processingId) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={deletePost}
        />
      )}
    </div>
  );
}

function PostCard({
  post,
  processing,
  onToggle,
  onDelete,
}: {
  post: DuoPost;
  processing: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const active = post.status === "active";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-plur-border bg-plur-card/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-plur-red/35 hover:shadow-[0_20px_55px_rgba(255,70,85,0.09)]">
      <div className="pointer-events-none absolute inset-0 -translate-x-[130%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/[0.035] to-transparent transition-transform duration-1000 group-hover:translate-x-[130%]" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={post.status} />

            <span className="rounded-lg border border-plur-border bg-plur-bg/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-plur-muted">
              {gameModeLabels[post.game_mode] ?? post.game_mode}
            </span>
          </div>

          <h3 className="mt-4 font-rajdhani text-2xl font-black text-white">
            {post.title}
          </h3>

          <p className="mt-3 max-w-3xl text-xs leading-6 text-plur-muted">
            {post.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <MetaBadge
              icon={<Globe2 size={13} />}
              text={post.server}
            />

            <MetaBadge
              icon={<MapPin size={13} />}
              text={post.city || "İl fark etmez"}
            />

            <MetaBadge
              icon={<Trophy size={13} />}
              text={
                post.wanted_rank_tier
                  ? rankLabels[post.wanted_rank_tier]
                  : "Rank fark etmez"
              }
            />

            <MetaBadge
              icon={<Users size={13} />}
              text={
                roleLabels[post.wanted_role ?? "any"] ??
                "Rol fark etmez"
              }
            />

            <MetaBadge
              icon={<Clock3 size={13} />}
              text={post.active_hours || "Saat fark etmez"}
            />

            <MetaBadge
              icon={<Mic size={13} />}
              text={
                post.mic_required
                  ? "Mikrofon zorunlu"
                  : "Mikrofon fark etmez"
              }
              green={post.mic_required}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-plur-muted">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={12} />
              Oluşturuldu: {formatDate(post.created_at)}
            </span>

            <span className="flex items-center gap-1.5">
              <RefreshCcw size={12} />
              Güncellendi: {formatDate(post.updated_at)}
            </span>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:w-[410px]">
          <button
            type="button"
            onClick={onToggle}
            disabled={processing || post.status === "closed"}
            className={`group/toggle relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${
              active
                ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300 hover:border-yellow-400/50"
                : "border-plur-green/30 bg-plur-green/10 text-plur-green hover:border-plur-green/50"
            }`}
          >
            {processing ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Power
                size={15}
                className="transition-transform duration-300 group-hover/toggle:rotate-12"
              />
            )}

            {active ? "Pasife Al" : "Yayına Al"}
          </button>

          <Link
            href={`/ilan-duzenle/${post.id}`}
            className="group/edit flex h-11 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg px-3 text-xs font-bold text-plur-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 active:scale-[0.97]"
          >
            <Edit3
              size={15}
              className="transition-transform duration-300 group-hover/edit:rotate-6"
            />
            Düzenle
          </Link>

          <button
            type="button"
            onClick={onDelete}
            disabled={processing}
            className="group/delete col-span-2 flex h-11 items-center justify-center gap-2 rounded-xl border border-plur-red/25 bg-plur-red/5 px-3 text-xs font-bold text-plur-red transition-all duration-300 hover:-translate-y-0.5 hover:border-plur-red/50 hover:bg-plur-red/12 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1"
          >
            <Trash2
              size={15}
              className="transition-transform duration-300 group-hover/delete:rotate-6"
            />
            Sil
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: PostStatus;
}) {
  const config = {
    active: {
      label: "Aktif",
      className:
        "border-plur-green/25 bg-plur-green/10 text-plur-green",
    },
    passive: {
      label: "Pasif",
      className:
        "border-yellow-400/25 bg-yellow-400/10 text-yellow-300",
    },
    closed: {
      label: "Kapalı",
      className:
        "border-plur-border bg-plur-bg text-plur-muted",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${config.className}`}
    >
      <Circle
        size={6}
        className={status === "active" ? "fill-plur-green" : ""}
      />
      {config.label}
    </span>
  );
}

function MetaBadge({
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
      {text}
    </span>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  green = false,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  green?: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-plur-border bg-plur-card/55 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-plur-red/30">
      <span className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 group-hover:translate-x-[130%]" />

      <div
        className={`relative flex items-center gap-3 ${
          green ? "text-plur-green" : "text-plur-red"
        }`}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-plur-bg/80">
          {icon}
        </div>

        <div>
          <p className="font-rajdhani text-3xl font-black text-white">
            {value}
          </p>

          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-plur-muted">
            {label}
          </p>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-plur-border bg-plur-card/40 px-6 py-16 text-center">
      <Gamepad2
        size={38}
        className="mx-auto text-plur-muted"
      />

      <h3 className="mt-4 text-lg font-bold text-white">
        Henüz bir ilanın yok
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-plur-muted">
        Oyun tarzına uygun takım arkadaşını bulmak için ilk duo ilanını
        oluştur.
      </p>

      <Link
        href="/ilan-olustur"
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-plur-red/50 bg-plur-red px-5 text-xs font-bold text-white shadow-[0_12px_32px_rgba(255,70,85,0.24)] transition hover:-translate-y-1"
      >
        <Plus size={16} />
        İlk İlanımı Oluştur
      </Link>
    </div>
  );
}

function MessageBox({
  type,
  message,
  onClose,
}: {
  type: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  const success = type === "success";

  return (
    <div
      className={`mt-5 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-xs leading-5 ${
        success
          ? "border-plur-green/30 bg-plur-green/10 text-plur-green"
          : "border-plur-red/30 bg-plur-red/10 text-red-300"
      }`}
    >
      <div className="flex items-start gap-2">
        {success ? (
          <Check size={16} className="mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        )}

        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Mesajı kapat"
        className="shrink-0 opacity-70 transition hover:opacity-100"
      >
        <X size={15} />
      </button>
    </div>
  );
}

function DeleteModal({
  post,
  loading,
  onCancel,
  onConfirm,
}: {
  post: DuoPost;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-plur-border bg-plur-card shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
        <div className="border-b border-plur-border p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plur-red/10 text-plur-red">
            <AlertTriangle size={23} />
          </div>

          <h2 className="mt-4 font-rajdhani text-2xl font-black text-white">
            İlan silinsin mi?
          </h2>

          <p className="mt-2 text-sm leading-6 text-plur-muted">
            <strong className="text-white">{post.title}</strong> ilanı
            kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-11 rounded-xl border border-plur-border bg-plur-bg text-xs font-bold text-plur-muted transition hover:border-white/20 hover:text-white disabled:opacity-60"
          >
            İptal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-plur-red/50 bg-plur-red text-xs font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}

            {loading ? "Siliniyor..." : "Evet, Sil"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}