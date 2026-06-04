"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Star,
  Send,
  CheckCircle,
  Scissors,
  Loader2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AppointmentInfo {
  id: string;
  salonName: string;
  serviceName: string;
  staffName: string;
  clientName: string;
  googlePlaceId: string | null;
  plan: string;
  hasReview: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FeedbackPage() {
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  /* ---- state ---- */
  const [step, setStep] = useState<"loading" | "rate" | "submitting" | "result">("loading");
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  /* ---- load appointment info ---- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/feedback/${appointmentId}`);
        if (!res.ok) {
          const data = await res.json();
          setLoadError(data.error || "Unable to load appointment.");
          return;
        }
        const data = await res.json();
        if (data.appointment.hasReview) {
          setLoadError("You have already submitted feedback for this appointment.");
          return;
        }
        setAppointment(data.appointment);
        setStep("rate");
      } catch {
        setLoadError("Something went wrong. Please try again later.");
      }
    }
    load();
  }, [appointmentId]);

  /* ---- submit review ---- */
  async function handleSubmit() {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setStep("submitting");
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (res.status === 409) {
        setError("You have already submitted a review for this appointment.");
        setStep("rate");
        return;
      }

      if (res.status === 404) {
        setError("Appointment not found. Please check the link and try again.");
        setStep("rate");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setStep("result");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setStep("rate");
    }
  }

  const displayRating = hoveredRating || rating;
  const isHighRating = rating >= 4;
  const googleReviewUrl = appointment?.googlePlaceId
    ? `https://search.google.com/local/writereview?placeid=${appointment.googlePlaceId}`
    : null;

  /* ================================================================ */
  /*  Render - Loading                                                 */
  /* ================================================================ */

  if (step === "loading") {
    if (loadError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header salonName={null} />
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="card max-w-md w-full text-center py-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <MessageSquare className="h-8 w-8 text-red-500" />
              </div>
              <p className="mt-6 text-gray-600">{loadError}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header salonName={null} />
        <div className="flex-1 flex items-center justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Render - Result (High Rating: 4-5 stars)                         */
  /* ================================================================ */

  if (step === "result" && isHighRating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header salonName={appointment?.salonName ?? null} />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="card max-w-md w-full text-center py-10 animate-fade-in">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600 animate-bounce" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Thank you, {appointment?.clientName}!
            </h2>
            <p className="mt-3 text-gray-600">
              We&apos;re thrilled you had a great experience. Your {rating}-star
              review means the world to us!
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            {googleReviewUrl && (
              <div className="mt-8 border-t border-gray-100 pt-8">
                <p className="text-gray-700 font-medium">
                  Would you mind sharing on Google too?
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  It helps other people discover {appointment?.salonName}.
                </p>
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium shadow-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <ExternalLink className="h-5 w-5" />
                  Leave a Google Review
                </a>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ================================================================ */
  /*  Render - Result (Low Rating: 1-3 stars)                          */
  /* ================================================================ */

  if (step === "result" && !isHighRating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header salonName={appointment?.salonName ?? null} />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="card max-w-md w-full text-center py-10 animate-fade-in">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <MessageSquare className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Thank you for your feedback
            </h2>
            <p className="mt-3 text-gray-600">
              We appreciate your honesty, {appointment?.clientName}. We&apos;ll
              use this to improve your next visit.
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {comment.trim() && (
              <p className="mt-4 text-sm text-gray-500 italic">
                &ldquo;{comment.trim()}&rdquo;
              </p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ================================================================ */
  /*  Render - Rating Form                                             */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header salonName={appointment?.salonName ?? null} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              How was your visit?
            </h2>
            {appointment && (
              <p className="mt-2 text-sm text-gray-500">
                Hi {appointment.clientName}! Tell us about your{" "}
                <span className="font-medium text-gray-700">
                  {appointment.serviceName}
                </span>{" "}
                with{" "}
                <span className="font-medium text-gray-700">
                  {appointment.staffName}
                </span>
                .
              </p>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Star Rating */}
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tap a star to rate
              </label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setError("");
                    }}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-all duration-200 hover:scale-125 focus:outline-none focus:scale-125 active:scale-110 p-1"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-12 w-12 sm:h-10 sm:w-10 transition-colors duration-150 ${
                        star <= displayRating
                          ? star <= rating && hoveredRating === 0
                            ? "fill-yellow-400 text-yellow-400"
                            : star <= hoveredRating
                            ? "fill-yellow-300 text-yellow-300"
                            : "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-3 text-sm font-medium text-gray-600 transition-all duration-200">
                  {rating === 1 && "We're sorry to hear that"}
                  {rating === 2 && "We can do better"}
                  {rating === 3 && "Thanks for the feedback"}
                  {rating === 4 && "Glad you enjoyed it!"}
                  {rating === 5 && "Amazing! We're so glad!"}
                </p>
              )}
            </div>

            {/* Comment - always shown but emphasized for low ratings */}
            {rating > 0 && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {rating <= 3
                    ? "What could we improve?"
                    : "Any comments?"}{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={rating <= 3 ? 4 : 3}
                  className="input-field resize-none"
                  placeholder={
                    rating <= 3
                      ? "We'd love to know how we can do better..."
                      : "Tell us about your experience..."
                  }
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={step === "submitting" || rating === 0}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === "submitting" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header sub-component                                               */
/* ------------------------------------------------------------------ */

function Header({ salonName }: { salonName: string | null }) {
  return (
    <header className="bg-gradient-to-r from-brand-600 to-brand-800 text-white">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-medium text-brand-200">
              Share Your Experience
            </div>
            <h1 className="text-xl font-bold">
              {salonName || "Full Chair"}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer sub-component                                               */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
      Powered by{" "}
      <span className="font-semibold text-gray-600">Full Chair</span>
    </footer>
  );
}
