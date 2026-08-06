"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Gamepad2,
  Globe2,
  Headphones,
  LoaderCircle,
  MapPin,
  Mic,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";

import {
  agents,
  turkishCities,
  valorantServers,
} from "@/lib/data";

import { createClient } from "@/lib/supabase/client";

const ranks = [
  { label: "Iron", value: "iron" },
  { label: "Bronze", value: "bronze" },
  { label: "Silver", value: "silver" },
  { label: "Gold", value: "gold" },
  { label: "Platinum", value: "platinum" },
  { label: "Diamond", value: "diamond" },
  { label: "Ascendant", value: "ascendant" },
  { label: "Immortal", value: "immortal" },
  { label: "Radiant", value: "radiant" },
];

const roles = [
  { label: "Duelist", value: "duelist" },
  { label: "Initiator", value: "initiator" },
  { label: "Controller", value: "controller" },
  { label: "Sentinel", value: "sentinel" },
];

const playStyleTags = [
  "Ciddi oynuyorum",
  "Rank kasıyorum",
  "Eğlence için",
  "Hırslı oynuyorum",
  "Takım oyuncusu",
  "Toksik değil",
  "Akşam aktif",
  "Hafta sonu aktif",
];


type ValorantAccount = {
  puuid: string;
  region: string;
  account_level: number;
  name: string;
  tag: string;
  card: string | null;
  platforms: string[];
};

type ValorantMmr = {
  peak?: {
    tier?: { name?: string };
    rr?: number;
  } | null;
  current?: {
    tier?: { name?: string };
    rr?: number;
    last_change?: number;
    elo?: number;
  } | null;
};

type ValorantApiResponse = {
  success?: boolean;
  error?: string;
  fetchedAt?: string;
  account?: ValorantAccount | null;
  mmr?: ValorantMmr | null;
  matches?: unknown[];
};

type VerifiedValorantProfile = {
  puuid: string;
  name: string;
  tag: string;
  region: string;
  platform: string;
  accountLevel: number;
  rank: string;
  rankTier: string;
  rr: number;
  peakRank: string;
  peakRr: number;
  cardId: string | null;
  verifiedAt: string;
};

function rankNameToTier(rankName: string) {
  const normalized = rankName.toLocaleLowerCase("en-US");
  const tiers = [
    "iron",
    "bronze",
    "silver",
    "gold",
    "platinum",
    "diamond",
    "ascendant",
    "immortal",
    "radiant",
  ];

  return tiers.find((tier) => normalized.includes(tier)) ?? "iron";
}

type ProfileForm = {
  username: string;
  tag: string;
  city: string;
  server: string;
  rank: string;
  rankTier: string;
  role: string;
  agent: string;
  age: string;
  language: string;
  mic: boolean;
  bio: string;
  tags: string[];
};

const initialForm: ProfileForm = {
  username: "",
  tag: "TR",
  city: "",
  server: "İstanbul",
  rank: "",
  rankTier: "",
  role: "",
  agent: "",
  age: "",
  language: "Türkçe",
  mic: true,
  bio: "",
  tags: [],
};

