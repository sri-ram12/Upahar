"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CustomerUser, CustomerAddress } from "@/types";

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  loading: boolean;
  login: (phone: string, pinOrPass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    address?: string;
    landmark?: string;
    locality?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (
    phone: string
  ) => Promise<{
    success: boolean;
    error?: string;
    isExistingUser?: boolean;
    existingName?: string | null;
    sandboxOtp?: string;
    message?: string;
  }>;
  verifyOtp: (data: {
    phone: string;
    code: string;
    name?: string;
    address?: string;
    landmark?: string;
    locality?: string;
  }) => Promise<{ success: boolean; error?: string; requiresName?: boolean }>;
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
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const CUSTOMER_STORAGE_KEY = "upahar_customer_profile";

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const persistCustomer = (user: CustomerUser | null) => {
    setCustomer(user);
    try {
      if (user) {
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      }
    } catch {}
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CustomerUser;
        setCustomer(parsed);
        // Refresh saved addresses silently from backend
        if (parsed?.id) {
          fetch(`/api/customer/addresses?customerId=${encodeURIComponent(parsed.id)}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.addresses) {
                persistCustomer({ ...parsed, addresses: d.addresses });
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (phone: string, pinOrPass: string) => {
    try {
      const res = await fetch("/api/customer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", phone, password: pinOrPass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Login failed" };
      }
      persistCustomer(data.customer);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "An unexpected error occurred" };
    }
  };

  const signup = async (data: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    address?: string;
    landmark?: string;
    locality?: string;
  }) => {
    try {
      const res = await fetch("/api/customer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", ...data }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || "Signup failed" };
      }
      persistCustomer(resData.customer);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "An unexpected error occurred" };
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      const res = await fetch("/api/customer/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to send OTP" };
      }
      return {
        success: true,
        isExistingUser: data.isExistingUser,
        existingName: data.existingName,
        sandboxOtp: data.sandboxOtp,
        message: data.message,
      };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to send OTP" };
    }
  };

  const verifyOtp = async (data: {
    phone: string;
    code: string;
    name?: string;
    address?: string;
    landmark?: string;
    locality?: string;
  }) => {
    try {
      const res = await fetch("/api/customer/otp", {
        method: "POST",
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
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Verification failed" };
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, ...addr }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to save address" };
      }
      persistCustomer({ ...customer, addresses: data.addresses });
      return { success: true, addresses: data.addresses };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to save address" };
    }
  };

  const deleteAddress = async (id: string) => {
    if (!customer) return;
    try {
      const res = await fetch(
        `/api/customer/addresses?id=${encodeURIComponent(id)}&customerId=${encodeURIComponent(customer.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (res.ok && data.addresses) {
        persistCustomer({ ...customer, addresses: data.addresses });
      }
    } catch {}
  };

  const logout = () => {
    persistCustomer(null);
    try {
      document.cookie = "upahar_customer_token=; path=/; max-age=0";
    } catch {}
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        login,
        signup,
        sendOtp,
        verifyOtp,
        saveAddress,
        deleteAddress,
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
