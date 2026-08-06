"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  ShieldAlert,
  Swords,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type NotificationType =
  | "message"
  | "favorite"
  | "duo_request"
  | "duo_accepted"
  | "duo_rejected"
  | "blocked"
  | "system";

type Notification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

type NotificationBellProps = {
  userId: string;
};

export default function NotificationBell({
  userId,
}: NotificationBellProps) {
  const supabase = useMemo(() => createClient(), []);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      setLoading(true);

      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
            id,
            user_id,
            actor_id,
            type,
            title,
            message,
            link,
            is_read,
            created_at
          `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(15);

      if (!mounted) {
        return;
      }

      if (error) {
        console.error("Bildirimler yüklenemedi:", error.message);
        setLoading(false);
        return;
      }

      setNotifications((data ?? []) as Notification[]);
      setLoading(false);
    }

    loadNotifications();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;

          setNotifications((current) => {
            const alreadyExists = current.some(
              (notification) => notification.id === newNotification.id
            );

            if (alreadyExists) {
              return current;
            }

            return [newNotification, ...current].slice(0, 15);
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;

          setNotifications((current) =>
            current.map((notification) =>
              notification.id === updatedNotification.id
                ? updatedNotification
                : notification
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedNotification = payload.old as Notification;

          setNotifications((current) =>
            current.filter(
              (notification) => notification.id !== deletedNotification.id
            )
          );
        }
      )
      .subscribe((status, error) => {
        if (error) {
          console.error("Bildirim bağlantısı kurulamadı:", error);
        }

        if (status === "CHANNEL_ERROR") {
          console.error("Bildirim kanalı hata verdi.");
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function markAsRead(notificationId: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Bildirim okundu yapılamadı:", error.message);
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Bildirimler okundu yapılamadı:", error.message);
    }
  }

  async function deleteNotification(notificationId: string) {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== notificationId
      )
    );

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Bildirim silinemedi:", error.message);
    }
  }

  return (
    <div ref={notificationRef} className="relative">
      <button
        type="button"
        aria-label="Bildirimler"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-lg p-2 text-plur-muted transition hover:bg-plur-card hover:text-white"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-plur-red px-1 text-[10px] font-bold text-white ring-2 ring-plur-bg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[350px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-plur-border bg-plur-card/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-plur-border px-4 py-4">
            <div>
              <h2 className="text-sm font-bold text-white">
                Bildirimler
              </h2>

              <p className="mt-0.5 text-xs text-plur-muted">
                {unreadCount > 0
                  ? `${unreadCount} okunmamış bildirim`
                  : "Yeni bildirimin bulunmuyor"}
              </p>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-plur-muted transition hover:bg-plur-red/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCheck size={15} />
              Tümünü oku
            </button>
          </div>

          <div className="max-h-[430px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-12 text-center text-sm text-plur-muted">
                Bildirimler yükleniyor...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <div className="mb-3 rounded-2xl bg-plur-bg p-4 text-plur-muted">
                  <Bell size={26} />
                </div>

                <p className="text-sm font-semibold text-white">
                  Bildirimin yok
                </p>

                <p className="mt-1 text-xs leading-5 text-plur-muted">
                  Mesajlar, favoriler ve duo istekleri burada görünecek.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onDelete={() =>
                    deleteNotification(notification.id)
                  }
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>

          <div className="border-t border-plur-border p-2">
            <Link
              href="/bildirimler"
              onClick={() => setOpen(false)}
              className="flex h-10 items-center justify-center rounded-xl text-xs font-bold text-plur-muted transition hover:bg-plur-red/10 hover:text-white"
            >
              Tüm bildirimleri görüntüle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
  onClose,
}: {
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const content = (
    <div
      className={`group relative flex gap-3 border-b border-plur-border/70 px-4 py-3.5 transition hover:bg-white/[0.025] ${
        notification.is_read ? "" : "bg-plur-red/[0.045]"
      }`}
    >
      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getNotificationIconStyle(
          notification.type
        )}`}
      >
        {getNotificationIcon(notification.type)}
      </div>

      <div className="min-w-0 flex-1 pr-6">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs font-bold text-white">
            {notification.title}
          </p>

          {!notification.is_read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-plur-red shadow-[0_0_10px_rgba(255,70,85,0.7)]" />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-plur-muted">
          {notification.message}
        </p>

        <p className="mt-1.5 text-[10px] font-medium text-plur-muted/70">
          {formatNotificationDate(notification.created_at)}
        </p>
      </div>

      <button
        type="button"
        aria-label="Bildirimi sil"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDelete();
        }}
        className="absolute right-3 top-3 rounded-md p-1 text-plur-muted opacity-0 transition hover:bg-plur-red/10 hover:text-plur-red group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );

  if (!notification.link) {
    return (
      <button
        type="button"
        onClick={onRead}
        className="block w-full text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={notification.link}
      onClick={() => {
        onRead();
        onClose();
      }}
      className="block"
    >
      {content}
    </Link>
  );
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "message":
      return <MessageCircle size={18} />;

    case "favorite":
      return <Heart size={18} />;

    case "duo_request":
    case "duo_accepted":
    case "duo_rejected":
      return <Swords size={18} />;

    case "blocked":
      return <ShieldAlert size={18} />;

    default:
      return <Bell size={18} />;
  }
}

function getNotificationIconStyle(type: NotificationType) {
  switch (type) {
    case "message":
      return "bg-blue-500/10 text-blue-400";

    case "favorite":
      return "bg-pink-500/10 text-pink-400";

    case "duo_request":
      return "bg-violet-500/10 text-violet-400";

    case "duo_accepted":
      return "bg-emerald-500/10 text-emerald-400";

    case "duo_rejected":
    case "blocked":
      return "bg-red-500/10 text-red-400";

    default:
      return "bg-plur-red/10 text-plur-red";
  }
}

function formatNotificationDate(createdAt: string) {
  const createdDate = new Date(createdAt);
  const difference = Date.now() - createdDate.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) {
    return "Şimdi";
  }

  if (difference < hour) {
    return `${Math.floor(difference / minute)} dk önce`;
  }

  if (difference < day) {
    return `${Math.floor(difference / hour)} sa önce`;
  }

  if (difference < 7 * day) {
    return `${Math.floor(difference / day)} gün önce`;
  }

  return createdDate.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}