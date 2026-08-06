"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Menu, ShieldAlert } from "lucide-react";

import AdminSidebar from "@/components/AdminSidebar";
import { createClient } from "@/lib/supabase/client";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
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
        .select("username, is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error || !data?.is_admin) {
        setAuthorized(false);
        return;
      }

      setAdminName(data.username ?? "Admin");
      setAuthorized(true);
    }

    void checkAdmin();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/giris");
    router.refresh();
  }

  if (authorized === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-plur-bg text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-plur-border bg-plur-card/70 px-6 py-5">
          <LoaderCircle size={21} className="animate-spin text-plur-red" />
          <span className="text-sm text-plur-muted">
            Admin yetkisi kontrol ediliyor...
          </span>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-plur-bg px-4 text-white">
        <section className="w-full max-w-md rounded-3xl border border-plur-red/30 bg-plur-card/70 p-7 text-center">
          <ShieldAlert size={42} className="mx-auto text-plur-red" />
          <h1 className="mt-5 font-rajdhani text-3xl font-black">
            Yetkisiz Erişim
          </h1>
          <p className="mt-3 text-sm leading-6 text-plur-muted">
            Bu sayfaya yalnızca PLUR yöneticileri erişebilir.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="mt-6 rounded-xl bg-plur-red px-5 py-3 text-xs font-bold text-white"
          >
            Ana Sayfaya Dön
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-plur-bg text-white">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={logout}
      />

      <div className="min-h-screen lg:ml-[260px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-plur-border bg-plur-bg/90 px-4 backdrop-blur-xl md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-plur-muted hover:bg-plur-card hover:text-white lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="ml-auto text-right">
            <p className="text-sm font-bold text-white">{adminName}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-plur-red">
              Yönetici
            </p>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