export default function ProfilTamamlaPage() {
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [riotName, setRiotName] = useState("");
  const [riotTag, setRiotTag] = useState("");
  const [valorantLoading, setValorantLoading] = useState(false);
  const [valorantError, setValorantError] = useState("");
  const [valorantProfile, setValorantProfile] =
    useState<VerifiedValorantProfile | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setPageLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/giris");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
            username,
            tag,
            city,
            server,
            rank,
            rank_tier,
            role,
            agent,
            age,
            language,
            mic,
            bio,
            tags,
            riot_puuid,
            riot_name,
            riot_tag,
            riot_region,
            riot_platform,
            riot_account_level,
            riot_rr,
            riot_peak_rank,
            riot_peak_rr,
            riot_card_id,
            riot_verified_at
          `
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        setErrorMessage(
          `Profil bilgileri alınamadı: ${profileError.message}`
        );

        setPageLoading(false);
        return;
      }

      setForm({
        username: profile.username ?? "",
        tag: profile.tag ?? "TR",
        city: profile.city ?? "",
        server: profile.server ?? "İstanbul",
        rank: profile.rank ?? "",
        rankTier: profile.rank_tier ?? "",
        role: profile.role ?? "",
        agent: profile.agent ?? "",
        age: profile.age ? String(profile.age) : "",
        language: profile.language ?? "Türkçe",
        mic: profile.mic ?? true,
        bio: profile.bio ?? "",
        tags: profile.tags ?? [],
      });

      if (profile.riot_puuid && profile.riot_name && profile.riot_tag) {
        const restoredProfile: VerifiedValorantProfile = {
          puuid: profile.riot_puuid,
          name: profile.riot_name,
          tag: profile.riot_tag,
          region: profile.riot_region ?? "eu",
          platform: profile.riot_platform ?? "pc",
          accountLevel: profile.riot_account_level ?? 0,
          rank: profile.rank ?? "Unrated",
          rankTier: profile.rank_tier ?? "iron",
          rr: profile.riot_rr ?? 0,
          peakRank: profile.riot_peak_rank ?? "Bilinmiyor",
          peakRr: profile.riot_peak_rr ?? 0,
          cardId: profile.riot_card_id ?? null,
          verifiedAt: profile.riot_verified_at ?? new Date().toISOString(),
        };

        setValorantProfile(restoredProfile);
        setRiotName(restoredProfile.name);
        setRiotTag(restoredProfile.tag);
      }

      setPageLoading(false);
    }

    loadProfile();
  }, [router, supabase]);

  const updateField = <K extends keyof ProfileForm>(
    field: K,
    value: ProfileForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleTag = (tag: string) => {
    setForm((current) => {
      const exists = current.tags.includes(tag);

      return {
        ...current,
        tags: exists
          ? current.tags.filter((currentTag) => currentTag !== tag)
          : [...current.tags, tag],
      };
    });
  };


  async function handleVerifyValorantAccount() {
    const cleanName = riotName.trim();
    const cleanTag = riotTag.trim().replace(/^#/, "");

    setValorantError("");
    setErrorMessage("");
    setSuccessMessage("");

    if (cleanName.length < 3 || cleanTag.length < 2) {
      setValorantProfile(null);
      setValorantError("Geçerli bir Riot kullanıcı adı ve tag gir.");
      return;
    }

    setValorantLoading(true);

    try {
      const params = new URLSearchParams({
        name: cleanName,
        tag: cleanTag,
        region: "eu",
        platform: "pc",
      });

      const response = await fetch(`/api/valorant/profile?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const result = (await response.json()) as ValorantApiResponse;

      if (!response.ok || !result.success || !result.account) {
        setValorantProfile(null);
        setValorantError(
          response.status === 404
            ? "Riot ID bulunamadı. Kullanıcı adı ve tag bilgisini kontrol et."
            : result.error || "Valorant hesabı doğrulanamadı."
        );
        return;
      }

      const currentRank = result.mmr?.current?.tier?.name || "Unrated";
      const verifiedAt = result.fetchedAt || new Date().toISOString();

      const verifiedProfile: VerifiedValorantProfile = {
        puuid: result.account.puuid,
        name: result.account.name,
        tag: result.account.tag,
        region: result.account.region || "eu",
        platform: "pc",
        accountLevel: result.account.account_level ?? 0,
        rank: currentRank,
        rankTier: rankNameToTier(currentRank),
        rr: result.mmr?.current?.rr ?? 0,
        peakRank: result.mmr?.peak?.tier?.name || "Bilinmiyor",
        peakRr: result.mmr?.peak?.rr ?? 0,
        cardId: result.account.card ?? null,
        verifiedAt,
      };

      setValorantProfile(verifiedProfile);
      setRiotName(verifiedProfile.name);
      setRiotTag(verifiedProfile.tag);
      setForm((current) => ({
        ...current,
        username: verifiedProfile.name,
        tag: verifiedProfile.tag,
        rank: verifiedProfile.rank,
        rankTier: verifiedProfile.rankTier,
      }));
    } catch {
      setValorantProfile(null);
      setValorantError("API bağlantısı kurulamadı. Biraz sonra tekrar dene.");
    } finally {
      setValorantLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!valorantProfile) {
      setErrorMessage("Önce Riot ID bilgini doğrulamalısın.");
      return;
    }

    if (!form.city) {
      setErrorMessage("Lütfen yaşadığın ili seç.");
      return;
    }

    if (!form.server) {
      setErrorMessage("Lütfen oynadığın sunucuyu seç.");
      return;
    }

    if (!form.role) {
      setErrorMessage("Lütfen ana rolünü seç.");
      return;
    }

    if (!form.agent) {
      setErrorMessage("Lütfen ana ajanını seç.");
      return;
    }

    const parsedAge = Number(form.age);

    if (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 100) {
      setErrorMessage("Yaş 13 ile 100 arasında olmalı.");
      return;
    }

    if (form.bio.trim().length < 20) {
      setErrorMessage("Biyografi en az 20 karakter olmalı.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      router.replace("/giris");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: valorantProfile.name,
        tag: valorantProfile.tag,
        city: form.city,
        server: form.server,
        rank: valorantProfile.rank,
        rank_tier: valorantProfile.rankTier,
        riot_puuid: valorantProfile.puuid,
        riot_name: valorantProfile.name,
        riot_tag: valorantProfile.tag,
        riot_region: valorantProfile.region,
        riot_platform: valorantProfile.platform,
        riot_account_level: valorantProfile.accountLevel,
        riot_rr: valorantProfile.rr,
        riot_peak_rank: valorantProfile.peakRank,
        riot_peak_rr: valorantProfile.peakRr,
        riot_card_id: valorantProfile.cardId,
        riot_verified_at: valorantProfile.verifiedAt,
        role: form.role,
        agent: form.agent,
        age: parsedAge,
        language: form.language,
        mic: form.mic,
        bio: form.bio.trim(),
        tags: form.tags,
        online: true,
        last_active: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        setErrorMessage(
          "Bu kullanıcı adı başka biri tarafından kullanılıyor."
        );
        return;
      }

      setErrorMessage(`Profil kaydedilemedi: ${error.message}`);
      return;
    }

    setSuccessMessage("Profilin başarıyla kaydedildi.");

    setTimeout(() => {
      router.push("/duo-bul");
      router.refresh();
    }, 900);
  }

  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-plur-bg text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-plur-border bg-plur-card/70 px-6 py-5">
          <LoaderCircle
            size={22}
            className="animate-spin text-plur-red"
          />

          <span className="text-sm text-plur-muted">
            Profil bilgilerin yükleniyor...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-plur-bg px-4 py-8 text-white md:px-6">
      <BackgroundEffects />

      <div className="relative mx-auto max-w-[1250px]">
        <section className="overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/65 shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="relative hidden overflow-hidden border-r border-plur-border bg-plur-bg/65 p-10 lg:block">
              <div className="absolute -left-28 top-10 h-80 w-80 rounded-full bg-plur-red/15 blur-[110px]" />

              <div className="relative flex h-full min-h-[760px] flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plur-red text-white shadow-[0_12px_35px_rgba(255,70,85,0.3)]">
                      <Gamepad2 size={25} />
                    </div>

                    <span className="font-rajdhani text-3xl font-black tracking-[0.18em]">
                      PLUR
                    </span>
                  </div>

                  <p className="mt-16 text-[10px] font-bold uppercase tracking-[0.22em] text-plur-red">
                    Profilini tamamla
                  </p>

                  <h1 className="mt-5 font-rajdhani text-5xl font-black uppercase leading-[0.95]">
                    Duo&apos;n seni doğru bilgilerle bulsun.
                  </h1>

                  <p className="mt-6 text-sm leading-7 text-plur-muted">
                    Rank, rol, il ve sunucu bilgilerini doldur. Böylece sana
                    gerçekten uygun oyuncularla eşleşebilirsin.
                  </p>

                  <div className="mt-8 space-y-3">
                    <FeatureItem
                      icon={<MapPin size={17} />}
                      text="Türkiye'nin 81 ilinden eşleşme"
                    />

                    <FeatureItem
                      icon={<Swords size={17} />}
                      text="Rank ve rol uyumlu oyuncular"
                    />

                    <FeatureItem
                      icon={<ShieldCheck size={17} />}
                      text="Güvenli topluluk profilleri"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-plur-red/20 bg-plur-red/10 p-4">
                  <div className="flex items-center gap-2 text-plur-red">
                    <Sparkles size={16} />

                    <span className="text-xs font-bold">
                      Son adım
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-plur-muted">
                    Bilgilerini kaydettikten sonra profilin oyuncu listesinde
                    gösterilmeye hazır olacak.
                  </p>
                </div>
              </div>
            </aside>

            <section className="p-5 sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-plur-red">
                  Oyuncu profili
                </p>

                <h2 className="mt-2 font-rajdhani text-3xl font-black sm:text-4xl">
                  Profil Bilgilerini Tamamla
                </h2>

                <p className="mt-3 text-sm leading-6 text-plur-muted">
                  Bu bilgiler diğer oyuncuların seni keşfetmesini ve doğru
                  filtrelerle bulmasını sağlayacak.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-7"
              >
                <FormSection
                  title="Valorant Hesabını Bağla"
                  description="Riot ID doğruysa gerçek rank ve hesap bilgilerin otomatik alınır."
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_125px_auto]">
                    <TextInput
                      label="Riot kullanıcı adı"
                      value={riotName}
                      onChange={(value) => {
                        setRiotName(value);
                        setValorantProfile(null);
                        setValorantError("");
                      }}
                      placeholder="Örn. pretty baby"
                      icon={<Gamepad2 size={16} />}
                      maxLength={32}
                    />

                    <TextInput
                      label="Riot tag"
                      value={riotTag}
                      onChange={(value) => {
                        setRiotTag(value.replace(/^#/, ""));
                        setValorantProfile(null);
                        setValorantError("");
                      }}
                      placeholder="599"
                      maxLength={8}
                    />

                    <button
                      type="button"
                      onClick={handleVerifyValorantAccount}
                      disabled={valorantLoading}
                      className="mt-[26px] flex h-12 items-center justify-center gap-2 rounded-xl border border-plur-red/50 bg-plur-red px-5 text-xs font-black text-white shadow-[0_12px_30px_rgba(255,70,85,0.22)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
                    >
                      {valorantLoading ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : valorantProfile ? (
                        <RefreshCw size={15} />
                      ) : (
                        <ShieldCheck size={16} />
                      )}
                      {valorantLoading
                        ? "Kontrol ediliyor..."
                        : valorantProfile
                          ? "Yeniden Doğrula"
                          : "Hesabı Doğrula"}
                    </button>
                  </div>

                  {valorantError && (
                    <div className="flex items-start gap-3 rounded-xl border border-plur-red/30 bg-plur-red/10 px-4 py-3 text-xs leading-5 text-red-300">
                      <AlertCircle size={17} className="mt-0.5 shrink-0" />
                      <span>{valorantError}</span>
                    </div>
                  )}

                  {valorantProfile && (
                    <div className="relative overflow-hidden rounded-2xl border border-plur-green/30 bg-gradient-to-br from-plur-green/10 via-plur-bg/80 to-cyan-400/[0.06] p-5">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-plur-green/15 blur-3xl" />
                      <div className="relative flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-plur-green">
                            <BadgeCheck size={18} />
                            <span className="text-xs font-black uppercase tracking-[0.14em]">
                              Hesap doğrulandı
                            </span>
                          </div>
                          <h3 className="mt-3 font-rajdhani text-2xl font-black text-white">
                            {valorantProfile.name}
                            <span className="text-plur-muted">#{valorantProfile.tag}</span>
                          </h3>
                          <p className="mt-1 text-xs text-plur-muted">
                            EU · PC · Hesap seviyesi {valorantProfile.accountLevel}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <ValorantStat
                            label="Güncel Rank"
                            value={valorantProfile.rank}
                            icon={<Trophy size={15} />}
                          />
                          <ValorantStat
                            label="RR"
                            value={String(valorantProfile.rr)}
                            icon={<Sparkles size={15} />}
                          />
                          <ValorantStat
                            label="Peak Rank"
                            value={valorantProfile.peakRank}
                            icon={<Gamepad2 size={15} />}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </FormSection>

                <FormSection
                  title="Temel Bilgiler"
                  description="Sitede görünecek oyuncu bilgilerin."
                >
                  <div className="rounded-2xl border border-plur-green/25 bg-plur-green/[0.06] p-4">
                    <div className="flex items-center gap-3">
                      <BadgeCheck size={20} className="text-plur-green" />
                      <div>
                        <p className="text-sm font-bold text-white">
                          Riot hesabından alınan kimlik
                        </p>
                        <p className="mt-1 text-xs text-plur-muted">
                          {valorantProfile
                            ? `${valorantProfile.name}#${valorantProfile.tag}`
                            : "Önce aşağıdaki Riot ID alanından hesabını doğrula."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectInput
                      label="İl"
                      value={form.city}
                      onChange={(value) =>
                        updateField("city", value)
                      }
                      placeholder="İl seç"
                      options={turkishCities.map((city) => ({
                        label: city,
                        value: city,
                      }))}
                      icon={<MapPin size={16} />}
                    />

                    <SelectInput
                      label="Oyun sunucusu"
                      value={form.server}
                      onChange={(value) =>
                        updateField("server", value)
                      }
                      placeholder="Sunucu seç"
                      options={valorantServers.map((server) => ({
                        label: server,
                        value: server,
                      }))}
                      icon={<Globe2 size={16} />}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label="Yaş"
                      type="number"
                      value={form.age}
                      onChange={(value) =>
                        updateField("age", value)
                      }
                      placeholder="Örn. 21"
                      min={13}
                      max={100}
                    />

                    <SelectInput
                      label="Dil"
                      value={form.language}
                      onChange={(value) =>
                        updateField("language", value)
                      }
                      placeholder="Dil seç"
                      options={[
                        {
                          label: "Türkçe",
                          value: "Türkçe",
                        },
                        {
                          label: "Türkçe / İngilizce",
                          value: "Türkçe / İngilizce",
                        },
                      ]}
                      icon={<Headphones size={16} />}
                    />
                  </div>
                </FormSection>

                <FormSection
                  title="Valorant Bilgileri"
                  description="Rank, rol ve ana ajan bilgilerin."
                >
                  <div className="rounded-2xl border border-plur-border bg-plur-bg/70 p-4">
                    <p className="text-xs font-semibold text-white">Gerçek Valorant bilgileri</p>
                    <p className="mt-2 text-xs leading-5 text-plur-muted">
                      Rank bilgisi manuel girilemez. Doğrulanan Riot hesabından otomatik alınır.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectInput
                      label="Ana rol"
                      value={form.role}
                      onChange={(value) =>
                        updateField("role", value)
                      }
                      placeholder="Rol seç"
                      options={roles}
                      icon={<Swords size={16} />}
                    />

                    <SelectInput
                      label="Ana ajan"
                      value={form.agent}
                      onChange={(value) =>
                        updateField("agent", value)
                      }
                      placeholder="Ajan seç"
                      options={agents.map((agent) => ({
                        label: agent,
                        value: agent,
                      }))}
                      icon={<Gamepad2 size={16} />}
                    />
                  </div>
                </FormSection>

                <FormSection
                  title="Oyun Tarzı"
                  description="Sana uygun duo adaylarının seni tanımasını sağla."
                >
                  <div>
                    <span className="mb-3 block text-xs font-semibold text-white">
                      Etiketler
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {playStyleTags.map((tag) => {
                        const active = form.tags.includes(tag);

                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] ${
                              active
                                ? "border-plur-red/50 bg-plur-red/15 text-plur-red shadow-[0_8px_24px_rgba(255,70,85,0.12)]"
                                : "border-plur-border bg-plur-bg/70 text-plur-muted hover:border-plur-red/30 hover:text-white"
                            }`}
                          >
                            {active && <Check size={13} />}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-plur-border bg-plur-bg/70 p-4 transition hover:border-plur-green/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-plur-green/10 text-plur-green">
                        <Mic size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Mikrofon kullanıyorum
                        </p>

                        <p className="mt-1 text-xs text-plur-muted">
                          Sesli iletişime açık olduğunu gösterir.
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={form.mic}
                      onChange={(event) =>
                        updateField("mic", event.target.checked)
                      }
                      className="h-5 w-5 accent-[#ff4655]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-white">
                      Biyografi
                    </span>

                    <textarea
                      value={form.bio}
                      onChange={(event) =>
                        updateField("bio", event.target.value)
                      }
                      placeholder="Oyun tarzını, hedefini ve aradığın duo tipini anlat..."
                      rows={5}
                      maxLength={350}
                      className="w-full resize-none rounded-2xl border border-plur-border bg-plur-bg/75 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-plur-muted focus:border-plur-red/60 focus:shadow-[0_0_25px_rgba(255,70,85,0.08)]"
                    />

                    <div className="mt-2 flex justify-between text-[10px] text-plur-muted">
                      <span>En az 20 karakter</span>
                      <span>{form.bio.length}/350</span>
                    </div>
                  </label>
                </FormSection>

                {errorMessage && (
                  <MessageBox
                    type="error"
                    message={errorMessage}
                  />
                )}

                {successMessage && (
                  <MessageBox
                    type="success"
                    message={successMessage}
                  />
                )}

                <button
                  type="submit"
                  disabled={saving || !valorantProfile}
                  className="group relative flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-plur-red/50 bg-plur-red px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_35px_rgba(255,70,85,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(255,70,85,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 translate-x-[-130%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[130%]" />

                  {saving ? (
                    <LoaderCircle
                      size={18}
                      className="relative animate-spin"
                    />
                  ) : (
                    <Check
                      size={18}
                      className="relative"
                    />
                  )}

                  <span className="relative">
                    {saving
                      ? "Profil kaydediliyor..."
                      : "Profili Kaydet"}
                  </span>

                  {!saving && (
                    <ArrowRight
                      size={17}
                      className="relative transition-transform duration-300 group-hover:translate-x-1"
                    />
                  )}
                </button>
              </form>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function BackgroundEffects() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-40 -top-36 h-[440px] w-[440px] rounded-full bg-plur-red/12 blur-[140px]" />

      <div className="absolute -bottom-40 -right-32 h-[440px] w-[440px] rounded-full bg-cyan-400/8 blur-[140px]" />

      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "45px 45px",
        }}
      />
    </div>
  );
}

function FeatureItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-plur-border bg-plur-card/45 px-4 py-3">
      <span className="text-plur-red">{icon}</span>
      <span className="text-xs text-plur-muted">{text}</span>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-plur-border bg-plur-bg/35 p-4 sm:p-5">
      <h3 className="font-rajdhani text-xl font-black text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs text-plur-muted">
        {description}
      </p>

      <div className="mt-5 space-y-4">
        {children}
      </div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  maxLength,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  type?: string;
  maxLength?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-white">
        {label}
      </span>

      <div className="group/input relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-plur-muted transition group-focus-within/input:text-plur-red">
            {icon}
          </span>
        )}

        <input
          required
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          max={max}
          className={`h-12 w-full rounded-xl border border-plur-border bg-plur-bg/75 pr-4 text-sm text-white outline-none transition placeholder:text-plur-muted focus:border-plur-red/60 focus:shadow-[0_0_25px_rgba(255,70,85,0.08)] ${
            icon ? "pl-11" : "pl-4"
          }`}
        />
      </div>
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  placeholder,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: {
    label: string;
    value: string;
  }[];
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-white">
        {label}
      </span>

      <div className="group/select relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-plur-muted transition group-focus-within/select:text-plur-red">
            {icon}
          </span>
        )}

        <select
          required
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-12 w-full cursor-pointer appearance-none rounded-xl border border-plur-border bg-plur-bg/75 pr-10 text-sm text-white outline-none transition focus:border-plur-red/60 focus:shadow-[0_0_25px_rgba(255,70,85,0.08)] ${
            icon ? "pl-11" : "pl-4"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-plur-muted transition group-focus-within/select:rotate-180 group-focus-within/select:text-plur-red"
        />
      </div>
    </label>
  );
}


function ValorantStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-[96px] rounded-xl border border-plur-border bg-plur-bg/75 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-plur-red">
        {icon}
        <span className="text-[8px] font-bold uppercase tracking-wider text-plur-muted">
          {label}
        </span>
      </div>
      <p className="mt-2 truncate text-xs font-black text-white">{value}</p>
    </div>
  );
}

function MessageBox({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-xs leading-5 ${
        type === "success"
          ? "border-plur-green/30 bg-plur-green/10 text-plur-green"
          : "border-plur-red/30 bg-plur-red/10 text-red-300"
      }`}
    >
      {message}
    </div>
  );
}