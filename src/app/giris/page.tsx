"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gamepad2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function GirisPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(
        "E-posta veya şifre hatalı. Hesabını doğruladığından emin ol."
      );
      return;
    }

    router.push("/duo-bul");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-plur-bg px-4 py-10 text-white">
      <BackgroundEffects />

      <div className="relative grid w-full max-w-[1100px] overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/70 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
        <AuthShowcase />

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-plur-red/10 text-plur-red">
                <LogIn size={21} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-plur-red">
                  Tekrar hoş geldin
                </p>

                <h1 className="font-rajdhani text-3xl font-black">
                  Giriş Yap
                </h1>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-plur-muted">
              Duo ilanlarını görüntülemek ve hesabını yönetmek için giriş yap.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-4"
            >
              <AuthInput
                label="E-posta"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="ornek@mail.com"
                icon={<Mail size={17} />}
                autoComplete="email"
              />

              <PasswordInput
                label="Şifre"
                value={password}
                onChange={setPassword}
                placeholder="Şifreni yaz"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-semibold text-plur-muted transition hover:text-plur-red"
                >
                  Şifremi unuttum
                </button>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-plur-red/30 bg-plur-red/10 px-4 py-3 text-xs leading-5 text-red-300">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-plur-red/50 bg-plur-red text-sm font-bold text-white shadow-[0_12px_35px_rgba(255,70,85,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(255,70,85,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 translate-x-[-130%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[130%]" />

                <span className="relative">
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </span>

                {!loading && (
                  <ArrowRight
                    size={17}
                    className="relative transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-plur-muted">
              Henüz hesabın yok mu?{" "}
              <Link
                href="/kayit"
                className="font-bold text-plur-red transition hover:text-white"
              >
                Kayıt ol
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function BackgroundEffects() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-plur-red/15 blur-[130px]" />
      <div className="absolute -bottom-40 -right-32 h-[440px] w-[440px] rounded-full bg-cyan-400/10 blur-[140px]" />

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

function AuthShowcase() {
  return (
    <aside className="relative hidden overflow-hidden border-r border-plur-border bg-plur-bg/60 p-12 lg:block">
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-plur-red/15 blur-[100px]" />

      <div className="relative flex h-full flex-col justify-between">
        <Link
          href="/duo-bul"
          className="inline-flex w-fit items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plur-red text-white shadow-[0_12px_35px_rgba(255,70,85,0.3)]">
            <Gamepad2 size={25} />
          </div>

          <span className="font-rajdhani text-3xl font-black tracking-[0.18em]">
            PLUR
          </span>
        </Link>

        <div className="my-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-plur-red">
            Play · Link · Unite · Rank
          </p>

          <h2 className="mt-5 font-rajdhani text-5xl font-black uppercase leading-[0.95]">
            Duo&apos;n seni bekliyor.
          </h2>

          <p className="mt-6 max-w-md text-sm leading-7 text-plur-muted">
            Hesabına giriş yap, sana uygun oyuncuları keşfet ve takım
            arkadaşınla birlikte yüksel.
          </p>

          <div className="mt-8 space-y-3">
            <ShowcaseItem text="Türkiye genelinden oyuncular" />
            <ShowcaseItem text="Rank ve sunucu odaklı eşleşme" />
            <ShowcaseItem text="Doğrulanmış topluluk profilleri" />
          </div>
        </div>

        <p className="text-xs text-plur-muted">
          PLUR oyuncu eşleşme platformu
        </p>
      </div>
    </aside>
  );
}

function ShowcaseItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-plur-border bg-plur-card/50 px-4 py-3">
      <ShieldCheck
        size={17}
        className="shrink-0 text-cyan-400"
      />

      <span className="text-xs text-plur-muted">
        {text}
      </span>
    </div>
  );
}

function AuthInput({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-white">
        {label}
      </span>

      <div className="group/input relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-plur-muted transition group-focus-within/input:text-plur-red">
          {icon}
        </span>

        <input
          required
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-xl border border-plur-border bg-plur-bg/80 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-plur-muted focus:border-plur-red/60 focus:shadow-[0_0_25px_rgba(255,70,85,0.08)]"
        />
      </div>
    </label>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  setShowPassword,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-white">
        {label}
      </span>

      <div className="group/input relative">
        <LockKeyhole
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-plur-muted transition group-focus-within/input:text-plur-red"
        />

        <input
          required
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          autoComplete="current-password"
          className="h-12 w-full rounded-xl border border-plur-border bg-plur-bg/80 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-plur-muted focus:border-plur-red/60 focus:shadow-[0_0_25px_rgba(255,70,85,0.08)]"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={
            showPassword ? "Şifreyi gizle" : "Şifreyi göster"
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 text-plur-muted transition hover:text-white"
        >
          {showPassword ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </label>
  );
}