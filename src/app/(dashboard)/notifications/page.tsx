"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  XCircle,
  Star,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCheck,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; badge: string }
> = {
  NEW_BOOKING: { icon: Bell, badge: "bg-green-100 text-green-700" },
  CANCELLATION: { icon: XCircle, badge: "bg-red-100 text-red-700" },
  REVIEW: { icon: Star, badge: "bg-yellow-100 text-yellow-700" },
  WHATSAPP: { icon: MessageSquare, badge: "bg-green-100 text-green-700" },
  REMINDER: { icon: Clock, badge: "bg-blue-100 text-blue-700" },
  SYSTEM: { icon: AlertCircle, badge: "bg-gray-100 text-gray-700" },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-heading font-medium text-charcoal">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-100 px-3 py-0.5 text-sm font-medium text-red-700">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            {markingAll ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="card py-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No notifications
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You&apos;re all caught up! Notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.SYSTEM;
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`card flex items-start gap-4 transition-colors ${
                  !notification.isRead ? "bg-brand-50/50" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.badge}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm ${
                            !notification.isRead
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.badge}`}
                        >
                          {notification.type.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600">
                        {notification.message}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-gray-400">
                      {timeAgo(notification.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-indigo-600" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
