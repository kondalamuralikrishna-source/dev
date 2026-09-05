import React, { useState } from "react";
import {
  Brain,
  Activity,
  Globe,
  Briefcase,
  ShieldAlert,
  BarChart3,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { UserProgress } from "../types";
import { ErrorMemoryStudio } from "./ErrorMemoryStudio";
import { GranularProsodyStudio } from "./GranularProsodyStudio";
import { RegisterCulturalStudio } from "./RegisterCulturalStudio";
import { DomainMasteryStudio } from "./DomainMasteryStudio";
import { AfterActionAuditStudio } from "./AfterActionAuditStudio";
import { AntiGamingAseEngineStudio } from "./AntiGamingAseEngineStudio";
import { PsychometricALAEvaluatorStudio } from "./PsychometricALAEvaluatorStudio";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";

export type FluencySubModule =
  | "overview"
  | "error_memory"
  | "prosody"
  | "register"
  | "domain"
  | "audit"
  | "ase_engine"
  | "psychometric_ala";

interface FluencySuiteHubProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onGrantXp: (amount: number, reason: string) => void;
  initialModule?: FluencySubModule;
}

export const FluencySuiteHub: React.FC<FluencySuiteHubProps> = ({
  progress,
  onUpdateProgress,
  onGrantXp,
  initialModule = "overview",
}) => {
  const [activeModule, setActiveModule] = useState<FluencySubModule>(initialModule);

  const errorBankCount = progress.errorMemoryBank?.length || 0;
  const auditCount = progress.afterActionAudits?.length || 0;

  const differentiators = [
    {
      id: "error_memory" as FluencySubModule,
      title: "1. Targeted Revision Bank",
      tag: "Personalized Review",
      desc: "Automatically saves grammar, vocabulary, and phonetic corrections to reinforce accurate patterns during future practice sessions.",
      icon: Brain,
      color: "from-indigo-600 to-purple-600",
      badge: `${errorBankCount} Items Saved`,
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "prosody" as FluencySubModule,
      title: "2. Speech Rhythm & Intonation",
      tag: "Acoustic Practice",
      desc: "Detailed acoustic insights on syllable stress hierarchy, pitch contour curves, speaking rate, and natural phrasing pauses.",
      icon: Activity,
      color: "from-teal-600 to-emerald-600",
      badge: "Rhythm & Pitch Map",
      badgeColor: "bg-teal-100 text-teal-800",
    },
    {
      id: "register" as FluencySubModule,
      title: "3. Tone & Communication Styles",
      tag: "Contextual Tone",
      desc: "Practice adjusting phrasing across 5 calibrated communication styles (Casual to Executive Formal) with natural nuance and polite phrasing.",
      icon: Globe,
      color: "from-purple-600 to-pink-600",
      badge: "Style Ladder",
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      id: "domain" as FluencySubModule,
      title: "4. Professional Scenario Practice",
      tag: "Real-World Scenarios",
      desc: "Targeted scenario tracks (Tech Architecture, Business Strategy, Negotiations) with relevant vocabulary and active conversational dynamics.",
      icon: Briefcase,
      color: "from-blue-600 to-indigo-600",
      badge: "Dynamic Scenarios",
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      id: "audit" as FluencySubModule,
      title: "5. Performance Audits & Feedback",
      tag: "Session Analytics",
      desc: "Review comprehensive feedback on vocabulary diversity, filler word frequency, sentence structure, and suggested polish rewrites.",
      icon: BarChart3,
      color: "from-emerald-600 to-teal-600",
      badge: `${auditCount} Reports Saved`,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "ase_engine" as FluencySubModule,
      title: "6. Acoustic & Pacing Analysis",
      tag: "Voice Diagnostics",
      desc: "Comprehensive speech evaluation measuring pitch contour balance, articulation rate, syllabic stability, and vocal dynamics.",
      icon: ShieldAlert,
      color: "from-rose-600 via-teal-700 to-slate-900",
      badge: "Acoustic Metrics",
      badgeColor: "bg-teal-100 text-teal-900 font-bold",
    },
    {
      id: "psychometric_ala" as FluencySubModule,
      title: "7. Psychometric ALA & Inclusive Assessment",
      tag: "Fairness & CEFR Standard",
      desc: "Empirical Automated Language Assessment with accent-neutral intelligibility disambiguation, motor-speech dysfluency shielding, and 1.0–9.0 band scoring.",
      icon: Brain,
      color: "from-emerald-600 via-teal-700 to-slate-900",
      badge: "ALA Psychometrics",
      badgeColor: "bg-emerald-100 text-emerald-900 font-bold",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Module Header Guide */}
      <ModuleHeaderGuide
        moduleTitle="Advanced Fluency Workshop & Specialized Studios"
        moduleCategory="Fluency & Pragmatics"
        estimatedTime="10–20 min per studio"
        difficulty="Intermediate to Advanced"
        themeColor="purple"
        steps={[
          {
            title: "Select Specialized Practice Studio",
            instruction: "Navigate between Revision Bank, Prosody/Intonation, Register/Pragmatics, Domain Scenarios, and Performance Audits.",
            tip: "Each studio zeroes in on a specific linguistic capability.",
          },
          {
            title: "Review Dynamic Error Memory",
            instruction: "Inspect recurring grammar slips and phonetic traps captured from your speaking sessions.",
            tip: "Eliminating top repeat mistakes creates fast fluency breakthroughs.",
          },
          {
            title: "Fine-tune Pitch, Cadence & Register",
            instruction: "Practice pitch contours, chunking rhythms, and diplomatic tone shifts in the Prosody and Register studios.",
            tip: "Compare your spoken waveform against native intonation contours.",
          },
          {
            title: "Generate Pedagogical After-Action Audit",
            instruction: "Export structured linguistic reports with communicative recommendations and earned XP.",
            tip: "Helps document your progress for professional and academic fluency.",
          },
        ]}
        completionGoal="Complete drills across any specialized fluency studio to strengthen prosody and professional register."
        xpReward={75}
      />

      {/* Navigation Sub-bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveModule("overview")}
          className={`px-3.5 py-2 text-xs font-black rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeModule === "overview"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>Workshop Overview</span>
        </button>

        <div className="h-5 w-px bg-slate-200 my-auto shrink-0" />

        <button
          type="button"
          onClick={() => setActiveModule("error_memory")}
          className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeModule === "error_memory"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-700 hover:bg-indigo-50"
          }`}
        >
          <Brain size={14} />
          <span>Revision Bank</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-900 px-1.5 rounded-full font-bold">
            {errorBankCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule("prosody")}
          className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeModule === "prosody"
              ? "bg-teal-600 text-white shadow-xs"
              : "text-slate-700 hover:bg-teal-50"
          }`}
        >
          <Activity size={14} />
          <span>Rhythm & Intonation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule("register")}
          className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeModule === "register"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-700 hover:bg-purple-50"
          }`}
        >
          <Globe size={14} />
          <span>Tone & Styles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule("domain")}
          className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeModule === "domain"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-700 hover:bg-blue-50"
          }`}
        >
          <Briefcase size={14} />
          <span>Professional Scenarios</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule("audit")}
          className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeModule === "audit"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-700 hover:bg-emerald-50"
          }`}
        >
          <BarChart3 size={14} />
          <span>Performance Audits</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule("ase_engine")}
          className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeModule === "ase_engine"
              ? "bg-teal-700 text-white shadow-xs"
              : "text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200/80"
          }`}
        >
          <ShieldAlert size={14} className={activeModule === "ase_engine" ? "text-white" : "text-teal-600"} />
          <span>Acoustic Diagnostics</span>
          <span className="text-[9px] bg-teal-200 text-teal-950 font-black px-1.5 py-0.2 rounded-full uppercase">
            VOICE
          </span>
        </button>
      </div>

      {/* OVERVIEW MODULE */}
      {activeModule === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Hero */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 shadow-xs">
                  REAL-WORLD FLUENCY ARCHITECTURE
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  6 Core Structural Market Differentiators
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-white mb-3">
                Bridging Guided Practice to Real-World Spoken Fluency
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Most language apps treat mistakes as isolated events, provide binary right/wrong
                scores, and ignore pragmatic register. LinguaFlow introduces dynamic error memory
                re-testing, deep acoustic prosody modeling, cultural register calibration, high-stakes
                domain friction, and post-session After-Action Audits.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModule("error_memory")}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Brain size={15} />
                  <span>Explore Error Memory Bank</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule("audit")}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl border border-slate-700 transition-all flex items-center gap-2"
                >
                  <BarChart3 size={15} className="text-emerald-400" />
                  <span>View After-Action Audit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Differentiator Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {differentiators.map((diff) => {
              const Icon = diff.icon;
              return (
                <div
                  key={diff.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${diff.color} text-white flex items-center justify-center shadow-xs`}>
                        <Icon size={22} />
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${diff.badgeColor}`}>
                        {diff.badge}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {diff.tag}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5 mb-2">
                      {diff.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      {diff.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModule(diff.id)}
                    className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Studio</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-STUDIOS */}
      {activeModule === "error_memory" && (
        <ErrorMemoryStudio
          progress={progress}
          onUpdateProgress={onUpdateProgress}
          onGrantXp={onGrantXp}
        />
      )}

      {activeModule === "prosody" && (
        <GranularProsodyStudio
          progress={progress}
          onGrantXp={onGrantXp}
        />
      )}

      {activeModule === "register" && (
        <RegisterCulturalStudio
          progress={progress}
          onGrantXp={onGrantXp}
        />
      )}

      {activeModule === "domain" && (
        <DomainMasteryStudio
          progress={progress}
          onGrantXp={onGrantXp}
          onLaunchAuditView={() => setActiveModule("audit")}
        />
      )}

      {activeModule === "audit" && (
        <AfterActionAuditStudio
          progress={progress}
          onUpdateProgress={onUpdateProgress}
          onGrantXp={onGrantXp}
        />
      )}

      {activeModule === "ase_engine" && (
        <AntiGamingAseEngineStudio
          progress={progress}
          onGrantXp={onGrantXp}
        />
      )}

      {activeModule === "psychometric_ala" && (
        <PsychometricALAEvaluatorStudio
          progress={progress}
          onGrantXp={onGrantXp}
        />
      )}
    </div>
  );
};
