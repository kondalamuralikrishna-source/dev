import React, { useState, useEffect } from "react";
import {
  ListOrdered,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  Info,
  Compass,
  Trophy,
  Lightbulb,
} from "lucide-react";
import { useTranslation } from "../context/TranslationContext";

export interface GuideStep {
  title: string;
  instruction: string;
  tip?: string;
}

export interface ModuleHeaderGuideProps {
  moduleTitle: string;
  moduleCategory?: string;
  estimatedTime?: string;
  difficulty?: string;
  steps: GuideStep[];
  completionGoal: string;
  xpReward?: number;
  themeColor?:
    | "indigo"
    | "teal"
    | "emerald"
    | "amber"
    | "violet"
    | "rose"
    | "sky"
    | "cyan"
    | "slate";
  defaultExpanded?: boolean;
  className?: string;
}

export const ModuleHeaderGuide: React.FC<ModuleHeaderGuideProps> = ({
  moduleTitle,
  moduleCategory = "Interactive Module",
  estimatedTime,
  difficulty,
  steps,
  completionGoal,
  xpReward,
  themeColor = "indigo",
  defaultExpanded = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultExpanded);
  const { t, isRegionalActive, currentLanguage, translateWithAI } = useTranslation();

  // Every caller of this shared card passes its own module title, steps, and completion goal as
  // plain English literals. Rather than wiring translation into all ~19 call sites individually,
  // translate them once here so switching the regional language updates every module's guide
  // card automatically.
  const [translated, setTranslated] = useState<{
    moduleTitle: string;
    completionGoal: string;
    steps: GuideStep[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTranslated(null);
    if (!isRegionalActive) return;

    (async () => {
      try {
        const [titleRes, goalRes, ...fieldResults] = await Promise.all([
          translateWithAI(moduleTitle, "module_guide_title"),
          translateWithAI(completionGoal, "module_guide_completion_goal"),
          ...steps.flatMap((step) => [
            translateWithAI(step.title, "module_guide_step_title"),
            translateWithAI(step.instruction, "module_guide_step_instruction"),
            step.tip
              ? translateWithAI(step.tip, "module_guide_step_tip")
              : Promise.resolve({ translatedText: "", targetLanguage: currentLanguage }),
          ]),
        ]);
        if (cancelled) return;

        const rebuiltSteps: GuideStep[] = steps.map((step, idx) => ({
          title: fieldResults[idx * 3]?.translatedText || step.title,
          instruction: fieldResults[idx * 3 + 1]?.translatedText || step.instruction,
          tip: step.tip ? fieldResults[idx * 3 + 2]?.translatedText || step.tip : undefined,
        }));

        setTranslated({
          moduleTitle: titleRes.translatedText || moduleTitle,
          completionGoal: goalRes.translatedText || completionGoal,
          steps: rebuiltSteps,
        });
      } catch (err) {
        console.error("Error translating module guide:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegionalActive, currentLanguage, moduleTitle, completionGoal, JSON.stringify(steps)]);

  const displayModuleTitle = translated?.moduleTitle || moduleTitle;
  const displayCompletionGoal = translated?.completionGoal || completionGoal;
  const displaySteps = translated?.steps || steps;

  // Theme-based class mappings
  const themeStyles = {
    indigo: {
      cardBg: "bg-indigo-950/40 border-indigo-500/30 text-indigo-100",
      badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      stepNum: "bg-indigo-600 text-white shadow-indigo-500/30",
      stepBox: "bg-indigo-900/30 border-indigo-800/60 hover:border-indigo-600/50",
      goalBox: "bg-indigo-950/80 border-indigo-500/40 text-indigo-200",
      accentText: "text-indigo-300",
      toggleBtn: "hover:bg-indigo-800/40 text-indigo-300",
    },
    teal: {
      cardBg: "bg-teal-950/40 border-teal-500/30 text-teal-100",
      badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      stepNum: "bg-teal-600 text-white shadow-teal-500/30",
      stepBox: "bg-teal-900/30 border-teal-800/60 hover:border-teal-600/50",
      goalBox: "bg-teal-950/80 border-teal-500/40 text-teal-200",
      accentText: "text-teal-300",
      toggleBtn: "hover:bg-teal-800/40 text-teal-300",
    },
    emerald: {
      cardBg: "bg-emerald-950/40 border-emerald-500/30 text-emerald-100",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      stepNum: "bg-emerald-600 text-white shadow-emerald-500/30",
      stepBox: "bg-emerald-900/30 border-emerald-800/60 hover:border-emerald-600/50",
      goalBox: "bg-emerald-950/80 border-emerald-500/40 text-emerald-200",
      accentText: "text-emerald-300",
      toggleBtn: "hover:bg-emerald-800/40 text-emerald-300",
    },
    amber: {
      cardBg: "bg-amber-950/40 border-amber-500/30 text-amber-100",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      stepNum: "bg-amber-600 text-slate-950 shadow-amber-500/30",
      stepBox: "bg-amber-900/30 border-amber-800/60 hover:border-amber-600/50",
      goalBox: "bg-amber-950/80 border-amber-500/40 text-amber-200",
      accentText: "text-amber-300",
      toggleBtn: "hover:bg-amber-800/40 text-amber-300",
    },
    violet: {
      cardBg: "bg-purple-950/40 border-purple-500/30 text-purple-100",
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      stepNum: "bg-purple-600 text-white shadow-purple-500/30",
      stepBox: "bg-purple-900/30 border-purple-800/60 hover:border-purple-600/50",
      goalBox: "bg-purple-950/80 border-purple-500/40 text-purple-200",
      accentText: "text-purple-300",
      toggleBtn: "hover:bg-purple-800/40 text-purple-300",
    },
    rose: {
      cardBg: "bg-rose-950/40 border-rose-500/30 text-rose-100",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      stepNum: "bg-rose-600 text-white shadow-rose-500/30",
      stepBox: "bg-rose-900/30 border-rose-800/60 hover:border-rose-600/50",
      goalBox: "bg-rose-950/80 border-rose-500/40 text-rose-200",
      accentText: "text-rose-300",
      toggleBtn: "hover:bg-rose-800/40 text-rose-300",
    },
    sky: {
      cardBg: "bg-sky-950/40 border-sky-500/30 text-sky-100",
      badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      stepNum: "bg-sky-600 text-white shadow-sky-500/30",
      stepBox: "bg-sky-900/30 border-sky-800/60 hover:border-sky-600/50",
      goalBox: "bg-sky-950/80 border-sky-500/40 text-sky-200",
      accentText: "text-sky-300",
      toggleBtn: "hover:bg-sky-800/40 text-sky-300",
    },
    cyan: {
      cardBg: "bg-cyan-950/40 border-cyan-500/30 text-cyan-100",
      badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      stepNum: "bg-cyan-600 text-slate-950 shadow-cyan-500/30",
      stepBox: "bg-cyan-900/30 border-cyan-800/60 hover:border-cyan-600/50",
      goalBox: "bg-cyan-950/80 border-cyan-500/40 text-cyan-200",
      accentText: "text-cyan-300",
      toggleBtn: "hover:bg-cyan-800/40 text-cyan-300",
    },
    slate: {
      cardBg: "bg-slate-900/70 border-slate-700/60 text-slate-100",
      badge: "bg-slate-800 text-slate-300 border-slate-700",
      stepNum: "bg-slate-700 text-white shadow-slate-600/30",
      stepBox: "bg-slate-800/50 border-slate-700/60 hover:border-slate-600",
      goalBox: "bg-slate-950/80 border-slate-700/80 text-slate-200",
      accentText: "text-slate-300",
      toggleBtn: "hover:bg-slate-800 text-slate-300",
    },
  }[themeColor] ?? {
    // Defensive fallback: an invalid/unrecognized themeColor value used to crash this component
    // entirely (reading a property off undefined), blanking the whole page for whatever tab
    // rendered it. Fall back to the indigo theme instead of throwing.
    cardBg: "bg-indigo-950/40 border-indigo-500/30 text-indigo-100",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    stepNum: "bg-indigo-600 text-white shadow-indigo-500/30",
    stepBox: "bg-indigo-900/30 border-indigo-800/60 hover:border-indigo-600/50",
    goalBox: "bg-indigo-950/80 border-indigo-500/40 text-indigo-200",
    accentText: "text-indigo-300",
    toggleBtn: "hover:bg-indigo-800/40 text-indigo-300",
  };

  return (
    <div
      className={`rounded-2xl border backdrop-blur-md overflow-hidden transition-all shadow-sm ${themeStyles.cardBg} ${className}`}
    >
      {/* Header bar */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border bg-black/20">
            <Compass size={13} className={themeStyles.accentText} />
            <span>{t("guide.flow_badge", "Guide & Completion Flow")}</span>
          </div>

          <span className="text-xs font-bold text-white/80 hidden sm:inline-block">
            {displayModuleTitle}
          </span>

          {estimatedTime && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 font-medium text-white/70">
              ⏱ {estimatedTime}
            </span>
          )}

          {xpReward && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black">
              +{xpReward} XP
            </span>
          )}
        </div>

        {/* Toggle Expand / Collapse Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10 transition-colors cursor-pointer ${themeStyles.toggleBtn}`}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Hide instructions" : "Show instructions"}
        >
          <span>{isOpen ? t("guide.hide", "Hide Guide") : t("guide.show", "How to Use")}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expandable Step Details */}
      {isOpen && (
        <div className="px-3.5 pb-4 sm:px-4 space-y-3.5 pt-1 border-t border-white/10">
          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {displaySteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${themeStyles.stepBox}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${themeStyles.stepNum}`}
                    >
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-[11.5px] text-white/80 leading-relaxed pl-7">
                    {step.instruction}
                  </p>
                </div>

                {step.tip && (
                  <div className="mt-2.5 pt-2 border-t border-white/5 pl-7 flex items-start gap-1 text-[10.5px] text-white/60">
                    <Lightbulb size={11} className="shrink-0 mt-0.5 text-amber-300" />
                    <span>{step.tip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Section Completion Criteria Badge */}
          <div
            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${themeStyles.goalBox}`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white">{t("guide.how_to_complete", "How to Complete Section:")} </span>
                <span className="text-white/90">{displayCompletionGoal}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/70 self-end sm:self-center shrink-0">
              <Trophy size={13} className="text-amber-400" />
              <span>{t("guide.milestone_logged", "Milestone Logged Automatically")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
