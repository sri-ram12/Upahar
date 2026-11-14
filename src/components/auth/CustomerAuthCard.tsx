"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  ChevronRight,
  Home,
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { TAGARAPUVALASA_LOCALITIES } from "@/lib/delivery-zones";

export type AuthMode = "OTP" | "SIGNIN" | "SIGNUP" | "VERIFY_EMAIL" | "RESET_PASSWORD";

export interface CustomerAuthCardProps {
  initialMode?: AuthMode;
  onClose?: () => void;
  isModal?: boolean;
}

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

export default function CustomerAuthCard({
  initialMode = "SIGNIN",
  onClose,
  isModal = true,
}: CustomerAuthCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
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
    setIsAuthModalOpen,
  } = useCustomerAuth();

  const safeInitialMode: AuthMode = initialMode === "OTP" ? "SIGNIN" : initialMode;
  const [mode, setMode] = useState<AuthMode>(safeInitialMode);
  const [otpChannel, setOtpChannel] = useState<"EMAIL" | "SMS">("EMAIL");

  // Password visibility toggles & Remember me
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsAuthModalOpen(false);
    }
  };

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
      "Google Sign-In is temporarily updating. Please sign in with your password or register an account below."
    );
    setAuthBannerError(null);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetOtpFlow();
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
    } else {
      if (!isModal) {
        router.push("/orders");
      }
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
        setErrorMsg(result.error || "Failed to sign in. Please verify your credentials.");
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
        return;
      }
      if (!isModal) {
        router.push("/orders");
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
    } else {
      if (!isModal) {
        router.push("/orders");
      }
    }
  };

  // -------------------------------------------------------------
  // CUSTOMER LOGGED IN VIEW (Profile & Address Management)
  // -------------------------------------------------------------
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
        setProfileMsg("Account details saved successfully.");
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
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(212,175,55,0.25)] border border-[#D4AF37]/30 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D4AF37] via-[#FFF2B2] to-[#DFC17B] shrink-0" />

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-[#4A0E17] via-[#380A11] to-[#2B070E] p-5 text-white flex justify-between items-center sticky top-0 z-10 shrink-0 border-b border-[#D4AF37]/30">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#A37F38] p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#2B070E] flex items-center justify-center text-[#DFC17B]">
                <User className="w-5 h-5" />
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#DFC17B] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                {customer.authProvider === "GOOGLE" || customer.authProvider === "HYBRID"
                  ? "Google Verified"
                  : customer.emailVerified
                  ? "Verified Customer"
                  : "Upahar Customer"}
              </span>
              <h3 className="text-lg font-black font-display text-white truncate">{customer.name}</h3>
            </div>
          </div>
          {isModal && (
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          {profileMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{profileMsg}</span>
            </div>
          )}

          {/* Account Profile Box */}
          <form
            onSubmit={handleSaveProfile}
            className="space-y-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#EADBCE]"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-[#2B070E] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#580D1A]" />
                <span>Profile &amp; Contact</span>
              </span>
              {customer.email && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-[160px]">{customer.email}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileNameDraft(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1">
                  Mobile (For Delivery)
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={profilePhone}
                  onChange={(e) => setProfilePhoneDraft(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#580D1A] to-[#74171E] text-[#F3DEAB] border border-[#D4AF37]/40 text-xs font-black hover:opacity-95 transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {profileSaving ? "Saving..." : "Save Profile Details"}
            </button>
          </form>

          {/* Saved Delivery Addresses */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#580D1A]" />
                <span>Saved Delivery Addresses ({customer.addresses?.length || 0})</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="text-[11px] font-black text-[#580D1A] hover:text-[#74171E] flex items-center gap-1 cursor-pointer hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddAddress ? "Cancel" : "Add Address"}</span>
              </button>
            </div>

            {showAddAddress && (
              <form
                onSubmit={handleAddSavedAddress}
                className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] space-y-2.5 animate-in fade-in duration-200"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Label (Hostel / Home / Office)"
                    value={newAddrLabel}
                    onChange={(e) => setNewAddrLabel(e.target.value)}
                    className="text-xs px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                  <select
                    value={newAddrLocality}
                    onChange={(e) => setNewAddrLocality(e.target.value)}
                    className="text-xs px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
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
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Nearby Landmark (optional)"
                  value={newAddrLandmark}
                  onChange={(e) => setNewAddrLandmark(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={savingAddr}
                  className="btn-maroon-gold w-full py-2.5 rounded-xl text-xs font-black cursor-pointer shadow-sm"
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
                    className="p-3 rounded-2xl border border-stone-200 bg-white hover:border-[#D4AF37]/50 transition flex items-start justify-between gap-2 text-xs shadow-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#580D1A]/10 text-[#580D1A] font-black text-[10px] border border-[#580D1A]/20">
                          {addr.label}
                        </span>
                        <span className="text-[10px] text-stone-500 font-bold truncate">
                          {addr.locality}
                        </span>
                        {addr.isDefault && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-stone-800 font-medium mt-1 line-clamp-2">{addr.address}</p>
                      {addr.landmark && (
                        <p className="text-[10px] text-stone-400 mt-0.5">Landmark: {addr.landmark}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition flex-shrink-0 cursor-pointer rounded-lg hover:bg-red-50"
                      title="Remove address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-stone-600 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3 text-center">
                <MapPin className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                <span>No saved addresses yet. Add your Hostel or Home address for 1-tap checkout within 7km!</span>
              </div>
            )}
          </div>

          {/* Action Links */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-stone-200">
            <Link
              href="/orders"
              onClick={handleClose}
              className="btn-maroon-gold py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span>My Orders</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                handleClose();
              }}
              className="py-2.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // NOT LOGGED IN: SIGN IN / REGISTER / VERIFY / RESET VIEW
  // -------------------------------------------------------------
  const headerTitle =
    mode === "SIGNIN"
      ? "Login"
      : mode === "SIGNUP"
      ? "Create Account"
      : mode === "VERIFY_EMAIL"
      ? "Verify Email"
      : "Reset Password";

  const headerSubtitle =
    mode === "SIGNIN"
      ? "Welcome back please login to your account"
      : mode === "SIGNUP"
      ? "Join Upahar for fast authentic food delivery"
      : mode === "VERIFY_EMAIL"
      ? `Enter the 6-digit code sent to ${email || "your inbox"}`
      : "Enter the code to set your new password";

  return (
    <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(212,175,55,0.25)] border border-[#D4AF37]/30 overflow-hidden my-4 max-h-[92vh] flex flex-col text-stone-800">
      {/* Decorative Top Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#D4AF37] via-[#FFF2B2] to-[#DFC17B] shrink-0" />

      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-[#4A0E17] via-[#380A11] to-[#2B070E] text-white flex items-center justify-between gap-2 shrink-0 border-b border-[#D4AF37]/30 relative">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#A37F38] p-0.5 shadow-md flex-shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#2B070E] flex items-center justify-center text-[#DFC17B]">
              {mode === "SIGNUP" ? (
                <UserPlus className="w-5 h-5 text-[#DFC17B]" />
              ) : (
                <LogIn className="w-5 h-5 text-[#DFC17B]" />
              )}
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black font-display text-white tracking-tight truncate">
              {headerTitle}
            </h3>
            <p className="text-[11px] text-[#DFC17B] font-medium truncate">{headerSubtitle}</p>
          </div>
        </div>

        {isModal && (
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex-shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Segmented Tab Switcher (Login vs Register) */}
      {(mode === "SIGNIN" || mode === "SIGNUP") && (
        <div className="p-2.5 bg-[#FAF7F2] border-b border-[#EADBCE] shrink-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/70 rounded-2xl">
            <button
              type="button"
              onClick={() => switchMode("SIGNIN")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "SIGNIN"
                  ? "bg-white text-[#580D1A] shadow-xs font-black border border-stone-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode("SIGNUP")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "SIGNUP"
                  ? "bg-white text-[#580D1A] shadow-xs font-black border border-stone-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>
      )}

      {/* Google Sign-In Button */}
      {(mode === "SIGNIN" || mode === "SIGNUP") && (
        <div className="px-5 sm:px-6 pt-3 pb-1 shrink-0">
          {providers.google ? (
            <a
              href={`/api/auth/google?redirect=${encodeURIComponent(pathname || "/")}`}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center justify-center gap-2.5 transition shadow-xs group cursor-pointer"
            >
              <GoogleLogoSvg />
              <span className="group-hover:text-stone-900">Continue with Google Account</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={handleGoogleUnconfigured}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center justify-center gap-2.5 transition shadow-xs group cursor-pointer"
            >
              <GoogleLogoSvg />
              <span className="group-hover:text-stone-900">Continue with Google Account</span>
            </button>
          )}

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {mode === "SIGNUP" ? "or register with details" : "or login with credentials"}
            </span>
            <div className="border-t border-stone-200 w-full" />
          </div>
        </div>
      )}

      {/* Main Scrollable Form Content */}
      <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4">
        {/* ============================================================ */}
        {/* VERIFY EMAIL / RESET PASSWORD FLOW */}
        {/* ============================================================ */}
        {mode === "VERIFY_EMAIL" || mode === "RESET_PASSWORD" ? (
          <form
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            className="space-y-4 pt-1"
          >
            {activeError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{activeError}</span>
              </div>
            )}

            {otpInfoMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                <span>{otpInfoMsg}</span>
              </div>
            )}

            {/* Email Target Input with Icon on Right */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={otpSent}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent focus:outline-none text-stone-800 disabled:bg-stone-100 disabled:text-stone-500"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {otpSent && mode !== "VERIFY_EMAIL" && (
                <button
                  type="button"
                  onClick={resetOtpFlow}
                  className="text-[11px] font-bold text-[#580D1A] hover:underline mt-1 cursor-pointer flex items-center gap-1"
                >
                  <span>Change email address</span>
                </button>
              )}
            </div>

            {/* OTP Sent: Code Input & Verification */}
            {otpSent && (
              <>
                {/* Sandbox OTP Auto-Fill Banner */}
                {sandboxOtp && (
                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-stone-800 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-black text-[10px] uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" /> Dev OTP Preview
                      </span>
                      <span className="block mt-0.5 text-stone-600">
                        Verification code:{" "}
                        <strong className="font-mono text-sm tracking-widest text-[#580D1A]">
                          {sandboxOtp}
                        </strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(sandboxOtp)}
                      className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 text-[10px] font-black cursor-pointer transition"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-stone-700">
                      Enter 6-Digit Email OTP <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      disabled={cooldownSec > 0 || loading}
                      onClick={() => handleSendOtp()}
                      className="text-[11px] font-bold text-[#580D1A] hover:underline disabled:text-stone-400 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                      <span>{cooldownSec > 0 ? `Resend in ${cooldownSec}s` : "Resend OTP"}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center font-mono text-xl font-black tracking-[0.4em] py-2.5 rounded-xl border-2 border-[#D4AF37] bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#580D1A]"
                    />
                  </div>
                </div>

                {mode === "RESET_PASSWORD" && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        minLength={4}
                        placeholder="At least 4 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent focus:outline-none text-stone-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-maroon-gold w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] transition cursor-pointer disabled:opacity-50"
            >
              <span>
                {loading
                  ? "Processing..."
                  : otpSent
                  ? mode === "RESET_PASSWORD"
                    ? "Reset Password & Sign In"
                    : "Verify Code & Continue"
                  : "Send Password Reset OTP"}
              </span>
              <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
            </button>

            <button
              type="button"
              onClick={() => switchMode("SIGNIN")}
              className="w-full text-center text-xs font-bold text-stone-600 hover:text-[#580D1A] cursor-pointer pt-1"
            >
              ← Back to Login
            </button>
          </form>
        ) : mode === "SIGNIN" ? (
          /* ============================================================ */
          /* SIGN IN FORM (Returning User) */
          /* ============================================================ */
          <form onSubmit={handleSubmitPasswordAuth} className="space-y-4 pt-1">
            {activeError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{activeError}</span>
              </div>
            )}

            {/* User Name Input with Icon on Right */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                User Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="User Name"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent focus:outline-none text-stone-800 placeholder-stone-400"
                />
                <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password Input with Eye Icon on Right */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={4}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent focus:outline-none text-stone-800 placeholder-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 transition cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox on Left & Forgot Password on Right */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-stone-600 hover:text-stone-800 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-300 text-[#580D1A] focus:ring-[#D4AF37] cursor-pointer accent-[#580D1A]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => switchMode("RESET_PASSWORD")}
                className="text-stone-600 hover:text-[#580D1A] hover:underline font-semibold transition cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Action Button: Original Upahar maroon-gold style and size */}
            <button
              type="submit"
              disabled={loading}
              className="btn-maroon-gold w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] transition cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Logging in..." : "Login"}</span>
              <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
            </button>

            {/* Bottom Switch to Signup */}
            <div className="pt-2 text-center">
              <p className="text-xs text-stone-600">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("SIGNUP")}
                  className="font-black text-[#580D1A] hover:underline cursor-pointer"
                >
                  Signup
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* ============================================================ */
          /* REGISTER FORM (New User) */
          /* ============================================================ */
          <form onSubmit={handleSubmitPasswordAuth} className="space-y-4 pt-1">
            {activeError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{activeError}</span>
              </div>
            )}

            {/* Section 1: Account Information */}
            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent focus:outline-none text-stone-800 placeholder-stone-400"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Email Address (OTP will be sent)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent focus:outline-none text-stone-800 placeholder-stone-400"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Mobile Number (Optional, 10 digits)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent focus:outline-none text-stone-800 placeholder-stone-400"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={4}
                    placeholder="Create Password or PIN (min 4 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent focus:outline-none text-stone-800 placeholder-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 transition cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Location (Tagarapuvalasa) */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2B070E] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#580D1A]" />
                  <span>Delivery Location (Tagarapuvalasa)</span>
                </span>
                <span className="text-[9px] font-bold text-[#580D1A]/70">Fast Doorstep Delivery</span>
              </div>

              {/* Locality Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Tagarapuvalasa Locality
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                >
                  {TAGARAPUVALASA_LOCALITIES.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.area})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room / Flat / Address */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Default Delivery Address (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Room No. / Flat / Street Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent focus:outline-none text-stone-800 placeholder-stone-400"
                  />
                  <Home className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Nearby Landmark (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nearby Landmark (Optional)"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent focus:outline-none text-stone-800 placeholder-stone-400"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Submit Button: Original Upahar maroon-gold style and size */}
            <button
              type="submit"
              disabled={loading}
              className="btn-maroon-gold w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] transition cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Registering..." : "Create Account & Send Verification Code"}</span>
              <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
            </button>

            {/* Bottom Switch to Sign In */}
            <div className="pt-2 text-center">
              <p className="text-xs text-stone-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("SIGNIN")}
                  className="font-black text-[#580D1A] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

