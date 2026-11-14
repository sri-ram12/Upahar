"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CustomerAuthCard from "@/components/auth/CustomerAuthCard";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { customer, loading } = useCustomerAuth();

  useEffect(() => {
    if (!loading && customer) {
      router.replace("/orders");
    }
  }, [customer, loading, router]);

  return (
    <div className="min-h-[85vh] py-8 px-4 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#580D1A] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-bold text-stone-400">UPAHAR Customer Portal</span>
      </div>

      <CustomerAuthCard initialMode="SIGNIN" isModal={false} />
    </div>
  );
}
