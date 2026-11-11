"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bike,
  Plus,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  DollarSign,
  UserCheck,
  Lock,
} from "lucide-react";
import { DeliveryAgent } from "@/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

export default function AdminDeliveryAgentsPage() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [pin, setPin] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [realtimeToast, setRealtimeToast] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/delivery/agents");
      const data = await res.json();
      if (data.agents) setAgents(data.agents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Instant real-time update when rider applies, toggles duty, delivers order, or settles cash
  const { isConnected: isRealtimeConnected } = useRealtimeEvents({
    onRiderStatusChanged: (payload) => {
      fetchAgents();
      if (payload?.isNewSignup && payload?.agent?.name) {
        setRealtimeToast(`🆕 New Rider Application: ${payload.agent.name} (${payload.agent.vehicleNumber})`);
        setTimeout(() => setRealtimeToast(null), 7000);
      }
    },
    onOrderDelivered: () => fetchAgents(),
    onOrderUpdated: () => fetchAgents(),
  });

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/delivery/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, vehicleNumber, pin }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add delivery agent");
      }

      setSuccessMsg(
        `🎉 Delivery Agent ${data.agent.name} registered successfully! They can now log in at /delivery using phone: ${data.agent.phone} and the 4-digit PIN.`
      );
      setName("");
      setPhone("");
      setVehicleNumber("");
      setPin("");
      fetchAgents();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register delivery agent");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (agent: DeliveryAgent) => {
    try {
      const res = await fetch("/api/delivery/agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agent.id, isActive: !agent.isActive }),
      });
      if (res.ok) fetchAgents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSettleCash = async (agentId: string) => {
    if (!confirm("Confirm that this rider has submitted and settled all cash in hand at the counter?")) return;
    try {
      const res = await fetch("/api/delivery/agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agentId, cashInHandReset: true }),
      });
      if (res.ok) fetchAgents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveReject = async (agentId: string, approvalStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/delivery/agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agentId, approvalStatus }),
      });
      if (res.ok) fetchAgents();
    } catch (e) {
      console.error(e);
    }
  };

  const pendingAgents = agents.filter((a) => a.approvalStatus === "PENDING_APPROVAL");
  const totalCashCollected = agents.reduce((sum, a) => sum + (a.cashInHand || 0), 0);
  const activeCount = agents.filter((a) => a.isActive && a.approvalStatus !== "PENDING_APPROVAL").length;

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-[#FAF7F2] min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EADBCE] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#74171E] block">
            Fleet & Dispatch Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
            Delivery Agents (Tagarapuvalasa)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Register authorized delivery boys. Only agents added here can access the /delivery console.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${
              isRealtimeConnected
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-amber-50 border-amber-300 text-amber-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRealtimeConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{isRealtimeConnected ? "SSE Live" : "Connecting..."}</span>
          </div>
          <Link
            href="/delivery"
            target="_blank"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/50 flex items-center space-x-1.5 shadow-sm hover:scale-105 transition"
          >
            <span>Open Rider App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={fetchAgents}
            className="p-2 rounded-xl bg-white border border-[#EADBCE] text-stone-600 hover:bg-stone-50"
            title="Refresh Agents List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {realtimeToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-black flex items-center justify-between shadow-lg">
          <span>{realtimeToast}</span>
          <button
            type="button"
            onClick={() => setRealtimeToast(null)}
            className="underline text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Authorized Riders
          </span>
          <div className="text-2xl font-black text-[#2B070E] font-display">
            {agents.length} Registered
          </div>
          <span className="text-[11px] text-emerald-700 font-bold block">
            {activeCount} Active with Delivery Access
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Cash Held with Riders
          </span>
          <div className="text-2xl font-black text-[#580D1A] font-display">
            ₹{totalCashCollected}
          </div>
          <span className="text-[11px] text-stone-500 font-medium block">
            Total COD cash awaiting counter deposit
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Coverage Area
          </span>
          <div className="text-2xl font-black text-[#2B070E] font-display">
            7.0 KM Radius
          </div>
          <span className="text-[11px] text-stone-500 font-medium block">
            Sangivalasa, ANITS & Tagarapuvalasa
          </span>
        </div>
      </div>

      {/* Pending Self-Signup Rider Requests */}
      {pendingAgents.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                New Rider Onboarding Requests
              </span>
              <h2 className="text-base font-black text-[#2B070E]">
                {pendingAgents.length} Delivery Boy Application(s) Awaiting Approval
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingAgents.map((pa) => (
              <div
                key={pa.id}
                className="bg-white rounded-2xl p-4 border border-amber-200 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-black text-sm text-[#2B070E] block">{pa.name}</span>
                  <span className="text-xs text-stone-600 block">
                    {pa.phone} • {pa.vehicleNumber}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApproveReject(pa.id, "APPROVED")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproveReject(pa.id, "REJECTED")}
                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Add Form + Agents Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Add Delivery Agent Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#F4EFE6] pb-3">
            <Plus className="w-4 h-4 text-[#580D1A]" />
            <h2 className="text-base font-bold text-[#2B070E]">
              Add New Delivery Agent
            </h2>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium leading-relaxed">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateAgent} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Agent Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ravi Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#580D1A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Mobile Number (Login ID) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="e.g. 9885455342"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full text-xs p-3 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#580D1A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Bike / Vehicle Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AP 39 CA 1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#580D1A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Secret 4-digit PIN (For Rider Login) *
              </label>
              <input
                type="password"
                required
                maxLength={6}
                placeholder="e.g. 1234"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#580D1A]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-maroon-gold w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] transition"
            >
              <span>{saving ? "Registering Agent..." : "Register & Grant Delivery Access"}</span>
            </button>
          </form>
        </div>

        {/* Right: Agents List (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#F4EFE6] pb-3">
            <h2 className="text-base font-bold text-[#2B070E]">
              Registered Riders ({agents.length})
            </h2>
            <span className="text-xs text-stone-400">
              Only Active riders can take deliveries
            </span>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#580D1A]" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs space-y-2">
              <Bike className="w-10 h-10 mx-auto text-stone-300" />
              <span>No delivery agents registered yet. Use the form on the left to add your first rider!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-[#2B070E]">
                        {agent.name}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          agent.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {agent.isActive ? "Active" : "Access Paused"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                      <a
                        href={`tel:${agent.phone}`}
                        className="flex items-center space-x-1 font-semibold text-[#580D1A] hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{agent.phone}</span>
                      </a>
                      <span className="text-stone-400 font-mono">
                        • {agent.vehicleNumber}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-stone-500 pt-1">
                      <span>Runs: <strong>{agent.totalDeliveries || 0}</strong></span>
                      <span>
                        Cash in Hand:{" "}
                        <strong className="text-emerald-800">
                          ₹{agent.cashInHand || 0}
                        </strong>
                      </span>
                      <span>
                        Earnings:{" "}
                        <strong className="text-[#580D1A]">
                          ₹{agent.totalEarnings || 0}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                    {agent.cashInHand > 0 && (
                      <button
                        onClick={() => handleSettleCash(agent.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition"
                        title="Settle cash collected"
                      >
                        Settle Cash
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleActive(agent)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        agent.isActive
                          ? "bg-stone-200 hover:bg-red-100 text-stone-700 hover:text-red-700"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {agent.isActive ? "Pause Access" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
