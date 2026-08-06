"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  message: string | null;
  created_at: string;
};

export default function AdminNotificationsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, user_id, type, title, message, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) setErrorMessage(error.message);
      setRows((data ?? []) as NotificationRow[]);
      setLoading(false);
    }
    void load();
  }, [supabase]);

  if (loading) return <Loading />;

  return (
    <main className="px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1500px]">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-plur-red">Yönetim Merkezi</p>
        <h1 className="mt-2 font-rajdhani text-4xl font-black">Bildirim Merkezi</h1>
        <p className="mt-2 text-sm text-plur-muted">Son 100 bildirimi görüntüle.</p>

        {errorMessage && <div className="mt-5 rounded-2xl border border-plur-red/30 bg-plur-red/10 px-4 py-3 text-sm text-red-300">{errorMessage}</div>}

        <div className="mt-6 overflow-hidden rounded-2xl border border-plur-border bg-plur-card/60">
          {rows.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-plur-muted"><Bell size={28} /><p className="text-sm">Bildirim bulunamadı.</p></div>
          ) : (
            <div className="divide-y divide-plur-border">
              {rows.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-black">{item.title ?? item.type}</p>
                    <span className="text-[10px] text-plur-muted">{new Date(item.created_at).toLocaleString("tr-TR")}</span>
                  </div>
                  <p className="mt-2 text-xs text-plur-muted">{item.message ?? "Mesaj yok"}</p>
                  <p className="mt-2 text-[10px] text-plur-muted">Kullanıcı: {item.user_id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Loading() {
  return <main className="flex min-h-[70vh] items-center justify-center"><div className="flex items-center gap-3 text-sm text-plur-muted"><LoaderCircle size={22} className="animate-spin text-plur-red" />Bildirimler yükleniyor...</div></main>;
}
