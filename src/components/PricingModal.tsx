import React, { useEffect, useState } from "react";
import { X, Zap, Check, Sparkles, Loader2, Flame, Crown } from "lucide-react";

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

const TIER_STYLE: Record<
  string,
  {
    icon: React.ElementType;
    badge?: string;
    cardBg: string;
    cardBorder: string;
    ring: string;
    iconWrap: string;
    priceColor: string;
    button: string;
  }
> = {
  sachet: {
    icon: Flame,
    cardBg: "bg-white",
    cardBorder: "border-slate-200",
    ring: "",
    iconWrap: "bg-amber-50 text-amber-600",
    priceColor: "text-slate-900",
    button: "bg-slate-900 hover:bg-slate-800 text-white",
  },
  plus: {
    icon: Sparkles,
    badge: "Most Popular",
    cardBg: "bg-gradient-to-b from-emerald-50/60 to-white",
    cardBorder: "border-emerald-300",
    ring: "ring-2 ring-emerald-200",
    iconWrap: "bg-emerald-100 text-emerald-600",
    priceColor: "text-emerald-700",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25",
  },
  pro: {
    icon: Crown,
    badge: "Best Value",
    cardBg: "bg-gradient-to-b from-blue-50/60 to-white",
    cardBorder: "border-blue-400",
    ring: "ring-2 ring-blue-200",
    iconWrap: "bg-blue-100 text-blue-600",
    priceColor: "text-blue-700",
    button: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25",
  },
};

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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 sm:px-8 py-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shrink-0">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Upgrade Your Plan</h2>
              <p className="text-xs text-slate-300 mt-0.5">Unlimited AI voice, full scenarios, and detailed feedback</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-slate-50/60 overflow-y-auto">
          {errorMsg && (
            <div className="mb-3 p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {plans.map((plan) => {
              const style = TIER_STYLE[plan.tier] || TIER_STYLE.sachet;
              const Icon = style.icon;
              const perDay = plan.tier === "sachet" ? plan.amountInr / 7 : plan.amountInr / 30;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-4 flex flex-col transition-transform hover:-translate-y-1 ${style.cardBg} ${style.cardBorder} ${style.ring} ${
                    style.badge ? "shadow-xl" : "shadow-xs"
                  }`}
                >
                  {style.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-md whitespace-nowrap">
                      {style.badge}
                    </span>
                  )}

                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${style.iconWrap}`}>
                    <Icon size={16} />
                  </div>

                  <h3 className="font-black text-slate-900 text-sm">{plan.name}</h3>

                  <div className="mt-1.5 mb-0.5 flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${style.priceColor}`}>₹{plan.amountInr}</span>
                    <span className="text-xs text-slate-500 font-semibold">
                      / {plan.tier === "sachet" ? "7 days" : "month"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mb-2.5">
                    ≈ ₹{perDay.toFixed(0)}/day
                  </p>

                  <p className="text-[11px] text-slate-500 mb-3 leading-snug">{plan.description}</p>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {(TIER_FEATURES[plan.tier] || []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-700">
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
                    className={`w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 ${style.button}`}
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
