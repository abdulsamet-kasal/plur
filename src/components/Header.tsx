"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ChevronDown,
  LoaderCircle,
  LogIn,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldBan,
  ShieldCheck,
  User,
  UserRoundPen,
} from "lucide-react";

import DuoRequestsBell from "@/components/DuoRequestsBell";
import NotificationBell from "@/components/NotificationBell";
import { headerLinks } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

type HeaderProps = {
  onMenuClick: () => void;
};

type HeaderProfile = {
  id: string;
  username: string;
  tag: string;
  avatarUrl: string;
  profileCompleted: boolean;
  isAdmin: boolean;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const menuRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (userError || !user) {
        setProfile(null);
        setAuthLoading(false);
        return;
      }

      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
            id,
            username,
            tag,
            avatar_url,
            city,
            server,
            rank_tier,
            role,
            agent,
            bio,
            is_admin
          `
        )
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (profileError) {
        console.error("Profil yüklenemedi:", profileError.message);
      }

      const username =
        profileRow?.username ||
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "Oyuncu";

      const tag = profileRow?.tag || "TR";

      const avatarUrl =
        profileRow?.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

      const profileCompleted = Boolean(
        profileRow?.city &&
          profileRow?.server &&
          profileRow?.rank_tier &&
          profileRow?.role &&
          profileRow?.agent &&
          profileRow?.bio
      );

      setProfile({
        id: user.id,
        username,
        tag,
        avatarUrl,
        profileCompleted,
        isAdmin: profileRow?.is_admin === true,
      });

      setAuthLoading(false);
    }

    loadCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setProfileMenuOpen(false);
        setAuthLoading(false);
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "USER_UPDATED" ||
        event === "TOKEN_REFRESHED"
      ) {
        loadCurrentUser();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function isLinkActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    setLogoutLoading(true);

    const { error } = await supabase.auth.signOut();

    setLogoutLoading(false);

    if (error) {
      console.error("Çıkış yapılamadı:", error.message);
      return;
    }

    setProfile(null);
    setProfileMenuOpen(false);

    router.push("/giris");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-plur-border bg-plur-bg/85 backdrop-blur-xl">
      <div className="flex min-h-[65px] items-center justify-between px-4 md:px-6">
        {/* Mobil menü */}
        <button
          type="button"
          aria-label="Menüyü aç"
          onClick={onMenuClick}
          className="mr-3 rounded-lg p-2 text-plur-muted transition hover:bg-plur-card hover:text-white"
        >
          <Menu size={22} />
        </button>

        {/* Üst navigasyon */}
        <nav className="hidden items-center gap-6 lg:flex">
          {headerLinks.map((link) => {
            const active = isLinkActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-5 text-sm transition-colors ${
                  active
                    ? "font-semibold text-white"
                    : "text-plur-muted hover:text-white"
                }`}
              >
                {link.label}

                {active && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-plur-red shadow-[0_0_12px_rgba(255,70,85,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sağ alan */}
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Ara"
            className="rounded-lg p-2 text-plur-muted transition hover:bg-plur-card hover:text-white"
          >
            <Search size={20} />
          </button>

          {/* Duo istekleri ve gerçek bildirim sistemi */}
          {profile && <DuoRequestsBell userId={profile.id} />}
          {profile && <NotificationBell userId={profile.id} />}

          {authLoading ? (
            <div className="flex h-10 items-center gap-2 border-l border-plur-border pl-3 text-xs text-plur-muted">
              <LoaderCircle
                size={17}
                className="animate-spin text-plur-red"
              />

              <span className="hidden sm:inline">
                Kullanıcı yükleniyor
              </span>
            </div>
          ) : profile ? (
            <div
              ref={menuRef}
              className="relative border-l border-plur-border pl-3"
            >
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen((current) => !current)
                }
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                className="group flex items-center gap-3 rounded-xl px-1.5 py-1 transition hover:bg-plur-card/70"
              >
                <div className="relative shrink-0">
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.username} kullanıcı avatarı`}
                    className="h-9 w-9 rounded-full border-2 border-plur-red bg-plur-card object-cover transition duration-300 group-hover:scale-105"
                  />

                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-plur-bg bg-plur-green shadow-[0_0_10px_rgba(39,215,123,0.55)]" />
                </div>

                <div className="hidden min-w-0 text-left sm:block">
                  <div className="flex max-w-[190px] items-center gap-2">
                    <p className="min-w-0 truncate text-sm font-semibold text-white">
                      {profile.username}
                      <span className="text-plur-muted">#{profile.tag}</span>
                    </p>

                    {profile.isAdmin && (
                      <span className="shrink-0 rounded-md border border-plur-red/30 bg-plur-red/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-plur-red">
                        Admin
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs ${
                      profile.profileCompleted
                        ? "text-plur-green"
                        : "text-yellow-400"
                    }`}
                  >
                    {profile.profileCompleted
                      ? "Online"
                      : "Profil eksik"}
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className={`hidden text-plur-muted transition-transform duration-300 sm:block ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-plur-border bg-plur-card/95 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                >
                  <div className="border-b border-plur-border px-3 py-3">
                    <div className="flex items-center gap-2">
                      <p className="min-w-0 truncate text-sm font-bold text-white">
                        {profile.username}
                        <span className="text-plur-muted">#{profile.tag}</span>
                      </p>

                      {profile.isAdmin && (
                        <span className="shrink-0 rounded-md border border-plur-red/30 bg-plur-red/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-plur-red">
                          Admin
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-plur-muted">
                      {profile.isAdmin ? "PLUR yönetici hesabı" : "PLUR oyuncu hesabı"}
                    </p>
                  </div>

                  <div className="py-2">
                    <DropdownLink
                      href={`/oyuncu/${profile.id}`}
                      icon={<User size={16} />}
                      label="Profilimi Gör"
                      onClick={() => setProfileMenuOpen(false)}
                    />

                    <DropdownLink
                      href="/profil/tamamla"
                      icon={<UserRoundPen size={16} />}
                      label={
                        profile.profileCompleted
                          ? "Profili Düzenle"
                          : "Profili Tamamla"
                      }
                      warning={!profile.profileCompleted}
                      onClick={() => setProfileMenuOpen(false)}
                    />

                    <DropdownLink
                      href="/engellenenler"
                      icon={<ShieldBan size={16} />}
                      label="Engellenenler"
                      onClick={() => setProfileMenuOpen(false)}
                    />

                    {profile.isAdmin && (
                      <DropdownLink
                        href="/admin"
                        icon={<ShieldCheck size={16} />}
                        label="Admin Paneli"
                        admin
                        onClick={() => setProfileMenuOpen(false)}
                      />
                    )}

                    <DropdownLink
                      href="/ayarlar"
                      icon={<Settings size={16} />}
                      label="Ayarlar"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                  </div>

                  <div className="border-t border-plur-border pt-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="group/logout flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-plur-muted transition hover:bg-plur-red/10 hover:text-plur-red disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {logoutLoading ? (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <LogOut
                          size={16}
                          className="transition-transform duration-300 group-hover/logout:translate-x-0.5"
                        />
                      )}

                      {logoutLoading
                        ? "Çıkış yapılıyor..."
                        : "Çıkış Yap"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-plur-border pl-3">
              <Link
                href="/giris"
                className="flex h-9 items-center gap-2 rounded-lg border border-plur-border bg-plur-card/60 px-3 text-xs font-semibold text-plur-muted transition hover:border-plur-red/40 hover:bg-plur-red/10 hover:text-white"
              >
                <LogIn size={15} />
                Giriş
              </Link>

              <Link
                href="/kayit"
                className="hidden h-9 items-center rounded-lg border border-plur-red/50 bg-plur-red px-3 text-xs font-bold text-white shadow-[0_8px_24px_rgba(255,70,85,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,70,85,0.35)] sm:flex"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownLink({
  href,
  icon,
  label,
  warning = false,
  admin = false,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  warning?: boolean;
  admin?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
        admin
          ? "border border-plur-red/20 bg-plur-red/[0.06] text-plur-red hover:bg-plur-red/10 hover:text-white"
          : warning
            ? "text-yellow-400 hover:bg-yellow-400/10"
            : "text-plur-muted hover:bg-plur-red/10 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}