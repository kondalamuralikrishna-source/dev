import React, { useEffect, useRef, useState } from "react";
import {
  Flame,
  Zap,
  ChevronDown,
  LogIn,
  LogOut,
  Bell,
  Search,
  Menu,
  UserCog,
} from "lucide-react";
import { CEFRLevel, UserProgress, UserAccount } from "../types";
import { LegalTab } from "./LegalModal";
import { isLevelUnlocked } from "../utils/storageUtils";
import { LanguageSelector } from "./LanguageSelector";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
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
  onOpenMobileMenu?: () => void;
  onOpenPricing?: () => void;
  onOpenEditProfile?: () => void;
}

// Slim top bar (search, notifications, stats, user menu). Primary navigation lives in <Sidebar>.
export const Header: React.FC<HeaderProps> = ({
  progress,
  onUpdateLevel,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenLegalModal,
  onOpenMobileMenu,
  onOpenPricing,
  onOpenEditProfile,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1"];

  const userRankLevel = Math.floor(progress.xp / 500) + 1;

  // Close the account dropdown on any click outside it (not just its own toggle button).
  useEffect(() => {
    if (!userDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs sticky top-0 z-30">
      <div className="relative px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Hamburger — opens the Sidebar as a slide-in drawer below the lg breakpoint, where the
            static sidebar column is hidden and this is otherwise the only way to switch tabs. */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Compact brand mark — only shown once the hamburger replaces the Sidebar's own logo
            (i.e. below lg), so the mobile header isn't just an unlabeled bar of icons. Centered
            in the header bar on phones (below md, where the search box is hidden and there'd
            otherwise be nothing balancing the hamburger/bell on either side); reverts to normal
            inline flow once the search box appears at md+. */}
        <div className="lg:hidden md:static md:left-auto md:translate-x-0 absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 shrink-0">
          <LinguaFlowLogo variant="mark" size="xs" />
          <span className="font-black text-sm text-slate-900 tracking-tight">
            FLUENXI<span className="text-blue-600">A</span>
          </span>
        </div>

        {/* Search (visual, matches design — filters nothing yet) */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search lessons, topics, or anything..."
              className="w-full h-9 pl-9 pr-3 bg-slate-100 border border-transparent rounded-xl text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Mother Tongue Translation (compact) */}
          <div className="hidden lg:block">
            <LanguageSelector variant="header" />
          </div>

          {/* CEFR Level Selector */}
          <div className="hidden sm:block relative group">
            <label htmlFor="cefr-level-select" className="sr-only">Select English Level</label>
            <select
              id="cefr-level-select"
              aria-label="Select English Level"
              value={progress.selectedLevel}
              onChange={(e) => onUpdateLevel(e.target.value as CEFRLevel)}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
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
            className="hidden sm:flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200/80 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs cursor-default"
            title={`${progress.streakDays} Day Continuous Learning Streak`}
          >
            <Flame size={15} className="fill-orange-500 text-orange-500" />
            <span>{progress.streakDays}</span>
            <span className="hidden md:inline font-medium text-[11px] text-orange-700/80">{t("header.days_streak", "days")}</span>
          </div>

          {/* XP and Rank Badge */}
          <div
            id="header-xp-badge"
            className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs cursor-default"
          >
            <Zap size={14} className="fill-amber-400 text-amber-500" />
            <span className="text-slate-800">{progress.xp} XP</span>
            <span className="text-[11px] font-semibold text-slate-400 border-l border-slate-200 pl-2">
              {t("header.rank", "Rank")} {userRankLevel}
            </span>
          </div>

          {/* Upgrade CTA -- opens the Cashfree pricing/checkout modal */}
          {onOpenPricing && (
            <button
              type="button"
              id="btn-open-pricing"
              onClick={onOpenPricing}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-full shadow-xs transition-all"
            >
              <Zap size={13} className="fill-slate-900" />
              <span>Upgrade</span>
            </button>
          )}

          {/* Notification bell (visual placeholder — no live notifications yet). Hidden on
              phones to keep the mobile header to hamburger + logo + profile; reappears at sm+. */}
          <button
            type="button"
            aria-label="Notifications"
            className="hidden sm:block relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
          </button>

          {/* Student Profile / Login Button — kept visible on mobile even when signed in: the
              hamburger drawer has Sign Out, but Edit Profile only lives in this dropdown, so
              hiding the trigger below sm left mobile users with no way to reach it. */}
          <div className="flex items-center sm:pl-1 sm:border-l border-slate-200">
            {currentUser ? (
              <div className="relative" ref={userDropdownRef}>
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
                    <span className="text-[10px] font-semibold text-blue-600 leading-none">
                      {t("header.student_role", "🎓 Student")}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 max-h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-black text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {currentUser.email || "student@fluenxiaapp.com"}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {t("header.active_learner_account", "Active Learner Account")}
                      </span>
                    </div>

                    {onOpenEditProfile && (
                      <button
                        type="button"
                        id="btn-open-edit-profile"
                        onClick={() => {
                          onOpenEditProfile();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <UserCog size={15} className="text-slate-500" />
                        <span>Edit Profile</span>
                      </button>
                    )}

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
                      <span>{t("header.sign_out", "Sign Out")}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-open-login"
                type="button"
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn size={14} />
                <span>{t("header.sign_in_with_google", "Sign In with Google")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
