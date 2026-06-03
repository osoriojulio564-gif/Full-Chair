"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Star,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  Tag,
  Clock,
} from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  notes: string | null;
  service: { id: string; name: string };
  staff: { id: string; firstName: string; lastName: string };
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  notes: string | null;
  tags: string;
  source: string | null;
  createdAt: string;
  appointments: Appointment[];
  reviews: Review[];
  _count: {
    appointments: number;
    reviews: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  "NO-SHOW": "bg-gray-100 text-gray-800",
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    notes: "",
    tags: "",
  });

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Client not found.");
        } else {
          setError("Failed to load client.");
        }
        return;
      }
      const data = await res.json();
      setClient(data.client);
    } catch {
      setError("Failed to load client.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const startEditing = () => {
    if (!client) return;
    setEditData({
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      email: client.email || "",
      notes: client.notes || "",
      tags: client.tags || "",
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setEditing(false);
      }
    } catch {
      console.error("Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/clients");
      }
    } catch {
      console.error("Failed to delete client");
    } finally {
      setDeleting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-6">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
        <div className="card py-12 text-center">
          <User className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {error || "Client not found"}
          </h3>
        </div>
      </div>
    );
  }

  const tagList = client.tags
    ? client.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </Link>

      {/* Client Info Card */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <User className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              {editing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) =>
                      setEditData({ ...editData, firstName: e.target.value })
                    }
                    className="input-field"
                    placeholder="First name"
                  />
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) =>
                      setEditData({ ...editData, lastName: e.target.value })
                    }
                    className="input-field"
                    placeholder="Last name"
                  />
                </div>
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">
                  {client.firstName} {client.lastName}
                </h1>
              )}
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since{" "}
                  {new Date(client.createdAt).toLocaleDateString()}
                </span>
                {client.source && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {client.source}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEditing}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startEditing}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-danger inline-flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Contact details */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">
              Phone
            </label>
            {editing ? (
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
                className="input-field"
                placeholder="(555) 123-4567"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{client.phone || "No phone"}</span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">
              Email
            </label>
            {editing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="input-field"
                placeholder="jane@example.com"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{client.email || "No email"}</span>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-500">
              Notes
            </label>
            {editing ? (
              <textarea
                value={editData.notes}
                onChange={(e) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
                className="input-field"
                rows={3}
                placeholder="Preferences, allergies, etc."
              />
            ) : (
              <p className="text-gray-900">
                {client.notes || "No notes"}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-500">
              Tags
            </label>
            {editing ? (
              <div>
                <input
                  type="text"
                  value={editData.tags}
                  onChange={(e) =>
                    setEditData({ ...editData, tags: e.target.value })
                  }
                  className="input-field"
                  placeholder="vip, regular, sensitive-skin (comma-separated)"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Separate tags with commas
                </p>
              </div>
            ) : tagList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tagList.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No tags</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 flex gap-6 border-t border-gray-100 pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {client._count.appointments}
            </p>
            <p className="text-xs text-gray-500">Appointments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {client._count.reviews}
            </p>
            <p className="text-xs text-gray-500">Reviews</p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Client
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {client.firstName} {client.lastName}
              </span>
              ? This will also remove all their appointment and review history.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger inline-flex items-center gap-2"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {deleting ? "Deleting..." : "Delete Client"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment History */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Appointment History
          </h2>
        </div>

        {client.appointments.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No appointments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Service</th>
                  <th className="pb-3 pr-4">Staff</th>
                  <th className="pb-3 pr-4">Price</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 whitespace-nowrap text-gray-900">
                      {new Date(appt.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-gray-600">
                      {appt.startTime} - {appt.endTime}
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {appt.service.name}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {appt.staff.firstName} {appt.staff.lastName}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-gray-900">
                      ${appt.price.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[appt.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
        </div>

        {client.reviews.length === 0 ? (
          <div className="py-8 text-center">
            <Star className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {client.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-gray-700">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
