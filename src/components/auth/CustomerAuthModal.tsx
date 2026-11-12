"use client";

import React from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import CustomerAuthCard from "./CustomerAuthCard";

export default function CustomerAuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useCustomerAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsAuthModalOpen(false)}
        aria-hidden="true"
      />

      {/* Auth Card Container */}
      <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-200">
        <CustomerAuthCard
          initialMode="SIGNIN"
          isModal={true}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </div>
  );
}
