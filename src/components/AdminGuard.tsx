"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      // Giriş yapmamış kullanıcı giriş sayfasına gider.
      if (userError || !user) {
        router.replace("/giris");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      // Normal kullanıcı hiçbir uyarı görmeden direkt ana sayfaya gider.
      if (profileError || profile?.is_admin !== true) {
        router.replace("/");
        return;
      }

      setAllowed(true);
    }

    void checkAdmin();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-plur-bg text-white">
        <LoaderCircle size={26} className="animate-spin text-plur-red" />
      </main>
    );
  }

  return <>{children}</>;
}
