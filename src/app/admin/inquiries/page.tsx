"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Phone,
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { ContactMessage } from "@/types";

export default function AdminInquiriesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: !current }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isRead: !current } : m))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered =
    filter === "unread" ? messages.filter((m) => !m.isRead) : messages;

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-[#FAF7F2] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EADBCE] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#74171E] block">
            Customer Relations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
            Guest Inquiries & Notes
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white p-1 rounded-xl border border-[#EADBCE] flex">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filter === "all"
                  ? "bg-[#580D1A] text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filter === "unread"
                  ? "bg-[#580D1A] text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Unread ({messages.filter((m) => !m.isRead).length})
            </button>
          </div>

          <button
            onClick={fetchMessages}
            className="p-2 bg-white rounded-xl border border-[#EADBCE] hover:bg-[#F4EFE6] transition"
            aria-label="Refresh inquiries"
          >
            <RefreshCw className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-3 border-[#580D1A] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EADBCE] p-8 space-y-3">
          <MessageSquare className="w-10 h-10 text-[#C5A059] mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-[#2B070E]">No inquiries</h3>
          <p className="text-stone-500 text-xs">
            {filter === "unread"
              ? "All guest messages have been marked as read!"
              : "No customer messages submitted yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-3xl border transition shadow-sm ${
                !msg.isRead
                  ? "bg-white border-[#D4AF37] shadow-md"
                  : "bg-white/80 border-[#EADBCE]"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-base text-[#2B070E]">
                    {msg.name}
                  </span>
                  {!msg.isRead && (
                    <span className="bg-[#580D1A] text-[#DFC17B] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                  {msg.subject && (
                    <span className="text-xs bg-[#FAF7F2] border border-[#EADBCE] text-stone-600 px-2.5 py-0.5 rounded-md font-medium">
                      {msg.subject}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs text-stone-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-4 bg-[#FAF7F2] p-4 rounded-2xl border border-[#F4EFE6]">
                {msg.message}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#F4EFE6]">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <a
                    href={`tel:${msg.contact}`}
                    className="flex items-center space-x-1.5 text-[#580D1A] hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{msg.contact}</span>
                  </a>

                  {msg.email && (
                    <a
                      href={`mailto:${msg.email}`}
                      className="flex items-center space-x-1.5 text-stone-600 hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{msg.email}</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleRead(msg.id, msg.isRead)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 border ${
                      msg.isRead
                        ? "bg-[#FAF7F2] text-stone-600 border-[#EADBCE]"
                        : "bg-[#EBF3E8] text-[#2D5A27] border-[#2D5A27]/30"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{msg.isRead ? "Mark Unread" : "Mark as Read"}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition"
                    aria-label="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
