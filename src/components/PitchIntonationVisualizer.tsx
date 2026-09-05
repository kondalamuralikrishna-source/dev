import React, { useState } from "react";
import {
  Activity,
  TrendingUp,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Info,
  HelpCircle,
} from "lucide-react";
import { SuprasegmentalFeedback } from "../types";

interface PitchIntonationVisualizerProps {
  suprasegmentals: SuprasegmentalFeedback;
  transcript?: string;
  wpm?: number;
}

export const PitchIntonationVisualizer: React.FC<PitchIntonationVisualizerProps> = ({
  suprasegmentals,
  transcript = "We achieve sub-second latency without risking state inconsistency.",
  wpm = 138,
}) => {
  const [selectedContourType, setSelectedContourType] = useState<"natural" | "flat" | "exaggerated">("natural");

  const isGamingDetected =
    typeof suprasegmentals.prosodic_gaming_detected === "boolean"
      ? suprasegmentals.prosodic_gaming_detected
      : suprasegmentals.prosodic_gaming_detected?.toLowerCase().includes("true") ||
        (suprasegmentals.prosodic_gaming_detected && !suprasegmentals.prosodic_gaming_detected.toLowerCase().includes("false"));

  // Generate dynamic F0 pitch curve coordinates based on sentence rhythm
  const words = transcript.split(/\s+/).slice(0, 8);
  const pitchPoints = words.map((word, idx) => {
    const isStressed = idx === 2 || idx === 5 || idx === words.length - 1;
    const baseF0 = 130; // Hz
    let f0 = baseF0;

    if (selectedContourType === "natural") {
      // Natural falling declarative pitch contour with peaks on stressed words
      f0 = isStressed ? baseF0 + 45 - idx * 3 : baseF0 - 15 - idx * 2;
      if (idx === words.length - 1) f0 = 100; // Terminal fall
    } else if (selectedContourType === "flat") {
      // Monotone gaming pattern
      f0 = baseF0 + (idx % 2 === 0 ? 2 : -2);
    } else {
      // Exaggerated unnatural spikes
      f0 = idx % 2 === 0 ? 210 : 90;
    }

    const x = 30 + (idx / Math.max(1, words.length - 1)) * 300;
    const y = 140 - (f0 - 80) * 0.9;
    return { word, x, y, f0: Math.round(f0), isStressed };
  });

  const pathD = pitchPoints.reduce(
    (acc, pt, i) =>
      i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} Q ${(pitchPoints[i - 1].x + pt.x) / 2} ${pt.y} ${pt.x} ${pt.y}`,
    ""
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <TrendingUp size={18} />
            </span>
            <h3 className="text-base font-black tracking-tight text-white">
              Suprasegmental $F_0$ Pitch Dynamics & Rhythm Engine
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Acoustic Prosody
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Clause-level intonation, nuclear stress placement, and stress-timed rhythm analysis
          </p>
        </div>

        {/* Anti-Gaming Flag Status */}
        <div className="flex items-center gap-2">
          {isGamingDetected ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black">
              <ShieldAlert size={14} className="text-rose-400" />
              Prosodic Gaming Detected
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
              <ShieldCheck size={14} className="text-emerald-400" />
              Anti-Gaming Verified: Authentic Prosody
            </div>
          )}
        </div>
      </div>

      {/* Main Pitch Chart Area */}
      <div className="mt-5 space-y-4">
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 relative">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">Fundamental Frequency ($F_0$ Pitch Curve)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">80Hz - 220Hz</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500">Compare Pattern:</span>
              <button
                type="button"
                onClick={() => setSelectedContourType("natural")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                  selectedContourType === "natural"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Learner Authentic
              </button>
              <button
                type="button"
                onClick={() => setSelectedContourType("flat")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                  selectedContourType === "flat"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Monotone Gaming
              </button>
            </div>
          </div>

          {/* SVG Pitch Chart */}
          <svg viewBox="0 0 360 160" className="w-full h-[150px] select-none">
            <defs>
              <linearGradient id="pitchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines (Pitch reference) */}
            <line x1="20" y1="30" x2="340" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
            <text x="5" y="33" fill="#64748b" fontSize="8">200Hz</text>
            <line x1="20" y1="80" x2="340" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
            <text x="5" y="83" fill="#64748b" fontSize="8">140Hz</text>
            <line x1="20" y1="130" x2="340" y2="130" stroke="#1e293b" strokeDasharray="3 3" />
            <text x="5" y="133" fill="#64748b" fontSize="8">80Hz</text>

            {/* Pitch Curve Line */}
            <path
              d={pathD}
              fill="none"
              stroke={selectedContourType === "flat" ? "#f43f5e" : "#14b8a6"}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Word Markers & Pitch Nodes */}
            {pitchPoints.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.isStressed ? 5 : 3.5}
                  fill={pt.isStressed ? "#f59e0b" : "#2dd4bf"}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                <text
                  x={pt.x}
                  y="155"
                  textAnchor="middle"
                  fill={pt.isStressed ? "#fef08a" : "#94a3b8"}
                  fontSize={pt.isStressed ? "9.5" : "8.5"}
                  fontWeight={pt.isStressed ? "bold" : "normal"}
                >
                  {pt.word}
                </text>
              </g>
            ))}
          </svg>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Nuclear / Content Word Stress (Higher Pitch & Longer Duration)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
              Unstressed Syllables (Compressed)
            </span>
          </div>
        </div>

        {/* Detailed Feedback Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pitch & Intonation Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-300">
              <Activity size={15} />
              Intonation Contour & Emphasis
            </div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              {suprasegmentals.pitch_and_intonation}
            </p>
          </div>

          {/* Rhythm, Timing & Tempo */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <Clock size={15} />
                Stress-Timed Cadence & Velocity
              </div>
              <span className="font-mono text-indigo-400 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                {wpm} WPM
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              {suprasegmentals.rhythm_and_timing}
            </p>
          </div>
        </div>

        {/* Gaming Detection Note */}
        {suprasegmentals.prosodic_gaming_detected && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <Info size={14} className="text-indigo-400 shrink-0" />
            <span>
              <strong className="text-slate-300">Anti-Gaming Diagnostic: </strong>
              {typeof suprasegmentals.prosodic_gaming_detected === "string"
                ? suprasegmentals.prosodic_gaming_detected
                : "No robotic alignment trickery detected. Evaluated against SLA natural conversational norms."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
