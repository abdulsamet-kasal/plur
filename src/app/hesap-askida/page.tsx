"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock3,
  LoaderCircle,
  LogOut,
  ShieldAlert,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type BanInfo = {
  is_banned: boolean;
  banned_at: string | null;
  banned_until: string | null;
  ban_reason: string | null;
};

export default function SuspendedAccountPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadBanInfo() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace("/giris");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_banned, banned_at, banned_until, ban_reason")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error || !data?.is_banned) {
        router.replace("/");
        return;
      }

      const expired =
        data.banned_until &&
        new Date(data.banned_until).getTime() <= Date.now();

      if (expired) {
        router.replace("/");
        return;
      }

      setBanInfo(data as BanInfo);
      setLoading(false);
    }

    void loadBanInfo();

    const interval = window.setInterval(() => {
      setTick((current) => current + 1);
    }, 1000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [router, supabase]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/giris");
    router.refresh();
  }

  if (loading || !banInfo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-plur-bg text-white">
        <LoaderCircle size={24} className="animate-spin text-plur-red" />
      </main>
    );
  }

  const remaining = formatRemainingTime(banInfo.banned_until);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-plur-bg px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-plur-red/15 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-yellow-400/10 blur-[130px]" />

      <section className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-plur-red/30 bg-plur-card/80 p-7 shadow-[0_35px_120px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-9">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-plur-red/10 text-plur-red">
          <ShieldAlert size={31} />
        </div>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-plur-red">
          Hesap Güvenliği
        </p>

        <h1 className="mt-2 font-rajdhani text-4xl font-black">
          Hesabın askıya alındı
        </h1>

        <p className="mt-3 text-sm leading-7 text-plur-muted">
          PLUR topluluk kurallarının ihlal edildiği tespit edildiği için
          hesabına geçici veya kalıcı erişim kısıtlaması uygulandı.
        </p>

        <div className="mt-7 space-y-3">
          <InfoBox
            label="Sebep"
            value={banInfo.ban_reason || "Topluluk kurallarının ihlali"}
          />

          <InfoBox
            label="Ban süresi"
            value={
              banInfo.banned_until
                ? remaining
                : "Süresiz"
            }
            icon={<Clock3 size={16} />}
          />

          {banInfo.banned_until && (
            <InfoBox
              label="Bitiş tarihi"
              value={new Date(banInfo.banned_until).toLocaleString("tr-TR")}
            />
          )}
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-plur-red/40 bg-plur-red text-sm font-bold text-white shadow-[0_14px_35px_rgba(255,70,85,0.25)]"
        >
          <LogOut size={17} />
          Çıkış Yap
        </button>
      </section>
    </main>
  );
}

function InfoBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-plur-border bg-plur-bg/70 p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-plur-muted">
        {label}
      </p>
      <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white">
        {icon}
        {value}
      </p>
    </div>
  );
}

function formatRemainingTime(value: string | null) {
  if (!value) return "Süresiz";

  const difference = new Date(value).getTime() - Date.now();

  if (difference <= 0) {
    return "Ban süresi doldu";
  }

  const totalMinutes = Math.floor(difference / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} gün ${hours} saat ${minutes} dakika`;
  }

  if (hours > 0) {
    return `${hours} saat ${minutes} dakika`;
  }

  return `${minutes} dakika`;
}
