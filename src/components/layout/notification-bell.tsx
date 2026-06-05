"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => d.notifications && setNotifications(d.notifications))
      .catch(() => {});

    const es = new EventSource("/api/notifications/stream");
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
          setNotifications((prev) => [data.notification, ...prev].slice(0, 20));
        }
      } catch {}
    };
    return () => es.close();
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-sm border border-gray-200 bg-white shadow-warm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700">Mark all read</button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet</p>
              ) : notifications.map((n) => (
                <div key={n.id} className={`border-b border-gray-50 px-4 py-3 ${!n.isRead ? "bg-brand-50/50" : ""}`}>
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
