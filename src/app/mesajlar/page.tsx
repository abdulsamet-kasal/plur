"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Circle,
  LoaderCircle,
  MessageCircle,
  RefreshCcw,
  Search,
  Sparkles,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";

type ConversationRow = {
  id: string;
  user_a: string;
  user_b: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  tag: string | null;
  avatar_url: string | null;
  online: boolean | null;
  last_active: string | null;
};

type BlockRow = {
  blocker_id: string;
  blocked_id: string;
};

type ConversationItem = {
  id: string;
  otherUserId: string;
  username: string;
  tag: string;
  avatarUrl: string;
  online: boolean;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
};

export default function MesajlarPage() {
  return (
    <Suspense fallback={<MesajlarLoading />}>
      <MesajlarContent />
    </Suspense>
  );
}

function MesajlarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("user");

  const supabase = useMemo(() => createClient(), []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  async function loadConversations(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/giris");
      return;
    }

    setCurrentUserId(user.id);

    const { data: conversationData, error: conversationError } =
      await supabase
        .from("conversations")
        .select(`
          id,
          user_a,
          user_b,
          last_message,
          last_message_at,
          created_at,
          updated_at
        `)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("last_message_at", {
          ascending: false,
          nullsFirst: false,
        });

    if (conversationError) {
      setErrorMessage(
        `Sohbetler yüklenemedi: ${conversationError.message}`
      );
      setConversations([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const rows = (conversationData ?? []) as ConversationRow[];

    const { data: blockedData, error: blockedError } = await supabase
      .from("blocked_users")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

    if (blockedError) {
      setErrorMessage(
        `Engellenen kullanıcılar alınamadı: ${blockedError.message}`
      );
      setConversations([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const blockedUserIds = new Set(
      ((blockedData ?? []) as BlockRow[]).map((block) =>
        block.blocker_id === user.id
          ? block.blocked_id
          : block.blocker_id
      )
    );

    const visibleRows = rows.filter((conversation) => {
      const otherUserId =
        conversation.user_a === user.id
          ? conversation.user_b
          : conversation.user_a;

      return !blockedUserIds.has(otherUserId);
    });

    if (visibleRows.length === 0) {
      setConversations([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const otherUserIds = [
      ...new Set(
        visibleRows.map((conversation) =>
          conversation.user_a === user.id
            ? conversation.user_b
            : conversation.user_a
        )
      ),
    ];

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        tag,
        avatar_url,
        online,
        last_active
      `)
      .in("id", otherUserIds);

    if (profileError) {
      setErrorMessage(
        `Kullanıcı profilleri yüklenemedi: ${profileError.message}`
      );
      setConversations([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data: unreadData, error: unreadError } = await supabase
      .from("messages")
      .select("conversation_id")
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    if (unreadError) {
      console.error("Okunmamış mesajlar alınamadı:", unreadError.message);
    }

    const unreadMap = new Map<string, number>();

    for (const message of unreadData ?? []) {
      const current = unreadMap.get(message.conversation_id) ?? 0;
      unreadMap.set(message.conversation_id, current + 1);
    }

    const profileMap = new Map(
      ((profileData ?? []) as ProfileRow[]).map((profile) => [
        profile.id,
        profile,
      ])
    );

    const mapped = visibleRows.flatMap((conversation) => {
      const otherUserId =
        conversation.user_a === user.id
          ? conversation.user_b
          : conversation.user_a;

      const profile = profileMap.get(otherUserId);

      if (!profile) {
        return [];
      }

      return [
        {
          id: conversation.id,
          otherUserId,
          username: profile.username ?? "Oyuncu",
          tag: profile.tag ?? "TR",
          avatarUrl:
            profile.avatar_url ??
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
          online: profile.online ?? false,
          lastMessage:
            conversation.last_message ?? "Henüz mesaj gönderilmedi.",
          lastMessageAt: conversation.last_message_at,
          unreadCount: unreadMap.get(conversation.id) ?? 0,
        } satisfies ConversationItem,
      ];
    });

    setConversations(mapped);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const channel = supabase
      .channel(`blocked-conversations-${currentUserId}`)
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
          ) as Partial<BlockRow>;

          if (
            row.blocker_id === currentUserId ||
            row.blocked_id === currentUserId
          ) {
            void loadConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, supabase]);

  useEffect(() => {
    if (!targetUserId || !currentUserId) {
      return;
    }

    async function openOrCreateConversation() {
      if (targetUserId === currentUserId) {
        setErrorMessage("Kendinle sohbet başlatamazsın.");
        router.replace("/mesajlar");
        return;
      }

      setStartingConversation(true);
      setErrorMessage("");

      const { data: blockData, error: blockError } = await supabase
        .from("blocked_users")
        .select("blocker_id, blocked_id")
        .or(
          `and(blocker_id.eq.${currentUserId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${currentUserId})`
        );

      if (blockError) {
        setErrorMessage(
          `Engel durumu kontrol edilemedi: ${blockError.message}`
        );
        setStartingConversation(false);
        router.replace("/mesajlar");
        return;
      }

      if ((blockData ?? []).length > 0) {
        const blockedByMe = (blockData ?? []).some(
          (row) =>
            row.blocker_id === currentUserId &&
            row.blocked_id === targetUserId
        );

        setErrorMessage(
          blockedByMe
            ? "Bu kullanıcıyı engellediğin için sohbet başlatamazsın."
            : "Bu kullanıcıyla sohbet başlatamazsın."
        );
        setStartingConversation(false);
        router.replace("/mesajlar");
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(user_a.eq.${currentUserId},user_b.eq.${targetUserId}),and(user_a.eq.${targetUserId},user_b.eq.${currentUserId})`
        )
        .maybeSingle();

      if (existingError) {
        setErrorMessage(
          `Sohbet kontrol edilemedi: ${existingError.message}`
        );
        setStartingConversation(false);
        return;
      }

      if (existing) {
        router.replace(`/mesajlar/${existing.id}`);
        return;
      }

      const { data: created, error: createError } = await supabase
        .from("conversations")
        .insert({
          user_a: currentUserId,
          user_b: targetUserId,
        })
        .select("id")
        .single();

      if (createError) {
        if (createError.code === "23505") {
          const { data: retried } = await supabase
            .from("conversations")
            .select("id")
            .or(
              `and(user_a.eq.${currentUserId},user_b.eq.${targetUserId}),and(user_a.eq.${targetUserId},user_b.eq.${currentUserId})`
            )
            .maybeSingle();

          if (retried) {
            router.replace(`/mesajlar/${retried.id}`);
            return;
          }
        }

        setErrorMessage(
          `Sohbet başlatılamadı: ${createError.message}`
        );
        setStartingConversation(false);
        return;
      }

      router.replace(`/mesajlar/${created.id}`);
    }

    openOrCreateConversation();
  }, [
    currentUserId,
    router,
    supabase,
    targetUserId,
  ]);

  const filteredConversations = useMemo(() => {
    const normalized = search
      .toLocaleLowerCase("tr-TR")
      .trim();

    if (!normalized) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return (
        conversation.username
          .toLocaleLowerCase("tr-TR")
          .includes(normalized) ||
        conversation.tag
          .toLocaleLowerCase("tr-TR")
          .includes(normalized) ||
        conversation.lastMessage
          .toLocaleLowerCase("tr-TR")
          .includes(normalized)
      );
    });
  }, [conversations, search]);

  return (
    <div className="min-h-screen bg-plur-bg text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-[240px]">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="px-4 py-5 md:px-6">
          <div className="mx-auto max-w-[1300px]">
            <section className="relative overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/65 p-6 md:p-8">
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-[110px]" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                    <Sparkles size={13} />
                    PLUR iletişim merkezi
                  </div>

                  <h1 className="mt-5 font-rajdhani text-4xl font-black uppercase md:text-5xl">
                    Mesajlar
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-plur-muted">
                    Duo adaylarınla konuş, oyun saatini belirle ve takımını
                    kur.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadConversations(true)}
                  disabled={refreshing}
                  className="flex h-11 items-center gap-2 self-start rounded-xl border border-plur-border bg-plur-bg/70 px-4 text-xs font-bold text-plur-muted transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:text-white disabled:opacity-60"
                >
                  <RefreshCcw
                    size={15}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Yenile
                </button>
              </div>
            </section>

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-plur-red/30 bg-plur-red/10 px-4 py-3 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            {startingConversation && (
              <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-6 py-8">
                <LoaderCircle
                  size={20}
                  className="animate-spin text-cyan-300"
                />
                <span className="text-sm text-plur-muted">
                  Sohbet hazırlanıyor...
                </span>
              </div>
            )}

            <section className="mt-5 overflow-hidden rounded-2xl border border-plur-border bg-plur-card/60">
              <div className="border-b border-plur-border p-4">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-plur-muted"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Kullanıcı veya mesaj ara..."
                    className="h-12 w-full rounded-xl border border-plur-border bg-plur-bg pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-plur-muted focus:border-cyan-400/50"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-3 px-6 py-20">
                  <LoaderCircle
                    size={24}
                    className="animate-spin text-plur-red"
                  />

                  <span className="text-sm text-plur-muted">
                    Sohbetlerin yükleniyor...
                  </span>
                </div>
              ) : filteredConversations.length > 0 ? (
                <div className="divide-y divide-plur-border">
                  {filteredConversations.map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                    />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="px-6 py-16 text-center">
                  <Search
                    size={34}
                    className="mx-auto text-plur-muted"
                  />

                  <h2 className="mt-4 text-lg font-bold">
                    Aramana uygun sohbet bulunamadı
                  </h2>

                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 rounded-xl bg-plur-red px-5 py-3 text-xs font-bold text-white"
                  >
                    Aramayı Temizle
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function ConversationCard({
  conversation,
}: {
  conversation: ConversationItem;
}) {
  return (
    <Link
      href={`/mesajlar/${conversation.id}`}
      className="group flex items-center gap-4 p-4 transition hover:bg-white/[0.025] md:p-5"
    >
      <div className="relative shrink-0">
        <img
          src={conversation.avatarUrl}
          alt={`${conversation.username} avatarı`}
          className="h-14 w-14 rounded-2xl border border-plur-border bg-plur-bg object-cover"
        />

        {conversation.online && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-plur-card bg-plur-green">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="truncate font-rajdhani text-lg font-black text-white group-hover:text-cyan-300">
            {conversation.username}
            <span className="text-plur-muted">
              #{conversation.tag}
            </span>
          </h2>

          <span className="shrink-0 text-[9px] text-plur-muted">
            {formatConversationDate(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <p
            className={`truncate text-xs ${
              conversation.unreadCount > 0
                ? "font-bold text-white"
                : "text-plur-muted"
            }`}
          >
            {conversation.lastMessage}
          </p>

          {conversation.unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-plur-red px-1.5 text-[9px] font-black text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-plur-muted transition group-hover:translate-x-1 group-hover:text-cyan-300"
      />
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <MessageCircle size={30} />
      </div>

      <h2 className="mt-5 font-rajdhani text-2xl font-black">
        Henüz sohbetin yok
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-plur-muted">
        Duo ilanlarındaki Mesaj butonuna basarak bir oyuncuyla sohbet
        başlatabilirsin.
      </p>

      <Link
        href="/duo-bul"
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-plur-red px-5 text-xs font-bold text-white"
      >
        <MessageCircle size={16} />
        Duo İlanlarını Keşfet
      </Link>
    </div>
  );
}

function MesajlarLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-plur-bg text-white">
      <div className="flex items-center gap-3 rounded-2xl border border-plur-border bg-plur-card/70 px-6 py-5">
        <LoaderCircle
          size={22}
          className="animate-spin text-plur-red"
        />

        <span className="text-sm text-plur-muted">
          Mesajlar hazırlanıyor...
        </span>
      </div>
    </main>
  );
}

function formatConversationDate(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}