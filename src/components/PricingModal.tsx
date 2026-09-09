import React, { useEffect, useState } from "react";
import { X, Zap, Check, Sparkles, Loader2 } from "lucide-react";

interface Plan {
  id: string;
  tier: "sachet" | "plus" | "pro";
  name: string;
  amountInr: number;
  durationDays: number;
  description: string;
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Cashfree's hosted-checkout SDK is loaded lazily (only when this modal is actually used) rather
// than unconditionally in index.html, since most sessions never open the pricing modal.
function loadCashfreeSdk(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Cashfree) return resolve((window as any).Cashfree);
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve((window as any).Cashfree);
    script.onerror = () => reject(new Error("Failed to load payment SDK. Please check your connection and try again."));
    document.head.appendChild(script);
  });
}

const TIER_FEATURES: Record<string, string[]> = {
  sachet: [
    "Unlimited AI voice for 7 days",
    "Full scenario library",
    "Full phonetic & grammar analysis",
    "Auto error-tracking deck",
    "One-time payment, no auto-renewal",
  ],
  plus: [
    "Unlimited AI voice, every day",
    "Full scenario library",
    "Full phonetic & grammar analysis",
    "Auto error-tracking deck",
    "Renews monthly",
  ],
  pro: [
    "Everything in Plus",
    "Priority low-latency voice",
    "Custom scenario builder",
    "Official CEFR/IELTS/TOEFL rubrics",
    "PDF certificate on diagnostic completion",
  ],
};

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    fetch("/api/payments/plans")
      .then((r) => r.json())
      .then((data) => setPlans(data.plans || []))
      .catch(() => setErrorMsg("Couldn't load pricing right now. Please try again."));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscribe = async (planId: string) => {
    setErrorMsg(null);
    setLoadingPlanId(planId);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Please sign in before purchasing a plan.");
      }
      const res = await fetch("/api/payments/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout.");

      const Cashfree = await loadCashfreeSdk();
      const cashfree = Cashfree({ mode: "production" });
      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong starting checkout.");
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Upgrade Your Plan</h2>
            <p className="text-xs text-slate-500">Unlimited AI voice, full scenarios, and detailed feedback</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 flex flex-col ${
                  plan.tier === "pro" ? "border-blue-400 shadow-lg ring-2 ring-blue-100" : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {plan.tier === "pro" && <Sparkles size={14} className="text-blue-600" />}
                  <h3 className="font-black text-slate-900">{plan.name}</h3>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-black text-slate-900">₹{plan.amountInr}</span>
                  <span className="text-xs text-slate-500">
                    {" "}
                    / {plan.tier === "sachet" ? "7 days" : "month"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{plan.description}</p>
                <ul className="space-y-2 mb-5 flex-1">
                  {(TIER_FEATURES[plan.tier] || []).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  id={`btn-subscribe-${plan.id}`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loadingPlanId !== null}
                  className={`w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${
                    plan.tier === "pro"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {loadingPlanId === plan.id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Redirecting...
                    </>
                  ) : (
                    <>
                      <Zap size={14} /> Get {plan.tier === "sachet" ? "Sachet Pass" : plan.name}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
