"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { UserCog, Plus, Phone, Mail, X, Scissors, Calendar } from "lucide-react";

interface StaffSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

interface StaffService {
  service: {
    name: string;
  };
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  isActive: boolean;
  avatar: string | null;
  schedule: StaffSchedule[];
  services: StaffService[];
  _count: {
    appointments: number;
    reviews: number;
  };
}

const ROLE_BADGE: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  STYLIST: "bg-pink-100 text-pink-700",
  RECEPTIONIST: "bg-green-100 text-green-700",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "STYLIST",
    bio: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      setStaff(data.staff ?? []);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "STYLIST",
          bio: "",
        });
        setShowForm(false);
        fetchStaff();
      }
    } catch (err) {
      console.error("Failed to create staff member:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-700">
            {staff.length}
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* Add Staff Form */}
      {showForm && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">New Staff Member</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-field"
                placeholder="Maria"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field"
                placeholder="Garcia"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="maria@fullchair.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-field"
              >
                <option value="STYLIST">Stylist</option>
                <option value="ADMIN">Admin</option>
                <option value="RECEPTIONIST">Receptionist</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Short bio, specialties, experience..."
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? "Saving..." : "Save Staff Member"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading staff...</div>
      ) : staff.length === 0 ? (
        <div className="card py-12 text-center">
          <UserCog className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No staff members yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first staff member.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Link
              key={member.id}
              href={`/staff/${member.id}`}
              className="card transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-start gap-3">
                {/* Avatar */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {getInitials(member.firstName, member.lastName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-lg font-semibold text-gray-900">
                      {member.firstName} {member.lastName}
                    </h3>
                    {!member.isActive && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      ROLE_BADGE[member.role] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>

              {member.email && (
                <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}

              {member.phone && (
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{member.phone}</span>
                </div>
              )}

              <div className="flex gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Scissors className="h-3 w-3" />
                  {member.services.length} services
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {member._count.appointments} appts
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
