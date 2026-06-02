"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Check,
  ChevronRight,
  ArrowLeft,
  Scissors,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Slot {
  time: string;
  staffId: string;
  staffName: string;
}

interface ServiceOption {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string | null;
  color: string | null;
}

interface SalonInfo {
  id: string;
  name: string;
  currency?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildNext14Days(): {
  iso: string;
  label: string;
  weekday: string;
  day: number;
  month: string;
}[] {
  const days: {
    iso: string;
    label: string;
    weekday: string;
    day: number;
    month: string;
  }[] = [];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      iso,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : weekdays[d.getDay()],
      weekday: weekdays[d.getDay()],
      day: d.getDate(),
      month: months[d.getMonth()],
    });
  }
  return days;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatPrice(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BookingPage() {
  const params = useParams();
  const salonSlug = params.salonSlug as string;

  /* ---- state ---- */
  const [step, setStep] = useState(1);
  const [salon, setSalon] = useState<SalonInfo | null>(null);

  // Step 1 - service
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(
    null
  );
  const [servicesLoading, setServicesLoading] = useState(true);

  // Step 2 - date
  const [selectedDate, setSelectedDate] = useState("");
  const dates = buildNext14Days();

  // Step 3 - slot
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Step 4 - contact
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* ---- fetch services on mount ---- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/booking/services?salon=${salonSlug}`);
        if (!res.ok) throw new Error("Failed to load services");
        const data = await res.json();
        setServices(data.services);
        setSalon(data.salon);
      } catch {
        setError(
          "Could not load salon information. Please check the link and try again."
        );
      } finally {
        setServicesLoading(false);
      }
    }
    load();
  }, [salonSlug]);

  /* ---- fetch slots when date + service are chosen ---- */
  const fetchSlots = useCallback(
    async (date: string, serviceId: string) => {
      setSlotsLoading(true);
      setSlots([]);
      setSelectedSlot(null);
      try {
        const res = await fetch(
          `/api/booking?salon=${salonSlug}&date=${date}&serviceId=${serviceId}`
        );
        if (!res.ok) throw new Error("Failed to load slots");
        const data = await res.json();
        setSlots(data.slots);
        if (data.salon) setSalon(data.salon);
      } catch {
        setError("Could not load available times.");
      } finally {
        setSlotsLoading(false);
      }
    },
    [salonSlug]
  );

  /* ---- handlers ---- */
  function handleServiceSelect(s: ServiceOption) {
    setSelectedService(s);
    setStep(2);
  }

  function handleDateSelect(iso: string) {
    setSelectedDate(iso);
    if (selectedService) {
      fetchSlots(iso, selectedService.id);
    }
    setStep(3);
  }

  function handleSlotSelect(slot: Slot) {
    setSelectedSlot(slot);
    setStep(4);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !selectedService) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonSlug,
          serviceId: selectedService.id,
          staffId: selectedSlot.staffId,
          date: selectedDate,
          startTime: selectedSlot.time,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Booking failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    setError("");
    if (step > 1) setStep(step - 1);
  }

  /* ---- group slots by staff ---- */
  const slotsByStaff = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    if (!acc[s.staffName]) acc[s.staffName] = [];
    acc[s.staffName].push(s);
    return acc;
  }, {});

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header salonName={salon?.name} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="card max-w-md w-full text-center py-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 animate-bounce">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Booking Confirmed!
            </h2>
            <p className="mt-3 text-gray-600">
              Your appointment with{" "}
              <span className="font-semibold">{selectedSlot?.staffName}</span>{" "}
              on <span className="font-semibold">{selectedDate}</span> at{" "}
              <span className="font-semibold">
                {selectedSlot ? formatTime(selectedSlot.time) : ""}
              </span>{" "}
              has been booked.
            </p>
            {selectedService && (
              <p className="mt-1 text-sm text-gray-500">
                {selectedService.name} &middot; {selectedService.duration} min
              </p>
            )}
            <p className="mt-6 text-sm text-gray-500">
              We&apos;ll send a confirmation to your phone. See you soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header salonName={salon?.name} />

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            {["Service", "Date", "Time", "Details"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && (
                  <ChevronRight className="h-3 w-3 text-gray-300" />
                )}
                <span
                  className={
                    step > i + 1
                      ? "text-brand-600"
                      : step === i + 1
                      ? "text-gray-900 font-semibold"
                      : "text-gray-400"
                  }
                >
                  {step > i + 1 ? `✓ ${label}` : label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 h-1 rounded-full bg-gray-200">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Back button */}
        {step > 1 && (
          <button
            onClick={goBack}
            className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}

        {/* ---- Step 1: Pick Service ---- */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Scissors className="h-5 w-5 text-brand-600" />
              Choose a Service
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Select the service you&apos;d like to book.
            </p>

            {servicesLoading ? (
              <div className="mt-8 flex justify-center">
                <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
              </div>
            ) : services.length === 0 ? (
              <div className="mt-8 card text-center text-gray-500 py-12">
                No services available at this time.
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s)}
                    className="card text-left hover:shadow-md hover:border-brand-300 transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: (s.color || "#d946ef") + "20",
                        }}
                      >
                        <Scissors
                          className="h-5 w-5"
                          style={{ color: s.color || "#d946ef" }}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {s.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {s.duration} min &middot;{" "}
                          {formatPrice(s.price, salon?.currency)}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-brand-600 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- Step 2: Pick Date ---- */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-600" />
              Pick a Date
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Booking{" "}
              <span className="font-medium text-gray-700">
                {selectedService?.name}
              </span>{" "}
              &middot; {selectedService?.duration} min
            </p>

            <div className="mt-6 grid grid-cols-4 sm:grid-cols-7 gap-2">
              {dates.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => handleDateSelect(d.iso)}
                  className={`flex flex-col items-center rounded-xl border-2 px-2 py-3 transition-all hover:shadow-md ${
                    selectedDate === d.iso
                      ? "border-brand-600 bg-brand-50"
                      : "border-gray-200 bg-white hover:border-brand-300"
                  }`}
                >
                  <span className="text-[11px] font-medium uppercase text-gray-500">
                    {d.label}
                  </span>
                  <span className="mt-1 text-lg font-bold text-gray-900">
                    {d.day}
                  </span>
                  <span className="text-[11px] text-gray-500">{d.month}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---- Step 3: Pick Time Slot ---- */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-600" />
              Pick a Time
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedService?.name} &middot; {selectedDate}
            </p>

            {slotsLoading ? (
              <div className="mt-8 flex justify-center">
                <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
              </div>
            ) : Object.keys(slotsByStaff).length === 0 ? (
              <div className="mt-8 card text-center text-gray-500 py-12">
                <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                No available slots on this date. Try another day.
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {Object.entries(slotsByStaff).map(
                  ([staffName, staffSlots]) => (
                    <div key={staffName}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
                          <User className="h-4 w-4 text-brand-600" />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {staffName}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {staffSlots.map((slot) => (
                          <button
                            key={`${slot.staffId}-${slot.time}`}
                            onClick={() => handleSlotSelect(slot)}
                            className={`rounded-full px-4 py-2 text-sm font-medium border-2 transition-all hover:shadow-md ${
                              selectedSlot?.staffId === slot.staffId &&
                              selectedSlot?.time === slot.time
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-gray-200 bg-white text-gray-700 hover:border-brand-400"
                            }`}
                          >
                            {formatTime(slot.time)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* ---- Step 4: Contact Details + Confirm ---- */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-brand-600" />
              Your Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedService?.name} with {selectedSlot?.staffName} &middot;{" "}
              {selectedDate} at{" "}
              {selectedSlot ? formatTime(selectedSlot.time) : ""}
            </p>

            {/* Summary card */}
            <div className="mt-6 rounded-xl bg-brand-50 border border-brand-200 p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Scissors className="h-4 w-4 text-brand-600" />
                    <span className="font-medium">
                      {selectedService?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-brand-600" />
                    <span>{selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-4 w-4 text-brand-600" />
                    <span>
                      {selectedSlot ? formatTime(selectedSlot.time) : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-brand-600" />
                    <span>{selectedSlot?.staffName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-700">
                    {selectedService
                      ? formatPrice(selectedService.price, salon?.currency)
                      : ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedService?.duration} min
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Jane"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-field"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pl-10"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Any special requests or notes..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !firstName || !lastName || !phone}
                className="btn-primary w-full py-3 text-base"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Check className="h-5 w-5 mr-2" />
                )}
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        Powered by{" "}
        <span className="font-semibold text-gray-600">Full Chair</span>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header sub-component                                               */
/* ------------------------------------------------------------------ */

function Header({ salonName }: { salonName?: string }) {
  return (
    <header className="bg-gradient-to-r from-brand-600 to-brand-800 text-white">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-medium text-brand-200">
              Book an Appointment
            </div>
            <h1 className="text-xl font-bold">
              {salonName || "Loading..."}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
