"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, Copy, Check, ExternalLink, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";

interface PaymentQRCardProps {
  amount: number;
  orderNumber?: string;
  upiId?: string;
  merchantName?: string;
  paymentQrUrl?: string;
  compact?: boolean;
  onSubmitUtr?: (utr: string) => Promise<void> | void;
  existingUtr?: string | null;
  paymentStatus?: string;
}

export default function PaymentQRCard({
  amount,
  orderNumber = "UPAHAR-ORDER",
  upiId = "paytm.s2fno8y@pty",
  merchantName = "Suravajjula Sai Sri Vamsi",
  paymentQrUrl = "/images/payment-qr.jpg",
  compact = false,
  onSubmitUtr,
  existingUtr,
  paymentStatus,
}: PaymentQRCardProps) {
  const [qrMode, setQrMode] = useState<"OFFICIAL" | "DYNAMIC">("OFFICIAL");
  const [dynamicQrDataUrl, setDynamicQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState(existingUtr || "");
  const [submitting, setSubmitting] = useState(false);
  const [utrSubmitted, setUtrSubmitted] = useState(Boolean(existingUtr));

  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    merchantName
  )}&am=${amount.toFixed(2)}&tn=${encodeURIComponent(`Upahar ${orderNumber}`)}&cu=INR`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(upiIntentUri, {
      width: 360,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#172554", light: "#FFFFFF" },
    })
      .then((url) => {
        if (active) setDynamicQrDataUrl(url);
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, [upiIntentUri]);

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitUtr || !utr.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitUtr(utr.trim());
      setUtrSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-[#002970]/20 shadow-sm overflow-hidden">
      {/* Header Strip */}
      <div className="bg-gradient-to-r from-[#002970] to-[#00BAF2] text-white px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <QrCode className="w-4 h-4 text-white flex-shrink-0" />
          <div>
            <span className="text-xs font-black tracking-wide block leading-none">
              Official Paytm / UPI Payment QR
            </span>
            <span className="text-[10px] text-sky-100 block mt-0.5">
              {merchantName} • {upiId}
            </span>
          </div>
        </div>
        <span className="bg-white text-[#002970] font-black text-xs px-2.5 py-1 rounded-xl shadow-xs">
          ₹{amount}
        </span>
      </div>

      <div className={`p-4 ${compact ? "space-y-3" : "sm:p-5 space-y-4"}`}>
        {/* Mode Switcher */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setQrMode("OFFICIAL")}
            className={`flex-1 py-1.5 rounded-lg transition ${
              qrMode === "OFFICIAL"
                ? "bg-white text-[#002970] shadow-xs font-black"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Business QR Card
          </button>
          <button
            type="button"
            onClick={() => setQrMode("DYNAMIC")}
            className={`flex-1 py-1.5 rounded-lg transition ${
              qrMode === "DYNAMIC"
                ? "bg-white text-[#002970] shadow-xs font-black"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Auto-Amount QR (₹{amount})
          </button>
        </div>

        {/* QR Display */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          {qrMode === "OFFICIAL" ? (
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white p-1.5">
              <img
                src={paymentQrUrl || "/images/payment-qr.jpg"}
                alt={`Paytm Business QR for ${merchantName}`}
                className={compact ? "w-48 h-auto object-contain rounded-xl" : "w-60 sm:w-64 h-auto object-contain rounded-xl"}
              />
            </div>
          ) : (
            <div className="p-3 bg-white rounded-2xl border-2 border-[#00BAF2]/40 shadow-inner flex flex-col items-center">
              {dynamicQrDataUrl ? (
                <img
                  src={dynamicQrDataUrl}
                  alt={`Scan to pay ₹${amount}`}
                  className={compact ? "w-44 h-44 object-contain" : "w-52 h-52 object-contain"}
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-stone-400">
                  Generating QR...
                </div>
              )}
              <span className="text-[11px] font-black text-[#002970] mt-1">
                Pre-filled Amount: ₹{amount} • #{orderNumber}
              </span>
            </div>
          )}

          {/* Copy UPI ID & 1-Tap Mobile App Pay */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full">
            <button
              type="button"
              onClick={handleCopyUpi}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center space-x-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied {upiId}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#002970]" />
                  <span>Copy UPI: {upiId}</span>
                </>
              )}
            </button>

            <a
              href={upiIntentUri}
              className="px-3.5 py-1.5 rounded-xl bg-[#002970] hover:bg-[#001d52] text-white text-[11px] font-black flex items-center space-x-1.5 shadow-sm transition"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#00BAF2]" />
              <span>Pay ₹{amount} via UPI App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Optional UTR / Payment Proof Form */}
        {onSubmitUtr && paymentStatus !== "PAID" && (
          <form onSubmit={handleUtrSubmit} className="pt-3 border-t border-stone-200 space-y-2">
            {utrSubmitted ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Payment Ref Submitted (<strong>{utr}</strong>). Rider / Admin will confirm receipt on delivery!
                </span>
              </div>
            ) : (
              <>
                <label className="block text-[11px] font-bold text-stone-600">
                  Already scanned QR? Enter 12-digit UPI Ref / UTR (or last 4 digits):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 431592817264 or 7264"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-300 bg-brand-cream font-mono"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !utr.trim()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black disabled:opacity-50 transition"
                  >
                    {submitting ? "Saving..." : "I Paid ₹" + amount}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        <div className="flex items-center justify-center space-x-1.5 text-[10px] text-stone-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Accepted on Paytm, PhonePe, Google Pay, BHIM & all UPI apps</span>
        </div>
      </div>
    </div>
  );
}

