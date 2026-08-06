"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ActiveBan = {
  ban_id: string;
  reason: string;
  starts_at: string;
  expires_at: string | null;
};

const PUBLIC_PATHS = ["/giris", "/kayit", "/banlandi"];

export default function BanGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const checkingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function checkBan() {
      if (checkingRef.current) return;
      if (pathname.startsWith("/admin")) return;

      checkingRef.current = true;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          if (pathname === "/banlandi") {
            router.replace("/giris");
          }
          return;
        }

        const { data, error } = await supabase.rpc("get_my_active_ban");

        if (!mounted) return;

        if (error) {
          console.error("Ban kontrolü yapılamadı:", error.message);
          return;
        }

        const activeBan = Array.isArray(data)
          ? ((data[0] ?? null) as ActiveBan | null)
          : null;

        if (activeBan) {
          if (pathname !== "/banlandi") {
            const params = new URLSearchParams({
              reason: activeBan.reason,
              starts_at: activeBan.starts_at,
            });

            if (activeBan.expires_at) {
              params.set("expires_at", activeBan.expires_at);
            }

            router.replace(`/banlandi?${params.toString()}`);
          }

          return;
        }

        if (pathname === "/banlandi") {
          router.replace("/");
        }
      } finally {
        checkingRef.current = false;
      }
    }

    void checkBan();

    const intervalId = window.setInterval(() => {
      void checkBan();
    }, 10_000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        void checkBan();
      }, 0);
    });

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      subscription.unsubscribe();
    };
  }, [pathname, router, supabase]);

  return <>{children}</>;
}
