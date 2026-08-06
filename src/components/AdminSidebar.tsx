"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FileWarning,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Shield,
  Users,
  X,
} from "lucide-react";

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/ilanlar", label: "İlanlar", icon: Gamepad2 },
  { href: "/admin/sikayetler", label: "Şikâyetler", icon: FileWarning },
  { href: "/admin/bildirim", label: "Bildirim Gönder", icon: Bell },
];

export default function AdminSidebar({
  isOpen,
  onClose,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Admin menüsünü kapat"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-plur-border bg-plur-bg transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-plur-border px-5">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-plur-red/10 text-plur-red">
              <Shield size={21} />
            </div>
            <div>
              <p className="font-rajdhani text-xl font-black tracking-[0.16em] text-white">
                PLUR ADMIN
              </p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-plur-muted">
                Control Center
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-plur-muted hover:bg-plur-card hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-plur-red/40 bg-plur-red/10 text-white"
                    : "border-transparent text-plur-muted hover:border-plur-border hover:bg-plur-card hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={active ? "text-plur-red" : "group-hover:text-plur-red"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-plur-border p-3">
          <Link
            href="/"
            className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-plur-muted transition hover:bg-plur-card hover:text-white"
          >
            <Gamepad2 size={18} />
            Siteye Dön
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-plur-muted transition hover:bg-plur-red/10 hover:text-plur-red"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}
