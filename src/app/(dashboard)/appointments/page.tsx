"use client";

import { useEffect, useState } from "react";
import { formatTime, addMinutesToTime } from "@/lib/utils";
import {
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  client: { id: string; firstName: string; lastName: string; email: string };
  service: { id: string; name: string };
  staff: { id: string; firstName: string; lastName: string };
}

interface ClientOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface ServiceOption {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface StaffOption {
  id: string;
  firstName: string;
  lastName: string;
}

const STATUS_TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
  CONFIRMED: { bg: "bg-blue-100", text: "text-blue-800" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-800" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-800" },
  IN_PROGRESS: { bg: "bg-purple-100", text: "text-purple-800" },
  NO_SHOW: { bg: "bg-gray-100", text: "text-gray-800" },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New appointment form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    staffId: "",
    date: "",
    startTime: "",
    endTime: "",
    price: "",
    notes: "",
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchFormOptions = async () => {
    setFormLoading(true);
    try {
      const [clientsRes, servicesRes, staffRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/services"),
        fetch("/api/staff"),
      ]);
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients || []);
      }
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.services || []);
      }
      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error("Failed to fetch form options:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenForm = () => {
    setShowForm(true);
    fetchFormOptions();
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      const endTime =
        formData.startTime
          ? addMinutesToTime(formData.startTime, service.duration)
          : "";
      setFormData({
        ...formData,
        serviceId,
        price: service.price.toString(),
        endTime,
      });
    } else {
      setFormData({ ...formData, serviceId, price: "", endTime: "" });
    }
  };

  const handleStartTimeChange = (startTime: string) => {
    const service = services.find((s) => s.id === formData.serviceId);
    const endTime =
      service && startTime
        ? addMinutesToTime(startTime, service.duration)
        : "";
    setFormData({ ...formData, startTime, endTime });
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: formData.clientId,
          serviceId: formData.serviceId,
          staffId: formData.staffId,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          price: parseFloat(formData.price),
          notes: formData.notes || undefined,
          source: "WALK_IN",
        }),
      });
      if (res.ok) {
        setFormData({
          clientId: "",
          serviceId: "",
          staffId: "",
          date: "",
          startTime: "",
          endTime: "",
          price: "",
          notes: "",
        });
        setShowForm(false);
        fetchAppointments();
      }
    } catch (error) {
      console.error("Failed to create appointment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
        );
      }
    } catch (error) {
      console.error("Failed to update appointment:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAppointments =
    activeFilter === "ALL"
      ? appointments
      : appointments.filter((apt) => apt.status === activeFilter);

  const getStatusBadge = (status: string) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.NO_SHOW;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const getActionButtons = (appointment: Appointment) => {
    const { id, status } = appointment;
    const isUpdating = updatingId === id;

    if (isUpdating) {
      return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
    }

    const buttons = [];

    if (status === "PENDING") {
      buttons.push(
        <button
          key="confirm"
          onClick={() => updateStatus(id, "CONFIRMED")}
          className="btn-primary text-xs px-3 py-1"
        >
          <CheckCircle className="w-3 h-3 mr-1 inline" />
          Confirm
        </button>
      );
    }

    if (status === "CONFIRMED" || status === "IN_PROGRESS") {
      buttons.push(
        <button
          key="complete"
          onClick={() => updateStatus(id, "COMPLETED")}
          className="btn-secondary text-xs px-3 py-1"
        >
          <CheckCircle className="w-3 h-3 mr-1 inline" />
          Complete
        </button>
      );
    }

    if (status !== "COMPLETED" && status !== "CANCELLED") {
      buttons.push(
        <button
          key="cancel"
          onClick={() => updateStatus(id, "CANCELLED")}
          className="btn-danger text-xs px-3 py-1"
        >
          <XCircle className="w-3 h-3 mr-1 inline" />
          Cancel
        </button>
      );
    }

    return <div className="flex items-center gap-2">{buttons}</div>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all salon appointments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAppointments}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => (showForm ? setShowForm(false) : handleOpenForm())}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
        </div>
      </div>

      {/* New Appointment Form */}
      {showForm && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              New Appointment
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {formLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading options...</span>
            </div>
          ) : (
            <form
              onSubmit={handleCreateAppointment}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Client
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Service
                </label>
                <select
                  required
                  value={formData.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration} min - ${s.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Staff
                </label>
                <select
                  required
                  value={formData.staffId}
                  onChange={(e) =>
                    setFormData({ ...formData, staffId: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select staff</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="input-field"
                  readOnly
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input-field"
                  rows={3}
                  placeholder="Any special requests or notes..."
                />
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? "Creating..." : "Create Appointment"}
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
          )}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <Filter className="w-4 h-4 text-gray-400 mr-2" />
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeFilter === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab}
            {tab !== "ALL" && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({appointments.filter((a) => a.status === tab).length})
              </span>
            )}
            {tab === "ALL" && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({appointments.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Loading appointments...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm">No appointments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(appointment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(appointment.startTime)} -{" "}
                        {formatTime(appointment.endTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {appointment.client.firstName} {appointment.client.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {appointment.service.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {appointment.staff.firstName} {appointment.staff.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {getActionButtons(appointment)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
