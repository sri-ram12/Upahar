"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Lock,
  KeyRound,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { TAGARAPUVALASA_LOCALITIES } from "@/lib/delivery-zones";

export default function CustomerAuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, signup, sendOtp, verifyOtp, customer } =
    useCustomerAuth();
  const [mode, setMode] = useState<"OTP" | "SIGNIN" | "SIGNUP">("OTP");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [locality, setLocality] = useState(TAGARAPUVALASA_LOCALITIES[0].name);

  // OTP Flow State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sandboxOtp, setSandboxOtp] = useState<string | null>(null);
  const [isExistingOtpUser, setIsExistingOtpUser] = useState(true);
  const [existingOtpName, setExistingOtpName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen || customer) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const res = await sendOtp(phone);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || "Could not send OTP");
      return;
    }
    setOtpSent(true);
    setIsExistingOtpUser(Boolean(res.isExistingUser));
    setExistingOtpName(res.existingName || null);
    setSandboxOtp(res.sandboxOtp || null);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const res = await verifyOtp({
      phone,
      code: otpCode,
      name: !isExistingOtpUser ? name : undefined,
      address: !isExistingOtpUser ? address : undefined,
      landmark: !isExistingOtpUser ? landmark : undefined,
      locality: !isExistingOtpUser ? locality : undefined,
    });
    setLoading(false);
    if (!res.success) {
      if (res.requiresName) {
        setIsExistingOtpUser(false);
      }
      setErrorMsg(res.error || "OTP verification failed");
    }
  };

  const handleSubmitPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (mode === "SIGNIN") {
      const result = await login(phone, password);
      setLoading(false);
      if (!result.success) {
        setErrorMsg(result.error || "Failed to sign in");
      }
    } else {
      const result = await signup({
        name,
        phone,
        password,
        address,
        landmark,
        locality,
      });
      setLoading(false);
      if (!result.success) {
        setErrorMsg(result.error || "Failed to create account");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 bg-brand-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-950 border border-[#D4AF37]/40 flex items-center justify-center text-[#DFC17B]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display text-white">
                {mode === "OTP"
                  ? "Quick Mobile OTP Login"
                  : mode === "SIGNIN"
                  ? "Password Sign In"
                  : "Create Upahar Account"}
              </h3>
              <span className="text-[11px] text-[#DFC17B] font-medium block">
                Tagarapuvalasa & Sangivalasa Express
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-brand-border bg-brand-cream">
          <button
            type="button"
            onClick={() => {
              setMode("OTP");
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-black transition ${
              mode === "OTP"
                ? "text-brand-700 border-b-2 border-brand-700 bg-white"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            📱 Mobile OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("SIGNIN");
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-black transition ${
              mode === "SIGNIN"
                ? "text-brand-700 border-b-2 border-brand-700 bg-white"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("SIGNUP");
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-black transition ${
              mode === "SIGNUP"
                ? "text-brand-700 border-b-2 border-brand-700 bg-white"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Body */}
        {mode === "OTP" ? (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Mobile Number (10 digits) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  disabled={otpSent}
                  placeholder="e.g. 9885455342"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700 disabled:opacity-60"
                />
              </div>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode("");
                    setSandboxOtp(null);
                    setErrorMsg(null);
                  }}
                  className="text-[11px] font-bold text-brand-700 hover:underline mt-1"
                >
                  Change mobile number
                </button>
              )}
            </div>

            {otpSent && (
              <>
                {sandboxOtp && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-black text-[10px] uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Verification OTP Ready
                      </span>
                      <span className="block mt-0.5">
                        Your 4-digit OTP is <strong className="font-mono text-sm tracking-widest">{sandboxOtp}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(sandboxOtp)}
                      className="px-2.5 py-1 rounded-lg bg-brand-700 text-[#DFC17B] text-[11px] font-black flex-shrink-0"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                {isExistingOtpUser && existingOtpName && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Welcome back, {existingOtpName}! Enter OTP below to sign in.</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Enter 4-Digit OTP *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={4}
                      autoFocus
                      placeholder="• • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center font-mono text-lg font-black tracking-[0.4em] pl-9 pr-3 py-2.5 rounded-xl border-2 border-brand-700 bg-brand-cream text-brand-700 focus:outline-none"
                    />
                  </div>
                </div>

                {!isExistingOtpUser && (
                  <div className="space-y-3 pt-2 border-t border-brand-surface">
                    <span className="text-[11px] font-black text-brand-700 block uppercase tracking-wider">
                      New Account Setup
                    </span>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        Tagarapuvalasa Locality
                      </label>
                      <select
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-cream font-semibold"
                      >
                        {TAGARAPUVALASA_LOCALITIES.map((loc) => (
                          <option key={loc.id} value={loc.name}>
                            {loc.name} ({loc.area})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        Default Delivery Address (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Room 304, ANITS Boys Hostel"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading || phone.replace(/\D/g, "").length < 10}
              className="btn-maroon-gold w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
            >
              <span>
                {loading
                  ? "Processing..."
                  : otpSent
                  ? "Verify OTP & Continue"
                  : "Send 4-Digit Verification OTP"}
              </span>
              <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitPasswordAuth} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === "SIGNUP" && (
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Mobile Number (10 digits) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9885455342"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Password or 4-digit PIN *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter your secret password or PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700"
                />
              </div>
            </div>

            {mode === "SIGNUP" && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Tagarapuvalasa Area / Locality
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-cream font-semibold text-stone-800"
                  >
                    {TAGARAPUVALASA_LOCALITIES.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name} ({loc.area})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Default Room No. / Flat / Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 304, Boys Hostel Block 2, ANITS"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite SBI ATM, near college gate"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-maroon-gold w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] transition"
            >
              <span>
                {loading
                  ? "Processing..."
                  : mode === "SIGNIN"
                  ? "Sign In & Continue"
                  : "Create Customer Account"}
              </span>
              <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
