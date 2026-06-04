"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Scissors,
  Users,
  ChevronRight,
  Calendar,
  Loader2,
  Quote,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  bio: string | null;
  avatar: string | null;
}

interface ServiceItem {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string | null;
  color: string | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  client: { firstName: string; lastName: string };
}

interface SalonData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string;
  address: string | null;
  city: string | null;
  country: string | null;
  openTime: string;
  closeTime: string;
  currency: string;
  plan: string;
  brandColor: string | null;
  tagline: string | null;
  heroImage: string | null;
  gallery: string | null;
  staff: StaffMember[];
  services: ServiceItem[];
  reviews: ReviewItem[];
  avgRating: number;
  _count: { reviews: number; clients: number };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount
  );
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "147, 51, 234";
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${
        i < Math.round(rating)
          ? "fill-yellow-400 text-yellow-400"
          : "text-gray-300"
      }`}
    />
  ));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SalonPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/salon/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Salon not found");
            return;
          }
          throw new Error("Failed to load salon");
        }
        const data = await res.json();

        // If STARTER plan, redirect to booking page
        if (data.salon.plan === "STARTER") {
          router.replace(`/book/${slug}`);
          return;
        }

        setSalon(data.salon);
      } catch {
        setError("Could not load salon. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading salon...</p>
        </div>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <Scissors className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            {error || "Salon not found"}
          </h1>
          <p className="mt-2 text-gray-500">
            The salon page you are looking for does not exist or is unavailable.
          </p>
        </div>
      </div>
    );
  }

  const brandColor = salon.brandColor || "#9333ea";
  const brandRgb = hexToRgb(brandColor);
  const bookUrl = `/book/${slug}`;

  // Group services by category
  const servicesByCategory = salon.services.reduce<
    Record<string, ServiceItem[]>
  >((acc, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================ */}
      {/*  HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 40%, ${brandColor}99 100%)`,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-10"
            style={{ backgroundColor: "#ffffff" }}
          />
          <div
            className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full opacity-10"
            style={{ backgroundColor: "#ffffff" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-5"
            style={{ backgroundColor: "#ffffff" }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28 lg:py-36">
          <div className="flex flex-col items-center text-center">
            {/* Logo / Initials */}
            <div
              className="flex h-24 w-24 items-center justify-center rounded-2xl shadow-2xl mb-8"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(12px)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <span className="text-3xl font-black text-white tracking-tight">
                {salon.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>

            {/* Salon name */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {salon.name}
            </h1>

            {/* Tagline */}
            {salon.tagline && (
              <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-lg font-light italic">
                {salon.tagline}
              </p>
            )}

            {/* Rating + Reviews */}
            {salon._count.reviews > 0 && (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(salon.avgRating)}
                </div>
                <span className="text-white font-bold text-lg">
                  {salon.avgRating}
                </span>
                <span className="text-white/70 text-sm">
                  ({salon._count.reviews}{" "}
                  {salon._count.reviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {/* Location */}
            {(salon.address || salon.city) && (
              <div className="mt-4 flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="h-4 w-4" />
                <span>
                  {[salon.address, salon.city, salon.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}

            {/* CTA */}
            <a
              href={bookUrl}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-100"
              style={{ color: brandColor }}
            >
              <Calendar className="h-5 w-5" />
              Book Your Appointment
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 80L48 74.7C96 69 192 59 288 48C384 37 480 27 576 32C672 37 768 59 864 64C960 69 1056 59 1152 48C1248 37 1344 27 1392 21.3L1440 16V80H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SERVICES SECTION                                             */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
              style={{
                backgroundColor: `rgba(${brandRgb}, 0.1)`,
                color: brandColor,
              }}
            >
              <Sparkles className="h-4 w-4" />
              Our Services
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              What We Offer
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Browse our complete menu of beauty and grooming services.
            </p>
          </div>

          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div key={category} className="mb-12 last:mb-0">
              <h3
                className="text-sm font-bold uppercase tracking-widest mb-6"
                style={{ color: brandColor }}
              >
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${service.color || brandColor}18`,
                          }}
                        >
                          <Scissors
                            className="h-5 w-5"
                            style={{ color: service.color || brandColor }}
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {service.name}
                          </h4>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration} min
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-lg font-black"
                          style={{ color: brandColor }}
                        >
                          {formatPrice(service.price, salon.currency)}
                        </span>
                      </div>
                    </div>
                    <a
                      href={bookUrl}
                      className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold transition-all opacity-0 group-hover:opacity-100 text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      Book Now
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TEAM SECTION                                                 */}
      {/* ============================================================ */}
      {salon.staff.length > 0 && (
        <section
          className="py-16 sm:py-24"
          style={{ backgroundColor: `rgba(${brandRgb}, 0.03)` }}
        >
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
                style={{
                  backgroundColor: `rgba(${brandRgb}, 0.1)`,
                  color: brandColor,
                }}
              >
                <Users className="h-4 w-4" />
                Our Team
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Meet the Experts
              </h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                Our talented team is here to make you look and feel your best.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {salon.staff.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className="h-3"
                    style={{
                      background: `linear-gradient(90deg, ${brandColor}, ${brandColor}99)`,
                    }}
                  />
                  <div className="p-6 text-center">
                    {/* Avatar */}
                    <div
                      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white text-2xl font-black shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)`,
                      }}
                    >
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(member.firstName, member.lastName)
                      )}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-gray-900">
                      {member.firstName} {member.lastName}
                    </h3>
                    <span
                      className="inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: `rgba(${brandRgb}, 0.1)`,
                        color: brandColor,
                      }}
                    >
                      {member.role}
                    </span>
                    {member.bio && (
                      <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  REVIEWS SECTION                                              */}
      {/* ============================================================ */}
      {salon.reviews.length > 0 && (
        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
                style={{
                  backgroundColor: `rgba(${brandRgb}, 0.1)`,
                  color: brandColor,
                }}
              >
                <Star className="h-4 w-4" />
                Reviews
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                What Our Clients Say
              </h2>
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(salon.avgRating)}
                </div>
                <span className="text-2xl font-black text-gray-900">
                  {salon.avgRating}
                </span>
                <span className="text-gray-500">
                  based on {salon._count.reviews}{" "}
                  {salon._count.reviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {salon.reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Quote
                    className="h-8 w-8 mb-3 opacity-20"
                    style={{ color: brandColor }}
                  />
                  {review.comment && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold"
                        style={{ backgroundColor: brandColor }}
                      >
                        {getInitials(
                          review.client.firstName,
                          review.client.lastName
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {review.client.firstName} {review.client.lastName.charAt(0)}.
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  CONTACT / LOCATION SECTION                                   */}
      {/* ============================================================ */}
      <section
        className="py-16 sm:py-24"
        style={{ backgroundColor: `rgba(${brandRgb}, 0.03)` }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
              style={{
                backgroundColor: `rgba(${brandRgb}, 0.1)`,
                color: brandColor,
              }}
            >
              <MapPin className="h-4 w-4" />
              Visit Us
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Get in Touch
            </h2>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div
                className="h-2"
                style={{
                  background: `linear-gradient(90deg, ${brandColor}, ${brandColor}66)`,
                }}
              />
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Address */}
                  {(salon.address || salon.city) && (
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
                        style={{
                          backgroundColor: `rgba(${brandRgb}, 0.1)`,
                        }}
                      >
                        <MapPin className="h-5 w-5" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          Address
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {salon.address}
                          {salon.address && salon.city && <br />}
                          {salon.city}
                          {salon.country && `, ${salon.country}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {salon.phone && (
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
                        style={{
                          backgroundColor: `rgba(${brandRgb}, 0.1)`,
                        }}
                      >
                        <Phone className="h-5 w-5" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          Phone
                        </h4>
                        <a
                          href={`tel:${salon.phone}`}
                          className="mt-1 text-sm text-gray-600 hover:underline block"
                        >
                          {salon.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {salon.email && (
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
                        style={{
                          backgroundColor: `rgba(${brandRgb}, 0.1)`,
                        }}
                      >
                        <Mail className="h-5 w-5" style={{ color: brandColor }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          Email
                        </h4>
                        <a
                          href={`mailto:${salon.email}`}
                          className="mt-1 text-sm text-gray-600 hover:underline block"
                        >
                          {salon.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
                      style={{
                        backgroundColor: `rgba(${brandRgb}, 0.1)`,
                      }}
                    >
                      <Clock className="h-5 w-5" style={{ color: brandColor }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        Business Hours
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {formatTime(salon.openTime)} &ndash;{" "}
                        {formatTime(salon.closeTime)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Monday &ndash; Saturday
                      </p>
                    </div>
                  </div>
                </div>

                {/* Book CTA inside contact */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <a
                    href={bookUrl}
                    className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-all hover:shadow-lg hover:scale-105 active:scale-100"
                    style={{ backgroundColor: brandColor }}
                  >
                    <Calendar className="h-4 w-4" />
                    Book Your Appointment
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-gray-400">
            Powered by{" "}
            <span className="font-semibold text-gray-600">Full Chair</span>
          </p>
          <p className="mt-1 text-xs text-gray-300">
            Beauty salon management made simple
          </p>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*  FLOATING BOOK NOW CTA                                        */}
      {/* ============================================================ */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={bookUrl}
          className="flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-2xl transition-all hover:scale-110 active:scale-100"
          style={{
            backgroundColor: brandColor,
            boxShadow: `0 8px 32px rgba(${brandRgb}, 0.4)`,
          }}
        >
          <Calendar className="h-5 w-5" />
          Book Now
        </a>
      </div>
    </div>
  );
}
