"use client";

import { useEffect, useMemo, useState } from "react";
import { Gamepad2, LoaderCircle, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PostRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  user_id: string;
};

export default function AdminPostsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<PostRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("duo_posts")
        .select("id, title, status, created_at, user_id")
        .order("created_at", { ascending: false });

      if (error) setErrorMessage(error.message);
      setRows((data ?? []) as PostRow[]);
      setLoading(false);
    }
    void load();
  }, [supabase]);

  const filtered = rows.filter((row) =>
    `${row.title} ${row.status} ${row.user_id}`.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))
  );

  if (loading) return <Loading text="İlanlar yükleniyor..." />;

  return (
    <Page title="İlanlar" description="Platformdaki ilanları ve durumlarını görüntüle.">
      <SearchBox value={search} onChange={setSearch} placeholder="İlan başlığı, durum veya kullanıcı ID ara..." />
      {errorMessage && <ErrorBox text={errorMessage} />}

      <div className="mt-5 overflow-hidden rounded-2xl border border-plur-border bg-plur-card/60">
        {filtered.length === 0 ? <Empty /> : (
          <div className="divide-y divide-plur-border">
            {filtered.map((post) => (
              <div key={post.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black">{post.title}</p>
                    <p className="mt-1 text-[10px] text-plur-muted">Kullanıcı: {post.user_id}</p>
                    <p className="mt-1 text-[10px] text-plur-muted">{new Date(post.created_at).toLocaleString("tr-TR")}</p>
                  </div>
                  <span className="w-fit rounded-lg bg-plur-red/10 px-2 py-1 text-[10px] font-bold text-plur-red">{post.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

function Page({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="px-4 py-6 md:px-6"><div className="mx-auto max-w-[1500px]">
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-plur-red">Yönetim Merkezi</p>
    <h1 className="mt-2 font-rajdhani text-4xl font-black">{title}</h1>
    <p className="mt-2 text-sm text-plur-muted">{description}</p>{children}
  </div></main>;
}
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <label className="relative mt-6 block"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-plur-muted" /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-12 w-full rounded-xl border border-plur-border bg-plur-card pl-11 pr-4 text-sm text-white outline-none focus:border-plur-red/50" /></label>;
}
function Loading({ text }: { text: string }) { return <main className="flex min-h-[70vh] items-center justify-center"><div className="flex items-center gap-3 text-sm text-plur-muted"><LoaderCircle size={22} className="animate-spin text-plur-red" />{text}</div></main>; }
function ErrorBox({ text }: { text: string }) { return <div className="mt-5 rounded-2xl border border-plur-red/30 bg-plur-red/10 px-4 py-3 text-sm text-red-300">{text}</div>; }
function Empty() { return <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-plur-muted"><Gamepad2 size={28} /><p className="text-sm">İlan bulunamadı.</p></div>; }
