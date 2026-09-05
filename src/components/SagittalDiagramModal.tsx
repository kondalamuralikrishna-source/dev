import React, { useState } from "react";
import {
  X,
  Volume2,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { SagittalDiagramConfig } from "../types";
import { SAGITTAL_DIAGRAM_CONFIGS } from "../data/fluidConvoData";
import { speakText } from "../utils/speechUtils";

interface SagittalDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKey?: string;
}

export const SagittalDiagramModal: React.FC<SagittalDiagramModalProps> = ({
  isOpen,
  onClose,
  initialKey = "short_i_vs_long_ee",
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(initialKey);
  const [activeComparison, setActiveComparison] = useState<"target" | "contrast">("target");

  if (!isOpen) return null;

  const currentConfig: SagittalDiagramConfig =
    SAGITTAL_DIAGRAM_CONFIGS[selectedKey] || SAGITTAL_DIAGRAM_CONFIGS.short_i_vs_long_ee;

  const state =
    activeComparison === "target"
      ? currentConfig.vocalTractState
      : {
          ...currentConfig.vocalTractState,
          ...currentConfig.contrastVocalTractState,
        };

  // Dynamic SVG coordinates computed from state
  // Jaw opening shifts the lower jaw and lip downward
  const jawDropY = state.jawOpening * 3.2; // 0 to 32px
  // Tongue height raises/lowers the tongue arch
  const tongueArchY = 190 - state.tongueHeight * 7.5; // High tongue = lower Y
  // Tongue backness shifts arch front/back
  const tongueArchX = 140 + state.tongueBackness * 9.0;
  // Lip protrusion/rounding
  const lipProtrudeX = state.lipRounding * 3.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Articulatory Sagittal Vocal Tract Diagram
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Interactive 2D Phonetics
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Diagnostic physical placement cues to eliminate meaning-altering minimal-pair shifts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sub-selector pills for minimal pair sounds */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-400 shrink-0 mr-1">Pair:</span>
          {Object.entries(SAGITTAL_DIAGRAM_CONFIGS).map(([key, item]) => {
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/50"
                }`}
              >
                <span>{item.targetSound}</span>
                <span className="text-[10px] text-slate-400 font-normal">vs</span>
                <span>{item.contrastSound}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Top: Interactive SVG Anatomical Cross-Section */}
          <div className="lg:col-span-6 bg-slate-950 rounded-2xl border border-slate-800/80 p-4 flex flex-col items-center justify-center relative overflow-hidden">
            {/* View Mode Toggle: Target vs Contrast */}
            <div className="w-full flex items-center justify-between mb-3 z-10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Vocal Tract Cross-Section
              </span>
              <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveComparison("target")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeComparison === "target"
                      ? "bg-teal-500 text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {currentConfig.targetSound}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveComparison("contrast")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeComparison === "contrast"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {currentConfig.contrastSound}
                </button>
              </div>
            </div>

            {/* SVG Sagittal Diagram */}
            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
              <svg
                viewBox="0 0 340 320"
                className="w-full h-full select-none"
                aria-label="Sagittal slice of the human vocal tract"
              >
                <defs>
                  <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#be123c" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="palateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Skull / Head Outline (Neutral profile) */}
                <path
                  d="M 60 40 Q 150 20 250 40 Q 300 80 300 150 L 300 290 Q 250 300 230 300 L 230 260 Q 260 250 260 180 Q 260 110 210 80 Q 150 70 100 85 L 60 40 Z"
                  fill="#1e293b"
                  opacity="0.4"
                />

                {/* Hard Palate & Alveolar Ridge (Top stationary boundary) */}
                <path
                  d="M 60 135 C 75 130, 95 125, 110 120 C 130 115, 170 115, 205 130 C 225 140, 240 165, 245 190 L 255 190 C 250 155, 230 125, 200 105 C 160 85, 115 90, 85 105 L 60 135 Z"
                  fill="url(#palateGrad)"
                  stroke="#64748b"
                  strokeWidth="1.5"
                />

                {/* Upper Teeth & Lip */}
                <path
                  d={`M ${65 - lipProtrudeX} 128 Q 75 128 80 135 L 75 148 L 70 148 L 70 135 Z`}
                  fill="#f8fafc"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <path
                  d={`M 50 110 Q ${55 - lipProtrudeX} 120 ${68 - lipProtrudeX} 130 Q 75 133 80 135`}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Soft Palate / Velum (Elevated for non-nasal, lowered for nasal) */}
                <path
                  d="M 205 130 Q 225 145 235 170 Q 230 175 220 165 Q 212 148 200 135 Z"
                  fill="#94a3b8"
                  opacity="0.9"
                />

                {/* Pharynx Back Wall */}
                <path
                  d="M 250 160 L 250 290"
                  stroke="#475569"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Glottis / Vocal Cords at Bottom */}
                <g transform="translate(225, 270)">
                  <ellipse cx="0" cy="0" rx="14" ry="7" fill={state.voicingActive ? "#10b981" : "#64748b"} />
                  {state.voicingActive && (
                    <circle cx="0" cy="0" r="18" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.6" className="animate-ping" />
                  )}
                  <text x="-25" y="22" fill="#94a3b8" fontSize="10" fontWeight="bold">
                    {state.voicingActive ? "Voiced (Vibrating)" : "Voiceless"}
                  </text>
                </g>

                {/* Active Dynamic Tongue Geometry */}
                <path
                  d={`M 110 ${250 + jawDropY} 
                     C 105 ${230 + jawDropY * 0.7}, 90 ${210 + jawDropY * 0.5}, ${85 + (currentConfig.articulatorFocus === "tongue_tip" ? -5 : 5)} ${175 + jawDropY * 0.3} 
                     Q ${tongueArchX - 30} ${tongueArchY + 10} ${tongueArchX} ${tongueArchY} 
                     Q ${tongueArchX + 45} ${tongueArchY + 20} 220 230 
                     L 215 270 
                     Q 170 280 110 ${250 + jawDropY} Z`}
                  fill="url(#tongueGrad)"
                  stroke="#fb7185"
                  strokeWidth="2"
                  filter="url(#glow)"
                />

                {/* Tongue Tip Focal Indicator */}
                {currentConfig.articulatorFocus === "tongue_tip" && (
                  <circle
                    cx="88"
                    cy={175 + jawDropY * 0.3}
                    r="8"
                    fill="#38bdf8"
                    opacity="0.8"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                )}

                {/* Alveolar Ridge / Blade Focal Indicator */}
                {currentConfig.articulatorFocus === "tongue_blade" && (
                  <circle
                    cx="120"
                    cy={145 + jawDropY * 0.2}
                    r="9"
                    fill="#38bdf8"
                    opacity="0.8"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                )}

                {/* Dorsum Focal Indicator */}
                {currentConfig.articulatorFocus === "tongue_dorsum" && (
                  <circle
                    cx={tongueArchX}
                    cy={tongueArchY}
                    r="9"
                    fill="#38bdf8"
                    opacity="0.8"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                )}

                {/* Lower Teeth & Lip (moves with jaw) */}
                <g transform={`translate(0, ${jawDropY})`}>
                  <path
                    d="M 50 185 Q 60 178 72 172 L 76 160 L 80 160 L 80 172 Q 95 178 105 185"
                    fill="#f8fafc"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                  <path
                    d="M 50 185 Q 60 180 72 175"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </g>

                {/* Airflow trajectory particles */}
                <path
                  d={`M 230 250 Q 210 190 ${tongueArchX} ${tongueArchY - 15} Q 110 135 70 150`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />

                {/* Anatomical Labels */}
                <text x="75" y="95" fill="#94a3b8" fontSize="9" fontWeight="bold">Alveolar Ridge</text>
                <text x="145" y="85" fill="#94a3b8" fontSize="9" fontWeight="bold">Hard Palate</text>
                <text x="215" y="115" fill="#94a3b8" fontSize="9" fontWeight="bold">Velum</text>
                <text x="20" y="160" fill="#94a3b8" fontSize="9" fontWeight="bold">Lips/Teeth</text>
                <text x="120" y="225" fill="#ffffff" fontSize="10" fontWeight="900">Tongue Body</text>
              </svg>
            </div>

            {/* Legend / Metrics */}
            <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-800 text-center">
              <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Jaw Aperture</span>
                <span className="text-xs font-black text-amber-400">
                  {state.jawOpening > 6 ? "Wide Open (8-10mm)" : state.jawOpening > 3 ? "Mid (4-6mm)" : "Closed (1-3mm)"}
                </span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Tongue Arch</span>
                <span className="text-xs font-black text-indigo-400">
                  {state.tongueHeight > 6 ? "High / Palatal" : state.tongueHeight > 3 ? "Mid / Central" : "Low / Flattened"}
                </span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Lip Tension</span>
                <span className="text-xs font-black text-teal-400">
                  {state.lipRounding > 5 ? "Rounded Circle" : state.lipRounding > 2 ? "Neutral Spread" : "Relaxed"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Step-by-Step Pedagogical Articulatory Guidance */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-white">
                    {currentConfig.title}
                  </h3>
                  <p className="text-xs text-indigo-400 font-bold mt-0.5">
                    Critical Minimal Pair: {currentConfig.commonConfusionPair}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const phrase = currentConfig.commonConfusionPair.split(",")[0] || "ship sheep";
                    speakText(phrase, 0.85);
                  }}
                  className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Volume2 size={14} />
                  <span>Listen Pair</span>
                </button>
              </div>

              {/* Step-by-step physical placement directives */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Physical Articulatory Directives</span>
                </span>
                <div className="space-y-2">
                  {currentConfig.articulatoryStepByStep.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-5 h-5 rounded-lg bg-slate-800 text-slate-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step.replace(/^\d+\.\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acoustic & Formant distinction */}
              <div className="bg-slate-800/40 rounded-2xl p-3.5 border border-slate-700/50 space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles size={13} />
                  <span>Acoustic Formant (Spectrogram) Signature</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentConfig.acousticDistinction}
                </p>
              </div>
            </div>

            {/* Bottom Quick Test Prompt */}
            <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-indigo-400 shrink-0" />
                <span className="text-xs text-indigo-200">
                  Ready to test this sound under conversational friction in FluidConvo?
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
              >
                Apply in Studio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
