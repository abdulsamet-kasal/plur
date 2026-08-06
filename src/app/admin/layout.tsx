import Link from "next/link";
import {
  Ban,
  Bell,
  FileWarning,
  Gamepad2,
  Home,
  LayoutDashboard,
  Users,
} from "lucide-react";

import AdminGuard from "@/components/AdminGuard";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/ilanlar", label: "İlanlar", icon: Gamepad2 },
  { href: "/admin/sikayetler", label: "Şikâyetler", icon: FileWarning },
  { href: "/admin/banlar", label: "Banlar", icon: Ban },
  { href: "/admin/bildirim", label: "Bildirim", icon: Bell },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-plur-bg text-white">
        <header className="sticky top-0 z-40 border-b border-plur-border bg-plur-card/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link href="/admin" className="font-rajdhani text-2xl font-black">
                PLUR <span className="text-plur-red">ADMIN</span>
              </Link>

              <Link
                href="/"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-plur-border bg-plur-bg px-3 text-[10px] font-bold text-plur-muted transition hover:text-white lg:hidden"
              >
                <Home size={14} />
                Siteye Dön
              </Link>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <nav className="flex flex-wrap gap-2">
                {links.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-plur-border bg-plur-bg px-3 text-xs font-bold text-plur-muted transition hover:border-plur-red/40 hover:bg-plur-red/10 hover:text-white"
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}
              </nav>

              <Link
                href="/"
                className="hidden h-10 items-center gap-2 rounded-xl border border-plur-border bg-plur-bg px-3 text-xs font-bold text-plur-muted transition hover:text-white lg:inline-flex"
              >
                <Home size={15} />
                Siteye Dön
              </Link>
            </div>
          </div>
        </header>

        {children}
      </div>
    </AdminGuard>
  );
}
