import React from "react";
import {
  LayoutDashboard,
  Mic,
  Crown,
  Layers,
  BookOpen,
  Award,
  Sparkles,
  Radio,
  Brain,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
import { useTranslation } from "../context/TranslationContext";
import type { NavTab } from "./Header";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onLogout: () => void;
}

interface NavItem {
  tab: NavTab;
  icon: React.ElementType;
  key: string;
  fallback: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const { t } = useTranslation();

  const groups: NavGroup[] = [
    {
      label: "Home",
      items: [{ tab: "dashboard", icon: LayoutDashboard, key: "tab.dashboard", fallback: "Dashboard" }],
    },
    {
      label: "Learn",
      items: [
        { tab: "grammar", icon: Layers, key: "tab.grammar", fallback: "Grammar Hub" },
        { tab: "vocabulary", icon: BookOpen, key: "tab.vocabulary", fallback: "Vocabulary Deck" },
        { tab: "adaptive", icon: Layers, key: "tab.adaptive", fallback: "Study Plan" },
        { tab: "c2course", icon: Crown, key: "tab.c2course", fallback: "Mastery Pathway" },
      ],
    },
    {
      label: "Practice",
      items: [
        { tab: "quizzes", icon: Award, key: "tab.quizzes", fallback: "Interactive Quizzes" },
        { tab: "chat", icon: MessageSquare, key: "tab.chat", fallback: "Roleplay Scenarios" },
        { tab: "doctor", icon: Sparkles, key: "tab.doctor", fallback: "Writing Assistant" },
        { tab: "stress", icon: ShieldAlert, key: "tab.stress", fallback: "Timed Drills" },
      ],
    },
    {
      label: "AI Speaking",
      items: [
        { tab: "assessment", icon: Mic, key: "tab.assessment", fallback: "Speaking Assessment", badge: "DIAGNOSTIC" },
        { tab: "roleplay_coach", icon: Sparkles, key: "tab.roleplay_coach", fallback: "Speaking Coach" },
        { tab: "fluidconvo", icon: Radio, key: "tab.fluidconvo", fallback: "Live Voice Chat" },
        { tab: "fluency_suite", icon: Brain, key: "tab.fluency_suite", fallback: "Fluency Workshop" },
        { tab: "pronunciation", icon: Mic, key: "tab.pronunciation", fallback: "Pronunciation Lab" },
      ],
    },
    {
      label: "Progress",
      items: [{ tab: "progress", icon: CheckCircle2, key: "tab.progress", fallback: "Progress & Stats" }],
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-slate-900 text-slate-300 h-screen sticky top-0 self-start">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800/80">
        <div className="p-1 rounded-lg bg-white/95 flex items-center justify-center">
          <LinguaFlowLogo variant="mark" size="xs" />
        </div>
        <span className="font-black text-base text-white tracking-tight">
          FLUENXI<span className="text-blue-400">A</span>
        </span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.tab;
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    id={`sidebar-tab-${item.tab}`}
                    type="button"
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={17} className="shrink-0" />
                    <span className="flex-1 text-left truncate">{t(item.key, item.fallback)}</span>
                    {item.badge && !isActive && (
                      <span className="text-[8px] font-black bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-rose-400 transition-all"
        >
          <LogOut size={17} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
