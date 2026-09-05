import React, { useState } from "react";
import {
  Flame,
  Clock,
  BookOpen,
  Target,
  Sparkles,
  Sliders,
  CheckCircle,
  TrendingUp,
  Award,
  Zap,
  Plus,
  ArrowRight,
  Trophy,
  Check,
  Calendar,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserProgress } from "../types";
import { DailyGoalSettingsModal } from "./DailyGoalSettingsModal";
import { NavTab } from "./Header";

interface DailyStudyGoalCardProps {
  progress: UserProgress;
  onUpdateGoalSettings: (settings: {
    dailyGoalType: "minutes" | "lessons";
    dailyGoalMinutes: number;
    dailyGoalLessons: number;
    dailyGoalTargetStreak: number;
  }) => void;
  onLogStudyMinutes?: (minutes: number) => void;
  setActiveTab: (tab: NavTab) => void;
  onSelectGrammarLesson: (lessonId: string) => void;
}

export const DailyStudyGoalCard: React.FC<DailyStudyGoalCardProps> = ({
  progress,
  onUpdateGoalSettings,
  onLogStudyMinutes,
  setActiveTab,
  onSelectGrammarLesson,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeViewMetric, setActiveViewMetric] = useState<"minutes" | "lessons">(
    progress.dailyGoalType || "minutes"
  );
  const [loggedToast, setLoggedToast] = useState<string | null>(null);

  const goalType = progress.dailyGoalType || "minutes";
  const targetMinutes = progress.dailyGoalMinutes || 15;
  const targetLessons = progress.dailyGoalLessons || 2;
  const targetStreak = progress.dailyGoalTargetStreak || 14;

  const currentMinutes = progress.minutesToday || 0;
  const currentLessons = progress.lessonsToday || 0;

  // Active tracked values based on selected primary goal
  const currentVal = activeViewMetric === "minutes" ? currentMinutes : currentLessons;
  const targetVal = activeViewMetric === "minutes" ? targetMinutes : targetLessons;
  const percentComplete = Math.min(100, Math.round((currentVal / targetVal) * 100));

  const isTodayGoalMet =
    progress.todayGoalCompleted ||
    (goalType === "minutes" ? currentMinutes >= targetMinutes : currentLessons >= targetLessons);

  // Streak calculation
  const streakDays = progress.streakDays || 1;
  const streakPercent = Math.min(100, Math.round((streakDays / targetStreak) * 100));

  // Generate 7-day strip data
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const isCurrentDay = i === 6;
    const dayLabel = dayNames[d.getDay()];

    const match = (progress.dailyActivityHistory || []).find((h) => h.date === dateStr);
    const completed = isCurrentDay
      ? isTodayGoalMet
      : match?.goalMet || (i < 6 && streakDays > (6 - i));

    return {
      dateStr,
      dayLabel,
      isCurrentDay,
      completed,
      minutes: match?.minutes ?? (isCurrentDay ? currentMinutes : completed ? targetMinutes : 0),
    };
  });

  const handleQuickBoost = (mins: number) => {
    if (onLogStudyMinutes) {
      onLogStudyMinutes(mins);
      setLoggedToast(`+${mins} study minutes logged! Keep it up! 🚀`);
      setTimeout(() => setLoggedToast(null), 3000);

      // Check if newly met
      if (currentMinutes + mins >= targetMinutes) {
        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }
      }
    }
  };

  return (
    <div
      id="card-daily-study-goal"
      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden transition-all"
    >
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with Goal Status & Customize button */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Target size={18} />
            </span>
            <h2 className="text-lg font-black tracking-tight text-slate-900">
              Daily Study & Streak Goal
            </h2>
            {isTodayGoalMet ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                <CheckCircle size={13} className="text-emerald-600" />
                <span>Today's Goal Met! 🔥 (+30 XP)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                <Sparkles size={13} className="text-amber-600" />
                <span>
                  {activeViewMetric === "minutes"
                    ? `${Math.max(0, targetMinutes - currentMinutes)} mins remaining`
                    : `${Math.max(0, targetLessons - currentLessons)} lessons remaining`}
                </span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Track your daily focus time and build an unbroken streak toward your{" "}
            <span className="font-bold text-slate-700">{targetStreak}-Day Streak Target</span>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Metric View Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              id="btn-switch-goal-minutes"
              type="button"
              onClick={() => setActiveViewMetric("minutes")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeViewMetric === "minutes"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock size={13} />
              <span>Minutes ({currentMinutes}/{targetMinutes}m)</span>
            </button>

            <button
              id="btn-switch-goal-lessons"
              type="button"
              onClick={() => setActiveViewMetric("lessons")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeViewMetric === "lessons"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookOpen size={13} />
              <span>Lessons ({currentLessons}/{targetLessons})</span>
            </button>
          </div>

          <button
            id="btn-customize-daily-goal"
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
            title="Customize Goal & Streak Target"
          >
            <Sliders size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: 3 Analytical Pillar Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Today's Active Goal Progress */}
        <div className="bg-gradient-to-br from-indigo-50/80 to-slate-50 rounded-2xl p-4.5 border border-indigo-100 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              {activeViewMetric === "minutes" ? <Clock size={15} /> : <BookOpen size={15} />}
              <span>Today's {activeViewMetric === "minutes" ? "Study Minutes" : "Completed Lessons"}</span>
            </span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full ${
                percentComplete >= 100
                  ? "bg-emerald-500 text-white"
                  : "bg-indigo-600 text-white"
              }`}
            >
              {percentComplete}%
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {currentVal}
              </span>
              <span className="text-slate-500 font-bold text-sm">
                / {targetVal} {activeViewMetric === "minutes" ? "minutes" : "lessons"}
              </span>
            </div>

            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-700 ${
                  percentComplete >= 100
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-indigo-600 to-amber-400"
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
            <span>
              {isTodayGoalMet ? "🎉 Target smashed for today!" : "🚀 Keep learning to hit 100%!"}
            </span>
            {onLogStudyMinutes && (
              <button
                id="btn-quick-log-study-time"
                type="button"
                onClick={() => handleQuickBoost(5)}
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <Plus size={12} />
                <span>+5 Mins</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Habit Streak Milestone Target */}
        <div className="bg-gradient-to-br from-amber-50/80 to-slate-50 rounded-2xl p-4.5 border border-amber-100 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Flame size={15} className="text-amber-500 fill-amber-500" />
              <span>Streak Milestone</span>
            </span>
            <span className="text-xs font-extrabold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
              {streakPercent}% of Habit Goal
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-900 flex items-center gap-1">
                {streakDays} <span className="text-lg font-bold text-amber-700">Days</span>
              </span>
              <span className="text-slate-500 font-bold text-sm">
                / {targetStreak} Days Target
              </span>
            </div>

            <div className="w-full h-3 bg-amber-200/60 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                style={{ width: `${streakPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-amber-900 pt-1 font-semibold">
            <span className="flex items-center gap-1">
              <Trophy size={13} className="text-amber-600" />
              <span>
                {streakDays >= targetStreak
                  ? "Champion! Set a higher streak target!"
                  : `${targetStreak - streakDays} days to ${targetStreak}-Day Milestone`}
              </span>
            </span>
          </div>
        </div>

        {/* Card 3: 7-Day Consistency Week Strip */}
        <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar size={15} className="text-slate-500" />
              <span>Past 7 Days Matrix</span>
            </span>
            <span className="text-xs font-bold text-indigo-600">
              {past7Days.filter((d) => d.completed).length}/7 Active
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {past7Days.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400">
                  {day.dayLabel}
                </span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    day.isCurrentDay
                      ? isTodayGoalMet
                        ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                        : "bg-indigo-600 text-white ring-2 ring-indigo-300 animate-pulse"
                      : day.completed
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-200 text-slate-400"
                  }`}
                  title={`${day.dateStr}: ${day.minutes} mins studied`}
                >
                  {day.completed ? (
                    <Check size={14} className="stroke-[3]" />
                  ) : day.isCurrentDay ? (
                    <Clock size={12} />
                  ) : (
                    "•"
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Continuous habit tracking</span>
            <span className="font-bold text-slate-700">
              Total XP: <span className="text-indigo-600">+{progress.xp}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="relative z-10 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
            ⚡
          </span>
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              Quick Study Actions to Advance Today's Goal
            </h4>
            <p className="text-[11px] text-slate-500">
              Jump directly into interactive grammar units, vocabulary decks, or speaking drills.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-quick-grammar-study"
            type="button"
            onClick={() => setActiveTab("grammar")}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen size={13} />
            <span>Grammar Lesson (+5m)</span>
          </button>

          <button
            id="btn-quick-pronunciation-study"
            type="button"
            onClick={() => setActiveTab("pronunciation")}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Pronounce Practice (+5m)</span>
          </button>

          <button
            id="btn-quick-roleplay-study"
            type="button"
            onClick={() => setActiveTab("chat")}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap size={13} />
            <span>AI Roleplay (+5m)</span>
          </button>
        </div>
      </div>

      {/* Floating feedback toast */}
      {loggedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <Sparkles size={15} className="text-amber-400" />
          <span>{loggedToast}</span>
        </div>
      )}

      {/* Daily Goal Settings Modal */}
      <DailyGoalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        progress={progress}
        onSave={onUpdateGoalSettings}
      />
    </div>
  );
};
