"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Compass,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      setFormData({
        name: "",
        contact: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#380A11] via-[#580D1A] to-[#2B070E] text-[#FAF7F2] py-20 px-4 text-center relative overflow-hidden border-b border-[#D4AF37]/30">
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-black/40 border border-[#D4AF37]/40 text-[#DFC17B]">
            <Compass className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>Visit Us & Connect</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white">
            Find Us & Say Namaste
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            We are always delighted to welcome diners to our dining room or answer your inquiries regarding dining sessions, bulk tiffins, or takeaway.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 space-y-12">
        {/* Contact Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phone Card */}
          <div className="p-8 rounded-3xl bg-white border border-[#EADBCE] shadow-lg space-y-4 hover:border-[#D4AF37] transition">
            <div className="w-12 h-12 rounded-2xl bg-[#580D1A] text-[#DFC17B] flex items-center justify-center shadow-md">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-stone-400 block">
                Direct Telephone & WhatsApp
              </span>
              <h3 className="text-xl font-black text-[#2B070E] mt-1 font-display">
                +91 9885455342
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Call our restaurant counter directly or message on WhatsApp for parcels and orders.
            </p>
            <a
              href="tel:+919885455342"
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#580D1A] hover:text-[#74171E] pt-2"
            >
              <span>Dial 9885455342</span>
              <span>→</span>
            </a>
          </div>

          {/* Address Card */}
          <div className="p-8 rounded-3xl bg-white border border-[#EADBCE] shadow-lg space-y-4 hover:border-[#D4AF37] transition">
            <div className="w-12 h-12 rounded-2xl bg-[#580D1A] text-[#DFC17B] flex items-center justify-center shadow-md">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-stone-400 block">
                Restaurant Location
              </span>
              <h3 className="text-base font-bold text-[#2B070E] mt-1">
                Sangivalasa, Visakhapatnam
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              1-1, Sangivalasa, ANITS College Road, Beside SBI, Andhra Pradesh 531162
            </p>
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#580D1A] hover:text-[#74171E] pt-2"
            >
              <span>Open in Google Maps</span>
              <span>→</span>
            </a>
          </div>

          {/* Hours Card */}
          <div className="p-8 rounded-3xl bg-white border border-[#EADBCE] shadow-lg space-y-4 hover:border-[#D4AF37] transition">
            <div className="w-12 h-12 rounded-2xl bg-[#580D1A] text-[#DFC17B] flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-stone-400 block">
                Operating Schedule
              </span>
              <h3 className="text-base font-bold text-[#2B070E] mt-1">
                Two Daily Sessions
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Morning Tiffins: 6:00 AM – 10:00 AM<br />Evening Fast Food: 6:00 PM – 10:30 PM
            </p>
            <span className="inline-block text-xs font-bold text-[#2D5A27] bg-[#EBF3E8] px-3 py-1 rounded-xl">
              Open Monday to Sunday
            </span>
          </div>
        </div>

        {/* Form and Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Inquiry Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-[#EADBCE] shadow-lg space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#74171E] flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Guest Inquiry Form</span>
              </span>
              <h2 className="text-2xl font-black text-[#2B070E] font-display">
                Send Us A Note
              </h2>
              <p className="text-xs text-stone-500">
                Have feedback, questions, or a bulk tiffin request? Fill out the details below.
              </p>
            </div>

            {status === "success" && (
              <div className="p-4 rounded-2xl bg-[#EBF3E8] border border-[#2D5A27]/30 text-[#2D5A27] text-xs flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>
                  Thank you! Your message has been safely received by the Upahar restaurant management team.
                </span>
              </div>
            )}

            {status === "error" && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage || "Failed to send message. Please try again."}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#580D1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#580D1A]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. ramesh@gmail.com"
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#580D1A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Bulk Morning Tiffins / Dining Experience"
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#580D1A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share your thoughts or inquiry with our kitchen..."
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#580D1A]"
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="btn-maroon-gold w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4 text-[#DFC17B]" />
                <span>{status === "submitting" ? "Sending..." : "Submit Message"}</span>
              </button>
            </form>
          </div>

          {/* Interactive Map Embed */}
          <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-[#EADBCE] shadow-lg flex flex-col bg-white min-h-[450px]">
            <div className="p-4 bg-[#2B070E] text-[#FAF7F2] flex items-center justify-between border-b border-[#D4AF37]/30">
              <span className="text-xs font-bold">Interactive Navigation Map</span>
              <a
                href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#DFC17B] hover:text-white transition"
              >
                Open in Full Google Maps ↗
              </a>
            </div>

            <div className="flex-1 relative w-full min-h-[380px] bg-stone-100">
              <iframe
                title="UPAHAR TIFFINS Map"
                src="https://maps.google.com/maps?q=Sangivalasa+ANITS+College+Road&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
