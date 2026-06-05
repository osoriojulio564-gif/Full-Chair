"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Users, Scissors, UserCircle,
  Star, Bell, MessageSquare, Settings, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/services", label: "Services", icon: Scissors },
  { href: "/staff", label: "Staff", icon: UserCircle },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="h-8 w-8 rounded-sm bg-brand-600" />
        <span className="font-heading text-lg font-medium text-charcoal">Full Chair</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-charcoal"
              )}>
              <item.icon className={cn("h-5 w-5", isActive ? "text-brand-600" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
          <LogOut className="h-5 w-5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
