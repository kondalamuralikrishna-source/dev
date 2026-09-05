import React, { useState } from "react";
import {
  Sparkles,
  Volume2,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  Activity,
  Maximize2,
} from "lucide-react";
import { speakText } from "../utils/speechUtils";

export interface VocalTractState {
  jawOpening: number; // 0 to 10
  tongueHeight: number; // 0 (low) to 10 (high)
  tongueBackness: number; // 0 (front) to 10 (back)
  lipRounding: number; // 0 (spread) to 10 (rounded)
  velumRaised: boolean; // true = oral, false = nasal
  vocalFoldsVoiced: boolean; // true = voiced, false = voiceless
  airStreamPath: "oral" | "nasal" | "fricative_dental" | "retroflex";
}

interface VocalTractArticulatorVisualizerProps {
  targetSound?: string;
  producedSound?: string;
  soundLocation?: string;
  articulatoryCorrection?: string;
  visualCueDescription?: string;
}

export const PHONEME_PRESETS: Record<string, {
  name: string;
  ipa: string;
  state: VocalTractState;
  articulatoryNotes: string;
}> = {
  "/θ/": {
    name: "Voiceless Dental Fricative",
    ipa: "/θ/",
    state: {
      jawOpening: 3,
      tongueHeight: 6,
      tongueBackness: 2,
      lipRounding: 1,
      velumRaised: true,
      vocalFoldsVoiced: false,
      airStreamPath: "fricative_dental",
    },
    articulatoryNotes: "Tongue tip protrudes lightly between incisors. Velum raised. Vocal folds apart (unvoiced).",
  },
  "[s]": {
    name: "Voiceless Alveolar Sibilant",
    ipa: "[s]",
    state: {
      jawOpening: 2,
      tongueHeight: 8,
      tongueBackness: 3,
      lipRounding: 1,
      velumRaised: true,
      vocalFoldsVoiced: false,
      airStreamPath: "oral",
    },
    articulatoryNotes: "Tongue tip touches or approaches alveolar ridge behind teeth creating high-frequency friction hiss.",
  },
  "/ð/": {
    name: "Voiced Dental Fricative",
    ipa: "/ð/",
    state: {
      jawOpening: 3,
      tongueHeight: 6,
      tongueBackness: 2,
      lipRounding: 1,
      velumRaised: true,
      vocalFoldsVoiced: true,
      airStreamPath: "fricative_dental",
    },
    articulatoryNotes: "Tongue tip between teeth with active vocal cord vibration.",
  },
  "[d]": {
    name: "Voiced Alveolar Plosive",
    ipa: "[d]",
    state: {
      jawOpening: 2,
      tongueHeight: 9,
      tongueBackness: 3,
      lipRounding: 1,
      velumRaised: true,
      vocalFoldsVoiced: true,
      airStreamPath: "oral",
    },
    articulatoryNotes: "Tongue tip seals alveolar ridge completely, building oral pressure before explosive release.",
  },
  "/iː/": {
    name: "Close Front Unrounded Vowel",
    ipa: "/iː/",
    state: {
      jawOpening: 1,
      tongueHeight: 9,
      tongueBackness: 1,
      lipRounding: 0,
      velumRaised: true,
      vocalFoldsVoiced: true,
      airStreamPath: "oral",
    },
    articulatoryNotes: "High front tongue posture with lateral lip spread and high muscular tension.",
  },
  "[ɪ]": {
    name: "Near-Close Near-Front Lax Vowel",
    ipa: "[ɪ]",
    state: {
      jawOpening: 3,
      tongueHeight: 6,
      tongueBackness: 3,
      lipRounding: 2,
      velumRaised: true,
      vocalFoldsVoiced: true,
      airStreamPath: "oral",
    },
    articulatoryNotes: "Slightly lowered and retracted tongue with relaxed jaw and lips.",
  },
  "/ɹ/": {
    name: "Voiced Post-Alveolar Approximant",
    ipa: "/ɹ/",
    state: {
      jawOpening: 4,
      tongueHeight: 7,
      tongueBackness: 6,
      lipRounding: 4,
      velumRaised: true,
      vocalFoldsVoiced: true,
      airStreamPath: "retroflex",
    },
    articulatoryNotes: "Tongue tip curled back toward post-alveolar region without tapping. Lateral tongue edges seal upper molars.",
  },
  "[ɾ]": {
    name: "Alveolar Tap / Flap",
    ipa: "[ɾ]",
    state: {
      jawOpening: 3,
      tongueHeight: 8,
      tongueBackness: 3,
      lipRounding: 1,
      velumRaised: true,
      vocalFoldsVoiced: true,
      airStreamPath: "oral",
    },
    articulatoryNotes: "Tongue tip executes a momentary tap against the alveolar ridge.",
  },
  "/ŋ/": {
    name: "Voiced Velar Nasal",
    ipa: "/ŋ/",
    state: {
      jawOpening: 3,
      tongueHeight: 9,
      tongueBackness: 9,
      lipRounding: 2,
      velumRaised: false,
      vocalFoldsVoiced: true,
      airStreamPath: "nasal",
    },
    articulatoryNotes: "Tongue back seals firmly against lowered velum; airflow diverts completely through nasal cavity.",
  },
};

