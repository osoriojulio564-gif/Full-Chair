"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Clock,
  Globe,
  Link,
  Trash2,
  Copy,
  CheckCircle,
  Loader2,
} from "lucide-react";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "America/Mexico_City",
  "America/Bogota",
  "Europe/London",
  "Europe/Paris",
  "Europe/Madrid",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Australia/Sydney",
];

interface BusinessHours {
  open: string;
  close: string;
  closed: boolean;
}

export default function SettingsPage() {
  const [salon, setSalon] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    description: "",
    timezone: "America/New_York",
    plan: "STARTER",
  });

  const [hours, setHours] = useState<Record<string, BusinessHours>>({
    mon: { open: "09:00", close: "18:00", closed: false },
    tue: { open: "09:00", close: "18:00", closed: false },
    wed: { open: "09:00", close: "18:00", closed: false },
    thu: { open: "09:00", close: "18:00", closed: false },
    fri: { open: "09:00", close: "18:00", closed: false },
    sat: { open: "10:00", close: "16:00", closed: false },
  });

  const [booking, setBooking] = useState({
    currency: "USD",
    bookingWindow: 30,
    cancellationPolicy:
      "Cancellations must be made at least 24 hours before the scheduled appointment. Late cancellations may be subject to a fee.",
  });

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [feedback, setFeedback] = useState<{ section: string; type: "success" | "error"; message: string } | null>(null);

  // Fetch salon data on mount
  useEffect(() => {
    async function fetchSalon() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        const s = data.salon;
        setSalon({
          name: s.name || "",
          email: s.email || "",
          phone: s.phone || "",
          address: s.address || "",
          city: s.city || "",
          country: s.country || "",
          description: s.description || "",
          timezone: s.timezone || "America/New_York",
        });
        // Populate hours from salon defaults
        setHours((prev) => {
          const updated = { ...prev };
          for (const day of DAYS) {
            updated[day.key] = {
              ...updated[day.key],
              open: s.openTime || "09:00",
              close: s.closeTime || "18:00",
            };
          }
          return updated;
        });
        setBooking((prev) => ({
          ...prev,
          currency: s.currency || "USD",
        }));
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSalon();
  }, []);

  const showFeedback = (section: string, type: "success" | "error", message: string) => {
    setFeedback({ section, type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: salon.name,
          email: salon.email,
          phone: salon.phone,
          address: salon.address,
          city: salon.city,
          country: salon.country,
          timezone: salon.timezone,
          description: salon.description,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showFeedback("info", "success", "Saved!");
    } catch {
      showFeedback("info", "error", "Failed to save. Please try again.");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openTime: hours.mon.open,
          closeTime: hours.mon.close,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showFeedback("hours", "success", "Saved!");
    } catch {
      showFeedback("hours", "error", "Failed to save. Please try again.");
    } finally {
      setSavingHours(false);
    }
  };

  const handleSaveBooking = async () => {
    setSavingBooking(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: booking.currency,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showFeedback("booking", "success", "Saved!");
    } catch {
      showFeedback("booking", "error", "Failed to save. Please try again.");
    } finally {
      setSavingBooking(false);
    }
  };

  const slug = salon.name.toLowerCase().replace(/\s+/g, "-");
  const bookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/book/${slug}`
      : `/book/${slug}`;

  const handleCopyUrl = () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/book/${slug}`
        : `/book/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateHours = (
    day: string,
    field: keyof BusinessHours,
    value: string | boolean
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const FeedbackBadge = ({ section }: { section: string }) => {
    if (!feedback || feedback.section !== section) return null;
    return (
      <span
        className={`ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          feedback.type === "success"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {feedback.message}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-7 w-7 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salon Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your salon information and preferences
          </p>
        </div>
      </div>

      {/* Salon Information */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Salon Information
          </h2>
          <FeedbackBadge section="info" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Salon Name
            </label>
            <input
              type="text"
              value={salon.name}
              onChange={(e) => setSalon({ ...salon, name: e.target.value })}
              className="input-field"
              placeholder="Your salon name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={salon.email}
              onChange={(e) => setSalon({ ...salon, email: e.target.value })}
              className="input-field"
              placeholder="contact@salon.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={salon.phone}
              onChange={(e) => setSalon({ ...salon, phone: e.target.value })}
              className="input-field"
              placeholder="+1 555 123 4567"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              value={salon.address}
              onChange={(e) => setSalon({ ...salon, address: e.target.value })}
              className="input-field"
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              value={salon.city}
              onChange={(e) => setSalon({ ...salon, city: e.target.value })}
              className="input-field"
              placeholder="New York"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              value={salon.country}
              onChange={(e) => setSalon({ ...salon, country: e.target.value })}
              className="input-field"
              placeholder="United States"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select
              value={salon.timezone}
              onChange={(e) => setSalon({ ...salon, timezone: e.target.value })}
              className="input-field"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={salon.description}
              onChange={(e) =>
                setSalon({ ...salon, description: e.target.value })
              }
              className="input-field"
              rows={3}
              placeholder="Tell clients about your salon..."
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveInfo}
            disabled={savingInfo}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            {savingInfo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {savingInfo ? "Saving..." : "Save Information"}
          </button>
        </div>
      </div>

      {/* Business Hours */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Business Hours
          </h2>
          <FeedbackBadge section="hours" />
        </div>
        <div className="space-y-3">
          {DAYS.map((day) => (
            <div
              key={day.key}
              className="flex items-center gap-4 rounded-lg border border-gray-100 p-3"
            >
              <span className="w-28 text-sm font-medium text-gray-900">
                {day.label}
              </span>
              <div className="flex flex-1 items-center gap-3">
                <input
                  type="time"
                  value={hours[day.key].open}
                  onChange={(e) =>
                    updateHours(day.key, "open", e.target.value)
                  }
                  disabled={hours[day.key].closed}
                  className="input-field w-auto py-1.5 text-sm disabled:opacity-50"
                />
                <span className="text-sm text-gray-400">to</span>
                <input
                  type="time"
                  value={hours[day.key].close}
                  onChange={(e) =>
                    updateHours(day.key, "close", e.target.value)
                  }
                  disabled={hours[day.key].closed}
                  className="input-field w-auto py-1.5 text-sm disabled:opacity-50"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={hours[day.key].closed}
                  onChange={(e) =>
                    updateHours(day.key, "closed", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-600">Closed</span>
              </label>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveHours}
            disabled={savingHours}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            {savingHours ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {savingHours ? "Saving..." : "Save Hours"}
          </button>
        </div>
      </div>

      {/* Booking Settings */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Booking Settings
          </h2>
          <FeedbackBadge section="booking" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              value={booking.currency}
              onChange={(e) =>
                setBooking({ ...booking, currency: e.target.value })
              }
              className="input-field"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (&euro;)</option>
              <option value="GBP">GBP (&pound;)</option>
              <option value="BRL">BRL (R$)</option>
              <option value="MXN">MXN ($)</option>
              <option value="COP">COP ($)</option>
              <option value="ARS">ARS ($)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Booking Window (days ahead)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={booking.bookingWindow}
              onChange={(e) =>
                setBooking({
                  ...booking,
                  bookingWindow: parseInt(e.target.value) || 1,
                })
              }
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cancellation Policy
            </label>
            <textarea
              value={booking.cancellationPolicy}
              onChange={(e) =>
                setBooking({ ...booking, cancellationPolicy: e.target.value })
              }
              className="input-field"
              rows={3}
              placeholder="Describe your cancellation policy..."
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveBooking}
            disabled={savingBooking}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            {savingBooking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {savingBooking ? "Saving..." : "Save Booking Settings"}
          </button>
        </div>
      </div>

      {/* Public Booking Page */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Link className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Public Booking Page
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Share this link with your clients so they can book appointments
          online.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
            <code className="text-sm text-gray-700 break-all">
              {bookingUrl}
            </code>
          </div>
          <button
            onClick={handleCopyUrl}
            className="btn-secondary inline-flex items-center gap-2 whitespace-nowrap"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy URL
              </>
            )}
          </button>
        </div>
        {salon.plan === "PREMIUM" && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Your premium branded salon page:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                <code className="text-sm text-gray-700 break-all">
                  {typeof window !== "undefined" ? `${window.location.origin}/salon/${salon.slug}` : `/salon/${salon.slug}`}
                </code>
              </div>
              <a
                href={`/salon/${salon.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
              >
                View Page
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
        </div>
        <p className="text-sm text-red-700 mb-4">
          Permanently delete your salon and all associated data. This action
          cannot be undone.
        </p>
        <div className="relative group inline-block">
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 opacity-60 cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            Delete Salon
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white whitespace-nowrap shadow-lg">
              Contact support to delete your salon
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
