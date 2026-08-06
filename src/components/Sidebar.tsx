"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bell,
  Gamepad2,
  Heart,
  Home,
  MessageSquare,
  Plus,
  Shield,
  Users,
  X,
} from "lucide-react";

import { navItems } from "@/lib/data";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const iconMap: Record<string, React.ReactNode> = {
  home: <Home size={18} />,
  users: <Users size={18} />,
  gamepad: <Gamepad2 size={18} />,
  shield: <Shield size={18} />,
  message: <MessageSquare size={18} />,
  bell: <Bell size={18} />,
  heart: <Heart size={18} />,
};

export default function Sidebar({
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const hiddenLabels = new Set([
    "ayarlar",
    "oyun arkadaşları",
    "oyun arkadaslari",
    "takım arkadaşı",
    "takim arkadasi",
    "engellenenler",
  ]);

  const hiddenHrefs = new Set([
    "/ayarlar",
    "/oyun-arkadaslari",
    "/takim-arkadasi",
    "/engellenenler",
  ]);

  const visibleItems = navItems.filter((item) => {
    const normalizedLabel = item.label
      .toLocaleLowerCase("tr-TR")
      .trim();

    return (
      !hiddenLabels.has(normalizedLabel) &&
      !hiddenHrefs.has(item.href)
    );
  });

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobil arka plan */}
      {isOpen && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col
          border-r border-plur-border bg-plur-bg
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-plur-border px-5 py-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-plur-red/10">
              <span className="font-rajdhani text-xl font-black text-plur-red">
                P
              </span>
            </div>

            <div>
              <h1 className="font-rajdhani text-2xl font-black tracking-[0.12em] text-plur-red">
                PLUR
              </h1>

              <p className="-mt-1 text-[9px] uppercase tracking-[0.24em] text-plur-muted">
                Find your duo
              </p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={onClose}
            className="rounded-lg p-2 text-plur-muted transition hover:bg-plur-card hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {/* Menü */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => {
            const active = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  group relative flex items-center gap-3 rounded-lg
                  border-l-2 px-3 py-2.5 text-sm font-medium
                  transition-all duration-200
                  ${
                    active
                      ? "border-plur-red bg-plur-red/10 text-white"
                      : "border-transparent text-plur-muted hover:translate-x-0.5 hover:bg-plur-card hover:text-white"
                  }
                `}
              >
                <span
                  className={
                    active
                      ? "text-plur-red"
                      : "transition-colors group-hover:text-plur-red"
                  }
                >
                  {iconMap[item.icon]}
                </span>

                <span className="flex-1">{item.label}</span>

                {active && (
                  <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-plur-red shadow-[0_0_10px_rgba(255,70,85,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Hızlı oyun */}
        <div className="border-t border-plur-border px-4 py-4">
          <Link
            href="/duo-bul"
            onClick={onClose}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
          >
            <Plus size={18} />
            Hızlı Oyun
          </Link>

          <p className="mt-4 text-center text-[9px] text-plur-muted/70">
            © 2026 PLUR
          </p>
        </div>
      </aside>
    </>
  );
}