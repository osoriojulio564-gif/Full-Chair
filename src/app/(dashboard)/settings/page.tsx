"use client";

import { useState } from "react";
import {
  Settings,
  Clock,
  Globe,
  Link,
  Trash2,
  Copy,
  CheckCircle,
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
    name: "My Salon",
    email: "contact@mysalon.com",
    phone: "+1 555 123 4567",
    address: "123 Main Street",
    city: "New York",
    country: "United States",
    description: "A premium beauty salon offering the best services in town.",
    timezone: "America/New_York",
  });

  const [hours, setHours] = useState<Record<string, BusinessHours>>({
    mon: { open: "09:00", close: "18:00", closed: false },
    tue: { open: "09:00", close: "18:00", closed: false },
    wed: { open: "09:00", close: "18:00", closed: false },
    thu: { open: "09:00", close: "20:00", closed: false },
    fri: { open: "09:00", close: "20:00", closed: false },
    sat: { open: "10:00", close: "16:00", closed: false },
  });

  const [booking, setBooking] = useState({
    currency: "USD",
    bookingWindow: 30,
    cancellationPolicy:
      "Cancellations must be made at least 24 hours before the scheduled appointment. Late cancellations may be subject to a fee.",
  });

  const [copied, setCopied] = useState(false);

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
          <button className="btn-primary inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Save Information
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
          <button className="btn-primary inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Save Hours
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
          <button className="btn-primary inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Save Booking Settings
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
