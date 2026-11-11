"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CustomerUser, CustomerAddress } from "@/types";

export interface AuthProvidersStatus {
  google: boolean;
  smtp: boolean;
  sms: boolean;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
  requiresName?: boolean;
  email?: string;
  delivered?: boolean;
  isExistingUser?: boolean;
  existingName?: string | null;
  sandboxOtp?: string;
  retryAfterSeconds?: number;
  message?: string;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  loading: boolean;
  providers: AuthProvidersStatus;
  authBannerError: string | null;
  setAuthBannerError: (err: string | null) => void;
  refreshSession: () => Promise<void>;
  login: (identifier: string, pinOrPass: string) => Promise<AuthActionResult>;
  signup: (data: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    address?: string;
    landmark?: string;
    locality?: string;
  }) => Promise<AuthActionResult>;
  sendOtp: (params: {
    channel: "EMAIL" | "SMS";
    email?: string;
    phone?: string;
    purpose?: "LOGIN" | "SIGNUP" | "VERIFY_EMAIL" | "RESET_PASSWORD";
  }) => Promise<AuthActionResult>;
  verifyOtp: (data: {
    channel: "EMAIL" | "SMS";
    email?: string;
    phone?: string;
    code: string;
    purpose?: "LOGIN" | "SIGNUP" | "VERIFY_EMAIL" | "RESET_PASSWORD";
    name?: string;
    password?: string;
    newPassword?: string;
    address?: string;
    landmark?: string;
    locality?: string;
  }) => Promise<AuthActionResult>;
  saveAddress: (addr: {
    label: string;
    address: string;
    landmark?: string;
    locality: string;
    lat?: number | null;
    lng?: number | null;
    distanceKm?: number | null;
    isDefault?: boolean;
  }) => Promise<{ success: boolean; addresses?: CustomerAddress[]; error?: string }>;
  deleteAddress: (id: string) => Promise<void>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    address?: string;
    landmark?: string;
    locality?: string;
  }) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const CUSTOMER_STORAGE_KEY = "upahar_customer_profile";

