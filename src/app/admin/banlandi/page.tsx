"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Ban, Clock3, LoaderCircle, LogOut, ShieldAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function BannedPage() {
  return (
    <Suspense fallback={null}>
      <BannedContent />
    </Suspense>
  );
}

function BannedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [signingOut, setSigningOut] = useState(false);

  const reason = searchParams.get("reason") ?? "Topluluk kurallarının ihlali";
  const startsAt = searchParams.get("starts_at");
  const expiresAt = searchParams.get("expires_at");

  async function signOut() {
    if (signingOut) return;

    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/giris");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-plur-bg px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-28 top-1/4 h-80 w-80 rounded-full bg-plur-red/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-28 bottom-1/4 h-80 w-80 rounded-full bg-yellow-400/10 blur-[120px]" />

      <section className="relative w-full max-w-2xl overflow-hidden rounded-[30px] border border-plur-red/30 bg-plur-card/90 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.65)] backdrop-blur-xl md:p-9">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-plur-red/15 blur-[100px]" />

        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-plur-red/30 bg-plur-red/10 text-plur-red">
            <Ban size={31} />
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-plur-red">
            Hesap Erişimi Kısıtlandı
          </p>

          <h1 className="mt-3 font-rajdhani text-4xl font-black md:text-5xl">
            Hesabın Banlandı
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-plur-muted">
            Bu hesap, moderasyon ekibi tarafından geçici veya süresiz olarak
            platform erişimine kapatıldı.
          </p>

          <div className="mt-7 rounded-2xl border border-plur-border bg-plur-bg p-5">
            <div className="flex items-center gap-2 text-red-300">
              <ShieldAlert size={17} />
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
                Ban Sebebi
              </p>
            </div>
            <p className="mt-3 text-sm font-bold leading-6 text-white">{reason}</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoCard
              label="Başlangıç"
              value={startsAt ? formatDate(startsAt) : "Bilinmiyor"}
            />
            <InfoCard
              label="Bitiş"
              value={expiresAt ? formatDate(expiresAt) : "Süresiz"}
              warning={!expiresAt}
            />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-4">
            <Clock3 size={18} className="mt-0.5 shrink-0 text-yellow-300" />
            <p className="text-xs leading-5 text-yellow-100/80">
              Süreli banlarda erişimin, bitiş tarihinden sonra otomatik olarak
              açılır. Hatalı bir işlem olduğunu düşünüyorsan destek ekibiyle
              iletişime geçebilirsin.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void signOut()}
            disabled={signingOut}
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg text-sm font-black text-white transition hover:border-plur-red/40 hover:bg-plur-red/10 disabled:opacity-60"
          >
            {signingOut ? (
              <LoaderCircle size={17} className="animate-spin text-plur-red" />
            ) : (
              <LogOut size={17} />
            )}
            {signingOut ? "Çıkış Yapılıyor..." : "Hesaptan Çıkış Yap"}
          </button>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-plur-border bg-plur-bg p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-plur-muted">
        {label}
      </p>
      <p
        className={`mt-2 text-sm font-black ${
          warning ? "text-yellow-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}
