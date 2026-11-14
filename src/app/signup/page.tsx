"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CustomerAuthCard from "@/components/auth/CustomerAuthCard";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { customer, loading } = useCustomerAuth();

  useEffect(() => {
    if (!loading && customer) {
      router.replace("/orders");
    }
  }, [customer, loading, router]);

  return (
    <div
      className="min-h-screen py-8 px-4 flex flex-col items-center justify-center relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/auth-scenic-bg.jpg')" }}
    >
      {/* Subtle Dark Vignette Backdrop for Readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

      <div className="w-full max-w-md mb-2 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white bg-black/40 hover:bg-black/60 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-bold text-white/90 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
          UPAHAR Customer Portal
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <CustomerAuthCard initialMode="SIGNUP" isModal={false} />
      </div>
    </div>
  );
}

