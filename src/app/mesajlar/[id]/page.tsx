"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  Check,
  CheckCheck,
  Circle,
  LoaderCircle,
  MoreVertical,
  Flag,
  Send,
  UserRoundX,
  X,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type ConversationRow = {
  id: string;
  user_a: string;
  user_b: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  tag: string | null;
  avatar_url: string | null;
  online: boolean | null;
  last_active: string | null;
  verified: boolean | null;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

type BlockStatus =
  | "none"
  | "blocked_by_me"
  | "blocked_by_other";

type ReportReason =
  | "harassment"
  | "spam"
  | "hate_speech"
  | "inappropriate_content"
  | "scam"
  | "other";

export default function SohbetPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params?.id;

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null
  );

  const [currentUserId, setCurrentUserId] = useState("");
  const [otherUser, setOtherUser] = useState<ProfileRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messageText, setMessageText] = useState("");
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [, setClockTick] = useState(0);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [blockStatus, setBlockStatus] = useState<BlockStatus>("none");
  const [checkingBlock, setCheckingBlock] = useState(true);
  const [blockActionLoading, setBlockActionLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] =
    useState<ReportReason | "">("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  async function refreshBlockStatus(
    currentId = currentUserId,
    otherId = otherUser?.id
  ) {
    if (!currentId || !otherId) {
      setBlockStatus("none");
      setCheckingBlock(false);
      return;
    }

    setCheckingBlock(true);

    const { data, error } = await supabase
      .from("blocked_users")
      .select("blocker_id, blocked_id")
      .or(
        `and(blocker_id.eq.${currentId},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${currentId})`
      );

    if (error) {
      console.error("Engel durumu alınamadı:", error.message);
      setBlockStatus("none");
      setCheckingBlock(false);
      return;
    }

    const rows = data ?? [];

    if (
      rows.some(
        (row) =>
          row.blocker_id === currentId &&
          row.blocked_id === otherId
      )
    ) {
      setBlockStatus("blocked_by_me");
    } else if (
      rows.some(
        (row) =>
          row.blocker_id === otherId &&
          row.blocked_id === currentId
      )
    ) {
      setBlockStatus("blocked_by_other");
    } else {
      setBlockStatus("none");
    }

    setCheckingBlock(false);
  }

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let mounted = true;

    async function loadConversation() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError || !user) {
        router.replace("/giris");
        return;
      }

      setCurrentUserId(user.id);

      const { data: conversationData, error: conversationError } =
        await supabase
          .from("conversations")
          .select("id, user_a, user_b")
          .eq("id", conversationId)
          .maybeSingle();

      if (!mounted) return;

      if (conversationError || !conversationData) {
        setErrorMessage(
          conversationError
            ? `Sohbet açılamadı: ${conversationError.message}`
            : "Sohbet bulunamadı."
        );
        setLoading(false);
        return;
      }

      const conversation = conversationData as ConversationRow;

      if (
        conversation.user_a !== user.id &&
        conversation.user_b !== user.id
      ) {
        setErrorMessage("Bu sohbeti görüntüleme yetkin yok.");
        setLoading(false);
        return;
      }

      const otherUserId =
        conversation.user_a === user.id
          ? conversation.user_b
          : conversation.user_a;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          tag,
          avatar_url,
          online,
          last_active,
          verified
        `)
        .eq("id", otherUserId)
        .maybeSingle();

      if (!mounted) return;

      if (profileError || !profileData) {
        setErrorMessage(
          profileError
            ? `Oyuncu profili alınamadı: ${profileError.message}`
            : "Oyuncu profili bulunamadı."
        );
        setLoading(false);
        return;
      }

      const loadedProfile = profileData as ProfileRow;
      setOtherUser(loadedProfile);
      await refreshBlockStatus(user.id, loadedProfile.id);

      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .select(`
          id,
          conversation_id,
          sender_id,
          receiver_id,
          content,
          is_read,
          read_at,
          created_at
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!mounted) return;

      if (messageError) {
        setErrorMessage(
          `Mesajlar yüklenemedi: ${messageError.message}`
        );
        setLoading(false);
        return;
      }

      setMessages((messageData ?? []) as MessageRow[]);

      await supabase
        .from("messages")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("conversation_id", conversationId)
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      setLoading(false);
    }

    loadConversation();

    return () => {
      mounted = false;
    };
  }, [conversationId, router, supabase]);

  useEffect(() => {
    if (!conversationId || !currentUserId || !otherUser) {
      return;
    }

    const channel = supabase
      .channel(`conversation-${conversationId}`, {
        config: {
          broadcast: {
            self: false,
          },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const incoming = payload.new as MessageRow;

          setMessages((current) => {
            if (current.some((message) => message.id === incoming.id)) {
              return current;
            }

            return [...current, incoming];
          });

          if (incoming.receiver_id === currentUserId) {
            await supabase
              .from("messages")
              .update({
                is_read: true,
                read_at: new Date().toISOString(),
              })
              .eq("id", incoming.id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as MessageRow;

          setMessages((current) =>
            current.map((message) =>
              message.id === updated.id ? updated : message
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${otherUser.id}`,
        },
        (payload) => {
          const updatedProfile = payload.new as ProfileRow;

          setOtherUser((current) =>
            current
              ? {
                  ...current,
                  online: updatedProfile.online,
                  last_active: updatedProfile.last_active,
                }
              : current
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blocked_users",
        },
        (payload) => {
          const row = (
            payload.new && Object.keys(payload.new).length > 0
              ? payload.new
              : payload.old
          ) as {
            blocker_id?: string;
            blocked_id?: string;
          };

          const isRelated =
            (row.blocker_id === currentUserId &&
              row.blocked_id === otherUser.id) ||
            (row.blocker_id === otherUser.id &&
              row.blocked_id === currentUserId);

          if (isRelated) {
            void refreshBlockStatus(
              currentUserId,
              otherUser.id
            );
          }
        }
      )
      .on(
        "broadcast",
        {
          event: "typing",
        },
        ({ payload }) => {
          const typingPayload = payload as {
            userId?: string;
            isTyping?: boolean;
          };

          if (typingPayload.userId === otherUser.id) {
            setOtherUserTyping(Boolean(typingPayload.isTyping));
          }
        }
      )
      .subscribe();

    chatChannelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      void channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId: currentUserId,
          isTyping: false,
        },
      });

      chatChannelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [
    conversationId,
    currentUserId,
    otherUser,
    supabase,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClockTick((current) => current + 1);
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage("");
    }, 2600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toastMessage]);

  async function blockUser() {
    if (!currentUserId || !otherUser || blockActionLoading) {
      return;
    }

    setBlockActionLoading(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("blocked_users")
      .insert({
        blocker_id: currentUserId,
        blocked_id: otherUser.id,
      });

    if (error && error.code !== "23505") {
      setErrorMessage(`Kullanıcı engellenemedi: ${error.message}`);
      setBlockActionLoading(false);
      return;
    }

    setBlockStatus("blocked_by_me");
    setOtherUserTyping(false);
    setMenuOpen(false);
    setBlockModalOpen(false);
    setBlockActionLoading(false);
    setToastMessage("Kullanıcı engellendi. Sohbet iki taraftan gizlendi.");

    window.setTimeout(() => {
      router.replace("/mesajlar");
      router.refresh();
    }, 900);
  }

  async function unblockUser() {
    if (!currentUserId || !otherUser || blockActionLoading) {
      return;
    }

    setBlockActionLoading(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("blocker_id", currentUserId)
      .eq("blocked_id", otherUser.id);

    if (error) {
      setErrorMessage(`Engel kaldırılamadı: ${error.message}`);
      setBlockActionLoading(false);
      return;
    }

    setBlockStatus("none");
    setMenuOpen(false);
    setBlockActionLoading(false);
  }

  async function submitReport() {
    if (
      !currentUserId ||
      !otherUser ||
      !conversationId ||
      reportLoading
    ) {
      return;
    }

    if (!reportReason) {
      setReportError("Lütfen bir şikâyet sebebi seç.");
      return;
    }

    const description = reportDescription.trim();

    if (description && description.length < 3) {
      setReportError("Açıklama en az 3 karakter olmalı.");
      return;
    }

    setReportLoading(true);
    setReportError("");

    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: recentReport, error: recentReportError } =
      await supabase
        .from("user_reports")
        .select("id")
        .eq("reporter_id", currentUserId)
        .eq("reported_id", otherUser.id)
        .gte("created_at", twentyFourHoursAgo)
        .limit(1)
        .maybeSingle();

    if (recentReportError) {
      setReportError(
        `Şikâyet kontrol edilemedi: ${recentReportError.message}`
      );
      setReportLoading(false);
      return;
    }

    if (recentReport) {
      setReportError(
        "Bu kullanıcı için son 24 saat içinde zaten bir şikâyet gönderdin."
      );
      setReportLoading(false);
      return;
    }

    const { error } = await supabase
      .from("user_reports")
      .insert({
        reporter_id: currentUserId,
        reported_id: otherUser.id,
        conversation_id: conversationId,
        reason: reportReason,
        description: description || null,
      });

    if (error) {
      setReportError(`Şikâyet gönderilemedi: ${error.message}`);
      setReportLoading(false);
      return;
    }

    setReportLoading(false);
    setReportModalOpen(false);
    setReportReason("");
    setReportDescription("");
    setReportError("");
    setMenuOpen(false);
    setToastMessage("Şikâyet başarıyla gönderildi.");
  }

  function sendTypingStatus(isTyping: boolean) {
    const channel = chatChannelRef.current;

    if (
      !channel ||
      !currentUserId ||
      blockStatus !== "none"
    ) {
      return;
    }

    void channel.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId: currentUserId,
        isTyping,
      },
    });
  }

  function handleMessageChange(value: string) {
    setMessageText(value);

    if (blockStatus !== "none") {
      return;
    }

    if (!value.trim()) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      sendTypingStatus(false);
      return;
    }

    sendTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
      typingTimeoutRef.current = null;
    }, 1500);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = messageText.trim();

    if (blockStatus !== "none") {
      setErrorMessage(
        blockStatus === "blocked_by_me"
          ? "Bu kullanıcıyı engellediğin için mesaj gönderemezsin."
          : "Bu kullanıcıyla mesajlaşamazsın."
      );
      return;
    }

    if (
      !content ||
      !conversationId ||
      !currentUserId ||
      !otherUser ||
      sending
    ) {
      return;
    }

    if (content.length > 2000) {
      setErrorMessage("Mesaj en fazla 2000 karakter olabilir.");
      return;
    }

    setSending(true);
    setErrorMessage("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    sendTypingStatus(false);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        receiver_id: otherUser.id,
        content,
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        receiver_id,
        content,
        is_read,
        read_at,
        created_at
      `)
      .single();

    if (error) {
      setErrorMessage(`Mesaj gönderilemedi: ${error.message}`);
      setSending(false);
      return;
    }

    const sentMessage = data as MessageRow;

    setMessages((current) => {
      if (current.some((message) => message.id === sentMessage.id)) {
        return current;
      }

      return [...current, sentMessage];
    });

    const messagePreview =
      content.length > 70 ? `${content.slice(0, 70)}...` : content;

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: otherUser.id,
        actor_id: currentUserId,
        type: "message",
        title: "Yeni mesaj",
        message: messagePreview,
        link: `/mesajlar/${conversationId}`,
      });

    if (notificationError) {
      console.error(
        "Mesaj bildirimi oluşturulamadı:",
        notificationError.message
      );
    }

    setMessageText("");
    setSending(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-plur-bg text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-plur-border bg-plur-card/70 px-6 py-5">
          <LoaderCircle
            size={22}
            className="animate-spin text-plur-red"
          />
          <span className="text-sm text-plur-muted">
            Sohbet yükleniyor...
          </span>
        </div>
      </main>
    );
  }

  if (errorMessage && !otherUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-plur-bg px-4 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-plur-border bg-plur-card/70 p-6 text-center">
          <h1 className="font-rajdhani text-2xl font-black">
            Sohbet açılamadı
          </h1>

          <p className="mt-3 text-sm text-plur-muted">
            {errorMessage}
          </p>

          <Link
            href="/mesajlar"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-plur-red px-5 text-xs font-bold text-white"
          >
            <ArrowLeft size={15} />
            Mesajlara dön
          </Link>
        </div>
      </main>
    );
  }

  if (!otherUser) {
    return null;
  }

  const avatarUrl =
    otherUser.avatar_url ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.id}`;

  return (
    <main className="flex min-h-screen flex-col bg-plur-bg text-white">
      <header className="sticky top-0 z-20 border-b border-plur-border bg-plur-card/90 px-4 py-3 backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/mesajlar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-plur-border bg-plur-bg text-plur-muted transition hover:border-plur-red/40 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>

          <Link
            href={`/oyuncu/${otherUser.id}`}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt={`${otherUser.username ?? "Oyuncu"} avatarı`}
                className="h-11 w-11 rounded-xl border border-plur-border bg-plur-bg object-cover"
              />

              {blockStatus === "none" && otherUser.online && (
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-plur-card bg-plur-green" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-rajdhani text-lg font-black">
                  {otherUser.username ?? "Oyuncu"}
                  <span className="text-plur-muted">
                    #{otherUser.tag ?? "TR"}
                  </span>
                </h1>

                {otherUser.verified && (
                  <ShieldCheck
                    size={15}
                    className="shrink-0 text-cyan-400"
                  />
                )}
              </div>

              <p
                className={`mt-0.5 flex items-center gap-1.5 text-[10px] ${
                  otherUser.online
                    ? "text-plur-green"
                    : "text-plur-muted"
                }`}
              >
                <Circle
                  size={6}
                  className={
                    otherUser.online ? "fill-plur-green" : ""
                  }
                />

                {blockStatus !== "none"
                  ? "Durum bilgisi gizli"
                  : otherUser.online
                    ? "Online"
                    : formatLastActive(otherUser.last_active)}
              </p>

              {blockStatus === "none" && otherUserTyping && (
                <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-cyan-300">
                  <span className="flex items-center gap-0.5">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.3s]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.15s]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-300" />
                  </span>
                  yazıyor...
                </p>
              )}
            </div>
          </Link>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Sohbet seçeneklerini aç"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-plur-border bg-plur-bg text-plur-muted transition hover:border-plur-red/40 hover:bg-plur-red/10 hover:text-white"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Menüyü kapat"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-30 cursor-default"
                />

                <div className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-2xl border border-plur-border bg-plur-card p-2 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
                  <Link
                    href={`/oyuncu/${otherUser.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex h-11 items-center rounded-xl px-3 text-xs font-semibold text-plur-muted transition hover:bg-white/[0.04] hover:text-white"
                  >
                    Profili görüntüle
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setReportModalOpen(true);
                      setReportError("");
                    }}
                    className="flex h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-xs font-bold text-yellow-300 transition hover:bg-yellow-400/10 hover:text-yellow-200"
                  >
                    <Flag size={16} />
                    Şikâyet et
                  </button>

                  <div className="my-1 h-px bg-plur-border" />

                  {blockStatus === "blocked_by_me" ? (
                    <button
                      type="button"
                      onClick={unblockUser}
                      disabled={blockActionLoading}
                      className="flex h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-xs font-bold text-plur-green transition hover:bg-plur-green/10 disabled:opacity-50"
                    >
                      {blockActionLoading ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <UserRoundX size={16} />
                      )}
                      Engeli kaldır
                    </button>
                  ) : blockStatus === "blocked_by_other" ? (
                    <div className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs text-plur-muted">
                      <UserRoundX size={16} />
                      Mesajlaşma kullanılamıyor
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setBlockModalOpen(true);
                      }}
                      disabled={blockActionLoading}
                      className="flex h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-xs font-bold text-red-300 transition hover:bg-plur-red/10 hover:text-plur-red disabled:opacity-50"
                    >
                      {blockActionLoading ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <UserRoundX size={16} />
                      )}
                      Kullanıcıyı engelle
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="flex-1 px-4 py-5 md:px-6">
        <div className="mx-auto max-w-[1100px]">
          {errorMessage && (
            <div className="mb-4 rounded-xl border border-plur-red/30 bg-plur-red/10 px-4 py-3 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {blockStatus !== "none" && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-plur-red/30 bg-plur-red/10 px-4 py-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-plur-red/15 text-plur-red">
                <Ban size={18} />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  {blockStatus === "blocked_by_me"
                    ? "Bu kullanıcıyı engelledin"
                    : "Bu kullanıcıyla mesajlaşamazsın"}
                </p>

                <p className="mt-1 text-xs leading-5 text-plur-muted">
                  {blockStatus === "blocked_by_me"
                    ? "Engeli kaldırana kadar mesaj, online durumu, son görülme ve yazıyor bilgisi kapalıdır."
                    : "Mesaj gönderme ve çevrimiçi durum bilgileri devre dışı bırakıldı."}
                </p>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex min-h-[55vh] items-center justify-center text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Send size={28} />
                </div>

                <h2 className="mt-5 font-rajdhani text-2xl font-black">
                  İlk mesajı sen gönder
                </h2>

                <p className="mt-2 text-sm text-plur-muted">
                  Oyun saati ve sunucu hakkında konuşmaya başlayabilirsin.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  mine={message.sender_id === currentUserId}
                />
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </section>

      <footer className="sticky bottom-0 border-t border-plur-border bg-plur-card/90 px-4 py-3 backdrop-blur-xl md:px-6">
        {checkingBlock ? (
          <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-center gap-2 text-xs text-plur-muted">
            <LoaderCircle size={16} className="animate-spin text-plur-red" />
            Engel durumu kontrol ediliyor...
          </div>
        ) : blockStatus !== "none" ? (
          <div className="mx-auto flex min-h-14 max-w-[1100px] items-center justify-center gap-2 rounded-2xl border border-plur-red/25 bg-plur-red/10 px-4 text-center text-xs font-semibold text-red-200">
            <Ban size={16} />
            Bu sohbette mesaj gönderemezsin.
          </div>
        ) : (
        <form
          onSubmit={sendMessage}
          className="mx-auto flex max-w-[1100px] items-end gap-3"
        >
          <div className="min-w-0 flex-1">
            <textarea
              value={messageText}
              onChange={(event) => handleMessageChange(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Mesajını yaz..."
              className="max-h-36 min-h-12 w-full resize-none rounded-2xl border border-plur-border bg-plur-bg px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-plur-muted focus:border-cyan-400/50"
            />

            <div className="mt-1 text-right text-[9px] text-plur-muted">
              {messageText.length}/2000
            </div>
          </div>

          <button
            type="submit"
            disabled={!messageText.trim() || sending || blockStatus !== "none"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-plur-red text-white shadow-[0_12px_30px_rgba(255,70,85,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
            ) : (
              <Send size={19} />
            )}
          </button>
        </form>
        )}
      </footer>

      {blockModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Engelleme penceresini kapat"
            onClick={() => {
              if (!blockActionLoading) {
                setBlockModalOpen(false);
              }
            }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]"
          />

          <section className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-plur-border bg-plur-card shadow-[0_30px_100px_rgba(0,0,0,0.65)] animate-[modalIn_220ms_ease-out]">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-plur-red/20 blur-3xl" />

            <div className="relative p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plur-red/10 text-plur-red">
                  <UserRoundX size={23} />
                </div>

                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  disabled={blockActionLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-plur-border bg-plur-bg text-plur-muted transition hover:border-plur-red/40 hover:text-white disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </div>

              <h2 className="mt-5 font-rajdhani text-2xl font-black">
                Kullanıcıyı engelle
              </h2>

              <p className="mt-3 text-sm leading-6 text-plur-muted">
                <strong className="text-white">
                  {otherUser.username ?? "Bu kullanıcı"}
                </strong>{" "}
                engellendiğinde sohbet iki tarafın da mesaj listesinden
                gizlenir.
              </p>

              <div className="mt-5 space-y-2 rounded-2xl border border-plur-border bg-plur-bg/70 p-4">
                <p className="flex items-start gap-2 text-xs leading-5 text-plur-muted">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-plur-red" />
                  Eski mesajlar silinmez ve veritabanında korunur.
                </p>

                <p className="flex items-start gap-2 text-xs leading-5 text-plur-muted">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-plur-red" />
                  İki taraf da yeni mesaj gönderemez.
                </p>

                <p className="flex items-start gap-2 text-xs leading-5 text-plur-muted">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-plur-red" />
                  Engel kaldırılırsa eski sohbet yeniden görünür.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  disabled={blockActionLoading}
                  className="h-11 rounded-xl border border-plur-border bg-plur-bg text-xs font-bold text-plur-muted transition hover:border-white/20 hover:text-white disabled:opacity-50"
                >
                  Vazgeç
                </button>

                <button
                  type="button"
                  onClick={blockUser}
                  disabled={blockActionLoading}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-plur-red/40 bg-plur-red text-xs font-bold text-white shadow-[0_12px_30px_rgba(255,70,85,0.25)] transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {blockActionLoading ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <UserRoundX size={16} />
                  )}

                  {blockActionLoading ? "Engelleniyor..." : "Engelle"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {reportModalOpen && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Şikâyet penceresini kapat"
            onClick={() => {
              if (!reportLoading) {
                setReportModalOpen(false);
                setReportError("");
              }
            }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]"
          />

          <section className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-plur-border bg-plur-card shadow-[0_30px_100px_rgba(0,0,0,0.65)] animate-[modalIn_220ms_ease-out]">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-yellow-400/15 blur-3xl" />

            <div className="relative p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-300">
                  <Flag size={23} />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!reportLoading) {
                      setReportModalOpen(false);
                      setReportError("");
                    }
                  }}
                  disabled={reportLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-plur-border bg-plur-bg text-plur-muted transition hover:border-yellow-400/40 hover:text-white disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </div>

              <h2 className="mt-5 font-rajdhani text-2xl font-black">
                Kullanıcıyı şikâyet et
              </h2>

              <p className="mt-3 text-sm leading-6 text-plur-muted">
                <strong className="text-white">
                  {otherUser.username ?? "Bu kullanıcı"}
                </strong>{" "}
                hakkında şikâyet sebebini seç ve gerekli görürsen kısa bir
                açıklama ekle.
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  ["harassment", "Taciz veya hakaret"],
                  ["spam", "Spam"],
                  ["hate_speech", "Nefret söylemi"],
                  ["inappropriate_content", "Uygunsuz içerik"],
                  ["scam", "Dolandırıcılık"],
                  ["other", "Diğer"],
                ].map(([value, label]) => {
                  const selected = reportReason === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setReportReason(value as ReportReason);
                        setReportError("");
                      }}
                      className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 text-left text-xs font-semibold transition ${
                        selected
                          ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-200"
                          : "border-plur-border bg-plur-bg text-plur-muted hover:border-yellow-400/30 hover:text-white"
                      }`}
                    >
                      <span
                        className={`h-3 w-3 shrink-0 rounded-full border ${
                          selected
                            ? "border-yellow-300 bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.5)]"
                            : "border-plur-muted"
                        }`}
                      />

                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <label
                  htmlFor="report-description"
                  className="text-xs font-bold text-white"
                >
                  Açıklama
                  <span className="ml-1 font-normal text-plur-muted">
                    (isteğe bağlı)
                  </span>
                </label>

                <textarea
                  id="report-description"
                  value={reportDescription}
                  onChange={(event) => {
                    setReportDescription(event.target.value);
                    setReportError("");
                  }}
                  rows={4}
                  maxLength={1000}
                  placeholder="Yaşadığın durumu kısa ve net şekilde anlat..."
                  className="mt-2 w-full resize-none rounded-2xl border border-plur-border bg-plur-bg px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-plur-muted focus:border-yellow-400/50"
                />

                <div className="mt-1 text-right text-[9px] text-plur-muted">
                  {reportDescription.length}/1000
                </div>
              </div>

              {reportError && (
                <div className="mt-4 rounded-xl border border-plur-red/30 bg-plur-red/10 px-4 py-3 text-xs text-red-300">
                  {reportError}
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(false);
                    setReportError("");
                  }}
                  disabled={reportLoading}
                  className="h-11 rounded-xl border border-plur-border bg-plur-bg text-xs font-bold text-plur-muted transition hover:border-white/20 hover:text-white disabled:opacity-50"
                >
                  Vazgeç
                </button>

                <button
                  type="button"
                  onClick={submitReport}
                  disabled={reportLoading || !reportReason}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-yellow-400/40 bg-yellow-400 text-xs font-bold text-black shadow-[0_12px_30px_rgba(253,224,71,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reportLoading ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Flag size={16} />
                  )}

                  {reportLoading ? "Gönderiliyor..." : "Şikâyeti gönder"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-[110] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-[toastIn_260ms_ease-out]">
          <div className="flex items-center gap-3 rounded-2xl border border-plur-green/30 bg-plur-card px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-plur-green/10 text-plur-green">
              <Check size={17} />
            </div>

            <p className="text-xs font-semibold text-white">
              {toastMessage}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function MessageBubble({
  message,
  mine,
}: {
  message: MessageRow;
  mine: boolean;
}) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 sm:max-w-[68%] ${
          mine
            ? "rounded-br-md bg-plur-red text-white"
            : "rounded-bl-md border border-plur-border bg-plur-card text-white"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.content}
        </p>

        <div
          className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${
            mine ? "text-white/70" : "text-plur-muted"
          }`}
        >
          <span>{formatMessageTime(message.created_at)}</span>

          {mine &&
            (message.is_read ? (
              <CheckCheck
                size={13}
                className="text-cyan-200"
              />
            ) : (
              <Check size={13} />
            ))}
        </div>
      </div>
    </div>
  );
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatLastActive(value: string | null) {
  if (!value) {
    return "Son görülme bilinmiyor";
  }

  const date = new Date(value);
  const now = new Date();
  const differenceMs = now.getTime() - date.getTime();
  const differenceMinutes = Math.max(
    0,
    Math.floor(differenceMs / 60_000)
  );

  if (differenceMinutes < 1) {
    return "Az önce aktifti";
  }

  if (differenceMinutes < 60) {
    return `${differenceMinutes} dk önce aktifti`;
  }

  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return `Son görülme bugün ${new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return `Son görülme dün ${new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)}`;
  }

  return `Son görülme ${new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
}