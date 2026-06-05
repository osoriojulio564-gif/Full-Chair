"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salonName: fd.get("salonName"),
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        password: fd.get("password"),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-sm bg-gradient-to-br from-brand-500 to-brand-700" />
          <h1 className="mt-4 text-2xl font-heading font-medium text-charcoal">Create your salon</h1>
          <p className="mt-2 text-sm text-charcoal/60">Get started with Full Chair in 2 minutes</p>
        </div>
        <form onSubmit={handleSubmit} className="card shadow-warm space-y-4">
          {error && <div className="rounded-sm bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1">Salon Name</label>
            <input name="salonName" required className="input-field" placeholder="Glamour Studio" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">First Name</label>
              <input name="firstName" required className="input-field" placeholder="Maria" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">Last Name</label>
              <input name="lastName" required className="input-field" placeholder="Garcia" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1">Email</label>
            <input name="email" type="email" required className="input-field" placeholder="maria@salon.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1">Phone (WhatsApp)</label>
            <input name="phone" type="tel" required className="input-field" placeholder="+1 555 123 4567" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1">Password</label>
            <input name="password" type="password" required minLength={8} className="input-field" placeholder="Min 8 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            {loading ? "Creating..." : "Create Salon"}
          </button>
          <p className="text-center text-sm text-charcoal/60">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-500">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
