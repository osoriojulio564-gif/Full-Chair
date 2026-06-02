"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Star, Send, CheckCircle, Scissors, Loader2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ReviewPage() {
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  /* ---- state ---- */
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* ---- handlers ---- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
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
        return;
      }

      if (res.status === 404) {
        setError(
          "Appointment not found. Please check the link and try again."
        );
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const displayRating = hoveredRating || rating;

  /* ================================================================ */
  /*  Render - Success                                                 */
  /* ================================================================ */

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="card max-w-md w-full text-center py-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600 animate-bounce" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Thank you for your feedback!
            </h2>
            <p className="mt-3 text-gray-600">
              Your {rating}-star review has been submitted. We appreciate you
              taking the time to share your experience.
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
      </div>
    );
  }

  /* ================================================================ */
  /*  Render - Form                                                    */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              How was your visit?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              We&apos;d love to hear about your experience. Your feedback helps
              us improve.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tap a star to rate
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform duration-150 hover:scale-110 focus:outline-none focus:scale-110"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-10 w-10 transition-colors duration-150 ${
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
                <p className="mt-2 text-sm text-gray-500">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Great"}
                  {rating === 5 && "Excellent!"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Tell us about your experience..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="btn-primary w-full py-3 text-base"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
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

function Header() {
  return (
    <header className="bg-gradient-to-r from-brand-600 to-brand-800 text-white">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-medium text-brand-200">
              Leave a Review
            </div>
            <h1 className="text-xl font-bold">Full Chair</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
