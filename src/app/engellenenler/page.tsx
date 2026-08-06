"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldBan,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { createClient } from "@/lib/supabase/client";

type BlockRow = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  tag: string | null;
  avatar_url: string | null;
  rank: string | null;
  role: string | null;
  agent: string | null;
  city: string | null;
  server: string | null;
};

type BlockedUserItem = {
  blockId: string;
  blockedAt: string;
  profile: ProfileRow;
};

export default function EngellenenlerPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [selectedUser, setSelectedUser] =
    useState<BlockedUserItem | null>(null);

  async function loadBlockedUsers(showRefresh = false) {
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

    const { data: blockData, error: blockError } = await supabase
      .from("blocked_users")
      .select("id, blocker_id, blocked_id, created_at")
      .eq("blocker_id", user.id)
      .order("created_at", { ascending: false });

    if (blockError) {
      setErrorMessage(
        `Engellenen kullanıcılar alınamadı: ${blockError.message}`
      );
      setBlockedUsers([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const blocks = (blockData ?? []) as BlockRow[];

    if (blocks.length === 0) {
      setBlockedUsers([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const blockedIds = blocks.map((block) => block.blocked_id);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        tag,
        avatar_url,
        rank,
        role,
        agent,
        city,
        server
      `)
      .in("id", blockedIds);

    if (profileError) {
      setErrorMessage(
        `Kullanıcı profilleri alınamadı: ${profileError.message}`
      );
      setBlockedUsers([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const profileMap = new Map(
      ((profileData ?? []) as ProfileRow[]).map((profile) => [
        profile.id,
        profile,
      ])
    );

    const items = blocks.flatMap((block) => {
      const profile = profileMap.get(block.blocked_id);

      if (!profile) {
        return [];
      }

      return [
        {
          blockId: block.id,
          blockedAt: block.created_at,
          profile,
        } satisfies BlockedUserItem,
      ];
    });

    setBlockedUsers(items);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    void loadBlockedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const channel = supabase
      .channel(`blocked-users-page-${currentUserId}`)
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

          if (row.blocker_id === currentUserId) {
            void loadBlockedUsers();
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
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage("");
    }, 2600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [successMessage]);

  async function unblockUser() {
    if (!selectedUser || unblockingId) {
      return;
    }

    setUnblockingId(selectedUser.profile.id);
    setErrorMessage("");

    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("id", selectedUser.blockId)
      .eq("blocker_id", currentUserId);

    if (error) {
      setErrorMessage(`Engel kaldırılamadı: ${error.message}`);
      setUnblockingId(null);
      return;
    }

    setBlockedUsers((current) =>
      current.filter(
        (blocked) => blocked.blockId !== selectedUser.blockId
      )
    );

    setSuccessMessage(
      `${selectedUser.profile.username ?? "Kullanıcının"} engeli kaldırıldı.`
    );

    setUnblockingId(null);
    setSelectedUser(null);
  }

  const filteredUsers = useMemo(() => {
    const normalized = search.toLocaleLowerCase("tr-TR").trim();

    if (!normalized) {
      return blockedUsers;
    }

    return blockedUsers.filter(({ profile }) => {
      const searchable = [
        profile.username,
        profile.tag,
        profile.rank,
        profile.role,
        profile.agent,
        profile.city,
        profile.server,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return searchable.includes(normalized);
    });
  }, [blockedUsers, search]);

  return (
    <div className="min-h-screen bg-plur-bg text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-[240px]">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="px-4 py-5 md:px-6">
          <div className="mx-auto max-w-[1200px]">
            <section className="relative overflow-hidden rounded-[28px] border border-plur-border bg-plur-card/65 p-6 md:p-8">
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-plur-red/15 blur-[110px]" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-plur-red/25 bg-plur-red/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-plur-red">
                    <ShieldBan size={13} />
                    Gizlilik ve güvenlik
                  </div>

                  <h1 className="mt-5 font-rajdhani text-4xl font-black uppercase md:text-5xl">
                    Engellenenler
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-plur-muted">
                    Engellediğin oyuncuları görüntüle, profillerini aç veya
                    engellerini kaldır.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/mesajlar"
                    className="flex h-11 items-center gap-2 rounded-xl border border-plur-border bg-plur-bg/70 px-4 text-xs font-bold text-plur-muted transition hover:-translate-y-0.5 hover:border-plur-red/40 hover:text-white"
                  >
                    <ArrowLeft size={15} />
                    Mesajlara dön
                  </Link>

                  <button
                    type="button"
                    onClick={() => loadBlockedUsers(true)}
                    disabled={refreshing}
                    className="flex h-11 items-center gap-2 rounded-xl bg-plur-red px-4 text-xs font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    <RefreshCcw
                      size={15}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    Yenile
                  </button>
                </div>
              </div>
            </section>

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-plur-red/30 bg-plur-red/10 px-4 py-3 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-plur-green/30 bg-plur-green/10 px-4 py-3 text-xs font-semibold text-plur-green">
                <UserRoundCheck size={17} />
                {successMessage}
              </div>
            )}

            <section className="mt-5 rounded-2xl border border-plur-border bg-plur-card/60 p-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-plur-muted"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Kullanıcı adı, rank, ajan veya şehir ara..."
                  className="h-12 w-full rounded-xl border border-plur-border bg-plur-bg pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-plur-muted focus:border-plur-red/60"
                />
              </div>

              <p className="mt-3 text-xs text-plur-muted">
                <strong className="text-white">{filteredUsers.length}</strong>{" "}
                engellenen kullanıcı
              </p>
            </section>

            <section className="mt-5">
              {loading ? (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-plur-border bg-plur-card/50 px-6 py-20">
                  <LoaderCircle
                    size={24}
                    className="animate-spin text-plur-red"
                  />

                  <span className="text-sm text-plur-muted">
                    Engellenen kullanıcılar yükleniyor...
                  </span>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredUsers.map((item) => (
                    <BlockedUserCard
                      key={item.blockId}
                      item={item}
                      loading={unblockingId === item.profile.id}
                      onUnblock={() => setSelectedUser(item)}
                    />
                  ))}
                </div>
              ) : blockedUsers.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="rounded-2xl border border-dashed border-plur-border bg-plur-card/40 px-6 py-16 text-center">
                  <Search
                    size={34}
                    className="mx-auto text-plur-muted"
                  />

                  <h2 className="mt-4 text-lg font-bold">
                    Aramana uygun kullanıcı bulunamadı
                  </h2>

                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 rounded-xl bg-plur-red px-5 py-3 text-xs font-bold text-white"
                  >
                    Aramayı temizle
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <ConfirmModal
        open={Boolean(selectedUser)}
        title="Engeli kaldırmak istiyor musun?"
        description={
          selectedUser
            ? `${selectedUser.profile.username ?? "Bu kullanıcı"} tekrar sana mesaj gönderebilir. Eski sohbetiniz ve mesajlarınız yeniden görünür.`
            : ""
        }
        confirmText="Engeli kaldır"
        cancelText="Vazgeç"
        loading={Boolean(unblockingId)}
        tone="success"
        icon={<UserRoundCheck size={23} />}
        onConfirm={unblockUser}
        onCancel={() => {
          if (!unblockingId) {
            setSelectedUser(null);
          }
        }}
      />
    </div>
  );
}

function BlockedUserCard({
  item,
  loading,
  onUnblock,
}: {
  item: BlockedUserItem;
  loading: boolean;
  onUnblock: () => void;
}) {
  const { profile } = item;

  const avatarUrl =
    profile.avatar_url ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`;

  return (
    <article className="group rounded-2xl border border-plur-border bg-plur-card/60 p-5 transition hover:-translate-y-1 hover:border-plur-red/30">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={`${profile.username ?? "Oyuncu"} avatarı`}
            className="h-16 w-16 rounded-2xl border border-plur-border bg-plur-bg object-cover grayscale-[35%]"
          />

          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-plur-card bg-plur-red text-white">
            <UserRoundX size={12} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-rajdhani text-xl font-black">
            {profile.username ?? "Oyuncu"}
            <span className="text-plur-muted">
              #{profile.tag ?? "TR"}
            </span>
          </h2>

          <p className="mt-1 truncate text-xs text-plur-muted">
            {[profile.rank, profile.agent, profile.role]
              .filter(Boolean)
              .join(" · ") || "Profil bilgisi bulunmuyor"}
          </p>

          <p className="mt-2 text-[10px] text-plur-muted">
            Engelleme tarihi: {formatDate(item.blockedAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href={`/oyuncu/${profile.id}`}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg text-xs font-bold text-plur-muted transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
        >
          <ExternalLink size={15} />
          Profili aç
        </Link>

        <button
          type="button"
          onClick={onUnblock}
          disabled={loading}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-plur-green/30 bg-plur-green/10 text-xs font-bold text-plur-green transition hover:-translate-y-0.5 hover:bg-plur-green/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <UserRoundCheck size={15} />
          )}

          {loading ? "Kaldırılıyor..." : "Engeli kaldır"}
        </button>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-plur-border bg-plur-card/40 px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-plur-green/10 text-plur-green">
        <UserRoundCheck size={30} />
      </div>

      <h2 className="mt-5 font-rajdhani text-2xl font-black">
        Engellediğin kullanıcı yok
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-plur-muted">
        Engellediğin oyuncular burada listelenecek.
      </p>

      <Link
        href="/mesajlar"
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-plur-red px-5 text-xs font-bold text-white"
      >
        <ArrowLeft size={15} />
        Mesajlara dön
      </Link>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}