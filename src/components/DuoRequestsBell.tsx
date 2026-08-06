"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  LoaderCircle,
  MessageCircle,
  ShieldCheck,
  Swords,
  UserRound,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type DuoRequestRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  post_id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  responded_at: string | null;
  conversation_id: string | null;
};

type SenderProfile = {
  id: string;
  username: string | null;
  tag: string | null;
  avatar_url: string | null;
  rank: string | null;
  agent: string | null;
  verified: boolean | null;
};

type DuoPost = {
  id: string;
  title: string;
};

type DuoRequestItem = DuoRequestRow & {
  sender: SenderProfile;
  post: DuoPost;
};

type DuoRequestsBellProps = {
  userId: string;
};

export default function DuoRequestsBell({ userId }: DuoRequestsBellProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const panelRef = useRef<HTMLDivElement>(null);

  const [requests, setRequests] = useState<DuoRequestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  async function loadRequests(showLoading = true) {
    if (showLoading) setLoading(true);

    const { data: requestData, error: requestError } = await supabase
      .from("duo_requests")
      .select(
        "id, sender_id, receiver_id, post_id, status, created_at, responded_at, conversation_id"
      )
      .eq("receiver_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (requestError) {
      console.error("Duo istekleri yüklenemedi:", requestError.message);
      setRequests([]);
      setLoading(false);
      return;
    }

    const rows = (requestData ?? []) as DuoRequestRow[];

    if (rows.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const senderIds = [...new Set(rows.map((request) => request.sender_id))];
    const postIds = [...new Set(rows.map((request) => request.post_id))];

    const [profilesResult, postsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, tag, avatar_url, rank, agent, verified")
        .in("id", senderIds),
      supabase.from("duo_posts").select("id, title").in("id", postIds),
    ]);

    if (profilesResult.error) {
      console.error(
        "Duo isteği profilleri yüklenemedi:",
        profilesResult.error.message
      );
    }

    if (postsResult.error) {
      console.error("Duo ilanları yüklenemedi:", postsResult.error.message);
    }

    const profileMap = new Map(
      ((profilesResult.data ?? []) as SenderProfile[]).map((profile) => [
        profile.id,
        profile,
      ])
    );

    const postMap = new Map(
      ((postsResult.data ?? []) as DuoPost[]).map((post) => [post.id, post])
    );

    const mapped = rows.flatMap((request) => {
      const sender = profileMap.get(request.sender_id);
      const post = postMap.get(request.post_id);

      return sender && post ? [{ ...request, sender, post }] : [];
    });

    setRequests(mapped);
    setLoading(false);
  }

  useEffect(() => {
    void loadRequests();

    const channel = supabase
      .channel(`duo-requests:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "duo_requests",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          void loadRequests(false);
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Duo istekleri Realtime bağlantısı kurulamadı.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, userId]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  async function findOrCreateConversation(senderId: string) {
    const { data: existing, error: existingError } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user_a.eq.${userId},user_b.eq.${senderId}),and(user_a.eq.${senderId},user_b.eq.${userId})`
      )
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) return existing.id as string;

    const { data: created, error: createError } = await supabase
      .from("conversations")
      .insert({ user_a: userId, user_b: senderId })
      .select("id")
      .single();

    if (createError) {
      if (createError.code === "23505") {
        const { data: retried, error: retryError } = await supabase
          .from("conversations")
          .select("id")
          .or(
            `and(user_a.eq.${userId},user_b.eq.${senderId}),and(user_a.eq.${senderId},user_b.eq.${userId})`
          )
          .maybeSingle();

        if (retryError) throw retryError;
        if (retried) return retried.id as string;
      }

      throw createError;
    }

    return created.id as string;
  }

  async function respondToRequest(
    request: DuoRequestItem,
    decision: "accepted" | "rejected"
  ) {
    if (actionId) return;

    setActionId(request.id);
    setFeedback("");

    try {
      let conversationId: string | null = null;

      if (decision === "accepted") {
        conversationId = await findOrCreateConversation(request.sender_id);
      }

      const { error: updateError } = await supabase
        .from("duo_requests")
        .update({
          status: decision,
          responded_at: new Date().toISOString(),
          conversation_id: conversationId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.id)
        .eq("receiver_id", userId)
        .eq("status", "pending");

      if (updateError) throw updateError;

      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("username, tag")
        .eq("id", userId)
        .maybeSingle();

      const receiverName = currentProfile?.username ?? "İlan sahibi";
      const receiverTag = currentProfile?.tag ? `#${currentProfile.tag}` : "";

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: request.sender_id,
          actor_id: userId,
          type: decision === "accepted" ? "duo_accepted" : "duo_rejected",
          title:
            decision === "accepted"
              ? "Duo isteğin kabul edildi"
              : "Duo isteğin reddedildi",
          message:
            decision === "accepted"
              ? `${receiverName}${receiverTag}, “${request.post.title}” ilanı için gönderdiğin isteği kabul etti.`
              : `${receiverName}${receiverTag}, “${request.post.title}” ilanı için gönderdiğin isteği reddetti.`,
          link:
            decision === "accepted" && conversationId
              ? `/mesajlar/${conversationId}`
              : `/oyuncu/${userId}`,
        });

      if (notificationError) {
        console.error(
          "Duo isteği yanıt bildirimi gönderilemedi:",
          notificationError.message
        );

        // Eski notifications CHECK kısıtı duo_accepted / duo_rejected
        // tiplerini henüz desteklemiyorsa bildirimin tamamen kaybolmaması
        // için system türüyle güvenli bir yedek bildirim oluştur.
        const { error: fallbackNotificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: request.sender_id,
            actor_id: userId,
            type: "system",
            title:
              decision === "accepted"
                ? "Duo isteğin kabul edildi"
                : "Duo isteğin reddedildi",
            message:
              decision === "accepted"
                ? `${receiverName}${receiverTag}, “${request.post.title}” ilanı için gönderdiğin isteği kabul etti.`
                : `${receiverName}${receiverTag}, “${request.post.title}” ilanı için gönderdiğin isteği reddetti.`,
            link:
              decision === "accepted" && conversationId
                ? `/mesajlar/${conversationId}`
                : `/oyuncu/${userId}`,
          });

        if (fallbackNotificationError) {
          console.error(
            "Yedek duo isteği bildirimi de gönderilemedi:",
            fallbackNotificationError.message
          );
        }
      }

      setRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
      setFeedback(
        decision === "accepted"
          ? "Duo isteği kabul edildi. Sohbete yönlendiriliyorsun..."
          : "Duo isteği reddedildi."
      );

      if (decision === "accepted" && conversationId) {
        setOpen(false);
        router.push(`/mesajlar/${conversationId}`);
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "İstek yanıtlanamadı.";
      console.error("Duo isteği yanıtlanamadı:", error);
      setFeedback(`Hata: ${message}`);
    } finally {
      setActionId(null);
    }
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        aria-label="Duo istekleri"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-lg p-2 text-plur-muted transition hover:bg-plur-card hover:text-white"
      >
        <Swords size={20} />

        {requests.length > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-black text-white ring-2 ring-plur-bg">
            {requests.length > 99 ? "99+" : requests.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[390px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-plur-border bg-plur-card/95 shadow-[0_24px_80px_rgba(0,0,0,0.58)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-plur-border px-4 py-4">
            <div>
              <div className="flex items-center gap-2">
                <Swords size={17} className="text-violet-400" />
                <h2 className="text-sm font-black text-white">Duo İstekleri</h2>
              </div>
              <p className="mt-1 text-xs text-plur-muted">
                {requests.length > 0
                  ? `${requests.length} bekleyen istek`
                  : "Bekleyen duo isteğin yok"}
              </p>
            </div>

            <button
              type="button"
              aria-label="Duo isteklerini kapat"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-plur-muted transition hover:bg-white/[0.04] hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {feedback && (
            <div
              className={`border-b px-4 py-3 text-xs font-semibold ${
                feedback.startsWith("Hata:")
                  ? "border-plur-red/25 bg-plur-red/10 text-red-300"
                  : "border-plur-green/25 bg-plur-green/10 text-plur-green"
              }`}
            >
              {feedback}
            </div>
          )}

          <div className="max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-3 px-6 py-14 text-sm text-plur-muted">
                <LoaderCircle size={20} className="animate-spin text-violet-400" />
                İstekler yükleniyor...
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                  <Swords size={27} />
                </div>
                <p className="mt-4 text-sm font-bold text-white">Yeni isteğin yok</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-plur-muted">
                  Oyuncular ilanlarına duo isteği gönderdiğinde burada görünecek.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-plur-border/80">
                {requests.map((request) => {
                  const busy = actionId === request.id;
                  const avatarUrl =
                    request.sender.avatar_url ??
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.sender.id}`;

                  return (
                    <article key={request.id} className="p-4">
                      <div className="flex gap-3">
                        <Link
                          href={`/oyuncu/${request.sender.id}`}
                          onClick={() => setOpen(false)}
                          className="relative shrink-0"
                        >
                          <img
                            src={avatarUrl}
                            alt={`${request.sender.username ?? "Oyuncu"} avatarı`}
                            className="h-12 w-12 rounded-xl border border-plur-border bg-plur-bg object-cover"
                          />
                          {request.sender.verified && (
                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-plur-card bg-cyan-500 text-white">
                              <ShieldCheck size={11} />
                            </span>
                          )}
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/oyuncu/${request.sender.id}`}
                                onClick={() => setOpen(false)}
                                className="truncate text-sm font-black text-white transition hover:text-violet-300"
                              >
                                {request.sender.username ?? "Oyuncu"}
                                <span className="text-plur-muted">
                                  #{request.sender.tag ?? "TR"}
                                </span>
                              </Link>
                              <p className="mt-0.5 truncate text-[10px] text-plur-muted">
                                {request.sender.rank ?? "Rank belirtilmedi"}
                                {request.sender.agent
                                  ? ` · ${request.sender.agent}`
                                  : ""}
                              </p>
                            </div>

                            <span className="shrink-0 text-[9px] text-plur-muted/75">
                              {formatRelativeDate(request.created_at)}
                            </span>
                          </div>

                          <div className="mt-3 rounded-xl border border-plur-border bg-plur-bg/70 px-3 py-2.5">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-400">
                              İstek gönderilen ilan
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-white">
                              {request.post.title}
                            </p>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={Boolean(actionId)}
                              onClick={() =>
                                void respondToRequest(request, "accepted")
                              }
                              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-plur-green text-xs font-black text-black transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-50"
                            >
                              {busy ? (
                                <LoaderCircle size={15} className="animate-spin" />
                              ) : (
                                <Check size={15} />
                              )}
                              Kabul Et
                            </button>

                            <button
                              type="button"
                              disabled={Boolean(actionId)}
                              onClick={() =>
                                void respondToRequest(request, "rejected")
                              }
                              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-plur-red/35 bg-plur-red/10 text-xs font-black text-red-300 transition hover:-translate-y-0.5 hover:bg-plur-red/15 disabled:cursor-wait disabled:opacity-50"
                            >
                              {busy ? (
                                <LoaderCircle size={15} className="animate-spin" />
                              ) : (
                                <X size={15} />
                              )}
                              Reddet
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-plur-border px-4 py-3 text-[10px] text-plur-muted">
            <UserRound size={13} />
            Kabul edilen isteklerde sohbet otomatik hazırlanır.
            <MessageCircle size={13} className="ml-auto text-violet-400" />
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeDate(value: string) {
  const difference = Date.now() - new Date(value).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) return "Şimdi";
  if (difference < hour) return `${Math.floor(difference / minute)} dk`;
  if (difference < day) return `${Math.floor(difference / hour)} sa`;
  if (difference < 7 * day) return `${Math.floor(difference / day)} gün`;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}