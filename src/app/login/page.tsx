"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-sm bg-gradient-to-br from-brand-500 to-brand-700" />
          <h1 className="mt-4 text-2xl font-heading font-medium text-charcoal">Welcome back</h1>
          <p className="mt-2 text-sm text-charcoal/60">Sign in to your Full Chair account</p>
        </div>
        <form onSubmit={handleSubmit} className="card shadow-warm space-y-4">
          {error && <div className="rounded-sm bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1">Email</label>
            <input name="email" type="email" required className="input-field" placeholder="you@salon.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1">Password</label>
            <input name="password" type="password" required className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-sm text-charcoal/60">
            No account?{" "}
            <Link href="/register" className="font-medium text-brand-600 hover:text-brand-500">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
