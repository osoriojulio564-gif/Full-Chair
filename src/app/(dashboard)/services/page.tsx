"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Scissors,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Tag,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  color: string;
  isActive: boolean;
  staff: { id: string; name: string }[];
}

const CATEGORIES = ["Hair", "Nails", "Skin", "Makeup", "Other"];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    category: "Hair",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data.services ?? []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ name: "", description: "", duration: 30, price: 0, category: "Hair" });
        setShowForm(false);
        fetchServices();
      }
    } catch (err) {
      console.error("Failed to create service:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchServices();
      }
    } catch (err) {
      console.error("Failed to delete service:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await fetch("/api/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service.id, isActive: !service.isActive }),
      });
      fetchServices();
    } catch (err) {
      console.error("Failed to toggle service:", err);
    }
  };

  const categoryColor = (category: string) => {
    switch (category) {
      case "Hair":
        return "bg-purple-100 text-purple-700";
      case "Nails":
        return "bg-pink-100 text-pink-700";
      case "Skin":
        return "bg-green-100 text-green-700";
      case "Makeup":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scissors className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-700">
            {services.length}
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {/* Add Service Form */}
      {showForm && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">New Service</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Service Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g. Women's Haircut"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="Brief description of the service"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                required
                min={5}
                step={5}
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                required
                min={0}
                step={0.01}
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? "Saving..." : "Save Service"}
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

      {/* Services Grid */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="card py-12 text-center">
          <Scissors className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No services yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your first service to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`card transition-shadow hover:shadow-md ${
                !service.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Top row: color dot + name + active toggle */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {service.color && (
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                </div>
                <button
                  onClick={() => handleToggleActive(service)}
                  title={service.isActive ? "Deactivate" : "Activate"}
                  className="text-gray-400 hover:text-indigo-600"
                >
                  {service.isActive ? (
                    <ToggleRight className="h-6 w-6 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Description */}
              {service.description && (
                <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                  {service.description}
                </p>
              )}

              {/* Badges */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  <Clock className="h-3 w-3" />
                  {service.duration} min
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  <DollarSign className="h-3 w-3" />
                  {service.price.toFixed(2)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor(
                    service.category
                  )}`}
                >
                  <Tag className="h-3 w-3" />
                  {service.category}
                </span>
              </div>

              {/* Staff list */}
              {service.staff && service.staff.length > 0 && (
                <p className="mb-3 text-xs text-gray-500">
                  Staff: {service.staff.map((s) => s.name).join(", ")}
                </p>
              )}

              {/* Delete */}
              <div className="flex justify-end border-t border-gray-100 pt-3">
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                  className="btn-danger inline-flex items-center gap-1 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deletingId === service.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
