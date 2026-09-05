import React, { useState } from "react";
import {
  Flame,
  Zap,
  BookOpen,
  Award,
  MessageSquare,
  Mic,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  ChevronDown,
  Layers,
  ShieldAlert,
  Crown,
  LogIn,
  LogOut,
  ShieldCheck,
  Radio,
  Brain,
  Globe,
  Languages,
} from "lucide-react";
import { CEFRLevel, UserProgress, UserAccount } from "../types";
import { LegalTab } from "./LegalModal";
import { isLevelUnlocked } from "../utils/storageUtils";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "../context/TranslationContext";

export type NavTab =
  | "dashboard"
  | "assessment"
  | "c2course"
  | "adaptive"
  | "grammar"
  | "vocabulary"
  | "quizzes"
  | "roleplay_coach"
  | "fluidconvo"
  | "fluency_suite"
  | "chat"
  | "pronunciation"
  | "stress"
  | "doctor"
  | "progress";

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  progress: UserProgress;
  onUpdateLevel: (level: CEFRLevel) => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenLegalModal?: (tab?: LegalTab) => void;
  onOpenArchitectureDoc?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  progress,
  onUpdateLevel,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenLegalModal,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { t, isRegionalActive, currentLanguageConfig } = useTranslation();
  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1"];

  // Level progress percentage (assuming 1000 XP per rank)
  const currentLevelXp = progress.xp % 500;
  const xpPercentage = Math.min(100, Math.round((currentLevelXp / 500) * 100));
  const userRankLevel = Math.floor(progress.xp / 500) + 1;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="p-1 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center">
              <LinguaFlowLogo variant="mark" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-black text-lg text-slate-900 tracking-wider uppercase">
                  FLUENXI<span className="text-cyan-600">A</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded">
                  Student Learning Portal
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 tracking-wider hidden sm:block">
                Empower Learning, Unleash Potential.
              </p>
            </div>
          </div>

          {/* User Gamification & Stats Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Regional Mother Tongue Language Selector Dropdown */}
            <LanguageSelector variant="header" />

            {/* CEFR Level Selector */}
            <div className="relative group">
              <label htmlFor="cefr-level-select" className="sr-only">Select English Level</label>
              <select
                id="cefr-level-select"
                aria-label="Select English Level"
                value={progress.selectedLevel}
                onChange={(e) => onUpdateLevel(e.target.value as CEFRLevel)}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
              >
                {levels.map((lvl) => {
                  const unlocked = isLevelUnlocked(lvl, progress);
                  return (
                    <option key={lvl} value={lvl} disabled={!unlocked}>
                      {lvl} {unlocked ? "" : "🔒"}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Streak Counter */}
            <div
              id="header-streak-badge"
              className="flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200/80 px-3 py-1 rounded-full text-xs font-bold shadow-xs cursor-default"
              title={`${progress.streakDays} Day Continuous Learning Streak`}
            >
              <Flame size={15} className="fill-orange-500 text-orange-500 animate-pulse" />
              <span>{progress.streakDays}</span>
              <span className="hidden md:inline font-medium text-[11px] text-orange-700/80">days</span>
            </div>

            {/* XP and Rank Badge with Tooltip */}
            <div
              id="header-xp-badge"
              className="relative group flex items-center gap-2 bg-slate-50 border border-slate-200/90 px-3 py-1 rounded-full text-xs font-bold shadow-xs cursor-default"
            >
              <div className="flex items-center gap-1 text-amber-500">
                <Zap size={14} className="fill-amber-400" />
                <span className="text-slate-800">{progress.xp} XP</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400 border-l border-slate-200 pl-2">
                <span>Rank {userRankLevel}</span>
              </div>

              {/* Progress Tooltip */}
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-48 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex justify-between mb-1 text-slate-300 font-medium">
                  <span>Level {userRankLevel}</span>
                  <span>{currentLevelXp} / 500 XP</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400 text-center">
                  Earn {500 - currentLevelXp} XP to reach Level {userRankLevel + 1}
                </p>
              </div>
            </div>

            {/* Student Profile / Login Button */}
            <div className="flex items-center pl-1 border-l border-slate-200">
              {currentUser ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <img
                      src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-lg border border-slate-200 object-cover"
                    />
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[110px] leading-tight">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-600 leading-none">
                        🎓 Student
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-900">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {currentUser.email || "student@fluenxiaapp.com"}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          Active Learner Account
                        </span>
                      </div>

                      {/* Legal Terms & Privacy */}
                      {onOpenLegalModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenLegalModal("terms");
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck size={15} className="text-slate-500" />
                          <span>Terms & Privacy Policy</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          onOpenAuthModal();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogIn size={15} />
                        <span>Switch Google Account</span>
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-open-login"
                  type="button"
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Sign In with Google</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Regional Mother Tongue Translation Option Strip */}
        <div
          id="header-regional-translation-strip"
          className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-y border-amber-300/70 dark:border-amber-500/30 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500 text-slate-950 font-black flex items-center justify-center">
              <Languages size={13} />
            </span>
            <span className="font-black text-amber-950 dark:text-amber-300 text-xs tracking-tight">
              Mother Tongue Translation:
            </span>
            <span className="text-[11px] text-amber-900/80 dark:text-amber-200/80 hidden md:inline">
              Translate English rules, vocabulary & speaking prompts into Telugu, Hindi, Tamil, Kannada, Bengali, or Marathi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector variant="header" />
          </div>
        </div>

        {/* Primary Student Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar pb-2 pt-1">
          <button
            id="tab-dashboard"
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard size={16} />
            <span>{t("tab.dashboard", "Dashboard")}</span>
          </button>

          <button
            id="tab-assessment"
            type="button"
            onClick={() => setActiveTab("assessment")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "assessment"
                ? "bg-teal-600 text-white shadow-xs font-black"
                : "text-teal-700 hover:bg-teal-50 bg-teal-50/50 border border-teal-200/50"
            }`}
          >
            <Mic size={15} />
            <span>{t("tab.assessment", "Speaking Assessment")}</span>
            <span className="text-[9px] bg-teal-200 text-teal-950 font-black px-1.5 py-0.2 rounded-full">
              DIAGNOSTIC
            </span>
          </button>

          <button
            id="tab-c2course"
            type="button"
            onClick={() => setActiveTab("c2course")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-black rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "c2course"
                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 text-white shadow-md shadow-purple-500/25"
                : "text-purple-700 hover:bg-purple-50 bg-purple-50/60 border border-purple-200/70"
            }`}
          >
            <Crown size={15} className="text-amber-400" />
            <span>{t("tab.c2course", "Mastery Pathway")}</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
              MILESTONES
            </span>
          </button>

          <button
            id="tab-adaptive"
            type="button"
            onClick={() => setActiveTab("adaptive")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "adaptive"
                ? "bg-indigo-600 text-white shadow-xs font-black"
                : "text-indigo-700 hover:bg-indigo-50 bg-indigo-50/50 border border-indigo-200/50"
            }`}
          >
            <Layers size={15} />
            <span>{t("tab.adaptive", "Study Plan")}</span>
            <span className="text-[9px] bg-indigo-200 text-indigo-950 font-black px-1.5 py-0.2 rounded-full">
              CUSTOM
            </span>
          </button>

          <button
            id="tab-grammar"
            type="button"
            onClick={() => setActiveTab("grammar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "grammar"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers size={16} />
            <span>{t("tab.grammar", "Grammar Hub")}</span>
          </button>

          <button
            id="tab-vocabulary"
            type="button"
            onClick={() => setActiveTab("vocabulary")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "vocabulary"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BookOpen size={16} />
            <span>{t("tab.vocabulary", "Vocabulary Deck")}</span>
          </button>

          <button
            id="tab-quizzes"
            type="button"
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "quizzes"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Award size={16} />
            <span>{t("tab.quizzes", "Interactive Quizzes")}</span>
          </button>

          <button
            id="tab-roleplay-coach"
            type="button"
            onClick={() => setActiveTab("roleplay_coach")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-black rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "roleplay_coach"
                ? "bg-gradient-to-r from-teal-700 via-emerald-600 to-indigo-700 text-white shadow-md shadow-teal-600/25"
                : "text-teal-800 hover:text-teal-950 hover:bg-teal-50 border border-teal-200/80 bg-teal-50/50"
            }`}
          >
            <Sparkles size={16} className={activeTab === "roleplay_coach" ? "text-amber-300 animate-spin" : "text-teal-600"} />
            <span>{t("tab.roleplay_coach", "Speaking Coach")}</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
              INTERACTIVE
            </span>
          </button>

          <button
            id="tab-fluidconvo"
            type="button"
            onClick={() => setActiveTab("fluidconvo")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-black rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "fluidconvo"
                ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-md shadow-teal-500/20"
                : "text-slate-700 hover:text-slate-950 hover:bg-teal-50/80 border border-teal-200/60 bg-teal-50/30"
            }`}
          >
            <Radio size={16} className={activeTab === "fluidconvo" ? "text-teal-200 animate-pulse" : "text-teal-600"} />
            <span>{t("tab.fluidconvo", "Live Voice Chat")}</span>
            <span className="text-[9px] bg-teal-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
              VOICE
            </span>
          </button>

          <button
            id="tab-fluency-suite"
            type="button"
            onClick={() => setActiveTab("fluency_suite")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-black rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "fluency_suite"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 text-white shadow-md shadow-indigo-500/25"
                : "text-indigo-800 hover:text-indigo-950 hover:bg-indigo-50 border border-indigo-200 bg-indigo-50/50"
            }`}
          >
            <Brain size={16} className={activeTab === "fluency_suite" ? "text-amber-300" : "text-indigo-600"} />
            <span>{t("tab.fluency_suite", "Fluency Workshop")}</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
              WORKSHOP
            </span>
          </button>

          <button
            id="tab-chat"
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "chat"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <MessageSquare size={16} />
            <span>{t("tab.chat", "Roleplay Scenarios")}</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded-full">
              PRACTICE
            </span>
          </button>

          <button
            id="tab-pronunciation"
            type="button"
            onClick={() => setActiveTab("pronunciation")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "pronunciation"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Mic size={16} />
            <span>{t("tab.pronunciation", "Pronunciation Lab")}</span>
            <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-1.5 py-0.2 rounded-full">
              AUDIO
            </span>
          </button>

          <button
            id="tab-stress"
            type="button"
            onClick={() => setActiveTab("stress")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "stress"
                ? "bg-rose-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShieldAlert size={16} className={activeTab === "stress" ? "text-amber-300" : "text-rose-600"} />
            <span>{t("tab.stress", "Timed Drills")}</span>
            <span className="text-[10px] bg-rose-100 text-rose-800 font-black px-1.5 py-0.2 rounded-full">
              RAPID
            </span>
          </button>

          <button
            id="tab-doctor"
            type="button"
            onClick={() => setActiveTab("doctor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "doctor"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Sparkles size={16} />
            <span>{t("tab.doctor", "Writing Assistant")}</span>
          </button>

          <button
            id="tab-progress"
            type="button"
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "progress"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{t("tab.progress", "Progress & Stats")}</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
