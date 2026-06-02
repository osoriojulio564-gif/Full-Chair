import Link from "next/link";
import { Calendar, MessageSquare, Star, Bell, Users, Scissors, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  { icon: Calendar, title: "Online Booking", desc: "Clients book 24/7 like OpenTable. Pick service, stylist, time — done." },
  { icon: MessageSquare, title: "WhatsApp Automation", desc: "Auto-confirm, remind, and follow up via WhatsApp. Zero manual work." },
  { icon: Bell, title: "Instant Notifications", desc: "Real-time alerts for bookings, cancellations, and reviews." },
  { icon: Star, title: "Ratings & Reviews", desc: "Collect feedback automatically. Showcase your best reviews." },
  { icon: Users, title: "Client CRM", desc: "Full client history, preferences, notes, and tags." },
  { icon: Scissors, title: "Staff Management", desc: "Individual schedules, performance, and service assignments." },
];

const benefits = [
  "No more double bookings",
  "WhatsApp reminders reduce no-shows by 60%",
  "Clients book themselves 24/7",
  "Revenue analytics in one place",
  "Automatic review collection",
  "Works on any device",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700" />
              <span className="text-xl font-bold text-gray-900">Full Chair</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-purple-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Your salon,{" "}
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">always full</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The all-in-one CRM for beauty salons. Online booking, WhatsApp automations,
              client management, reviews, and real-time notifications.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-base px-8 py-3">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="#features" className="btn-secondary text-base px-8 py-3">See Features</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything your salon needs</h2>
            <p className="mt-4 text-lg text-gray-600">Built specifically for beauty professionals.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
                  <f.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why salons choose Full Chair</h2>
              <div className="mt-8 space-y-4">
                {benefits.map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
              <div className="text-center py-8">
                <div className="text-5xl font-bold">60%</div>
                <div className="mt-2 text-brand-200">fewer no-shows</div>
                <div className="mt-8 text-5xl font-bold">3x</div>
                <div className="mt-2 text-brand-200">more reviews</div>
                <div className="mt-8 text-5xl font-bold">24/7</div>
                <div className="mt-2 text-brand-200">online booking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Ready to fill every chair?</h2>
          <p className="mt-4 text-lg text-gray-600">Join salons already using Full Chair to grow.</p>
          <Link href="/register" className="btn-primary text-base px-8 py-3 mt-8 inline-flex">
            Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Full Chair. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
