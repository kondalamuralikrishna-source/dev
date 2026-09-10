import React from "react";
import { Lock, Zap } from "lucide-react";

interface ScenarioLockOverlayProps {
  onUpgradeClick?: () => void;
}

// Dims a locked scenario card and shows an upgrade CTA on top of it. Used by every scenario grid
// (FluidConvo, L2 Speaking Coach, Stress Speaking, Roleplay) to gate scenarios past the Free
// tier's daily limit, per the board doc's "5 Starter Scenarios" vs "Full 200+ Scenarios" split.
export const ScenarioLockOverlay: React.FC<ScenarioLockOverlayProps> = ({ onUpgradeClick }) => (
  <div
    className="absolute inset-0 rounded-2xl bg-slate-900/55 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1.5 text-center p-3 z-10 cursor-pointer"
    onClick={(e) => {
      e.stopPropagation();
      onUpgradeClick?.();
    }}
  >
    <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
      <Lock size={15} className="text-white" />
    </div>
    <p className="text-[11px] font-black text-white flex items-center gap-1">
      <Zap size={11} className="text-amber-300" />
      <span>Upgrade to Unlock</span>
    </p>
  </div>
);
