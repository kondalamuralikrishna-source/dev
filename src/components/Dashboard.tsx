import React from "react";
import {
  Flame,
  Zap,
  BookOpen,
  Award,
  MessageSquare,
  Mic,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Layers,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Crown,
  BarChart3,
  Radio,
  Globe,
  Brain,
  Activity,
  Scale,
} from "lucide-react";
import { CEFRLevel, UserProgress } from "../types";
import { GRAMMAR_LESSONS, VOCABULARY_COLLECTIONS } from "../data/curriculumData";
import { AudioButton } from "./AudioButton";
import { NavTab } from "./Header";
import { LevelProgressionBanner } from "./LevelProgressionBanner";
import { DailyStudyGoalCard } from "./DailyStudyGoalCard";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { LanguageSelector } from "./LanguageSelector";

interface DashboardProps {
  progress: UserProgress;
  learnerName?: string;
  setActiveTab: (tab: NavTab) => void;
  onSelectGrammarLesson: (lessonId: string) => void;
  onSelectVocabCollection: (collectionId: string) => void;
  onSelectLevel: (level: CEFRLevel) => void;
  onOpenAssessment: () => void;
  onOpenAdvancementExam: (level: CEFRLevel) => void;
  onUpdateGoalSettings: (settings: {
    dailyGoalType: "minutes" | "lessons";
    dailyGoalMinutes: number;
    dailyGoalLessons: number;
    dailyGoalTargetStreak: number;
  }) => void;
  onLogStudyMinutes?: (minutes: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  learnerName,
  setActiveTab,
  onSelectGrammarLesson,
  onSelectVocabCollection,
  onSelectLevel,
  onOpenAssessment,
  onOpenAdvancementExam,
  onUpdateGoalSettings,
  onLogStudyMinutes,
}) => {
  // Find next uncompleted grammar lesson for current level
  const currentLevelLessons = GRAMMAR_LESSONS.filter((l) => l.level === progress.selectedLevel);
  const nextLesson =
    currentLevelLessons.find((l) => !progress.completedLessonIds.includes(l.id)) ||
    GRAMMAR_LESSONS.find((l) => !progress.completedLessonIds.includes(l.id)) ||
    GRAMMAR_LESSONS[0];

  // Daily vocabulary word
  const dailyWord = VOCABULARY_COLLECTIONS[0]?.words[0];

  const completedLessonsCount = progress.completedLessonIds.length;
  const totalLessonsCount = GRAMMAR_LESSONS.length;
  const overallCurriculumPercent = Math.round(
    (completedLessonsCount / totalLessonsCount) * 100
  );

  const goalType = progress.dailyGoalType || "minutes";
  const targetVal = goalType === "minutes" ? progress.dailyGoalMinutes || 15 : progress.dailyGoalLessons || 2;
  const currentVal = goalType === "minutes" ? progress.minutesToday || 0 : progress.lessonsToday || 0;
  const goalPercent = Math.min(100, Math.round((currentVal / targetVal) * 100));

  const hourOfDay = new Date().getHours();
  const timeGreeting = hourOfDay < 12 ? "Good morning" : hourOfDay < 17 ? "Good afternoon" : "Good evening";
  const firstName = learnerName?.split(" ")[0] || "Learner";

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            {timeGreeting}, {firstName}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Small steps every day lead to big progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-orange-200 rounded-2xl px-4 py-2 shadow-xs">
            <Flame size={18} className="fill-orange-500 text-orange-500" />
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">{progress.streakDays}</p>
              <p className="text-[10px] text-slate-500 font-semibold">Day Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-2xl px-4 py-2 shadow-xs">
            <CheckCircle size={18} className="text-emerald-500" />
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">
                {goalPercent >= 100 ? "Complete" : `${goalPercent}%`}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold">Today's Goal</p>
            </div>
          </div>
        </div>
      </div>

      {/* High-Visibility Mother Tongue Translation Banner */}
      <LanguageSelector variant="banner" />

      {/* Hero Welcome & Daily Motivation */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-200 text-xs font-semibold tracking-wide border border-white/15">
              <Sparkles size={14} className="text-amber-400" />
              <span>Active CEFR Level {progress.selectedLevel} LMS Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to elevate your English today?
            </h1>
            <p className="text-blue-200 text-sm sm:text-base max-w-xl leading-relaxed">
              Complete your level tutorials, build vocabulary fluency, and pass benchmark exams to unlock advanced CEFR levels.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="btn-continue-next-lesson"
                type="button"
                onClick={() => {
                  onSelectGrammarLesson(nextLesson.id);
                  setActiveTab("grammar");
                }}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span>Continue: {nextLesson.title}</span>
                <ArrowRight size={16} />
              </button>

              <button
                id="btn-l2-speaking-coach-quick"
                type="button"
                onClick={() => setActiveTab("roleplay_coach")}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-teal-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={16} className="text-slate-950" />
                <span>Speaking Coach</span>
                <span className="text-[10px] bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded font-black">
                  INTERACTIVE
                </span>
              </button>

              <button
                id="btn-practice-fluidconvo-quick"
                type="button"
                onClick={() => setActiveTab("fluidconvo")}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-sm rounded-xl border border-white/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Radio size={16} className="text-teal-300 animate-pulse" />
                <span>Live Voice Chat</span>
              </button>

              <button
                id="btn-practice-fluency-suite-quick"
                type="button"
                onClick={() => setActiveTab("fluency_suite")}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Brain size={16} className="text-amber-300" />
                <span>Fluency Workshop</span>
                <span className="text-[10px] bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded font-black">
                  WORKSHOP
                </span>
              </button>

              <button
                id="btn-practice-speaking-quick"
                type="button"
                onClick={() => setActiveTab("chat")}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare size={16} className="text-amber-300" />
                <span>Roleplay Scenarios</span>
              </button>

              <button
                id="btn-pronunciation-quick"
                type="button"
                onClick={() => setActiveTab("pronunciation")}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Mic size={16} className="text-rose-300" />
                <span>Pronunciation Lab</span>
              </button>

              <button
                id="btn-stress-drills-quick"
                type="button"
                onClick={() => setActiveTab("stress")}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <ShieldAlert size={16} className="text-amber-300" />
                <span>Timed Drills</span>
              </button>
            </div>
          </div>

          {/* Daily Progress Gauge Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-blue-200">
                Daily Goal • {goalType === "minutes" ? "Minutes" : "Lessons"}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  goalPercent >= 100
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-amber-400 text-slate-950"
                }`}
              >
                {goalPercent}% {goalPercent >= 100 ? "Goal Met!" : "Done"}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {currentVal}
              </span>
              <span className="text-blue-200 text-sm">
                / {targetVal} {goalType === "minutes" ? "active mins" : "lessons"}
              </span>
            </div>

            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  goalPercent >= 100
                    ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                    : "bg-gradient-to-r from-amber-400 to-amber-300"
                }`}
                style={{ width: `${goalPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                <span className="text-xs text-blue-200 block">Streak</span>
                <span className="text-lg font-bold text-amber-300 flex items-center justify-center gap-1">
                  <Flame size={16} className="fill-amber-400" /> {progress.streakDays} / {progress.dailyGoalTargetStreak || 14}d
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                <span className="text-xs text-blue-200 block">Earned XP</span>
                <span className="text-lg font-bold text-blue-100 flex items-center justify-center gap-1">
                  <Zap size={16} className="fill-blue-400 text-blue-400" /> {progress.xp}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Daily Study Goal & Streak Target Feature */}
      <ModuleHeaderGuide
        moduleTitle="Dashboard & Daily Progress Hub"
        moduleCategory="Overview"
        estimatedTime="Daily 10–20 min"
        difficulty="All CEFR Levels"
        themeColor="indigo"
        steps={[
          {
            title: "Check Daily Goal & Streak",
            instruction: "Review your target study minutes or lesson count and maintain your daily streak count.",
            tip: "Consistent 15-min daily sessions beat sporadic long cram sessions.",
          },
          {
            title: "Choose Active Learning Path",
            instruction: "Continue your next recommended CEFR Grammar Lesson, or jump into Speaking Coach / Live Voice Chat.",
            tip: "Mix structural grammar with oral speech practice for balanced mastery.",
          },
          {
            title: "Track XP & Mastery Milestone",
            instruction: "Earn XP across quizzes, speaking drills, and pronunciation labs to level up your global rank.",
            tip: "Aim for +150 XP per day to stay on top of the leaderboard.",
          },
          {
            title: "Unlock Higher CEFR Levels",
            instruction: "Pass the level milestone benchmark exams when your level progress reaches 100%.",
            tip: "Benchmark exams unlock the next CEFR tier and personalized practice sets.",
          },
        ]}
        completionGoal="Complete your daily study target (minutes or lessons) and maintain your streak today."
        xpReward={50}
      />

      <DailyStudyGoalCard
        progress={progress}
        onUpdateGoalSettings={onUpdateGoalSettings}
        onLogStudyMinutes={onLogStudyMinutes}
        setActiveTab={setActiveTab}
        onSelectGrammarLesson={onSelectGrammarLesson}
      />

      {/* CEFR Level Unlock & Progression Banner */}
      <LevelProgressionBanner
        progress={progress}
        onSelectLevel={onSelectLevel}
        onOpenAssessment={onOpenAssessment}
        onOpenAdvancementExam={onOpenAdvancementExam}
      />

      {/* 4 Core Pillars Action Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers size={18} className="text-blue-600" />
          <span>Core English Learning Pillars</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pillar 0: Mastery Pathway */}
          <div
            id="card-pillar-c2course"
            onClick={() => setActiveTab("c2course")}
            className="group bg-gradient-to-br from-purple-950 via-blue-950 to-slate-900 text-white rounded-2xl p-5 border border-purple-500/40 shadow-lg hover:shadow-purple-500/20 hover:border-purple-400 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Crown size={24} className="text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                Mastery Pathway
              </h3>
              <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded uppercase tracking-wider">
                MILESTONES
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Step-by-step progression roadmap tailored to guide your overall English development towards fluent proficiency.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-purple-300">
              <span>Personalized Progression Track</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 1: Speaking Coach */}
          <div
            id="card-pillar-l2-coach"
            onClick={() => setActiveTab("roleplay_coach")}
            className="group bg-gradient-to-br from-slate-900 via-teal-950 to-blue-950 text-white rounded-2xl p-5 border border-teal-500/40 shadow-lg hover:shadow-teal-500/20 hover:border-teal-400 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles size={24} className="text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base group-hover:text-teal-300 transition-colors">
                Speaking Coach
              </h3>
              <span className="text-[9px] font-black px-1.5 py-0.2 bg-gradient-to-r from-amber-400 to-teal-400 text-slate-950 rounded uppercase tracking-wider">
                INTERACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Spontaneous speaking practice with real-time feedback, communicative coaching, and contextual vocabulary guidance.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-teal-300">
              <span>Interactive Dialogue Drills</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 2: Live Voice Chat */}
          <div
            id="card-pillar-fluidconvo"
            onClick={() => setActiveTab("fluidconvo")}
            className="group bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 border border-teal-500/40 shadow-lg hover:shadow-teal-500/20 hover:border-teal-400 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Radio size={24} className="animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base group-hover:text-teal-300 transition-colors">
                Live Voice Chat
              </h3>
              <span className="text-[9px] font-black px-1.5 py-0.2 bg-teal-400 text-slate-950 rounded uppercase tracking-wider">
                VOICE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Interactive conversational audio practice designed for smooth turn-taking and natural fluency building.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-teal-300">
              <span>Real-Time Voice Interaction</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 3: Fluency Workshop */}
          <div
            id="card-pillar-fluency-suite"
            onClick={() => setActiveTab("fluency_suite")}
            className="group bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-white rounded-2xl p-5 border border-purple-500/40 shadow-lg hover:shadow-purple-500/20 hover:border-purple-400 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Brain size={24} className="text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                Fluency Workshop
              </h3>
              <span className="text-[9px] font-black px-1.5 py-0.2 bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 rounded uppercase tracking-wider">
                WORKSHOP
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Deep-dive modules focusing on phonetic rhythm, contextual tone, industry topics, and post-session audits.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-amber-300">
              <span>Comprehensive Fluency Modules</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 1: Grammar Hub */}
          <div
            id="card-pillar-grammar"
            onClick={() => setActiveTab("grammar")}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
              Grammar Hub
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Step-by-step rules, verb tense timelines, and common pitfalls explained simply.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>{completedLessonsCount}/{totalLessonsCount} Completed</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 2: Vocabulary */}
          <div
            id="card-pillar-vocabulary"
            onClick={() => setActiveTab("vocabulary")}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
              Vocabulary Deck
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Thematic flashcards with native audio, phonetic IPA, idioms, and spaced repetition.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>{VOCABULARY_COLLECTIONS.length} Collections</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 3: Roleplay Scenarios */}
          <div
            id="card-pillar-chat"
            onClick={() => setActiveTab("chat")}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare size={24} />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                Roleplay Scenarios
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                PRACTICE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Conversational roleplays (job interview, cafe, travel) with live feedback and suggestions.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>5 Interactive Scenarios</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 4: Pronunciation Lab */}
          <div
            id="card-pillar-pronounce"
            onClick={() => setActiveTab("pronunciation")}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Mic size={24} />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                Pronunciation Lab
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded">
                AUDIO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Speech analysis, syllable stress markers, phonetic breakdowns, and practice drills.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-rose-600">
              <span>Speech Coach</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 5: Timed Speaking Drills */}
          <div
            id="card-pillar-stress"
            onClick={() => setActiveTab("stress")}
            className="group bg-gradient-to-br from-rose-900 to-slate-900 text-white rounded-2xl p-5 border border-rose-800/80 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-400/30 flex items-center justify-center mb-3 group-hover:rotate-6 transition-transform">
              <ShieldAlert size={24} className="animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base group-hover:text-rose-300 transition-colors">
                Timed Drills
              </h3>
              <span className="text-[10px] font-black px-1.5 py-0.2 bg-rose-500 text-white rounded">
                RAPID
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Fast-paced speaking challenges with countdown timers to build spontaneous conversational agility.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-amber-300">
              <span>Timed Agility Simulator</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 6: Writing Assistant */}
          <div
            id="card-pillar-doctor"
            onClick={() => setActiveTab("doctor")}
            className="group bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 border border-blue-500/30 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles size={24} className="text-amber-300" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
                Writing Assistant
              </h3>
              <span className="text-[10px] font-black px-1.5 py-0.2 bg-blue-500 text-white rounded">
                AI DIAGNOSIS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Analyze sentences for CEFR nuance, grammatical correctness, syntax improvements, and natural phrasing.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-blue-300">
              <span>Instant Grammar Diagnosis</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Word of the Day & Quick Interactive Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Cols: Quick Practice Center */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              <span>Recommended Quick Practice</span>
            </h2>
            <button
              id="btn-see-all-quizzes"
              type="button"
              onClick={() => setActiveTab("quizzes")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Explore All Quizzes</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quick Diagnostic Quiz */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded">
                    Quiz Challenge
                  </span>
                  <span className="text-xs text-slate-400">• 5 Questions</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">
                  English Grammar Core Diagnostic
                </h4>
                <p className="text-xs text-slate-500">
                  Assess your mastery of tenses, subject-verb agreement, and error identification.
                </p>
              </div>

              <button
                id="btn-start-diagnostic-quiz"
                type="button"
                onClick={() => setActiveTab("quizzes")}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Award size={14} />
                <span>Start Practice Quiz (+50 XP)</span>
              </button>
            </div>

            {/* AI Grammar Doctor Explainer */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded">
                    AI Doctor
                  </span>
                  <span className="text-xs text-slate-400">• Instant Analysis</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">
                  Sentence & Grammar Doctor
                </h4>
                <p className="text-xs text-slate-500">
                  Paste any complex English sentence to analyze parts of speech, tenses, and natural improvements.
                </p>
              </div>

              <button
                id="btn-open-grammar-doctor"
                type="button"
                onClick={() => setActiveTab("doctor")}
                className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles size={14} />
                <span>Analyze Any Sentence</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1-Col: Featured Word of the Day */}
        {dailyWord && (
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400 px-2 py-0.5 bg-amber-400/10 rounded-full border border-amber-400/20">
                  Word of the Day
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {dailyWord.level} Level
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black tracking-tight text-white">
                    {dailyWord.word}
                  </h3>
                  <AudioButton text={dailyWord.word} size="sm" variant="secondary" />
                </div>
                <p className="text-xs text-blue-300 font-mono mt-0.5">
                  {dailyWord.phonetic} • <span className="italic">{dailyWord.partOfSpeech}</span>
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {dailyWord.definition}
              </p>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-blue-100 italic">
                "{dailyWord.exampleSentence}"
              </div>
            </div>

            <button
              id="btn-explore-flashcards-word"
              type="button"
              onClick={() => {
                onSelectVocabCollection("vocab_daily");
                setActiveTab("vocabulary");
              }}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 flex items-center justify-center gap-1.5 transition-colors"
            >
              <BookOpen size={14} />
              <span>Practice in Flashcards Deck</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
