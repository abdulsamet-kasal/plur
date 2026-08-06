"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Gamepad2,
  Globe2,
  LoaderCircle,
  MapPin,
  Mic,
  Radio,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";

import {
  turkishCities,
  valorantServers,
} from "@/lib/data";

import { createClient } from "@/lib/supabase/client";

type FormState = {
  title: string;
  gameMode: string;
  wantedRankTier: string;
  wantedRole: string;
  server: string;
  city: string;
  micRequired: boolean;
  activeHours: string;
  description: string;
  status: "active" | "passive" | "closed";
};

type DuoPostRow = {
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
  status: "active" | "passive" | "closed";
};

const gameModes = [
  { label: "Rekabetçi", value: "competitive" },
  { label: "Derecesiz", value: "unrated" },
  { label: "Premier", value: "premier" },
  { label: "Tam Gaz", value: "swiftplay" },
  { label: "Spike'a Hücum", value: "spike_rush" },
  { label: "Ölüm Kalım Savaşı", value: "deathmatch" },
  { label: "Özel Oyun", value: "custom" },
];

const ranks = [
  { label: "Fark etmez", value: "" },
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
  { label: "Fark etmez", value: "any" },
  { label: "Duelist", value: "duelist" },
  { label: "Initiator", value: "initiator" },
  { label: "Controller", value: "controller" },
  { label: "Sentinel", value: "sentinel" },
];

const activeHourOptions = [
  "Sabah 08:00 - 12:00",
  "Öğlen 12:00 - 17:00",
  "Akşam 17:00 - 22:00",
  "Gece 22:00 - 03:00",
  "Hafta sonu",
  "Saat fark etmez",
];

const initialForm: FormState = {
  title: "",
  gameMode: "competitive",
  wantedRankTier: "",
  wantedRole: "any",
  server: "İstanbul",
  city: "",
  micRequired: true,
  activeHours: "",
  description: "",
  status: "active",
};

