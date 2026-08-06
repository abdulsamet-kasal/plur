"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileWarning,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type ReportStatus = "pending" | "reviewing" | "resolved" | "rejected";

type ReportRow = {
  id: string;
  reporter_id: string;
  reported_id: string;
  conversation_id: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  tag: string | null;
  avatar_url: string | null;
  online: boolean | null;
  rank: string | null;
  city: string | null;
};

type ReportWithProfiles = ReportRow & {
  reporter: ProfileRow | null;
  reported: ProfileRow | null;
};

const reasonLabels: Record<string, string> = {
  harassment: "Taciz / Rahatsız Etme",
  spam: "Spam",
  hate_speech: "Nefret Söylemi",
  inappropriate_content: "Uygunsuz İçerik",
  scam: "Dolandırıcılık",
  other: "Diğer",
};

const statusLabels: Record<ReportStatus, string> = {
  pending: "Bekliyor",
  reviewing: "İnceleniyor",
  resolved: "Çözüldü",
  rejected: "Reddedildi",
};

export default function AdminReportsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [reports, setReports] = useState<ReportWithProfiles[]>([]);
  const [selectedReport, setSelectedReport] =
    useState<ReportWithProfiles | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadReports(initial = false) {
    if (initial) setLoading(true);
    else setRefreshing(true);

    setErrorMessage("");

    const { data: reportRows, error: reportsError } = await supabase
      .from("user_reports")
      .select(
        `
          id,
          reporter_id,
          reported_id,
          conversation_id,
          reason,
          description,
          status,
          admin_note,
          reviewed_at,
          created_at,
          updated_at
        `
      )
      .order("created_at", { ascending: false });

    if (reportsError) {
      setErrorMessage(reportsError.message);
      setReports([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const rows = (reportRows ?? []) as ReportRow[];
    const profileIds = Array.from(
      new Set(rows.flatMap((row) => [row.reporter_id, row.reported_id]))
    );

    let profileMap = new Map<string, ProfileRow>();

    if (profileIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, tag, avatar_url, online, rank, city")
        .in("id", profileIds);

      if (profilesError) {
        setErrorMessage(profilesError.message);
      } else {
        profileMap = new Map(
          ((profiles ?? []) as ProfileRow[]).map((profile) => [
            profile.id,
            profile,
          ])
        );
      }
    }

    setReports(
      rows.map((row) => ({
        ...row,
        reporter: profileMap.get(row.reporter_id) ?? null,
        reported: profileMap.get(row.reported_id) ?? null,
      }))
    );

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    void loadReports(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReports = useMemo(() => {
    const normalizedSearch = normalize(search);

    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;

      const matchesSearch =
        !normalizedSearch ||
        [
          report.reason,
          report.description,
          report.reporter?.username,
          report.reporter?.tag,
          report.reported?.username,
          report.reported?.tag,
          report.reporter_id,
          report.reported_id,
        ].some((value) =>
          normalize(value ?? "").includes(normalizedSearch)
        );

      return matchesStatus && matchesSearch;
    });
  }, [reports, search, statusFilter]);

  const counts = useMemo(
    () => ({
      all: reports.length,
      pending: reports.filter((item) => item.status === "pending").length,
      reviewing: reports.filter((item) => item.status === "reviewing").length,
      resolved: reports.filter((item) => item.status === "resolved").length,
      rejected: reports.filter((item) => item.status === "rejected").length,
    }),
    [reports]
  );

  function openDetails(report: ReportWithProfiles) {
    setSelectedReport(report);
    setAdminNote(report.admin_note ?? "");
    setSuccessMessage("");
    setErrorMessage("");
  }

  async function updateReportStatus(status: ReportStatus) {
    if (!selectedReport || actionLoading) return;

    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("user_reports")
      .update({
        status,
        admin_note: adminNote.trim() || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedReport.id);

    if (error) {
      setErrorMessage(error.message);
      setActionLoading(false);
      return;
    }

    const updatedReport: ReportWithProfiles = {
      ...selectedReport,
      status,
      admin_note: adminNote.trim() || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setReports((current) =>
      current.map((report) =>
        report.id === updatedReport.id ? updatedReport : report
      )
    );
    setSelectedReport(updatedReport);
    setSuccessMessage(`Şikâyet durumu "${statusLabels[status]}" olarak güncellendi.`);
    setActionLoading(false);
  }

  if (loading) {
    return <Loading text="Şikâyetler yükleniyor..." />;
  }

  return (
    <>
      <main className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-[1500px]">
          <section className="relative overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/70 p-6 md:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-400/10 blur-[100px]" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-plur-red">
                  Yönetim Merkezi
                </p>
                <h1 className="mt-3 font-rajdhani text-4xl font-black md:text-5xl">
                  Şikâyet Yönetimi
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-plur-muted">
                  Kullanıcı şikâyetlerini incele, durumlarını güncelle ve admin
                  notlarını kaydet.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadReports(false)}
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

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Toplam" value={counts.all} />
            <SummaryCard label="Bekliyor" value={counts.pending} tone="warning" />
            <SummaryCard
              label="İnceleniyor"
              value={counts.reviewing}
              tone="info"
            />
            <SummaryCard
              label="Çözüldü"
              value={counts.resolved}
              tone="success"
            />
            <SummaryCard
              label="Reddedildi"
              value={counts.rejected}
              tone="danger"
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
                placeholder="Kullanıcı, sebep, açıklama veya kullanıcı ID ara..."
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
                  active={statusFilter === "pending"}
                  onClick={() => setStatusFilter("pending")}
                  label="Bekliyor"
                />
                <FilterButton
                  active={statusFilter === "reviewing"}
                  onClick={() => setStatusFilter("reviewing")}
                  label="İnceleniyor"
                />
                <FilterButton
                  active={statusFilter === "resolved"}
                  onClick={() => setStatusFilter("resolved")}
                  label="Çözüldü"
                />
                <FilterButton
                  active={statusFilter === "rejected"}
                  onClick={() => setStatusFilter("rejected")}
                  label="Reddedildi"
                />
              </div>

              <p className="text-[11px] text-plur-muted">
                {filteredReports.length} şikâyet gösteriliyor
              </p>
            </div>
          </section>

          {errorMessage && !selectedReport && (
            <MessageBox type="error" text={errorMessage} />
          )}

          <section className="mt-5 grid gap-4">
            {filteredReports.length === 0 ? (
              <EmptyState />
            ) : (
              filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onOpen={() => openDetails(report)}
                />
              ))
            )}
          </section>
        </div>
      </main>

      <ReportDetailsModal
        report={selectedReport}
        adminNote={adminNote}
        onAdminNoteChange={setAdminNote}
        actionLoading={actionLoading}
        errorMessage={selectedReport ? errorMessage : ""}
        successMessage={successMessage}
        onStatusChange={updateReportStatus}
        onClose={() => {
          if (!actionLoading) {
            setSelectedReport(null);
            setAdminNote("");
            setErrorMessage("");
            setSuccessMessage("");
          }
        }}
      />
    </>
  );
}

function ReportCard({
  report,
  onOpen,
}: {
  report: ReportWithProfiles;
  onOpen: () => void;
}) {
  return (
    <article className="rounded-2xl border border-plur-border bg-plur-card/60 p-5 transition hover:-translate-y-0.5 hover:border-plur-red/30">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <span className="rounded-lg bg-white/[0.04] px-2 py-1 text-[9px] font-bold text-plur-muted">
              {reasonLabels[report.reason] ?? report.reason}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-white">
            {report.description || "Açıklama girilmemiş."}
          </p>

          <p className="mt-2 text-[10px] text-plur-muted">
            {formatDate(report.created_at)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:w-[520px]">
          <UserMiniCard title="Şikâyet Eden" profile={report.reporter} />
          <UserMiniCard title="Şikâyet Edilen" profile={report.reported} danger />
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-plur-red/30 bg-plur-red/10 px-4 text-xs font-bold text-red-200 transition hover:border-plur-red/60 hover:bg-plur-red/15 hover:text-white"
        >
          <FileWarning size={15} />
          Şikâyeti İncele
        </button>
      </div>
    </article>
  );
}

function ReportDetailsModal({
  report,
  adminNote,
  onAdminNoteChange,
  actionLoading,
  errorMessage,
  successMessage,
  onStatusChange,
  onClose,
}: {
  report: ReportWithProfiles | null;
  adminNote: string;
  onAdminNoteChange: (value: string) => void;
  actionLoading: boolean;
  errorMessage: string;
  successMessage: string;
  onStatusChange: (status: ReportStatus) => void;
  onClose: () => void;
}) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <section className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-plur-border bg-plur-card p-5 shadow-[0_30px_100px_rgba(0,0,0,0.65)] md:p-7">
        <button
          type="button"
          onClick={onClose}
          disabled={actionLoading}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-plur-border bg-plur-bg text-plur-muted transition hover:text-white disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <span className="rounded-lg bg-white/[0.04] px-2 py-1 text-[9px] font-bold text-plur-muted">
              {reasonLabels[report.reason] ?? report.reason}
            </span>
          </div>

          <h2 className="mt-4 font-rajdhani text-3xl font-black">
            Şikâyet Detayı
          </h2>
          <p className="mt-1 text-[11px] text-plur-muted">
            Oluşturulma: {formatDate(report.created_at)}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <UserDetailCard
            title="Şikâyet Eden Kullanıcı"
            profile={report.reporter}
            fallbackId={report.reporter_id}
          />
          <UserDetailCard
            title="Şikâyet Edilen Kullanıcı"
            profile={report.reported}
            fallbackId={report.reported_id}
            danger
          />
        </div>

        <div className="mt-5 rounded-2xl border border-plur-border bg-plur-bg p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-plur-muted">
            Kullanıcı Açıklaması
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white">
            {report.description || "Açıklama girilmemiş."}
          </p>
        </div>

        <div className="mt-5">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-plur-muted">
            Admin Notu
          </label>
          <textarea
            value={adminNote}
            onChange={(event) => onAdminNoteChange(event.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="İnceleme sonucu, alınan aksiyon veya açıklama yaz..."
            className="mt-2 w-full resize-none rounded-2xl border border-plur-border bg-plur-bg px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-plur-muted focus:border-plur-red/50"
          />
          <p className="mt-1 text-right text-[9px] text-plur-muted">
            {adminNote.length}/2000
          </p>
        </div>

        {errorMessage && <MessageBox type="error" text={errorMessage} />}
        {successMessage && <MessageBox type="success" text={successMessage} />}

        <div className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-plur-muted">
            Şikâyet Durumunu Güncelle
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionButton
              label="Beklemeye Al"
              icon={<Clock3 size={16} />}
              loading={actionLoading}
              onClick={() => onStatusChange("pending")}
            />
            <ActionButton
              label="İnceleniyor"
              icon={<ShieldAlert size={16} />}
              loading={actionLoading}
              onClick={() => onStatusChange("reviewing")}
              tone="info"
            />
            <ActionButton
              label="Çözüldü"
              icon={<CheckCircle2 size={16} />}
              loading={actionLoading}
              onClick={() => onStatusChange("resolved")}
              tone="success"
            />
            <ActionButton
              label="Reddet"
              icon={<XCircle size={16} />}
              loading={actionLoading}
              onClick={() => onStatusChange("rejected")}
              tone="danger"
            />
          </div>
        </div>

        {report.conversation_id && (
          <div className="mt-5 rounded-xl border border-plur-border bg-white/[0.02] px-4 py-3 text-[10px] text-plur-muted">
            İlgili konuşma ID: {report.conversation_id}
          </div>
        )}
      </section>
    </div>
  );
}

function UserMiniCard({
  title,
  profile,
  danger = false,
}: {
  title: string;
  profile: ProfileRow | null;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-plur-border bg-plur-bg/70 p-3">
      <p
        className={`text-[8px] font-bold uppercase tracking-[0.12em] ${
          danger ? "text-red-300" : "text-plur-muted"
        }`}
      >
        {title}
      </p>
      <p className="mt-2 truncate text-xs font-black">
        {profile?.username ?? "Kullanıcı"}
        <span className="text-plur-muted">#{profile?.tag ?? "TR"}</span>
      </p>
    </div>
  );
}

function UserDetailCard({
  title,
  profile,
  fallbackId,
  danger = false,
}: {
  title: string;
  profile: ProfileRow | null;
  fallbackId: string;
  danger?: boolean;
}) {
  const avatar =
    profile?.avatar_url ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackId}`;

  return (
    <article
      className={`rounded-2xl border p-4 ${
        danger
          ? "border-plur-red/25 bg-plur-red/[0.04]"
          : "border-plur-border bg-plur-bg"
      }`}
    >
      <p
        className={`text-[9px] font-bold uppercase tracking-[0.12em] ${
          danger ? "text-red-300" : "text-plur-muted"
        }`}
      >
        {title}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <img
          src={avatar}
          alt=""
          className="h-12 w-12 rounded-xl border border-plur-border bg-plur-card object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black">
            {profile?.username ?? "Kullanıcı"}
            <span className="text-plur-muted">#{profile?.tag ?? "TR"}</span>
          </p>
          <p className="mt-1 truncate text-[9px] text-plur-muted">{fallbackId}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[9px]">
        <span className="rounded-lg bg-white/[0.04] px-2 py-1 text-plur-muted">
          {profile?.rank ?? "Rank yok"}
        </span>
        <span className="rounded-lg bg-white/[0.04] px-2 py-1 text-plur-muted">
          {profile?.city ?? "Şehir yok"}
        </span>
        <span
          className={`rounded-lg px-2 py-1 ${
            profile?.online
              ? "bg-plur-green/10 text-plur-green"
              : "bg-white/[0.04] text-plur-muted"
          }`}
        >
          {profile?.online ? "Online" : "Offline"}
        </span>
      </div>

      <Link
        href={`/oyuncu/${fallbackId}`}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-card text-[10px] font-bold text-plur-muted transition hover:text-white"
      >
        <ExternalLink size={14} />
        Profili Gör
      </Link>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warning" | "info" | "success" | "danger";
}) {
  const toneClass = {
    default: "bg-plur-red/10 text-plur-red",
    warning: "bg-yellow-400/10 text-yellow-300",
    info: "bg-cyan-400/10 text-cyan-300",
    success: "bg-plur-green/10 text-plur-green",
    danger: "bg-red-500/10 text-red-300",
  }[tone];

  return (
    <article className="rounded-2xl border border-plur-border bg-plur-card/60 p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
        <FileWarning size={19} />
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-plur-muted">
        {label}
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

function StatusBadge({ status }: { status: ReportStatus }) {
  const classes: Record<ReportStatus, string> = {
    pending: "bg-yellow-400/10 text-yellow-300",
    reviewing: "bg-cyan-400/10 text-cyan-300",
    resolved: "bg-plur-green/10 text-plur-green",
    rejected: "bg-red-500/10 text-red-300",
  };

  return (
    <span className={`rounded-lg px-2 py-1 text-[9px] font-bold ${classes[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

function ActionButton({
  label,
  icon,
  loading,
  onClick,
  tone = "default",
}: {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  onClick: () => void;
  tone?: "default" | "info" | "success" | "danger";
}) {
  const classes = {
    default: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
    info: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
    success: "border-plur-green/25 bg-plur-green/10 text-plur-green",
    danger: "border-red-500/25 bg-red-500/10 text-red-300",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${classes}`}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

function MessageBox({
  type,
  text,
}: {
  type: "error" | "success";
  text: string;
}) {
  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
        type === "error"
          ? "border-plur-red/30 bg-plur-red/10 text-red-300"
          : "border-plur-green/30 bg-plur-green/10 text-plur-green"
      }`}
    >
      {text}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-plur-border bg-plur-card/40 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-plur-green/10 text-plur-green">
        <CheckCircle2 size={27} />
      </div>
      <h2 className="mt-4 text-lg font-black">Şikâyet bulunamadı</h2>
      <p className="mt-2 text-sm text-plur-muted">
        Seçili filtreye veya arama kelimesine uygun kayıt yok.
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
