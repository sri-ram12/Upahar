"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UtensilsCrossed, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@upahar.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Please check credentials.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-stone-800 border border-stone-700 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-600/30">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            UPAHAR Management Portal
          </h1>
          <p className="text-stone-400 text-xs">
            Sign in to manage orders, live menu items, and business hours
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="p-3 bg-stone-900/80 border border-stone-700 rounded-2xl text-xs text-stone-300 space-y-1">
          <span className="font-bold text-orange-400 block uppercase tracking-wider text-[10px]">
            Default Admin Credentials
          </span>
          <p>Email: <code className="text-amber-200">admin@upahar.com</code></p>
          <p>Password: <code className="text-amber-200">admin123</code></p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl flex items-center space-x-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-700">
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-orange-400 transition"
          >
            ← Back to Customer Website
          </Link>
        </div>
      </div>
    </div>
  );
}
