"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Search, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function AdminPostsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  async function loadPosts() {
    const { data } = await supabase
      .from("duo_posts")
      .select("id, title, description, status, created_at, user_id")
      .order("created_at", { ascending: false });

    setPosts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  async function removePost(id: string) {
    if (!window.confirm("Bu ilan kalıcı olarak silinsin mi?")) return;

    setActionId(id);
    const { error } = await supabase.from("duo_posts").delete().eq("id", id);

    if (!error) {
      setPosts((current) => current.filter((post) => post.id !== id));
    }

    setActionId(null);
  }

  const filtered = posts.filter((post) =>
    `${post.title} ${post.description}`
      .toLocaleLowerCase("tr-TR")
      .includes(search.toLocaleLowerCase("tr-TR").trim())
  );

  return (
    <main className="px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1500px]">
        <h1 className="font-rajdhani text-4xl font-black">İlan Yönetimi</h1>

        <div className="relative mt-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-plur-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="İlan ara..."
            className="h-12 w-full rounded-xl border border-plur-border bg-plur-card/60 pl-11 pr-4 text-sm outline-none focus:border-plur-red/60"
          />
        </div>

        <section className="mt-5 overflow-hidden rounded-2xl border border-plur-border bg-plur-card/60">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoaderCircle className="animate-spin text-plur-red" />
            </div>
          ) : (
            <div className="divide-y divide-plur-border">
              {filtered.map((post) => (
                <article key={post.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold">{post.title}</h2>
                      <span className="rounded-lg bg-plur-red/10 px-2 py-1 text-[9px] font-bold text-plur-red">
                        {post.status}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-plur-muted">
                      {post.description}
                    </p>
                    <p className="mt-2 text-[10px] text-plur-muted">
                      {new Date(post.created_at).toLocaleString("tr-TR")}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={actionId === post.id}
                    onClick={() => void removePost(post.id)}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl bg-plur-red/10 px-4 text-xs font-bold text-plur-red disabled:opacity-50"
                  >
                    {actionId === post.id ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                    Sil
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