export const VocalTractArticulatorVisualizer: React.FC<VocalTractArticulatorVisualizerProps> = ({
  targetSound = "/θ/",
  producedSound = "[s]",
  soundLocation = "thought",
  articulatoryCorrection = "Place the tongue tip lightly between the incisors rather than contacting the alveolar ridge.",
  visualCueDescription,
}) => {
  const [activeSoundMode, setActiveSoundMode] = useState<"target" | "produced">("target");
  const [showWireframe, setShowWireframe] = useState(false);
  const [activeArticulatorFocus, setActiveArticulatorFocus] = useState<string | null>("tongue");

  // Lookup presets or generate calculated state
  const targetPreset = PHONEME_PRESETS[targetSound] || {
    name: `Target Phoneme ${targetSound}`,
    ipa: targetSound,
    state: {
      jawOpening: 3,
      tongueHeight: 6,
      tongueBackness: 3,
      lipRounding: 1,
      velumRaised: true,
      vocalFoldsVoiced: true,
      airStreamPath: "oral",
    },
    articulatoryNotes: articulatoryCorrection,
  };

  const producedPreset = PHONEME_PRESETS[producedSound] || {
    name: `Produced Sound ${producedSound}`,
    ipa: producedSound,
    state: {
      jawOpening: 2,
      tongueHeight: 8,
      tongueBackness: 4,
      lipRounding: 1,
      velumRaised: true,
      vocalFoldsVoiced: false,
      airStreamPath: "oral",
    },
    articulatoryNotes: "Observed articulation pattern before corrective motor feedback.",
  };

  const currentState = activeSoundMode === "target" ? targetPreset.state : producedPreset.state;
  const currentSoundLabel = activeSoundMode === "target" ? targetSound : producedSound;

  // Geometry calculations for Sagittal Cutaway SVG
  const jawDropOffset = currentState.jawOpening * 3.4; // 0 to 34px
  const tongueArchY = 195 - currentState.tongueHeight * 7.8; // higher tongue = lower Y
  const tongueArchX = 145 + currentState.tongueBackness * 8.5; // front vs back
  const lipProtrusionX = currentState.lipRounding * 3.5;

  const handlePlayAudio = (sound: string) => {
    speakText(sound.replace(/[/[\]]/g, "") || "sound");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-xl">
      {/* Header & Sound Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers size={18} />
            </span>
            <h3 className="text-base font-black tracking-tight text-white">
              3D/2D Sagittal Vocal Tract Articulator Model
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Motor SLA Mechanics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing kinetic tongue, lip, velum, and jaw posture in <span className="text-amber-300 font-bold">"{soundLocation}"</span>
          </p>
        </div>

        {/* Target vs Produced Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSoundMode("target")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSoundMode === "target"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle2 size={14} />
            Target {targetSound}
          </button>
          <button
            type="button"
            onClick={() => setActiveSoundMode("produced")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSoundMode === "produced"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertTriangle size={14} />
            Observed {producedSound}
          </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* SVG Vocal Tract Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-4 border border-slate-800/80 relative flex flex-col items-center justify-center min-h-[360px]">
          {/* Top Controls Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                activeSoundMode === "target"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/30"
              }`}>
                {activeSoundMode === "target" ? "Target Model" : "Observed Shift"}: {currentSoundLabel}
              </span>
              <button
                type="button"
                onClick={() => handlePlayAudio(currentSoundLabel)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                title="Hear reference sound"
              >
                <Volume2 size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowWireframe(!showWireframe)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                showWireframe
                  ? "bg-indigo-600 text-white border-indigo-400"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              {showWireframe ? "Wireframe Active" : "Standard Shading"}
            </button>
          </div>

          {/* Dynamic Sagittal SVG Cutaway */}
          <svg
            viewBox="0 0 360 320"
            className="w-full max-w-[340px] h-[300px] select-none transition-all duration-300"
          >
            <defs>
              <linearGradient id="palateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={activeSoundMode === "target" ? "#059669" : "#e11d48"}
                />
                <stop
                  offset="100%"
                  stopColor={activeSoundMode === "target" ? "#047857" : "#be123c"}
                />
              </linearGradient>
              <filter id="glowAir" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Cranium & Head Outline */}
            <path
              d="M 60 280 L 60 120 C 60 50 140 30 220 30 C 300 30 320 90 320 180"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray={showWireframe ? "4 4" : undefined}
            />

            {/* Nasal Cavity (Upper Airway) */}
            <path
              d="M 120 70 C 180 60 230 65 260 100 L 260 120 C 220 95 160 90 120 100 Z"
              fill={currentState.velumRaised ? "#1e293b" : "rgba(20, 184, 166, 0.25)"}
              stroke="#0ea5e9"
              strokeWidth="1.5"
            />
            <text x="160" y="85" fill="#38bdf8" fontSize="9" fontWeight="bold" opacity="0.8">
              Nasal Cavity {currentState.velumRaised ? "(Closed)" : "(Airstream Vented)"}
            </text>

            {/* Hard Palate & Alveolar Ridge */}
            <path
              d="M 95 145 C 110 135 140 125 180 125 C 210 125 240 135 255 155 L 245 165 C 230 150 205 140 180 140 C 145 140 120 148 105 160 Z"
              fill="url(#palateGrad)"
              stroke="#64748b"
              strokeWidth="2"
            />
            {/* Alveolar Ridge Dot indicator */}
            <circle cx="115" cy="146" r="4" fill="#38bdf8" />
            <text x="122" y="142" fill="#94a3b8" fontSize="8">Alveolar Ridge</text>

            {/* Upper Teeth & Lip */}
            <path
              d={`M ${80 - lipProtrusionX} 140 C ${85 - lipProtrusionX} 145 92 148 95 155 L 90 162 C 85 158 80 155 75 150 Z`}
              fill="#cbd5e1"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <text x="45" y="145" fill="#cbd5e1" fontSize="8">Upper Lip</text>

            {/* Dynamic Velum (Soft Palate & Uvula) */}
            <path
              d={
                currentState.velumRaised
                  ? "M 245 165 C 265 170 275 175 280 185 L 272 190 C 265 180 255 175 240 172 Z" // Raised, seals nasal port
                  : "M 245 165 C 255 185 260 205 265 220 L 255 222 C 250 205 245 185 240 172 Z" // Lowered, opens nasal port
              }
              fill="#ec4899"
              stroke="#f43f5e"
              strokeWidth="2"
            />
            <text x="275" y="175" fill="#f43f5e" fontSize="8">
              Velum ({currentState.velumRaised ? "Raised" : "Lowered"})
            </text>

            {/* Posterior Pharyngeal Wall */}
            <path
              d="M 285 120 L 285 270"
              fill="none"
              stroke="#64748b"
              strokeWidth="3"
            />
            <text x="290" y="220" fill="#64748b" fontSize="8">Pharynx</text>

            {/* Vocal Folds & Larynx Glottis */}
            <g transform="translate(250, 260)">
              <rect x="0" y="0" width="30" height="18" rx="4" fill="#334155" stroke="#475569" />
              <path
                d={
                  currentState.vocalFoldsVoiced
                    ? "M 5 9 Q 15 3 25 9 Q 15 15 5 9" // Vibrating folds
                    : "M 5 5 L 25 5 M 5 13 L 25 13" // Folds apart
                }
                fill={currentState.vocalFoldsVoiced ? "#f59e0b" : "none"}
                stroke={currentState.vocalFoldsVoiced ? "#fbbf24" : "#94a3b8"}
                strokeWidth="2"
              />
              <text x="-50" y="12" fill={currentState.vocalFoldsVoiced ? "#fbbf24" : "#94a3b8"} fontSize="8" fontWeight="bold">
                {currentState.vocalFoldsVoiced ? "Vocal Folds [VOICED]" : "Vocal Folds [UNVOICED]"}
              </text>
            </g>

            {/* Dynamic Tongue Body, Tip, and Dorsum */}
            <path
              d={`
                M 85 ${200 + jawDropOffset}
                C ${100} ${190 + jawDropOffset}, ${tongueArchX - 25} ${tongueArchY}, ${tongueArchX} ${tongueArchY}
                C ${tongueArchX + 35} ${tongueArchY}, 235 220, 245 260
                L 210 270
                C 195 240, 150 ${220 + jawDropOffset}, 85 ${215 + jawDropOffset}
                Z
              `}
              fill="url(#tongueGrad)"
              stroke={activeSoundMode === "target" ? "#34d399" : "#fb7185"}
              strokeWidth="2.5"
              className="transition-all duration-300 ease-out"
            />

            {/* Tongue Tip Dot Marker */}
            <circle
              cx={activeSoundMode === "target" && currentSoundLabel.includes("θ") ? 92 : 105}
              cy={activeSoundMode === "target" && currentSoundLabel.includes("θ") ? 162 : 175 + jawDropOffset}
              r="4.5"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            <text
              x={108}
              y={180 + jawDropOffset}
              fill="#ffffff"
              fontSize="8"
              fontWeight="bold"
            >
              Apex (Tip)
            </text>

            {/* Lower Teeth & Mandible (Jaw) */}
            <g transform={`translate(0, ${jawDropOffset})`}>
              <path
                d="M 80 185 L 90 178 L 93 190 L 80 195 Z"
                fill="#cbd5e1"
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
              <path
                d={`M ${75 - lipProtrusionX} 200 C ${80 - lipProtrusionX} 210, 85 220, 95 230 L 75 250 C 60 230, 60 210, ${70 - lipProtrusionX} 200 Z`}
                fill="#334155"
                stroke="#64748b"
                strokeWidth="2"
              />
              <text x="25" y="215" fill="#cbd5e1" fontSize="8">Lower Lip / Mandible</text>
            </g>

            {/* Airflow trajectory glow lines */}
            {currentState.airStreamPath === "fricative_dental" && (
              <path
                d="M 240 250 Q 180 200 120 170 T 80 162"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                filter="url(#glowAir)"
              />
            )}
            {currentState.airStreamPath === "nasal" && (
              <path
                d="M 240 250 Q 250 180 230 110 T 110 80"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                filter="url(#glowAir)"
              />
            )}
          </svg>

          {/* Subtitle description */}
          <div className="text-[11px] text-slate-400 text-center mt-2 px-4 max-w-sm">
            {activeSoundMode === "target" ? targetPreset.articulatoryNotes : producedPreset.articulatoryNotes}
          </div>
        </div>

        {/* Articulatory Diagnostic Metrics & Actionable Cues (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity size={14} className="text-indigo-400" />
              Kinetic Articulator Parameters
            </h4>

            {/* Metric Bars */}
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Tongue Height (Arch)</span>
                  <span className="text-indigo-400 font-bold">{currentState.tongueHeight} / 10</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${currentState.tongueHeight * 10}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Tongue Backness (Front vs Back)</span>
                  <span className="text-indigo-400 font-bold">{currentState.tongueBackness} / 10</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${currentState.tongueBackness * 10}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Mandible (Jaw) Drop</span>
                  <span className="text-amber-400 font-bold">{currentState.jawOpening} / 10</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${currentState.jawOpening * 10}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">Glottal Voicing:</span>
                <span className={`font-black px-2 py-0.5 rounded-md ${
                  currentState.vocalFoldsVoiced
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-slate-800 text-slate-300"
                }`}>
                  {currentState.vocalFoldsVoiced ? "Voiced (Vibrating)" : "Voiceless (Silent)"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Velopharyngeal Port:</span>
                <span className={`font-black px-2 py-0.5 rounded-md ${
                  currentState.velumRaised
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                }`}>
                  {currentState.velumRaised ? "Oral (Velum Up)" : "Nasal Vented (Velum Down)"}
                </span>
              </div>
            </div>

            {/* Actionable SLA Physical Mechanics Prompt */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
                <Sparkles size={14} />
                Actionable Motor Articulation Prescription:
              </div>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">
                {articulatoryCorrection}
              </p>
              {visualCueDescription && (
                <div className="mt-2 pt-2 border-t border-indigo-900/60 text-[11px] text-indigo-300/80 italic">
                  <span className="font-semibold text-indigo-200">3D Kinetic Cue: </span>
                  {visualCueDescription}
                </div>
              )}
            </div>
          </div>

          {/* Quick preset selector for common SLA minimal pairs */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Quick Reference Presets:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {Object.keys(PHONEME_PRESETS).slice(0, 6).map((soundKey) => (
                <button
                  key={soundKey}
                  type="button"
                  onClick={() => {
                    setActiveSoundMode("target");
                    handlePlayAudio(soundKey);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    currentSoundLabel === soundKey
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {soundKey}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
