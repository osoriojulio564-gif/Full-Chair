"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import {
  ArrowLeft,
  UserCog,
  Save,
  Pencil,
  Trash2,
  Calendar,
  Star,
  Clock,
  Mail,
  Phone,
  Loader2,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ScheduleDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

interface StaffService {
  service: { id: string; name: string; duration: number; price: number };
}

interface StaffAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  client: { firstName: string; lastName: string };
  service: { name: string };
}

interface StaffReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  client: { firstName: string; lastName: string };
}

interface StaffDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  bio: string | null;
  isActive: boolean;
  avatar: string | null;
  schedule: ScheduleDay[];
  services: StaffService[];
  appointments: StaffAppointment[];
  reviews: StaffReview[];
  _count: { appointments: number; reviews: number };
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const ROLE_BADGE: Record<string, string> = {
  OWNER: "bg-red-100 text-red-700",
  STYLIST: "bg-blue-100 text-blue-700",
  MANAGER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  RECEPTIONIST: "bg-green-100 text-green-700",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

const DEFAULT_SCHEDULE: ScheduleDay[] = [1, 2, 3, 4, 5, 6].map((d) => ({
  dayOfWeek: d,
  startTime: "09:00",
  endTime: "18:00",
  isOff: false,
}));

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Info edit state
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    role: "STYLIST",
  });
  const [savingInfo, setSavingInfo] = useState(false);

  // Schedule edit state
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleDay[]>([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ---- Fetch ---- */

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/${id}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load staff member");
        return;
      }
      const data = await res.json();
      setStaff(data.staff);
    } catch {
      setError("Failed to load staff member");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  /* ---- Populate forms when staff loads ---- */

  useEffect(() => {
    if (staff) {
      setInfoForm({
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone || "",
        bio: staff.bio || "",
        role: staff.role,
      });

      // Merge fetched schedule with defaults for missing days
      const merged = DEFAULT_SCHEDULE.map((def) => {
        const existing = staff.schedule.find(
          (s) => s.dayOfWeek === def.dayOfWeek
        );
        return existing
          ? {
              dayOfWeek: existing.dayOfWeek,
              startTime: existing.startTime,
              endTime: existing.endTime,
              isOff: existing.isOff,
            }
          : { ...def };
      });
      setScheduleForm(merged);
    }
  }, [staff]);

  /* ---- Save info ---- */

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "info", ...infoForm }),
      });
      if (res.ok) {
        setEditingInfo(false);
        fetchStaff();
      }
    } catch {
      console.error("Failed to update info");
    } finally {
      setSavingInfo(false);
    }
  };

  /* ---- Save schedule ---- */

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "schedule", schedule: scheduleForm }),
      });
      if (res.ok) {
        setEditingSchedule(false);
        fetchStaff();
      }
    } catch {
      console.error("Failed to update schedule");
    } finally {
      setSavingSchedule(false);
    }
  };

  /* ---- Delete ---- */

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/staff");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete staff member");
      }
    } catch {
      console.error("Failed to delete staff member");
    } finally {
      setDeleting(false);
    }
  };

  /* ---- Helpers ---- */

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  const updateScheduleDay = (
    dayOfWeek: number,
    field: keyof ScheduleDay,
    value: string | boolean
  ) => {
    setScheduleForm((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    );
  };

  /* ---- Render: loading / error ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">Loading staff member...</span>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="space-y-6">
        <Link
          href="/staff"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff
        </Link>
        <div className="card py-12 text-center">
          <p className="text-red-600">{error || "Staff member not found"}</p>
        </div>
      </div>
    );
  }

  /* ---- Render: main ---- */

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/staff"
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Staff
      </Link>

      {/* ============================================================ */}
      {/* 1. Staff Info Card                                           */}
      {/* ============================================================ */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCog className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-heading font-medium text-charcoal">
              Staff Profile
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!editingInfo && (
              <button
                onClick={() => setEditingInfo(true)}
                className="btn-secondary inline-flex items-center gap-1 text-sm"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger inline-flex items-center gap-1 text-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              Are you sure you want to delete {staff.firstName} {staff.lastName}?
              This action cannot be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger text-sm"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {editingInfo ? (
          /* ---- Edit mode ---- */
          <form onSubmit={handleSaveInfo} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                required
                value={infoForm.firstName}
                onChange={(e) =>
                  setInfoForm({ ...infoForm, firstName: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                required
                value={infoForm.lastName}
                onChange={(e) =>
                  setInfoForm({ ...infoForm, lastName: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={infoForm.email}
                onChange={(e) =>
                  setInfoForm({ ...infoForm, email: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={infoForm.phone}
                onChange={(e) =>
                  setInfoForm({ ...infoForm, phone: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={infoForm.role}
                onChange={(e) =>
                  setInfoForm({ ...infoForm, role: e.target.value })
                }
                className="input-field"
              >
                <option value="STYLIST">Stylist</option>
                <option value="MANAGER">Manager</option>
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
                <option value="RECEPTIONIST">Receptionist</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                value={infoForm.bio}
                onChange={(e) =>
                  setInfoForm({ ...infoForm, bio: e.target.value })
                }
                className="input-field"
                rows={3}
                placeholder="Short bio, specialties, experience..."
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={savingInfo}
                className="btn-primary inline-flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {savingInfo ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditingInfo(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* ---- Display mode ---- */
          <div>
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                {getInitials(staff.firstName, staff.lastName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-heading font-medium text-charcoal">
                    {staff.firstName} {staff.lastName}
                  </h3>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ROLE_BADGE[staff.role] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {staff.role}
                  </span>
                </div>
                {staff.email && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-3.5 w-3.5" />
                    {staff.email}
                  </div>
                )}
                {staff.phone && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-3.5 w-3.5" />
                    {staff.phone}
                  </div>
                )}
                {staff.bio && (
                  <p className="mt-3 text-sm text-gray-600">{staff.bio}</p>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-4 flex gap-6 border-t border-gray-100 pt-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {staff._count.appointments} appointments
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4" />
                {staff._count.reviews} reviews
              </span>
              <span className="inline-flex items-center gap-1">
                {staff.services.length} services
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. Weekly Schedule                                           */}
      {/* ============================================================ */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-heading font-medium text-charcoal">
              Weekly Schedule
            </h2>
          </div>
          {!editingSchedule ? (
            <button
              onClick={() => setEditingSchedule(true)}
              className="btn-secondary inline-flex items-center gap-1 text-sm"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="btn-primary inline-flex items-center gap-1 text-sm"
              >
                <Save className="h-3.5 w-3.5" />
                {savingSchedule ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditingSchedule(false)}
                className="btn-secondary inline-flex items-center gap-1 text-sm"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Day
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Start
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  End
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Off
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(editingSchedule ? scheduleForm : staff.schedule.length > 0 ? staff.schedule : DEFAULT_SCHEDULE).map(
                (day) => (
                  <tr key={day.dayOfWeek} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {DAY_NAMES[day.dayOfWeek] || `Day ${day.dayOfWeek}`}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {editingSchedule ? (
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) =>
                            updateScheduleDay(
                              day.dayOfWeek,
                              "startTime",
                              e.target.value
                            )
                          }
                          disabled={day.isOff}
                          className="input-field w-32"
                        />
                      ) : day.isOff ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        formatTime(day.startTime)
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {editingSchedule ? (
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) =>
                            updateScheduleDay(
                              day.dayOfWeek,
                              "endTime",
                              e.target.value
                            )
                          }
                          disabled={day.isOff}
                          className="input-field w-32"
                        />
                      ) : day.isOff ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        formatTime(day.endTime)
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {editingSchedule ? (
                        <input
                          type="checkbox"
                          checked={day.isOff}
                          onChange={(e) =>
                            updateScheduleDay(
                              day.dayOfWeek,
                              "isOff",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                        />
                      ) : day.isOff ? (
                        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          Off
                        </span>
                      ) : null}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Recent Appointments                                       */}
      {/* ============================================================ */}
      <div className="card">
        <div className="mb-4 flex items-center gap-3">
          <Calendar className="h-6 w-6 text-indigo-600" />
          <h2 className="text-lg font-heading font-medium text-charcoal">
            Recent Appointments
          </h2>
        </div>

        {staff.appointments.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No appointments yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Client
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Service
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                      {new Date(apt.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                      {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                      {apt.client.firstName} {apt.client.lastName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                      {apt.service.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[apt.status] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {apt.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. Reviews                                                   */}
      {/* ============================================================ */}
      <div className="card">
        <div className="mb-4 flex items-center gap-3">
          <Star className="h-6 w-6 text-indigo-600" />
          <h2 className="text-lg font-heading font-medium text-charcoal">Reviews</h2>
        </div>

        {staff.reviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No reviews yet.
          </p>
        ) : (
          <div className="space-y-4">
            {staff.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {review.client.firstName} {review.client.lastName}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
