import React from "react";
import { Users, Brain, Activity, ShieldCheck, ShieldAlert, Sparkles, LogOut, X, IndianRupee, FileText } from "lucide-react";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
import { LanguageSelector } from "./LanguageSelector";
import type { AdminNavTab } from "./AdminHeader";

interface AdminSidebarProps {
  activeTab: AdminNavTab;
  setActiveTab: (tab: AdminNavTab) => void;
  onLogout: () => void;
  // Below the lg breakpoint this sidebar is normally hidden entirely (no static column). These
  // props let it double as a slide-in drawer, opened via a hamburger button in <AdminHeader>, so
  // phones/tablets still have a way to switch admin sections.
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  // Owner-managed per-admin restriction (UserAccount.allowedSections). undefined/null = full
  // access, shows every item -- only ever narrows the list, never for role "owner".
  allowedSections?: string[] | null;
}

interface NavItem {
  tab: AdminNavTab;
  icon: React.ElementType;
  label: string;
  activeClass: string;
  idleIconClass: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Colors/icons mirror the admin tabs that used to live in AdminHeader's horizontal nav — same 7
// destinations, just reorganized into a sidebar so they no longer overflow/scroll off screen on
// narrower viewports, and "User Management" is a clear, dedicated first entry.
const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        tab: "governance",
        icon: Users,
        label: "User Management & Analytics",
        activeClass: "bg-amber-500 text-slate-950",
        idleIconClass: "text-amber-400",
      },
      {
        tab: "subscriptions",
        icon: IndianRupee,
        label: "Subscriptions & Revenue",
        activeClass: "bg-green-600 text-white ring-1 ring-green-400",
        idleIconClass: "text-green-400",
      },
      {
        tab: "content_settings",
        icon: FileText,
        label: "Content & Site Settings",
        activeClass: "bg-fuchsia-600 text-white ring-1 ring-fuchsia-400",
        idleIconClass: "text-fuchsia-400",
      },
    ],
  },
  {
    label: "Assessment Intelligence",
    items: [
      {
        tab: "ala_studio",
        icon: Brain,
        label: "Psychometric ALA Evaluator",
        activeClass: "bg-emerald-600 text-white ring-1 ring-emerald-400",
        idleIconClass: "text-emerald-400",
      },
      {
        tab: "speech_science",
        icon: Activity,
        label: "Speech Science Acoustic DSP",
        activeClass: "bg-teal-600 text-white ring-1 ring-teal-400",
        idleIconClass: "text-teal-400",
      },
      {
        tab: "integrity_assessment",
        icon: ShieldAlert,
        label: "Dual Plagiarism & Integrity",
        activeClass: "bg-purple-600 text-white ring-1 ring-purple-400",
        idleIconClass: "text-purple-400",
      },
      {
        tab: "ase_engine",
        icon: ShieldAlert,
        label: "Anti-Gaming ASE Acoustic Lab",
        activeClass: "bg-rose-600 text-white ring-1 ring-rose-400",
        idleIconClass: "text-rose-400",
      },
    ],
  },
  {
    label: "Content & Compliance",
    items: [
      {
        tab: "adaptive_curriculum",
        icon: Sparkles,
        label: "Curriculum & Role-Play Authoring",
        activeClass: "bg-cyan-600 text-white ring-1 ring-cyan-400",
        idleIconClass: "text-cyan-400",
      },
      {
        tab: "enterprise_compliance",
        icon: ShieldCheck,
        label: "Compliance & HITL Proctoring",
        activeClass: "bg-indigo-600 text-white ring-1 ring-indigo-400",
        idleIconClass: "text-indigo-400",
      },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  allowedSections,
}) => {
  const handleSelectTab = (tab: AdminNavTab) => {
    setActiveTab(tab);
    onCloseMobile?.();
  };

  const visibleGroups = allowedSections
    ? groups
        .map((group) => ({ ...group, items: group.items.filter((item) => allowedSections.includes(item.tab)) }))
        .filter((group) => group.items.length > 0)
    : groups;

  return (
    <>
      {/* Backdrop — mobile/tablet only, closes the drawer on tap */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 shrink-0 bg-slate-900 text-slate-300 h-full transform transition-transform duration-200 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:self-start`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2.5 px-5 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-white/95 flex items-center justify-center">
              <LinguaFlowLogo variant="mark" size="xs" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-base text-white tracking-tight">
                FLUENXI<span className="text-cyan-400">A</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-wide mt-0.5">
                Institutional Governance & Analytics
              </span>
            </div>
          </div>
          {/* Close button — mobile/tablet drawer only */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mother Tongue / Regional Language — only surfaced here on mobile/tablet, since the
            AdminHeader's own copy of this control is hidden below the lg breakpoint. */}
        <div className="lg:hidden px-4 pt-3">
          <LanguageSelector variant="admin" />
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
          {visibleGroups.map((group) => (
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
                      id={`admin-sidebar-tab-${item.tab}`}
                      type="button"
                      onClick={() => handleSelectTab(item.tab)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? `${item.activeClass} shadow-sm`
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon size={17} className={`shrink-0 ${isActive ? "" : item.idleIconClass}`} />
                      <span className="flex-1 text-left">{item.label}</span>
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
    </>
  );
};
