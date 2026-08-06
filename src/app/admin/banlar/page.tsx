"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldBan,
  Unlock,
  UserRound,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  tag: string | null;
  avatar_url: string | null;
  rank: string | null;
  city: string | null;
  online: boolean | null;
};

type BanRow = {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  note: string | null;
  starts_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
  created_at: string;
  profile: Profile | null;
};

type DurationValue = "1" | "3" | "7" | "30" | "permanent";

export default function AdminBansPage() {
  const supabase = useMemo(() => createClient(), []);

  const [bans, setBans] = useState<BanRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedBan, setSelectedBan] = useState<BanRow | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState<DurationValue>("7");
  const [revokeReason, setRevokeReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadData(initial = false) {
    if (initial) setLoading(true);
    else setRefreshing(true);

    setErrorMessage("");

    const [{ data: banData, error: banError }, { data: profileData, error: profileError }] =
      await Promise.all([
        supabase
          .from("user_bans")
          .select(`
            id,
            user_id,
            banned_by,
            reason,
            note,
            starts_at,
            expires_at,
            revoked_at,
            revoked_by,
            revoke_reason,
            created_at
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, username, tag, avatar_url, rank, city, online")
          .order("username", { ascending: true }),
      ]);

    if (banError) setErrorMessage(banError.message);
    if (profileError) setErrorMessage(profileError.message);

    const loadedProfiles = (profileData ?? []) as Profile[];
    const profileMap = new Map(loadedProfiles.map((profile) => [profile.id, profile]));

    setProfiles(loadedProfiles);
    setBans(
      ((banData ?? []) as Omit<BanRow, "profile">[]).map((ban) => ({
        ...ban,
        profile: profileMap.get(ban.user_id) ?? null,
      }))
    );

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    void loadData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeBanUserIds = useMemo(
    () =>
      new Set(
        bans
          .filter((ban) => isBanActive(ban))
          .map((ban) => ban.user_id)
      ),
    [bans]
  );

  const filteredProfiles = useMemo(() => {
    const q = normalize(search);

    return profiles.filter((profile) => {
      if (!q) return true;
      return [profile.username, profile.tag, profile.rank, profile.city, profile.id]
        .some((value) => normalize(value ?? "").includes(q));
    });
  }, [profiles, search]);

  const visibleBans = useMemo(
    () => bans.filter((ban) => showHistory || isBanActive(ban)),
    [bans, showHistory]
  );

  async function banUser() {
    if (!selectedProfile || !reason.trim() || actionLoading) return;

    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const durationDays = duration === "permanent" ? null : Number(duration);

    const { error } = await supabase.rpc("admin_ban_user", {
      target_user_id: selectedProfile.id,
      ban_reason: reason.trim(),
      ban_note: note.trim() || null,
      duration_days: durationDays,
    });

    if (error) {
      setErrorMessage(error.message);
      setActionLoading(false);
      return;
    }

    setSuccessMessage(`${selectedProfile.username ?? "Kullanıcı"} banlandı.`);
    setSelectedProfile(null);
    setReason("");
    setNote("");
    setDuration("7");
    await loadData(false);
    setActionLoading(false);
  }

  async function revokeBan() {
    if (!selectedBan || actionLoading) return;

    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.rpc("admin_unban_user", {
      target_ban_id: selectedBan.id,
      unban_reason: revokeReason.trim() || "Admin tarafından kaldırıldı",
    });

    if (error) {
      setErrorMessage(error.message);
      setActionLoading(false);
      return;
    }

    setSuccessMessage("Ban kaldırıldı.");
    setSelectedBan(null);
    setRevokeReason("");
    await loadData(false);
    setActionLoading(false);
  }

  if (loading) {
    return <Loading text="Ban sistemi yükleniyor..." />;
  }

  return (
    <>
      <main className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-[1500px]">
          <section className="relative overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/70 p-6 md:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-plur-red/20 blur-[110px]" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-plur-red">
                  Moderasyon Merkezi
                </p>
                <h1 className="mt-3 font-rajdhani text-4xl font-black md:text-5xl">
                  Ban Yönetimi
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-plur-muted">
                  Süreli veya süresiz cezalar ver, aktif banları izle ve ban geçmişini yönet.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadData(false)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg px-4 text-xs font-bold text-white transition hover:border-plur-red/40 hover:bg-plur-red/10 disabled:opacity-60"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin text-plur-red" : ""} />
                {refreshing ? "Yenileniyor..." : "Yenile"}
              </button>
            </div>
          </section>

          {errorMessage && <Message type="error" text={errorMessage} />}
          {successMessage && <Message type="success" text={successMessage} />}

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <Summary label="Aktif Ban" value={bans.filter(isBanActive).length} icon={<ShieldBan />} />
            <Summary label="Toplam Ban Kaydı" value={bans.length} icon={<Ban />} />
            <Summary label="Banlı Olmayan" value={Math.max(0, profiles.length - activeBanUserIds.size)} icon={<CheckCircle2 />} green />
          </section>

          <section className="mt-6 rounded-2xl border border-plur-border bg-plur-card/60 p-4 md:p-5">
            <label className="relative block">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-plur-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Kullanıcı adı, tag, rank, şehir veya ID ara..."
                className="h-12 w-full rounded-xl border border-plur-border bg-plur-bg pl-11 pr-4 text-sm text-white outline-none focus:border-plur-red/50"
              />
            </label>
          </section>

          <section className="mt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-rajdhani text-2xl font-black">Kullanıcılar</h2>
                <p className="text-[11px] text-plur-muted">Ban vermek için kullanıcıyı seç.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProfiles.map((profile) => {
                const banned = activeBanUserIds.has(profile.id);
                return (
                  <article key={profile.id} className="rounded-2xl border border-plur-border bg-plur-card/60 p-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={profile.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
                        alt=""
                        className="h-14 w-14 rounded-2xl border border-plur-border bg-plur-bg"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-rajdhani text-xl font-black">
                          {profile.username ?? "Oyuncu"}
                          <span className="text-plur-muted">#{profile.tag ?? "TR"}</span>
                        </p>
                        <p className="mt-1 truncate text-[9px] text-plur-muted">{profile.id}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-[9px]">
                      <span className="rounded-lg bg-white/[0.04] px-2 py-1 text-plur-muted">{profile.rank ?? "Rank yok"}</span>
                      <span className="rounded-lg bg-white/[0.04] px-2 py-1 text-plur-muted">{profile.city ?? "Şehir yok"}</span>
                      <span className={`rounded-lg px-2 py-1 ${banned ? "bg-plur-red/10 text-plur-red" : "bg-plur-green/10 text-plur-green"}`}>
                        {banned ? "Banlı" : "Aktif"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Link
                        href={`/oyuncu/${profile.id}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg text-[10px] font-bold text-plur-muted transition hover:text-white"
                      >
                        <ExternalLink size={14} />
                        Profil
                      </Link>

                      <button
                        type="button"
                        disabled={banned}
                        onClick={() => {
                          setSelectedProfile(profile);
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-plur-red/30 bg-plur-red/10 text-[10px] font-bold text-red-200 transition hover:bg-plur-red/15 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ShieldBan size={14} />
                        {banned ? "Zaten Banlı" : "Banla"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-rajdhani text-2xl font-black">
                  {showHistory ? "Ban Geçmişi" : "Aktif Banlar"}
                </h2>
                <p className="text-[11px] text-plur-muted">{visibleBans.length} kayıt gösteriliyor.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowHistory((current) => !current)}
                className="h-10 rounded-xl border border-plur-border bg-plur-card px-4 text-[10px] font-bold text-plur-muted transition hover:text-white"
              >
                {showHistory ? "Sadece Aktifleri Göster" : "Tüm Geçmişi Göster"}
              </button>
            </div>

            <div className="grid gap-4">
              {visibleBans.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-plur-border bg-plur-card/40 px-6 py-16 text-center text-sm text-plur-muted">
                  Ban kaydı bulunamadı.
                </div>
              ) : (
                visibleBans.map((ban) => (
                  <article key={ban.id} className="rounded-2xl border border-plur-border bg-plur-card/60 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-rajdhani text-xl font-black">
                            {ban.profile?.username ?? "Kullanıcı"}
                            <span className="text-plur-muted">#{ban.profile?.tag ?? "TR"}</span>
                          </p>
                          <span className={`rounded-lg px-2 py-1 text-[9px] font-bold ${isBanActive(ban) ? "bg-plur-red/10 text-plur-red" : "bg-white/[0.04] text-plur-muted"}`}>
                            {isBanActive(ban) ? "Aktif Ban" : "Sona Erdi"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-white">{ban.reason}</p>
                        {ban.note && <p className="mt-1 text-xs text-plur-muted">{ban.note}</p>}
                      </div>

                      <div className="grid gap-2 text-[10px] text-plur-muted sm:grid-cols-2 lg:w-[430px]">
                        <div className="rounded-xl border border-plur-border bg-plur-bg px-3 py-2">
                          Başlangıç: {formatDate(ban.starts_at)}
                        </div>
                        <div className="rounded-xl border border-plur-border bg-plur-bg px-3 py-2">
                          Bitiş: {ban.expires_at ? formatDate(ban.expires_at) : "Süresiz"}
                        </div>
                      </div>

                      {isBanActive(ban) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBan(ban);
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-plur-green/30 bg-plur-green/10 px-4 text-xs font-bold text-plur-green transition hover:bg-plur-green/15"
                        >
                          <Unlock size={15} />
                          Banı Kaldır
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <BanModal
        profile={selectedProfile}
        reason={reason}
        note={note}
        duration={duration}
        loading={actionLoading}
        onReasonChange={setReason}
        onNoteChange={setNote}
        onDurationChange={setDuration}
        onConfirm={() => void banUser()}
        onClose={() => !actionLoading && setSelectedProfile(null)}
      />

      <UnbanModal
        ban={selectedBan}
        reason={revokeReason}
        loading={actionLoading}
        onReasonChange={setRevokeReason}
        onConfirm={() => void revokeBan()}
        onClose={() => !actionLoading && setSelectedBan(null)}
      />
    </>
  );
}

function BanModal({
  profile,
  reason,
  note,
  duration,
  loading,
  onReasonChange,
  onNoteChange,
  onDurationChange,
  onConfirm,
  onClose,
}: {
  profile: Profile | null;
  reason: string;
  note: string;
  duration: DurationValue;
  loading: boolean;
  onReasonChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onDurationChange: (value: DurationValue) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!profile) return null;

  return (
    <ModalShell title={`${profile.username ?? "Kullanıcı"} banlanacak`} onClose={onClose}>
      <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-plur-muted">Ban Süresi</label>
      <select
        value={duration}
        onChange={(event) => onDurationChange(event.target.value as DurationValue)}
        className="mt-2 h-12 w-full rounded-xl border border-plur-border bg-plur-bg px-4 text-sm text-white outline-none"
      >
        <option value="1">1 Gün</option>
        <option value="3">3 Gün</option>
        <option value="7">7 Gün</option>
        <option value="30">30 Gün</option>
        <option value="permanent">Süresiz</option>
      </select>

      <label className="mt-4 block text-[10px] font-bold uppercase tracking-[0.12em] text-plur-muted">Ban Sebebi</label>
      <input
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        maxLength={250}
        placeholder="Örn. Taciz, spam, uygunsuz davranış..."
        className="mt-2 h-12 w-full rounded-xl border border-plur-border bg-plur-bg px-4 text-sm text-white outline-none focus:border-plur-red/50"
      />

      <label className="mt-4 block text-[10px] font-bold uppercase tracking-[0.12em] text-plur-muted">Admin Notu</label>
      <textarea
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="İç moderasyon notu..."
        className="mt-2 w-full resize-none rounded-xl border border-plur-border bg-plur-bg px-4 py-3 text-sm text-white outline-none focus:border-plur-red/50"
      />

      <button
        type="button"
        onClick={onConfirm}
        disabled={!reason.trim() || loading}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-plur-red text-sm font-black text-white disabled:opacity-50"
      >
        {loading ? <LoaderCircle size={17} className="animate-spin" /> : <ShieldBan size={17} />}
        Banı Uygula
      </button>
    </ModalShell>
  );
}

function UnbanModal({
  ban,
  reason,
  loading,
  onReasonChange,
  onConfirm,
  onClose,
}: {
  ban: BanRow | null;
  reason: string;
  loading: boolean;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!ban) return null;

  return (
    <ModalShell title="Ban kaldırılacak" onClose={onClose}>
      <p className="text-sm text-plur-muted">
        {ban.profile?.username ?? "Kullanıcının"} aktif banını kaldırıyorsun.
      </p>
      <textarea
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        rows={4}
        maxLength={500}
        placeholder="Ban kaldırma sebebi..."
        className="mt-4 w-full resize-none rounded-xl border border-plur-border bg-plur-bg px-4 py-3 text-sm text-white outline-none focus:border-plur-green/50"
      />
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-plur-green text-sm font-black text-black disabled:opacity-50"
      >
        {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Unlock size={17} />}
        Banı Kaldır
      </button>
    </ModalShell>
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <section className="relative z-10 w-full max-w-lg rounded-[28px] border border-plur-border bg-plur-card p-6 shadow-[0_30px_100px_rgba(0,0,0,.65)]">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-plur-border bg-plur-bg text-plur-muted">
          <X size={18} />
        </button>
        <h2 className="pr-12 font-rajdhani text-2xl font-black">{title}</h2>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}

function Summary({
  label,
  value,
  icon,
  green = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  green?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-plur-border bg-plur-card/60 p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${green ? "bg-plur-green/10 text-plur-green" : "bg-plur-red/10 text-plur-red"}`}>
        {icon}
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-plur-muted">{label}</p>
      <p className="mt-1 font-rajdhani text-3xl font-black">{value}</p>
    </article>
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

function Message({ type, text }: { type: "error" | "success"; text: string }) {
  return (
    <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${type === "error" ? "border-plur-red/30 bg-plur-red/10 text-red-300" : "border-plur-green/30 bg-plur-green/10 text-plur-green"}`}>
      {text}
    </div>
  );
}

function isBanActive(ban: Pick<BanRow, "revoked_at" | "expires_at">) {
  if (ban.revoked_at) return false;
  if (!ban.expires_at) return true;
  return new Date(ban.expires_at).getTime() > Date.now();
}

function normalize(value: string) {
  return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
