import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
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

        <h1 className="text-3xl font-black text-stone-900">Terms & Conditions</h1>
        <p className="text-xs text-stone-500">
          Last Updated: {new Date().getFullYear()} • UPAHAR TIFFINS AND FAST FOOD
        </p>

        <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
          <p>
            Welcome to UPAHAR TIFFINS AND FAST FOOD. By accessing our website, placing an order, or browsing our digital menu, you agree to comply with the following terms and conditions.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            1. Ordering & Availability
          </h3>
          <p>
            All food items are subject to daily kitchen availability. Orders can only be fulfilled during our operational business hours (6:30 AM – 11:00 PM IST). We reserve the right to decline or cancel an order if items become unavailable.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            2. Pricing & Payments
          </h3>
          <p>
            All prices are in Indian Rupees (₹) and include applicable taxes (GST) unless specified. Payment can be made via Cash on Delivery, UPI, or online card payments.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            3. Delivery & Pickup Policy
          </h3>
          <p>
            Delivery times are estimates and may vary based on weather, kitchen rush, and distance. For counter pickups, please present your order reference number at our takeaway counter.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            4. Cancellation & Refund Policy
          </h3>
          <p>
            Because food items are freshly prepared to order, cancellations cannot be accepted once the kitchen has begun preparation. In the rare event of quality issues or missing items, please contact our restaurant immediately at +91 98765 43210 for prompt resolution.
          </p>
        </div>
      </div>
    </div>
  );
}
