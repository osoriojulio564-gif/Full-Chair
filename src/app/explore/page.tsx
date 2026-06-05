"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Star,
  Search,
  MapPin,
  Users,
  Scissors,
  ChevronRight,
  Crown,
  Filter,
} from "lucide-react";

interface Salon {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  logo: string | null;
  coverImage: string | null;
  avgRating: number;
  reviewCount: number;
  clientCount: number;
  staffCount: number;
  serviceCount: number;
  categories: string[];
  priceRange: { min: number; max: number } | null;
  plan: string;
}

const SERVICE_CATEGORIES = ["Hair", "Nails", "Color", "Skin", "Makeup"];

const SORT_OPTIONS = [
  { value: "rating", label: "Best Rated" },
  { value: "name", label: "Name A-Z" },
  { value: "newest", label: "Newest" },
];

const PLACEHOLDER_GRADIENTS = [
  "from-brand-400 to-brand-700",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-red-600",
  "from-emerald-400 to-teal-600",
  "from-brand-500 to-amber-700",
  "from-stone-400 to-stone-700",
];

function getGradient(name: string): string {
  const index = name.charCodeAt(0) % PLACEHOLDER_GRADIENTS.length;
  return PLACEHOLDER_GRADIENTS[index];
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700">{rating > 0 ? rating.toFixed(1) : "--"}</span>
      <span className="text-sm text-gray-400">({count})</span>
    </div>
  );
}

function SalonCard({ salon }: { salon: Salon }) {
  const isPremium = salon.plan === "PREMIUM";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-warm-sm transition-all duration-300 hover:shadow-warm hover:-translate-y-1">
      {/* Cover image */}
      <div className="relative h-48 w-full overflow-hidden">
        {salon.coverImage ? (
          <img
            src={salon.coverImage}
            alt={salon.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getGradient(salon.name)}`}
          >
            <span className="text-5xl font-heading font-medium text-white/80">
              {salon.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Premium badge */}
        {isPremium && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-bold text-amber-900 shadow-lg">
            <Crown className="h-3.5 w-3.5" />
            Premium
          </div>
        )}

        {/* Logo overlay */}
        {salon.logo && (
          <div className="absolute bottom-3 left-3">
            <img
              src={salon.logo}
              alt=""
              className="h-12 w-12 rounded-sm border-2 border-white object-cover shadow-warm-sm"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-heading font-medium text-charcoal group-hover:text-brand-600 transition-colors">
          {salon.name}
        </h3>

        {(salon.city || salon.address) && (
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {salon.city}
              {salon.country ? `, ${salon.country}` : ""}
            </span>
          </div>
        )}

        <div className="mt-3">
          <StarRating rating={salon.avgRating} count={salon.reviewCount} />
        </div>

        {/* Categories */}
        {salon.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {salon.categories.slice(0, 4).map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
              >
                {cat}
              </span>
            ))}
            {salon.categories.length > 4 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                +{salon.categories.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          {salon.priceRange && (
            <span className="font-medium text-gray-700">
              ${salon.priceRange.min} - ${salon.priceRange.max}
            </span>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>
              {salon.staffCount} {salon.staffCount === 1 ? "stylist" : "stylists"}
            </span>
          </div>
        </div>

        {salon.description && (
          <p className="mt-3 text-sm text-gray-500 line-clamp-2">{salon.description}</p>
        )}

        {/* Book button */}
        <div className="mt-auto pt-5">
          <Link
            href={`/book/${salon.slug}`}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            Book Now
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [citySearch, setCitySearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("rating");

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (citySearch.trim()) params.set("city", citySearch.trim());
      if (activeCategory) params.set("service", activeCategory);
      params.set("sort", sort);

      const res = await fetch(`/api/explore?${params.toString()}`);
      const data = await res.json();
      setSalons(data.salons || []);
    } catch {
      setSalons([]);
    } finally {
      setLoading(false);
    }
  }, [citySearch, activeCategory, sort]);

  useEffect(() => {
    const debounce = setTimeout(fetchSalons, 300);
    return () => clearTimeout(debounce);
  }, [fetchSalons]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-sm bg-brand-500" />
              <span className="text-xl font-heading font-medium text-charcoal">Full Chair</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Salon Login
              </Link>
              <Link href="/register" className="btn-primary">
                List Your Salon
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-charcoal py-16 sm:py-24">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-heading font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find your perfect salon
          </h1>
          <p className="mt-4 text-lg text-brand-200 sm:text-xl">
            Book appointments at top-rated salons near you
          </p>

          {/* Search bar */}
          <div className="mt-10 mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city or location..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full rounded-sm border-0 bg-white py-4 pl-12 pr-4 text-base text-charcoal shadow-warm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-300/50"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-white text-brand-700 shadow-lg"
                    : "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sort bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span className="font-medium text-gray-700">
                {loading ? "Searching..." : `${salons.length} salon${salons.length !== 1 ? "s" : ""} found`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
              <div className="flex rounded-sm border border-gray-200 bg-gray-50 p-0.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                      sort === opt.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Salon grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-sm border border-gray-200 bg-white overflow-hidden"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="h-10 w-full rounded-sm bg-gray-200 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : salons.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {salons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
              <Scissors className="h-12 w-12 text-brand-300" />
            </div>
            <h3 className="mt-6 text-xl font-heading font-medium text-charcoal">No salons found</h3>
            <p className="mt-2 max-w-md text-gray-600">
              {citySearch
                ? `We couldn't find any salons in "${citySearch}". Try a different city or clear your search.`
                : "No salons are listed yet. Check back soon!"}
            </p>
            {citySearch && (
              <button
                onClick={() => {
                  setCitySearch("");
                  setActiveCategory(null);
                }}
                className="btn-secondary mt-6"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-sm bg-brand-500" />
              <span className="text-sm font-semibold text-gray-700">Powered by Full Chair</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Home
              </Link>
              <Link href="/register" className="hover:text-gray-700 transition-colors">
                List Your Salon
              </Link>
              <Link href="/login" className="hover:text-gray-700 transition-colors">
                Salon Login
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Full Chair
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
