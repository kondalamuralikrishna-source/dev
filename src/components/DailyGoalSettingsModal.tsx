import React, { useState } from "react";
import {
  X,
  Target,
  Clock,
  BookOpen,
  Flame,
  Check,
  Sparkles,
  Trophy,
  Sliders,
  TrendingUp,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserProgress } from "../types";

interface DailyGoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onSave: (settings: {
    dailyGoalType: "minutes" | "lessons";
    dailyGoalMinutes: number;
    dailyGoalLessons: number;
    dailyGoalTargetStreak: number;
  }) => void;
}

const MINUTE_PRESETS = [
  { value: 5, label: "5 mins", desc: "Casual warm-up" },
  { value: 10, label: "10 mins", desc: "Steady habit" },
  { value: 15, label: "15 mins", desc: "Recommended" },
  { value: 20, label: "20 mins", desc: "Dedicated" },
  { value: 30, label: "30 mins", desc: "Intensive" },
  { value: 45, label: "45 mins", desc: "Accelerated" },
];

const LESSON_PRESETS = [
  { value: 1, label: "1 lesson", desc: "Light pace" },
  { value: 2, label: "2 lessons", desc: "Recommended" },
  { value: 3, label: "3 lessons", desc: "Fast progress" },
  { value: 5, label: "5 lessons", desc: "Power learner" },
];

const STREAK_PRESETS = [
  { value: 7, label: "7 Days", badge: "Sprint", desc: "1-week foundation" },
  { value: 14, label: "14 Days", badge: "Habit", desc: "Brain rewiring" },
  { value: 30, label: "30 Days", badge: "Mastery", desc: "Fluency milestone" },
  { value: 60, label: "60 Days", badge: "Iron Will", desc: "Unbreakable habit" },
  { value: 100, label: "100 Days", badge: "Legend", desc: "True language mastery" },
];

export const DailyGoalSettingsModal: React.FC<DailyGoalSettingsModalProps> = ({
  isOpen,
  onClose,
  progress,
  onSave,
}) => {
  const [goalType, setGoalType] = useState<"minutes" | "lessons">(
    progress.dailyGoalType || "minutes"
  );
  const [minutes, setMinutes] = useState<number>(progress.dailyGoalMinutes || 15);
  const [lessons, setLessons] = useState<number>(progress.dailyGoalLessons || 2);
  const [targetStreak, setTargetStreak] = useState<number>(
    progress.dailyGoalTargetStreak || 14
  );

  if (!isOpen) return null;

  const currentActive = goalType === "minutes" ? progress.minutesToday : progress.lessonsToday;
  const targetValue = goalType === "minutes" ? minutes : lessons;
  const previewPercent = Math.min(100, Math.round((currentActive / targetValue) * 100));

  const handleSave = () => {
    onSave({
      dailyGoalType: goalType,
      dailyGoalMinutes: minutes,
      dailyGoalLessons: lessons,
      dailyGoalTargetStreak: targetStreak,
    });

    if (previewPercent >= 100) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-daily-goal-settings"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-start justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg border border-amber-400/30">
                <Sliders size={16} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Goal Customizer
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Set Your Daily Study & Streak Goal
            </h2>
            <p className="text-xs text-indigo-200">
              Personalize your daily learning target and continuous habit streak milestone.
            </p>
          </div>

          <button
            id="btn-close-daily-goal-modal"
            type="button"
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer relative z-10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Goal Tracking Metric Type */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
              1. Choose Daily Metric
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGoalType("minutes")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  goalType === "minutes"
                    ? "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    goalType === "minutes"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Study Time</h4>
                  <p className="text-xs text-slate-500">Track active minutes</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGoalType("lessons")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  goalType === "lessons"
                    ? "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    goalType === "lessons"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Lessons / Units</h4>
                  <p className="text-xs text-slate-500">Track completed units</p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Target Amount Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                2. Daily Target ({goalType === "minutes" ? "Minutes" : "Lessons"})
              </label>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Selected: {goalType === "minutes" ? `${minutes} Mins / day` : `${lessons} Lessons / day`}
              </span>
            </div>

            {goalType === "minutes" ? (
              <div className="grid grid-cols-3 gap-2">
                {MINUTE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setMinutes(preset.value)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      minutes === preset.value
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <div className="font-extrabold text-sm">{preset.label}</div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        minutes === preset.value ? "text-indigo-200" : "text-slate-500"
                      }`}
                    >
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LESSON_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setLessons(preset.value)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      lessons === preset.value
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <div className="font-extrabold text-sm">{preset.label}</div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        lessons === preset.value ? "text-indigo-200" : "text-slate-500"
                      }`}
                    >
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Target Streak Goal (Continuous Habit Milestone) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Flame size={14} className="text-amber-500 fill-amber-500" />
                <span>3. Continuous Streak Milestone Goal</span>
              </label>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Target: {targetStreak} Days
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STREAK_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setTargetStreak(preset.value)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    targetStreak === preset.value
                      ? "bg-amber-50 border-amber-500 ring-2 ring-amber-400/30"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {preset.label}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                        targetStreak === preset.value
                          ? "bg-amber-500 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Live Progress Preview */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Today's Progress with this Goal</span>
              <span
                className={`font-black ${
                  previewPercent >= 100 ? "text-emerald-600" : "text-indigo-600"
                }`}
              >
                {previewPercent}% Complete ({currentActive} / {targetValue}{" "}
                {goalType === "minutes" ? "mins" : "lessons"})
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  previewPercent >= 100
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-indigo-500 to-amber-400"
                }`}
                style={{ width: `${previewPercent}%` }}
              />
            </div>

            {previewPercent >= 100 && (
              <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                <Check size={13} />
                <span>You will immediately have today's goal marked completed!</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="btn-save-daily-goal-settings"
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Check size={15} />
            <span>Save & Apply Daily Goal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
