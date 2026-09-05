import React, { useState } from "react";
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  BookOpen,
  Mic,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Volume2,
  Check,
  Zap,
  Play,
  Layers,
  GraduationCap,
  ShieldCheck,
  Flame,
  MessageSquare,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CEFRLevel, UserProgress, SpokenAssessmentEvaluationResponse } from "../types";
import { CEFR_MODULE_TIERS, CEFRModuleDescriptor } from "../data/spokenAssessmentData";
import { CEFR_LEVEL_ORDER, getCEFRLevelIndex, unlockLevel, recordBenchmarkExamPassed } from "../utils/storageUtils";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";

interface AdaptiveModuleConfiguratorProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onLaunchFluidConvo?: (topic?: string) => void;
  onRetakeAssessment?: () => void;
  onOpenLesson?: (lessonId: string) => void;
}

export const AdaptiveModuleConfigurator: React.FC<AdaptiveModuleConfiguratorProps> = ({
  progress,
  onUpdateProgress,
  onLaunchFluidConvo,
  onRetakeAssessment,
  onOpenLesson,
}) => {
  const diagnosedBand: CEFRLevel = progress.spokenAssessmentResult?.cefr_band || progress.selectedLevel || "B1";
  const [activeViewLevel, setActiveViewLevel] = useState<CEFRLevel>(diagnosedBand);
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>({});
  const [activeDrillModal, setActiveDrillModal] = useState<{
    id: string;
    title: string;
    level: CEFRLevel;
    prompt: string;
  } | null>(null);

  const activeModuleData: CEFRModuleDescriptor = CEFR_MODULE_TIERS[activeViewLevel] || CEFR_MODULE_TIERS.B1;
  const diagnosedIndex = getCEFRLevelIndex(diagnosedBand);

  // Helper to determine status of a tier
  const getTierStatus = (level: CEFRLevel): {
    status: "tested_out" | "active" | "unlocked" | "locked";
    label: string;
    colorClass: string;
  } => {
    const levelIdx = getCEFRLevelIndex(level);
    if (level === diagnosedBand) {
      return {
        status: "active",
        label: "Active Starting Module",
        colorClass: "bg-indigo-600 text-white border-indigo-700 shadow-md",
      };
    }
    if (levelIdx < diagnosedIndex) {
      return {
        status: "tested_out",
        label: "Tested Out / Mastered",
        colorClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300",
      };
    }
    // For levels higher than diagnosed
    if (progress.unlockedLevels?.includes(level)) {
      return {
        status: "unlocked",
        label: "Unlocked Next Tier",
        colorClass: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
      };
    }
    return {
      status: "locked",
      label: "Queued / Locked",
      colorClass: "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400",
    };
  };

  const handleCompleteDrill = (drillId: string) => {
    setCompletedDrills((prev) => ({ ...prev, [drillId]: true }));
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleUnlockNextTier = (level: CEFRLevel) => {
    const updated = unlockLevel(level, 150);
    onUpdateProgress(updated);
    setActiveViewLevel(level);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner: Spoken Assessment Baseline Confirmation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} />
                Screen 3: Adaptive CEFR Module Configurator
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Personalized Spoken Curriculum for {progress.spokenAssessmentResult?.cefr_band ? `Band ${progress.spokenAssessmentResult.cefr_band}` : "Your Level"}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Based on your oral proficiency assessment, lower levels have been automatically marked as tested out, and your curriculum starts right at your optimal communicative threshold.
            </p>
          </div>

          {/* Assessment Score Snapshot */}
          {progress.spokenAssessmentResult && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 shrink-0 shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex flex-col items-center justify-center font-black shadow-inner">
                <span className="text-xs uppercase">Band</span>
                <span className="text-xl leading-none">{progress.spokenAssessmentResult.cefr_band}</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300">Fluency: {progress.spokenAssessmentResult.fluency_score}%</div>
                <div className="text-xs font-bold text-slate-300">Grammar: {progress.spokenAssessmentResult.grammar_score}%</div>
                <div className="text-xs font-bold text-slate-300">Vocab: {progress.spokenAssessmentResult.vocabulary_score}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Retake action */}
        {onRetakeAssessment && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-end">
            <button
              type="button"
              onClick={onRetakeAssessment}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Retake Spoken Assessment</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive CEFR Tier Selector Matrix (A1 - C2) */}
      <ModuleHeaderGuide
        moduleTitle="Study Plan & Adaptive CEFR Curriculum"
        moduleCategory="Custom Study Plan"
        estimatedTime="15–30 min per module"
        difficulty="Adaptive"
        themeColor="violet"
        steps={[
          {
            title: "Review Tested-Out Tiers",
            instruction: "Lower tiers you mastered in your diagnostic assessment are automatically marked as tested out.",
            tip: "You can still click tested-out tiers anytime to review foundational concepts.",
          },
          {
            title: "Select Active Target Tier",
            instruction: "Click on your current active CEFR band to open its targeted communicative grammar and lexical units.",
            tip: "Focus on closing specific phonetic and syntactic gaps identified in your evaluation.",
          },
          {
            title: "Launch Interactive Drills",
            instruction: "Complete the practical oral prompts and conversational speaking drills assigned to each module.",
            tip: "Drills are scored on communicative effectiveness and lexical range.",
          },
          {
            title: "Complete Tier & Level Up",
            instruction: "Finish all required drills in your active tier to graduate to the subsequent CEFR milestone.",
            tip: "Graduation automatically unlocks higher-difficulty conversational scenarios.",
          },
        ]}
        completionGoal="Complete all core spoken drills in your active tier to advance your CEFR roadmap."
        xpReward={100}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>CEFR Proficiency Ladder (A1 to C2)</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Click any level to view curriculum & drills</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CEFR_LEVEL_ORDER.map((level) => {
            const tierData = CEFR_MODULE_TIERS[level];
            const { status, label } = getTierStatus(level);
            const isSelected = activeViewLevel === level;
            const isDiagnosed = diagnosedBand === level;

            return (
              <button
                key={level}
                type="button"
                onClick={() => setActiveViewLevel(level)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-indigo-600 dark:ring-indigo-400 shadow-md bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-700"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Status Indicator Chip */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-black text-slate-900 dark:text-white">{level}</span>
                  {status === "tested_out" && (
                    <span className="p-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full" title="Tested Out">
                      <Check size={14} />
                    </span>
                  )}
                  {status === "active" && (
                    <span className="p-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full animate-pulse" title="Active Baseline">
                      <Zap size={14} />
                    </span>
                  )}
                  {status === "locked" && (
                    <span className="p-1 bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 rounded-full" title="Locked">
                      <Lock size={14} />
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{tierData.badge}</div>
                  <div className="text-[11px] font-semibold mt-1">
                    {status === "tested_out" && (
                      <span className="text-emerald-600 dark:text-emerald-400">Tested Out ✓</span>
                    )}
                    {status === "active" && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">Active Start ★</span>
                    )}
                    {status === "unlocked" && (
                      <span className="text-blue-600 dark:text-blue-400">Unlocked</span>
                    )}
                    {status === "locked" && (
                      <span className="text-slate-400 dark:text-slate-500">Queued</span>
                    )}
                  </div>
                </div>

                {isDiagnosed && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-bl-lg" title="Diagnosed Placement" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Module Detail & Action Canvas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Module Header Bar */}
        <div className={`p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${activeModuleData.accentBg}`}>
                  {activeModuleData.level} • {activeModuleData.badge}
                </span>
                {getTierStatus(activeViewLevel).status === "tested_out" && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Tested Out (Credit Granted)
                  </span>
                )}
                {getTierStatus(activeViewLevel).status === "active" && (
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Zap size={14} /> Recommended Active Starting Tier
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {activeModuleData.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
                {activeModuleData.tagline}
              </p>
            </div>

            {/* Quick Action Button */}
            <div>
              {getTierStatus(activeViewLevel).status === "locked" ? (
                <button
                  type="button"
                  onClick={() => handleUnlockNextTier(activeViewLevel)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
                >
                  <Lock size={15} />
                  <span>Unlock {activeViewLevel} Tier (150 XP)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onLaunchFluidConvo && onLaunchFluidConvo(`${activeViewLevel} Fluency Scenario`)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <MessageSquare size={16} />
                  <span>Live FluidConvo AI Practice</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* CEFR Formal Descriptor */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <GraduationCap size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-0.5">
                Official CEFR Level Descriptor:
              </span>
              <p className="italic leading-relaxed">{activeModuleData.cefrDescriptor}</p>
            </div>
          </div>

          {/* Core Competencies in This Module */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Target Competencies & Oral Skills:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeModuleData.focusSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 shadow-sm"
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Spoken Drills & Lessons */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recommended Interactive Spoken Drills & Modules:
              </h4>
              <span className="text-xs text-slate-400">Audio capture enabled</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeModuleData.sampleLessons.map((lesson) => {
                const isCompleted = !!completedDrills[lesson.id];
                return (
                  <div
                    key={lesson.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between hover:shadow-lg transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {lesson.type.replace("_", " ")}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{lesson.duration}</span>
                      </div>

                      <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                        {lesson.title}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {lesson.summary}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      {isCompleted ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={16} /> Completed
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Ready to Start</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCompleteDrill(lesson.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95"
                        }`}
                      >
                        <Mic size={13} />
                        <span>{isCompleted ? "Practice Again" : "Start Drill"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
