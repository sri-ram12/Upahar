import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-1 text-xs font-bold text-stone-500 hover:text-orange-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>

        <h1 className="text-3xl font-black text-stone-900">Privacy Policy</h1>
        <p className="text-xs text-stone-500">
          Effective Date: {new Date().getFullYear()} • UPAHAR TIFFINS AND FAST FOOD
        </p>

        <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
          <p>
            At UPAHAR TIFFINS AND FAST FOOD, we value your privacy and are committed to protecting the personal information you share with us when ordering food or browsing our website.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            1. Information We Collect
          </h3>
          <p>
            We collect personal information necessary to fulfill your food orders, such as your name, delivery address, mobile phone number, and optional email address.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            2. How We Use Your Information
          </h3>
          <p>
            Your information is used solely to prepare and deliver your orders, send order confirmations via SMS/WhatsApp, provide customer assistance, and process payments securely.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            3. Payment Security
          </h3>
          <p>
            We do not store your credit/debit card numbers or UPI PINs on our servers. All online payment transactions are processed securely through certified payment gateway providers.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            4. Contact Us
          </h3>
          <p>
            If you have questions regarding this policy, please reach out to us at contact@upaharrestaurant.com or visit our restaurant at 1-1, Sangivalasa, ANITS College Road.
          </p>
        </div>
      </div>
    </div>
  );
}
