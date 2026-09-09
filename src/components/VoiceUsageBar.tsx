import React, { useEffect, useState } from "react";
import { Mic, Zap } from "lucide-react";

interface VoiceUsageBarProps {
  onUpgradeClick: () => void;
  className?: string;
}

interface SubscriptionState {
  effectiveTier: "free" | "plus" | "pro" | "sachet";
  voiceUsage: { secondsUsedToday: number; dailyLimitSeconds: number } | null;
}

// Shown on voice-driven screens (FluidConvo, Speaking Coach) and the Dashboard so Free-tier
// learners always know how much of their 3 daily minutes remain -- per the board doc's P1
// directive: "a prominent 3-minute daily voice timer bar on the home screen."
export const VoiceUsageBar: React.FC<VoiceUsageBarProps> = ({ onUpgradeClick, className = "" }) => {
  const [state, setState] = useState<SubscriptionState | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    fetch("/api/subscription/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setState(data))
      .catch(() => {});
  }, []);

  if (!state || state.effectiveTier !== "free" || !state.voiceUsage) return null;

  const { secondsUsedToday, dailyLimitSeconds } = state.voiceUsage;
  const remaining = Math.max(0, dailyLimitSeconds - secondsUsedToday);
  const percentUsed = Math.min(100, Math.round((secondsUsedToday / dailyLimitSeconds) * 100));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-4 space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Mic size={14} className={remaining > 0 ? "text-blue-600" : "text-rose-500"} />
          <span>Daily AI Voice Time</span>
        </div>
        <span className={`text-xs font-black ${remaining > 0 ? "text-slate-900" : "text-rose-600"}`}>
          {minutes}:{seconds.toString().padStart(2, "0")} left
        </span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${remaining > 0 ? "bg-blue-500" : "bg-rose-500"}`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
      <button
        type="button"
        onClick={onUpgradeClick}
        className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800"
      >
        <Zap size={12} />
        <span>Upgrade for unlimited voice</span>
      </button>
    </div>
  );
};
