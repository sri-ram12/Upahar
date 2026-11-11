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
            All food items are subject to daily kitchen availability. Orders are fulfilled during our active dining &amp; delivery sessions: Morning Tiffins (6:00 AM – 10:30 AM IST) and Afternoon &amp; Evening Fast Food &amp; Tiffins (12:00 PM – 10:30 PM IST). Fast food specials (Noodles, Fried Rice &amp; Starters) open exclusively from 12:00 PM onwards.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            2. Pricing & Payments
          </h3>
          <p>
            All prices are in Indian Rupees (₹). A small parcel packaging charge and distance-based delivery fee (free above qualifying subtotals within 7km of Sangivalasa / Tagarapuvalasa) apply cleanly before confirmation. Payment can be made via Cash on Delivery or scanning our official Paytm / UPI Business QR.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            3. Delivery & Pickup Policy
          </h3>
          <p>
            Doorstep delivery operates within a 7.0 km radius around Sangivalasa &amp; Tagarapuvalasa (minimum delivery subtotal ₹60). Customers receive a 4-digit secret Delivery OTP on their live order screen to confirm handover upon delivery.
          </p>

          <h3 className="font-bold text-stone-900 text-base pt-2">
            4. Cancellation & Refund Policy
          </h3>
          <p>
            Customers can self-cancel an order directly from the tracking page while it is in PENDING status before the kitchen starts preparation. Once preparation begins, please contact +91 98854 55342 immediately for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