const OAUTH_ERROR_LABELS: Record<string, string> = {
  google_not_configured:
    "Google Sign-In needs GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in .env. Please sign in with Email OTP or Mobile OTP meanwhile.",
  google_cancelled: "Google Sign-In was cancelled.",
  google_state_invalid: "Google login session expired. Please try again.",
  google_token_failed: "Google Sign-In token exchange failed. Please try again.",
  google_profile_failed: "Could not read your Google account email profile.",
  google_server_error: "Google Sign-In failed on the server. Please try again.",
};

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authBannerError, setAuthBannerError] = useState<string | null>(null);
  const [providers, setProviders] = useState<AuthProvidersStatus>({
    google: false,
    smtp: false,
    sms: false,
  });

  const persistCustomer = useCallback((user: CustomerUser | null) => {
    setCustomer(user);
    try {
      if (user) {
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      }
    } catch {}
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/session", { credentials: "include" });
      const data = await res.json();
      if (data?.providers) {
        setProviders(data.providers);
      }
      if (data?.authenticated && data?.customer) {
        persistCustomer(data.customer);
      } else if (res.ok) {
        persistCustomer(null);
      }
    } catch {}
  }, [persistCustomer]);

  useEffect(() => {
    let active = true;

    async function bootSession() {
      try {
        const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
        if (saved && active) {
          setCustomer(JSON.parse(saved) as CustomerUser);
        }
      } catch {}

      try {
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          const authSuccess = url.searchParams.get("authSuccess");
          const authError = url.searchParams.get("authError");
          if (authSuccess || authError) {
            if (authError && active) {
              setAuthBannerError(OAUTH_ERROR_LABELS[authError] || "Sign-In failed. Please try again.");
              setIsAuthModalOpen(true);
            }
            url.searchParams.delete("authSuccess");
            url.searchParams.delete("authError");
            window.history.replaceState({}, "", url.pathname + url.search + url.hash);
          }
        }
        await refreshSession();
      } finally {
        if (active) setLoading(false);
      }
    }

    bootSession();
    return () => {
      active = false;
    };
  }, [refreshSession]);

  const login = async (identifier: string, pinOrPass: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/customer/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", identifier, password: pinOrPass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Login failed" };
      }
      if (data.requiresEmailVerification) {
        return {
          success: true,
          requiresEmailVerification: true,
          email: data.email,
          delivered: data.delivered,
          sandboxOtp: data.sandboxOtp,
          message: data.message,
        };
      }
      persistCustomer(data.customer);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An unexpected error occurred";
      return { success: false, error: msg };
    }
  };

  const signup = async (data: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    address?: string;
    landmark?: string;
    locality?: string;
  }): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/customer/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", ...data }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || "Registration failed" };
      }
      if (resData.requiresEmailVerification) {
        return {
          success: true,
          requiresEmailVerification: true,
          email: resData.email,
          delivered: resData.delivered,
          sandboxOtp: resData.sandboxOtp,
          message: resData.message,
        };
      }
      persistCustomer(resData.customer);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An unexpected error occurred";
      return { success: false, error: msg };
    }
  };

  const sendOtp = async (params: {
    channel: "EMAIL" | "SMS";
    email?: string;
    phone?: string;
    purpose?: "LOGIN" | "SIGNUP" | "VERIFY_EMAIL" | "RESET_PASSWORD";
  }): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/customer/otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", ...params }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Failed to send OTP",
          retryAfterSeconds: data.retryAfterSeconds,
        };
      }
      return {
        success: true,
        delivered: data.delivered,
        isExistingUser: data.isExistingUser,
        existingName: data.existingName,
        sandboxOtp: data.sandboxOtp,
        message: data.message,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send OTP";
      return { success: false, error: msg };
    }
  };

  const verifyOtp = async (data: {
    channel: "EMAIL" | "SMS";
    email?: string;
    phone?: string;
    code: string;
    purpose?: "LOGIN" | "SIGNUP" | "VERIFY_EMAIL" | "RESET_PASSWORD";
    name?: string;
    password?: string;
    newPassword?: string;
    address?: string;
    landmark?: string;
    locality?: string;
  }): Promise<AuthActionResult> => {
    try {
      const res = await fetch("/api/customer/otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", ...data }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return {
          success: false,
          error: resData.error || "Invalid OTP",
          requiresName: resData.requiresName,
        };
      }
      persistCustomer(resData.customer);
      setIsAuthModalOpen(false);
      return { success: true, message: resData.message };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Verification failed";
      return { success: false, error: msg };
    }
  };

  const saveAddress = async (addr: {
    label: string;
    address: string;
    landmark?: string;
    locality: string;
    lat?: number | null;
    lng?: number | null;
    distanceKm?: number | null;
    isDefault?: boolean;
  }) => {
    if (!customer) return { success: false, error: "Not signed in" };
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, ...addr }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to save address" };
      }
      persistCustomer({ ...customer, addresses: data.addresses });
      return { success: true, addresses: data.addresses };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save address";
      return { success: false, error: msg };
    }
  };

  const deleteAddress = async (id: string) => {
    if (!customer) return;
    try {
      const res = await fetch(
        `/api/customer/addresses?id=${encodeURIComponent(id)}&customerId=${encodeURIComponent(customer.id)}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json();
      if (res.ok && data.addresses) {
        persistCustomer({ ...customer, addresses: data.addresses });
      }
    } catch {}
  };

  const updateProfile = async (profileData: {
    name?: string;
    phone?: string;
    address?: string;
    landmark?: string;
    locality?: string;
  }): Promise<AuthActionResult> => {
    if (!customer) return { success: false, error: "Please sign in first." };
    try {
      const res = await fetch("/api/customer/session", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to update profile." };
      }
      persistCustomer(data.customer);
      return { success: true, message: "Profile saved." };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update profile";
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    persistCustomer(null);
    try {
      await fetch("/api/customer/logout", { method: "POST", credentials: "include" });
    } catch {}
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        providers,
        authBannerError,
        setAuthBannerError,
        refreshSession,
        login,
        signup,
        sendOtp,
        verifyOtp,
        saveAddress,
        deleteAddress,
        updateProfile,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