export default function IlanDuzenlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createClient(), []);

  const postId = params?.id;

  const [form, setForm] = useState<FormState>(initialForm);
  const [ownerId, setOwnerId] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPost() {
      if (!postId) {
        return;
      }

      setPageLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

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
          status
        `)
        .eq("id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        setErrorMessage(`İlan alınamadı: ${error.message}`);
        setPageLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage(
          "Bu ilan bulunamadı veya bu ilanı düzenleme yetkin yok."
        );
        setPageLoading(false);
        return;
      }

      const post = data as DuoPostRow;

      setOwnerId(post.user_id);

      setForm({
        title: post.title,
        gameMode: post.game_mode,
        wantedRankTier: post.wanted_rank_tier ?? "",
        wantedRole: post.wanted_role ?? "any",
        server: post.server,
        city: post.city ?? "",
        micRequired: post.mic_required,
        activeHours: post.active_hours ?? "",
        description: post.description,
        status: post.status,
      });

      setPageLoading(false);
    }

    loadPost();

    return () => {
      mounted = false;
    };
  }, [postId, router, supabase]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const title = form.title.trim();
    const description = form.description.trim();

    if (!postId || !ownerId) {
      setErrorMessage("İlan bilgisi bulunamadı.");
      return;
    }

    if (title.length < 5) {
      setErrorMessage("İlan başlığı en az 5 karakter olmalı.");
      return;
    }

    if (title.length > 80) {
      setErrorMessage("İlan başlığı en fazla 80 karakter olabilir.");
      return;
    }

    if (!form.gameMode) {
      setErrorMessage("Lütfen oyun modu seç.");
      return;
    }

    if (!form.server) {
      setErrorMessage("Lütfen oyun sunucusu seç.");
      return;
    }

    if (description.length < 20) {
      setErrorMessage("İlan açıklaması en az 20 karakter olmalı.");
      return;
    }

    if (description.length > 500) {
      setErrorMessage("İlan açıklaması en fazla 500 karakter olabilir.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/giris");
        return;
      }

      if (user.id !== ownerId) {
        setErrorMessage("Bu ilanı düzenleme yetkin yok.");
        return;
      }

      const { error } = await supabase
        .from("duo_posts")
        .update({
          title,
          game_mode: form.gameMode,
          wanted_rank_tier: form.wantedRankTier || null,
          wanted_role: form.wantedRole || "any",
          server: form.server,
          city: form.city || null,
          mic_required: form.micRequired,
          active_hours: form.activeHours || null,
          description,
          status: form.status,
        })
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) {
        setErrorMessage(`İlan güncellenemedi: ${error.message}`);
        return;
      }

      setSuccessMessage("İlan başarıyla güncellendi.");

      setTimeout(() => {
        router.push("/ilanlarim");
        router.refresh();
      }, 900);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "İlan güncellenirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setSaving(false);
    }
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
            İlan bilgileri yükleniyor...
          </span>
        </div>
      </main>
    );
  }

  if (errorMessage && !ownerId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-plur-bg px-4 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-plur-border bg-plur-card/70 p-6 text-center">
          <ShieldCheck
            size={38}
            className="mx-auto text-plur-red"
          />

          <h1 className="mt-4 font-rajdhani text-2xl font-black">
            İlan açılamadı
          </h1>

          <p className="mt-3 text-sm leading-6 text-plur-muted">
            {errorMessage}
          </p>

          <Link
            href="/ilanlarim"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-plur-red/50 bg-plur-red px-5 text-xs font-bold text-white"
          >
            <ArrowLeft size={15} />
            İlanlarıma dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-plur-bg px-4 py-8 text-white md:px-6">
      <BackgroundEffects />

      <div className="relative mx-auto max-w-[1300px]">
        <Link
          href="/ilanlarim"
          className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-plur-border bg-plur-card/60 px-4 py-2.5 text-xs font-semibold text-plur-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-plur-red/40 hover:bg-plur-red/10 hover:text-white"
        >
          <ArrowLeft
            size={15}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />

          İlanlarıma dön
        </Link>

        <section className="overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/65 shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="grid xl:grid-cols-[0.72fr_1.28fr]">
            <aside className="relative overflow-hidden border-b border-plur-border bg-plur-bg/65 p-6 sm:p-8 xl:border-b-0 xl:border-r xl:p-10">
              <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-plur-red/15 blur-[110px]" />

              <div className="relative flex h-full flex-col">
                <div className="inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plur-red text-white shadow-[0_12px_35px_rgba(255,70,85,0.3)]">
                    <Gamepad2 size={25} />
                  </div>

                  <span className="font-rajdhani text-3xl font-black tracking-[0.18em]">
                    PLUR
                  </span>
                </div>

                <p className="mt-12 text-[10px] font-bold uppercase tracking-[0.22em] text-plur-red">
                  İlan düzenleme
                </p>

                <h1 className="mt-5 font-rajdhani text-4xl font-black uppercase leading-[0.95] sm:text-5xl">
                  İlanını güncel tut.
                </h1>

                <p className="mt-6 text-sm leading-7 text-plur-muted">
                  Aradığın oyuncu özellikleri değiştiyse ilanını güncelle.
                  Kaydettiğin değişiklikler duo listesine anında yansır.
                </p>

                <div className="mt-8 space-y-3">
                  <FeatureItem
                    icon={<Trophy size={17} />}
                    text="Aranan rank ve rolü değiştir"
                  />

                  <FeatureItem
                    icon={<Mic size={17} />}
                    text="Mikrofon tercihini güncelle"
                  />

                  <FeatureItem
                    icon={<ShieldCheck size={17} />}
                    text="İlan durumunu yönet"
                  />
                </div>

                <div className="mt-8 rounded-2xl border border-plur-red/20 bg-plur-red/10 p-4">
                  <div className="flex items-center gap-2 text-plur-red">
                    <Sparkles size={16} />

                    <span className="text-xs font-bold">
                      Bilgi
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-plur-muted">
                    İlanı pasife alırsan duo-bul sayfasında görünmez fakat
                    daha sonra yeniden yayına alabilirsin.
                  </p>
                </div>
              </div>
            </aside>

            <section className="p-5 sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-plur-red">
                  İlan detayları
                </p>

                <h2 className="mt-2 font-rajdhani text-3xl font-black sm:text-4xl">
                  İlanı Düzenle
                </h2>

                <p className="mt-3 text-sm leading-6 text-plur-muted">
                  Mevcut ilan bilgilerini güncelleyip tekrar kaydet.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-7"
              >
                <FormSection
                  title="İlan Bilgileri"
                  description="Oyuncuların göreceği temel ilan bilgileri."
                >
                  <TextInput
                    label="İlan başlığı"
                    value={form.title}
                    onChange={(value) =>
                      updateField("title", value)
                    }
                    placeholder="İlan başlığını yaz"
                    icon={<Radio size={16} />}
                    maxLength={80}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectInput
                      label="Oyun modu"
                      value={form.gameMode}
                      onChange={(value) =>
                        updateField("gameMode", value)
                      }
                      options={gameModes}
                      icon={<Gamepad2 size={16} />}
                    />

                    <SelectInput
                      label="Oyun sunucusu"
                      value={form.server}
                      onChange={(value) =>
                        updateField("server", value)
                      }
                      options={valorantServers.map((server) => ({
                        label: server,
                        value: server,
                      }))}
                      icon={<Globe2 size={16} />}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectInput
                      label="İl"
                      value={form.city}
                      onChange={(value) =>
                        updateField("city", value)
                      }
                      options={[
                        {
                          label: "İl fark etmez",
                          value: "",
                        },
                        ...turkishCities.map((city) => ({
                          label: city,
                          value: city,
                        })),
                      ]}
                      icon={<MapPin size={16} />}
                    />

                    <SelectInput
                      label="Aktif olduğun saat"
                      value={form.activeHours}
                      onChange={(value) =>
                        updateField("activeHours", value)
                      }
                      options={[
                        {
                          label: "Saat belirtme",
                          value: "",
                        },
                        ...activeHourOptions.map((hour) => ({
                          label: hour,
                          value: hour,
                        })),
                      ]}
                      icon={<Clock3 size={16} />}
                    />
                  </div>
                </FormSection>

                <FormSection
                  title="Aranan Oyuncu"
                  description="Duo adayında bulunmasını istediğin özellikler."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectInput
                      label="Aranan rank"
                      value={form.wantedRankTier}
                      onChange={(value) =>
                        updateField("wantedRankTier", value)
                      }
                      options={ranks}
                      icon={<Trophy size={16} />}
                    />

                    <SelectInput
                      label="Aranan rol"
                      value={form.wantedRole}
                      onChange={(value) =>
                        updateField("wantedRole", value)
                      }
                      options={roles}
                      icon={<Swords size={16} />}
                    />
                  </div>

                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-plur-border bg-plur-bg/70 p-4 transition hover:border-plur-green/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-plur-green/10 text-plur-green">
                        <Mic size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Mikrofon zorunlu
                        </p>

                        <p className="mt-1 text-xs leading-5 text-plur-muted">
                          İlanına yalnızca mikrofon kullananlar başvursun.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`relative h-7 w-12 rounded-full transition ${
                        form.micRequired
                          ? "bg-plur-green"
                          : "bg-plur-border"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.micRequired}
                        onChange={(event) =>
                          updateField(
                            "micRequired",
                            event.target.checked
                          )
                        }
                        className="sr-only"
                      />

                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          form.micRequired
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </div>
                  </label>

                  <SelectInput
                    label="İlan durumu"
                    value={form.status}
                    onChange={(value) =>
                      updateField(
                        "status",
                        value as FormState["status"]
                      )
                    }
                    options={[
                      {
                        label: "Aktif",
                        value: "active",
                      },
                      {
                        label: "Pasif",
                        value: "passive",
                      },
                      {
                        label: "Kapalı",
                        value: "closed",
                      },
                    ]}
                    icon={<ShieldCheck size={16} />}
                  />
                </FormSection>

                <FormSection
                  title="Açıklama"
                  description="Oyun tarzını ve beklentilerini açıkça anlat."
                >
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-white">
                      İlan açıklaması
                    </span>

                    <textarea
                      required
                      value={form.description}
                      onChange={(event) =>
                        updateField(
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="İlan açıklamasını yaz..."
                      rows={6}
                      maxLength={500}
                      className="w-full resize-none rounded-2xl border border-plur-border bg-plur-bg/75 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-plur-muted focus:border-plur-red/60 focus:shadow-[0_0_25px_rgba(255,70,85,0.08)]"
                    />

                    <div className="mt-2 flex justify-between text-[10px] text-plur-muted">
                      <span>En az 20 karakter</span>
                      <span>{form.description.length}/500</span>
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
                  disabled={saving}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-plur-red/50 bg-plur-red px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_35px_rgba(255,70,85,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(255,70,85,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
                      ? "Değişiklikler kaydediliyor..."
                      : "Değişiklikleri Kaydet"}
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
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  maxLength?: number;
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
          type="text"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          maxLength={maxLength}
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
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-12 w-full cursor-pointer appearance-none rounded-xl border border-plur-border bg-plur-bg/75 pr-10 text-sm text-white outline-none transition focus:border-plur-red/60 focus:shadow-[0_0_25px_rgba(255,70,85,0.08)] ${
            icon ? "pl-11" : "pl-4"
          }`}
        >
          {options.map((option) => (
            <option
              key={`${label}-${option.value}`}
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

function FeatureItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-plur-border bg-plur-card/45 px-4 py-3">
      <span className="text-plur-red">
        {icon}
      </span>

      <span className="text-xs text-plur-muted">
        {text}
      </span>
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