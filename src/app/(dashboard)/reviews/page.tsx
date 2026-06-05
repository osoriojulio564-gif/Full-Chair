"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, MessageSquare, Send } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  response: string | null;
  isPublic: boolean;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
  };
  staff: {
    firstName: string;
    lastName: string;
  };
  appointment: {
    service: {
      name: string;
    };
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

const FILTER_TABS = [
  { label: "All", value: 0 },
  { label: "5 Stars", value: 5 },
  { label: "4 Stars", value: 4 },
  { label: "3 Stars", value: 3 },
  { label: "2 Stars", value: 2 },
  { label: "1 Star", value: 1 },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews =
    filter === 0 ? reviews : reviews.filter((r) => r.rating === filter);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId, response: replyText }),
      });
      if (res.ok) {
        setReplyText("");
        setReplyingTo(null);
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to submit reply:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-heading font-medium text-charcoal">Reviews</h1>
          <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-700">
            {reviews.length}
          </span>
        </div>
      </div>

      {/* Average Rating */}
      {reviews.length > 0 && (
        <div className="card flex items-center gap-4">
          <div className="text-4xl font-heading font-medium text-charcoal">
            {averageRating.toFixed(1)}
          </div>
          <div>
            <StarRating rating={Math.round(averageRating)} />
            <p className="mt-1 text-sm text-gray-500">
              Based on {reviews.length} review{reviews.length !== 1 && "s"}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="card py-12 text-center">
          <Star className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No reviews found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 0
              ? "Reviews will appear here as clients leave feedback."
              : "No reviews match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading font-medium text-charcoal">
                      {review.client.firstName} {review.client.lastName}
                    </h3>
                    <StarRating rating={review.rating} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>{review.appointment.service.name}</span>
                    <span>&middot;</span>
                    <span>
                      with {review.staff.firstName} {review.staff.lastName}
                    </span>
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {timeAgo(review.createdAt)}
                </span>
              </div>

              {review.comment && (
                <p className="mt-3 text-sm text-gray-700">{review.comment}</p>
              )}

              {/* Existing Response */}
              {review.response && (
                <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                  <p className="mb-1 text-xs font-medium text-indigo-700">
                    Your Response
                  </p>
                  <p className="text-sm text-indigo-900">{review.response}</p>
                </div>
              )}

              {/* Reply Section */}
              {!review.response && (
                <div className="mt-3">
                  {replyingTo === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="input-field"
                        rows={3}
                        placeholder="Write your response..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(review.id)}
                          disabled={submittingReply || !replyText.trim()}
                          className="btn-primary inline-flex items-center gap-2 text-sm"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {submittingReply ? "Sending..." : "Send Reply"}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
