import React from "react";
import {
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  Award,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { CEFRLevel, UserProgress } from "../types";
import { CEFR_LEVEL_ORDER, isLevelUnlocked, getNextCEFRLevel } from "../utils/storageUtils";
import { GRAMMAR_LESSONS, VOCABULARY_COLLECTIONS } from "../data/curriculumData";

interface LevelProgressionBannerProps {
  progress: UserProgress;
  onSelectLevel: (level: CEFRLevel) => void;
  onOpenAssessment: () => void;
  onOpenAdvancementExam: (level: CEFRLevel) => void;
}

export const LevelProgressionBanner: React.FC<LevelProgressionBannerProps> = ({
  progress,
  onSelectLevel,
  onOpenAssessment,
  onOpenAdvancementExam,
}) => {
  const currentLevel = progress.selectedLevel || "A1";
  const unlockedLevels = progress.unlockedLevels || ["A1"];
  const nextLevel = getNextCEFRLevel(currentLevel);

  // Calculate tutorials completion for current active level
  const levelLessons = GRAMMAR_LESSONS.filter((l) => l.level === currentLevel);
  const completedLevelLessons = levelLessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  );
  const isCurrentLevelCompleted =
    levelLessons.length > 0 && completedLevelLessons.length === levelLessons.length;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 text-left">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-100">
              CEFR LMS Portal Progression
            </span>
            {progress.assessmentCompleted && (
              <span className="text-[11px] font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 size={12} /> Diagnosed
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Current Active Portal: <span className="text-indigo-600">Level {currentLevel}</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenAssessment}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Retake Diagnostic Assessment</span>
          </button>

          {nextLevel && (
            <button
              type="button"
              onClick={() => onOpenAdvancementExam(currentLevel)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Award size={14} />
              <span>Unlock Level {nextLevel} Test</span>
            </button>
          )}
        </div>
      </div>

      {/* CEFR Level Track Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {CEFR_LEVEL_ORDER.map((lvl) => {
          const unlocked = isLevelUnlocked(lvl, progress);
          const isCurrent = lvl === currentLevel;
          const lessons = GRAMMAR_LESSONS.filter((l) => l.level === lvl);
          const done = lessons.filter((l) => progress.completedLessonIds.includes(l.id)).length;
          const isMastered = lessons.length > 0 && done === lessons.length;

          return (
            <div
              key={lvl}
              onClick={() => {
                if (unlocked) {
                  onSelectLevel(lvl);
                } else {
                  // If locked, let user take the advancement exam to unlock
                  const prevLvl = CEFR_LEVEL_ORDER[CEFR_LEVEL_ORDER.indexOf(lvl) - 1];
                  if (prevLvl) {
                    onOpenAdvancementExam(prevLvl);
                  }
                }
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isCurrent
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.02]"
                  : unlocked
                  ? "bg-slate-50 text-slate-900 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
                  : "bg-slate-100/70 text-slate-400 border-slate-200/60 opacity-85 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                    isCurrent
                      ? "bg-white/20 text-white"
                      : unlocked
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {lvl}
                </span>

                {unlocked ? (
                  <div className="flex items-center gap-1">
                    {isMastered && (
                      <CheckCircle2
                        size={14}
                        className={isCurrent ? "text-amber-300" : "text-emerald-600"}
                      />
                    )}
                    <Unlock size={14} className={isCurrent ? "text-white" : "text-slate-400"} />
                  </div>
                ) : (
                  <Lock size={14} className="text-slate-400" />
                )}
              </div>

              <div className="text-xs font-bold truncate">
                {lvl === "A1"
                  ? "Beginner"
                  : lvl === "A2"
                  ? "Elementary"
                  : lvl === "B1"
                  ? "Intermediate"
                  : lvl === "B2"
                  ? "Upper-Int."
                  : lvl === "C1"
                  ? "Advanced"
                  : "C2 Mastery"}
              </div>

              <div
                className={`text-[10px] mt-1 ${
                  isCurrent ? "text-indigo-200" : unlocked ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {unlocked
                  ? `${done}/${lessons.length} Tutorials`
                  : "Locked • Click to Test"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
