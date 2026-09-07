import React from "react";
import {
  Award,
  Flame,
  Zap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Bookmark,
  Target,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { UserProgress } from "../types";
import { GRAMMAR_LESSONS, VOCABULARY_COLLECTIONS } from "../data/curriculumData";
import { INITIAL_ACHIEVEMENTS } from "../utils/storageUtils";
import { AudioButton } from "./AudioButton";
import { NavTab } from "./Header";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { AutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";

interface ProgressTrackerProps {
  progress: UserProgress;
  setActiveTab: (tab: NavTab) => void;
  onSelectGrammarLesson: (lessonId: string) => void;
  onResetProgress: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  setActiveTab,
  onSelectGrammarLesson,
  onResetProgress,
}) => {
  const { t } = useTranslation();
  const totalLessons = GRAMMAR_LESSONS.length;
  const completedLessons = progress.completedLessonIds.length;
  const lessonProgressPercent = Math.round(
    (completedLessons / totalLessons) * 100
  );

  const allWords = VOCABULARY_COLLECTIONS.flatMap((c) => c.words);
  const savedWords = allWords.filter((w) => progress.savedVocabIds.includes(w.id));

  // Average quiz score
  const quizScoresList: number[] = Object.values(progress.quizScores || {});
  const avgQuizScore =
    quizScoresList.length > 0
      ? Math.round(
          quizScoresList.reduce((a, b) => a + b, 0) / quizScoresList.length
        )
      : 85;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Module Header Guide */}
      <ModuleHeaderGuide
        moduleTitle="Mastery Metrics & Progress Tracker"
        moduleCategory="Analytics & Achievements"
        estimatedTime="Ongoing Review"
        difficulty="All Activity Logs"
        themeColor="emerald"
        steps={[
          {
            title: "Review Cumulative Learning Stats",
            instruction: "Check total study minutes, daily streak consistency, lessons completed, and earned XP.",
            tip: "Daily streaks unlock special milestone badges.",
          },
          {
            title: "Inspect Weak Grammar Areas",
            instruction: "Review flagged grammar rules and click 'Review Lesson' to practice missed patterns.",
            tip: "Targeted remediation raises quiz scores faster.",
          },
          {
            title: "Track Badges & Achievements",
            instruction: "Monitor your progress toward unlocking milestone trophies and global ranking tiers.",
            tip: "Unlocked badges shine with glowing medals and bonus XP.",
          },
          {
            title: "Access Bookmarked Vocabulary",
            instruction: "Revisit your saved words collection for fast audio-supported spaced repetition.",
            tip: "Listen to pronunciation and quiz yourself on word meanings.",
          },
        ]}
        completionGoal="Review your analytics, remediate flagged grammar topics, and unlock new milestone achievements."
        xpReward={20}
      />

      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t("progress.title", "Learning Analytics & Progress")}
            </h1>
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">
              {t("progress.realtime_tracker", "Real-time Tracker")}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t("progress.subtitle", "Track your CEFR level progression, streak consistency, quiz accuracy, and earned milestone badges.")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("progress.reset_confirm", "Are you sure you want to reset all learning progress?"))) {
              onResetProgress();
            }
          }}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <RotateCcw size={13} />
          <span>{t("progress.reset_progress", "Reset Progress")}</span>
        </button>
      </div>

      {/* 4-Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total XP */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("progress.total_xp", "Total XP")}
            </span>
            <Zap size={18} className="fill-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{progress.xp}</p>
          <span className="text-[11px] text-slate-500 block">
            {t("progress.rank_level", "Rank Level")} {Math.floor(progress.xp / 500) + 1} {t("progress.scholar", "Scholar")}
          </span>
        </div>

        {/* Metric 2: Streak & Goal */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("progress.streak_goal", "Streak & Goal")}
            </span>
            <Flame size={18} className="fill-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {progress.streakDays} <span className="text-sm font-bold text-slate-500">/ {progress.dailyGoalTargetStreak || 14}d</span>
          </p>
          <span className="text-[11px] text-amber-700 font-medium block">
            {progress.todayGoalCompleted
              ? t("progress.goal_met", "✅ Today's Goal Met (+30 XP)")
              : `⚡ ${t("progress.daily_goal_label", "Daily Goal:")} ${
                  progress.dailyGoalType === "lessons"
                    ? `${progress.lessonsToday}/${progress.dailyGoalLessons} ${t("progress.lessons_unit", "Lessons")}`
                    : `${progress.minutesToday}/${progress.dailyGoalMinutes} ${t("progress.mins_unit", "Mins")}`
                }`}
          </span>
        </div>

        {/* Metric 3: Curriculum Completion */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("progress.curriculum_done", "Curriculum Done")}
            </span>
            <CheckCircle2 size={18} />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {lessonProgressPercent}%
          </p>
          <span className="text-[11px] text-slate-500 block">
            {completedLessons} {t("common.of", "of")} {totalLessons} {t("progress.grammar_lessons_unit", "Grammar Lessons")}
          </span>
        </div>

        {/* Metric 4: Average Quiz Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("progress.quiz_accuracy", "Quiz Accuracy")}
            </span>
            <Award size={18} />
          </div>
          <p className="text-3xl font-black text-slate-900">{avgQuizScore}%</p>
          <span className="text-[11px] text-purple-600 font-medium block">
            {progress.completedQuizIds.length} {t("progress.quizzes_attempted", "Quizzes Attempted")}
          </span>
        </div>
      </div>

      {/* CEFR Level Mastery Radar / Bar Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            <span>{t("progress.cefr_skill_distribution", "CEFR Skill Distribution & Mastery")}</span>
          </h2>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
            {t("c2.current_level", "Current Level:")} {progress.selectedLevel}
          </span>
        </div>

        <div className="space-y-4">
          {/* Grammar & Syntax */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{t("progress.grammar_syntax_rules", "Grammar & Syntax Rules")}</span>
              <span className="text-blue-600">
                {Math.min(100, Math.max(30, lessonProgressPercent))}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(30, lessonProgressPercent))}%` }}
              />
            </div>
          </div>

          {/* Vocabulary Breadth */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{t("progress.vocab_idiomatic", "Vocabulary & Idiomatic Expressions")}</span>
              <span className="text-emerald-600">
                {Math.min(100, Math.max(40, (progress.masteredVocabIds.length / allWords.length) * 100))}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(40, (progress.masteredVocabIds.length / allWords.length) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Conversational Fluency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{t("progress.conversational_fluency", "Conversational Fluency & Roleplays")}</span>
              <span className="text-amber-600">75%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `75%` }}
              />
            </div>
          </div>

          {/* Pronunciation & Phonetics */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{t("progress.pronunciation_clarity", "Pronunciation Clarity & Syllable Stress")}</span>
              <span className="text-rose-600">82%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-700"
                style={{ width: `82%` }}
              />
            </div>
          </div>

          {/* High-Pressure Speaking & Stress Composure */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{t("progress.speaking_under_pressure", "Speaking Under Pressure & Crisis Composure")}</span>
              <span className="text-rose-700 font-black">
                {progress.stressTestsCompleted && progress.stressTestsCompleted.length > 0
                  ? `${Math.round(
                      progress.stressTestsCompleted.reduce((a, b) => a + b.score, 0) /
                        progress.stressTestsCompleted.length
                    )}%`
                  : "70%"}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full transition-all duration-700"
                style={{
                  width: `${
                    progress.stressTestsCompleted && progress.stressTestsCompleted.length > 0
                      ? Math.round(
                          progress.stressTestsCompleted.reduce((a, b) => a + b.score, 0) /
                            progress.stressTestsCompleted.length
                        )
                      : 70
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2-Columns: Saved Words Notebook & Achievements Trophy Case */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Saved Vocabulary Notebook */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Bookmark size={18} className="text-amber-500" />
                <span>{t("progress.saved_words_notebook", "Saved Words Notebook")} ({savedWords.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab("vocabulary")}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                {t("progress.open_flashcards", "Open Flashcards")}
              </button>
            </div>

            {savedWords.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                {t("progress.no_saved_words", "No saved words yet. Click the bookmark icon on any flashcard to build your notebook!")}
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {savedWords.map((word) => (
                  <div
                    key={word.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {word.word}
                        </span>
                        <span className="text-[10px] font-mono text-blue-600">
                          {word.phonetic}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        <AutoText as="span" text={word.definition} context="vocab_definition" />
                      </p>
                    </div>
                    <AudioButton text={word.word} size="sm" variant="ghost" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Milestone Badges & Achievements */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            <span>{t("progress.milestone_badges", "Milestone Badges")} ({progress.achievements.length}/{INITIAL_ACHIEVEMENTS.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {INITIAL_ACHIEVEMENTS.map((ach) => {
              const isUnlocked = progress.achievements.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                    isUnlocked
                      ? "bg-amber-50/60 border-amber-200"
                      : "bg-slate-50 border-slate-200 opacity-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isUnlocked
                        ? "bg-amber-400 text-slate-950 shadow-xs"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    <Award size={16} />
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 text-xs">
                      <AutoText as="span" text={ach.title} context="progress_achievement_title" />
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      <AutoText as="span" text={ach.description} context="progress_achievement_description" />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
