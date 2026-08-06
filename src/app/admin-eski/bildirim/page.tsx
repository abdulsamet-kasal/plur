"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bell, LoaderCircle, Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function AdminNotificationPage() {
  const supabase = useMemo(() => createClient(), []);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("/");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle || !cleanMessage) return;

    setSending(true);
    setFeedback("");

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_banned", false);

    if (profileError) {
      setFeedback(`Hata: ${profileError.message}`);
      setSending(false);
      return;
    }

    const rows = (profiles ?? []).map((profile) => ({
      user_id: profile.id,
      actor_id: null,
      type: "system",
      title: cleanTitle,
      message: cleanMessage,
      link: link.trim() || "/",
    }));

    const { error } = await supabase.from("notifications").insert(rows);

    if (error) {
      setFeedback(`Hata: ${error.message}`);
    } else {
      setFeedback(`${rows.length} kullanıcıya bildirim gönderildi.`);
      setTitle("");
      setMessage("");
    }

    setSending(false);
  }

  return (
    <main className="px-4 py-6 md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-plur-red/10 text-plur-red">
          <Bell size={26} />
        </div>
        <h1 className="mt-5 font-rajdhani text-4xl font-black">
          Toplu Bildirim Gönder
        </h1>
        <p className="mt-2 text-sm text-plur-muted">
          Banlı olmayan tüm kullanıcılara sistem bildirimi gönder.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-3xl border border-plur-border bg-plur-card/60 p-6"
        >
          <label className="block">
            <span className="text-xs font-bold">Başlık</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
              className="mt-2 h-12 w-full rounded-xl border border-plur-border bg-plur-bg px-4 text-sm outline-none focus:border-plur-red/60"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold">Mesaj</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={500}
              rows={5}
              className="mt-2 w-full resize-none rounded-xl border border-plur-border bg-plur-bg px-4 py-3 text-sm outline-none focus:border-plur-red/60"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold">Yönlendirme bağlantısı</span>
            <input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="/duo-bul"
              className="mt-2 h-12 w-full rounded-xl border border-plur-border bg-plur-bg px-4 text-sm outline-none focus:border-plur-red/60"
            />
          </label>

          {feedback && (
            <div className="rounded-xl border border-plur-border bg-plur-bg px-4 py-3 text-xs text-plur-muted">
              {feedback}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !title.trim() || !message.trim()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-plur-red text-sm font-bold text-white disabled:opacity-50"
          >
            {sending ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {sending ? "Gönderiliyor..." : "Bildirimi Gönder"}
          </button>
        </form>
      </div>
    </main>
  );
}
