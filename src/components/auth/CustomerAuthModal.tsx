"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  KeyRound,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  MapPin,
  Trash2,
  Plus,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { TAGARAPUVALASA_LOCALITIES } from "@/lib/delivery-zones";

type AuthMode = "OTP" | "SIGNIN" | "SIGNUP" | "VERIFY_EMAIL" | "RESET_PASSWORD";

function GoogleLogoSvg() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

export default function CustomerAuthModal() {
  const pathname = usePathname();
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    providers,
    authBannerError,
    setAuthBannerError,
    login,
    signup,
    sendOtp,
    verifyOtp,
    updateProfile,
    saveAddress,
    deleteAddress,
    logout,
    customer,
  } = useCustomerAuth();

  const [mode, setMode] = useState<AuthMode>("OTP");
  const [otpChannel, setOtpChannel] = useState<"EMAIL" | "SMS">("EMAIL");

  // Profile & Address Management State (when customer is signed in)
  const [profileNameDraft, setProfileNameDraft] = useState<string | null>(null);
  const [profilePhoneDraft, setProfilePhoneDraft] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState("Hostel");
  const [newAddrLine, setNewAddrLine] = useState("");
  const [newAddrLandmark, setNewAddrLandmark] = useState("");
  const [newAddrLocality, setNewAddrLocality] = useState(TAGARAPUVALASA_LOCALITIES[0].name);
  const [savingAddr, setSavingAddr] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [locality, setLocality] = useState(TAGARAPUVALASA_LOCALITIES[0].name);

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sandboxOtp, setSandboxOtp] = useState<string | null>(null);
  const [otpInfoMsg, setOtpInfoMsg] = useState<string | null>(null);
  const [isExistingOtpUser, setIsExistingOtpUser] = useState(true);
  const [existingOtpName, setExistingOtpName] = useState<string | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const t = setTimeout(() => setCooldownSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldownSec]);

  if (!isAuthModalOpen) return null;

  if (customer) {
    const profileName = profileNameDraft ?? customer.name ?? "";
    const profilePhone = profilePhoneDraft ?? customer.phone ?? "";

    const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setProfileSaving(true);
      setProfileMsg(null);
      setErrorMsg(null);
      const res = await updateProfile({ name: profileName, phone: profilePhone });
      setProfileSaving(false);
      if (res.success) {
        setProfileNameDraft(null);
        setProfilePhoneDraft(null);
        setProfileMsg("Account details saved.");
      } else {
        setErrorMsg(res.error || "Could not update profile.");
      }
    };

    const handleAddSavedAddress = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newAddrLine.trim()) return;
      setSavingAddr(true);
      setErrorMsg(null);
      const loc = TAGARAPUVALASA_LOCALITIES.find((l) => l.name === newAddrLocality);
      const res = await saveAddress({
        label: newAddrLabel || "Home",
        address: newAddrLine.trim(),
        landmark: newAddrLandmark.trim() || undefined,
        locality: newAddrLocality,
        lat: loc?.lat ?? null,
        lng: loc?.lng ?? null,
        distanceKm: loc?.distanceKm ?? null,
        isDefault: (customer.addresses?.length || 0) === 0,
      });
      setSavingAddr(false);
      if (res.success) {
        setNewAddrLine("");
        setNewAddrLandmark("");
        setShowAddAddress(false);
      } else {
        setErrorMsg(res.error || "Failed to save address.");
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden animate-in zoom-in-95 duration-200 my-4 max-h-[92vh] overflow-y-auto">
          <div className="bg-brand-700 p-5 text-white flex justify-between items-center sticky top-0 z-10">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#DFC17B] block">
                {customer.authProvider === "GOOGLE" || customer.authProvider === "HYBRID"
                  ? "Google Verified Account"
                  : customer.emailVerified
                  ? "Verified Customer Account"
                  : "Upahar Customer Account"}
              </span>
              <h3 className="text-lg font-black font-display truncate">{customer.name}</h3>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {profileMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}

            {/* Account Summary & Quick Edit */}
            <form onSubmit={handleSaveProfile} className="space-y-3 bg-[#FAF8F4] p-4 rounded-2xl border border-brand-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-brand-950 uppercase tracking-wider text-[10px]">
                  Profile &amp; Contact
                </span>
                {customer.email && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate max-w-[170px]">{customer.email}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileNameDraft(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-brand-border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    Mobile Number (for Delivery)
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={profilePhone}
                    onChange={(e) => setProfilePhoneDraft(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-brand-border bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="px-4 py-2 rounded-xl bg-brand-700 text-[#DFC17B] text-xs font-black hover:opacity-95 transition cursor-pointer disabled:opacity-50"
              >
                {profileSaving ? "Saving..." : "Save Profile"}
              </button>
            </form>

            {/* Saved Delivery Addresses */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-700" />
                  <span>Saved Delivery Addresses ({customer.addresses?.length || 0})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="text-[11px] font-black text-brand-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddAddress ? "Cancel" : "Add Address"}</span>
                </button>
              </div>

              {showAddAddress && (
                <form
                  onSubmit={handleAddSavedAddress}
                  className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-brand-border space-y-2.5"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Label (Hostel / Home)"
                      value={newAddrLabel}
                      onChange={(e) => setNewAddrLabel(e.target.value)}
                      className="text-xs px-2.5 py-2 rounded-xl border border-brand-border bg-white"
                    />
                    <select
                      value={newAddrLocality}
                      onChange={(e) => setNewAddrLocality(e.target.value)}
                      className="text-xs px-2.5 py-2 rounded-xl border border-brand-border bg-white font-semibold"
                    >
                      {TAGARAPUVALASA_LOCALITIES.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name} (~{loc.distanceKm}km)
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Room No. / Flat / Street Address *"
                    value={newAddrLine}
                    onChange={(e) => setNewAddrLine(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-brand-border bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Nearby Landmark (optional)"
                    value={newAddrLandmark}
                    onChange={(e) => setNewAddrLandmark(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-brand-border bg-white"
                  />
                  <button
                    type="submit"
                    disabled={savingAddr}
                    className="btn-maroon-gold w-full py-2.5 rounded-xl text-xs font-black cursor-pointer"
                  >
                    {savingAddr ? "Saving..." : "Save Delivery Address"}
                  </button>
                </form>
              )}

              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {customer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-3 rounded-xl border border-brand-border bg-white flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-brand-700/10 text-brand-700 font-black text-[10px]">
                            {addr.label}
                          </span>
                          <span className="text-[10px] text-stone-400 font-bold truncate">
                            {addr.locality}
                          </span>
                        </div>
                        <p className="text-stone-700 font-semibold mt-1 line-clamp-2">{addr.address}</p>
                        {addr.landmark && (
                          <p className="text-[10px] text-stone-400">Landmark: {addr.landmark}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteAddress(addr.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition flex-shrink-0 cursor-pointer"
                        title="Remove address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-stone-500 bg-stone-50 border border-stone-200 rounded-xl p-3">
                  No saved addresses yet. Add your Hostel or Home address for 1-tap checkout within 7km!
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-brand-border">
              <Link
                href="/orders"
                onClick={() => setIsAuthModalOpen(false)}
                className="btn-maroon-gold py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#DFC17B]" />
                <span>My Orders</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsAuthModalOpen(false);
                }}
                className="py-2.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeError = errorMsg || authBannerError;

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtpCode("");
    setSandboxOtp(null);
    setOtpInfoMsg(null);
    setErrorMsg(null);
    setAuthBannerError(null);
  };

  const handleGoogleUnconfigured = () => {
    setErrorMsg(
      "Google Sign-In requires GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET configured in .env / Render. Meanwhile, use Email OTP or Mobile OTP below."
    );
    setAuthBannerError(null);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setAuthBannerError(null);
    setLoading(true);

    const purpose =
      mode === "VERIFY_EMAIL"
        ? "VERIFY_EMAIL"
        : mode === "RESET_PASSWORD"
        ? "RESET_PASSWORD"
        : undefined;

    const channelToSend =
      mode === "VERIFY_EMAIL" || mode === "RESET_PASSWORD" ? "EMAIL" : otpChannel;

    const res = await sendOtp({
      channel: channelToSend,
      email: channelToSend === "EMAIL" ? email : undefined,
      phone: channelToSend === "SMS" ? phone : undefined,
      purpose,
    });
    setLoading(false);

    if (!res.success) {
      if (res.retryAfterSeconds) setCooldownSec(res.retryAfterSeconds);
      setErrorMsg(res.error || "Could not send OTP");
      return;
    }

    setOtpSent(true);
    setCooldownSec(25);
    setIsExistingOtpUser(Boolean(res.isExistingUser));
    setExistingOtpName(res.existingName || null);
    setSandboxOtp(res.sandboxOtp || null);
    setOtpInfoMsg(res.message || null);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setAuthBannerError(null);
    setLoading(true);

    const channelToVerify =
      mode === "VERIFY_EMAIL" || mode === "RESET_PASSWORD" ? "EMAIL" : otpChannel;
    const purposeToVerify =
      mode === "VERIFY_EMAIL"
        ? "VERIFY_EMAIL"
        : mode === "RESET_PASSWORD"
        ? "RESET_PASSWORD"
        : undefined;

    const res = await verifyOtp({
      channel: channelToVerify,
      email: channelToVerify === "EMAIL" ? email : undefined,
      phone: channelToVerify === "SMS" ? phone : undefined,
      code: otpCode,
      purpose: purposeToVerify,
      name: !isExistingOtpUser ? name : undefined,
      newPassword: mode === "RESET_PASSWORD" ? newPassword : undefined,
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
    setAuthBannerError(null);
    setLoading(true);

    if (mode === "SIGNIN") {
      const result = await login(identifier, password);
      setLoading(false);
      if (!result.success) {
        setErrorMsg(result.error || "Failed to sign in");
        return;
      }
      if (result.requiresEmailVerification && result.email) {
        setEmail(result.email);
        setOtpChannel("EMAIL");
        setOtpSent(true);
        setOtpCode("");
        setSandboxOtp(result.sandboxOtp || null);
        setOtpInfoMsg(result.message || null);
        setCooldownSec(25);
        setMode("VERIFY_EMAIL");
      }
      return;
    }

    // Registration (SIGNUP) -> automatically triggers 6-digit Email OTP verification
    const result = await signup({
      name,
      email,
      phone,
      password,
      address,
      landmark,
      locality,
    });
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || "Failed to register account");
      return;
    }

    if (result.requiresEmailVerification && result.email) {
      setEmail(result.email);
      setOtpChannel("EMAIL");
      setOtpSent(true);
      setOtpCode("");
      setSandboxOtp(result.sandboxOtp || null);
      setOtpInfoMsg(result.message || null);
      setCooldownSec(25);
      setMode("VERIFY_EMAIL");
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetOtpFlow();
  };

  const headerTitle =
    mode === "OTP"
      ? "Quick Email / Mobile OTP Login"
      : mode === "SIGNIN"
      ? "Sign In to Upahar"
      : mode === "SIGNUP"
      ? "Create Upahar Account"
      : mode === "VERIFY_EMAIL"
      ? "Verify Registration Email OTP"
      : "Reset Password via Email OTP";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAuthModalOpen(false)}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-brand-700 text-white flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-950 border border-[#D4AF37]/40 flex items-center justify-center text-[#DFC17B] flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black font-display text-white truncate">
                {headerTitle}
              </h3>
              <span className="text-[11px] text-[#DFC17B] font-medium block truncate">
                Google Account • Email OTP • Mobile Express
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition flex-shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Sign-In Section (shown on main 3 auth modes) */}
        {(mode === "OTP" || mode === "SIGNIN" || mode === "SIGNUP") && (
          <div className="px-5 pt-4 pb-3 bg-[#FAF8F4] border-b border-brand-border space-y-2.5">
            {providers.google ? (
              <a
                href={`/api/auth/google?redirect=${encodeURIComponent(pathname || "/")}`}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 shadow-xs text-stone-800 text-xs font-extrabold flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <GoogleLogoSvg />
                <span>Continue with Google Account</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleGoogleUnconfigured}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 shadow-xs text-stone-800 text-xs font-extrabold flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <GoogleLogoSvg />
                <span>Continue with Google Account</span>
              </button>
            )}
          </div>
        )}

        {/* Mode Tabs */}
        {(mode === "OTP" || mode === "SIGNIN" || mode === "SIGNUP") && (
          <div className="flex border-b border-brand-border bg-brand-cream">
            <button
              type="button"
              onClick={() => switchMode("OTP")}
              className={`flex-1 py-2.5 text-xs font-black transition cursor-pointer ${
                mode === "OTP"
                  ? "text-brand-700 border-b-2 border-brand-700 bg-white"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              OTP Login
            </button>
            <button
              type="button"
              onClick={() => switchMode("SIGNIN")}
              className={`flex-1 py-2.5 text-xs font-black transition cursor-pointer ${
                mode === "SIGNIN"
                  ? "text-brand-700 border-b-2 border-brand-700 bg-white"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("SIGNUP")}
              className={`flex-1 py-2.5 text-xs font-black transition cursor-pointer ${
                mode === "SIGNUP"
                  ? "text-brand-700 border-b-2 border-brand-700 bg-white"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* OTP LOGIN / VERIFY EMAIL / RESET PASSWORD FLOW */}
        {mode === "OTP" || mode === "VERIFY_EMAIL" || mode === "RESET_PASSWORD" ? (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="p-5 sm:p-6 space-y-4">
            {activeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{activeError}</span>
              </div>
            )}

            {otpInfoMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                <span>{otpInfoMsg}</span>
              </div>
            )}

            {/* Channel Selector inside OTP Login (Customer's Own Email primary; Mobile OTP for existing accounts) */}
            {mode === "OTP" && !otpSent && (
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#FAF8F4] border border-brand-border">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel("EMAIL");
                      resetOtpFlow();
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      otpChannel === "EMAIL"
                        ? "bg-brand-700 text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Your Email OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel("SMS");
                      resetOtpFlow();
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      otpChannel === "SMS"
                        ? "bg-brand-700 text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Existing Mobile</span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 text-center">
                  {otpChannel === "EMAIL"
                    ? "Sign in or register using your own email address (6-digit OTP sent to you)"
                    : "Existing mobile customers only — new users please register with Google or Email."}
                </p>
              </div>
            )}

            {/* Email or Phone Target Input */}
            {mode === "VERIFY_EMAIL" || mode === "RESET_PASSWORD" || otpChannel === "EMAIL" ? (
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={otpSent}
                    placeholder="e.g. name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700 disabled:opacity-65"
                  />
                </div>
                {otpSent && mode !== "VERIFY_EMAIL" && (
                  <button
                    type="button"
                    onClick={resetOtpFlow}
                    className="text-[11px] font-bold text-brand-700 hover:underline mt-1 cursor-pointer"
                  >
                    Change email address
                  </button>
                )}
              </div>
            ) : (
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
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700 disabled:opacity-65"
                  />
                </div>
                {otpSent && (
                  <button
                    type="button"
                    onClick={resetOtpFlow}
                    className="text-[11px] font-bold text-brand-700 hover:underline mt-1 cursor-pointer"
                  >
                    Change mobile number
                  </button>
                )}
              </div>
            )}

            {otpSent && (
              <>
                {sandboxOtp && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-black text-[10px] uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Dev OTP Preview (SMTP/SMS env not set)
                      </span>
                      <span className="block mt-0.5">
                        Your verification OTP is{" "}
                        <strong className="font-mono text-sm tracking-widest">{sandboxOtp}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(sandboxOtp)}
                      className="px-2.5 py-1 rounded-lg bg-brand-700 text-[#DFC17B] text-[11px] font-black flex-shrink-0 cursor-pointer"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                {isExistingOtpUser && existingOtpName && mode === "OTP" && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Welcome back, {existingOtpName}! Enter OTP below to sign in.</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-stone-600">
                      Enter {mode === "VERIFY_EMAIL" || mode === "RESET_PASSWORD" || otpChannel === "EMAIL" ? "6-Digit Email OTP" : "4-Digit Mobile OTP"} *
                    </label>
                    <button
                      type="button"
                      disabled={cooldownSec > 0 || loading}
                      onClick={() => handleSendOtp()}
                      className="text-[11px] font-bold text-brand-700 hover:underline disabled:text-stone-400 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{cooldownSec > 0 ? `Resend in ${cooldownSec}s` : "Resend OTP"}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={mode === "VERIFY_EMAIL" || mode === "RESET_PASSWORD" || otpChannel === "EMAIL" ? 6 : 4}
                      autoFocus
                      placeholder={
                        mode === "VERIFY_EMAIL" || mode === "RESET_PASSWORD" || otpChannel === "EMAIL"
                          ? "• • • • • •"
                          : "• • • •"
                      }
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center font-mono text-lg font-black tracking-[0.35em] pl-9 pr-3 py-2.5 rounded-xl border-2 border-brand-700 bg-brand-cream text-brand-700 focus:outline-none"
                    />
                  </div>
                </div>

                {mode === "RESET_PASSWORD" && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      New Password (min 4 chars) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={4}
                        placeholder="Enter new password or PIN"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream"
                      />
                    </div>
                  </div>
                )}

                {mode === "OTP" && !isExistingOtpUser && (
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
                    {otpChannel === "EMAIL" && (
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Mobile Number (Optional, helpful for doorstep updates)
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="e.g. 9885455342"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream"
                        />
                      </div>
                    )}
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
              disabled={loading}
              className="btn-maroon-gold w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <span>
                {loading
                  ? "Processing..."
                  : otpSent
                  ? mode === "RESET_PASSWORD"
                    ? "Reset Password & Sign In"
                    : "Verify OTP & Continue"
                  : mode === "RESET_PASSWORD"
                  ? "Send Password Reset Email OTP"
                  : `Send ${otpChannel === "EMAIL" ? "6-Digit Email" : "4-Digit Mobile"} OTP`}
              </span>
              <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
            </button>

            {(mode === "VERIFY_EMAIL" || mode === "RESET_PASSWORD") && (
              <button
                type="button"
                onClick={() => switchMode("SIGNIN")}
                className="w-full text-center text-[11px] font-bold text-stone-500 hover:text-brand-700 cursor-pointer"
              >
                Back to Password Sign In
              </button>
            )}
          </form>
        ) : (
          /* PASSWORD SIGN IN OR NEW USER REGISTRATION FORM */
          <form onSubmit={handleSubmitPasswordAuth} className="p-5 sm:p-6 space-y-3.5">
            {activeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{activeError}</span>
              </div>
            )}

            {mode === "SIGNIN" ? (
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Email Address or 10-Digit Mobile *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. name@gmail.com or 9885455342"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700"
                  />
                </div>
              </div>
            ) : (
              <>
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

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Email Address (6-Digit Registration OTP sent here) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700"
                    />
                  </div>
                </div>

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
              </>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-stone-600">
                  Password or 4-digit PIN *
                </label>
                {mode === "SIGNIN" && (
                  <button
                    type="button"
                    onClick={() => switchMode("RESET_PASSWORD")}
                    className="text-[11px] font-bold text-brand-700 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={4}
                  placeholder="Enter password (min 4 characters)"
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
              className="btn-maroon-gold w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] transition cursor-pointer"
            >
              <span>
                {loading
                  ? "Processing..."
                  : mode === "SIGNIN"
                  ? "Sign In & Continue"
                  : "Register & Send Email OTP"}
              </span>
              <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
