import React, { useState } from "react";
import {
  Crown,
  Shield,
  Layers,
  BarChart3,
  Link2,
  LogOut,
  ChevronDown,
  Brain,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Users,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import { UserAccount } from "../types";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
import { PortalLinksModal } from "./PortalLinksModal";
import { AnonymousAttemptTelemetryModal } from "./AnonymousAttemptTelemetryModal";
import { LegalTab } from "./LegalModal";
import { LanguageSelector } from "./LanguageSelector";

export type AdminNavTab =
  | "governance"
  | "ala_studio"
  | "speech_science"
  | "enterprise_compliance"
  | "integrity_assessment"
  | "adaptive_curriculum"
  | "ase_engine";

interface AdminHeaderProps {
  activeAdminTab: AdminNavTab;
  setActiveAdminTab: (tab: AdminNavTab) => void;
  currentUser: UserAccount;
  onLogout: () => void;
  onOpenLegalModal?: (tab?: LegalTab) => void;
  onOpenArchitectureDoc?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeAdminTab,
  setActiveAdminTab,
  currentUser,
  onLogout,
  onOpenLegalModal,
  onOpenArchitectureDoc,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isPortalLinksOpen, setIsPortalLinksOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  const isOwner =
    currentUser.role === "owner" ||
    currentUser.email === "regana.kasieswaramma@fluenxaapp.com" ||
    currentUser.email === "regana.kasieswaramma@fluenxiaapp.com" ||
    currentUser.email === "kondala.muralikrishna@gmail.com";

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xl">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Admin Badge */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveAdminTab("governance")}
          >
            <div className="p-1 rounded-xl bg-white shadow-md flex items-center justify-center">
              <LinguaFlowLogo variant="mark" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-black text-lg text-white tracking-wider uppercase">
                  FLUENXI<span className="text-cyan-400">A</span>
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider hidden sm:block">
                Institutional Governance, Acoustic DSP & Psychometrics
              </p>
            </div>
          </div>

          {/* Admin Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Regional Translation Selector for Administrators */}
            <LanguageSelector variant="admin" />

            {/* Architecture Whitepaper PDF */}
            {onOpenArchitectureDoc && (
              <button
                type="button"
                onClick={onOpenArchitectureDoc}
                className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 active:scale-95 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-700/60 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Download System Architecture Technical Specifications & Engineering Blueprint PDF"
              >
                <Layers size={14} className="text-emerald-400" />
                <span className="hidden md:inline">Architecture (PDF)</span>
                <span className="md:hidden">Arch PDF</span>
              </button>
            )}

            {/* Anonymous Attempt Telemetry & CSV Export */}
            <button
              type="button"
              onClick={() => setIsTelemetryOpen(true)}
              className="px-2.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 active:scale-95 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-700/60 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="View test attempt counts and download raw CSV export logs"
            >
              <FileSpreadsheet size={14} className="text-indigo-400" />
              <span className="hidden md:inline">Telemetry & Export</span>
              <span className="md:hidden">Export</span>
            </button>

            {/* Direct Portal URLs Button */}
            <button
              type="button"
              onClick={() => setIsPortalLinksOpen(true)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="View and copy direct Portal URLs for Student and Admin portals"
            >
              <Link2 size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Portal URLs</span>
            </button>

            {/* Admin User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg border border-slate-700 object-cover"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-white truncate max-w-[120px] leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-black uppercase text-amber-400 leading-none">
                    {isOwner ? "👑 Platform Owner" : "🛡️ Administrator"}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 text-slate-200 rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-xs font-black text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentUser.email || "admin@fluenxiaapp.com"}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                      {isOwner ? "👑 Full Owner Privileges" : "🛡️ Platform Administrator"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPortalLinksOpen(true);
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-cyan-400 hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                  >
                    <Link2 size={15} />
                    <span>Direct Portal URLs</span>
                  </button>

                  {onOpenArchitectureDoc && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenArchitectureDoc();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-emerald-400 hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                    >
                      <Layers size={15} />
                      <span>System Architecture Blueprint</span>
                    </button>
                  )}

                  {onOpenLegalModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenLegalModal("terms");
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck size={15} />
                      <span>Terms & Privacy Policies</span>
                    </button>
                  )}

                  <div className="border-t border-slate-700 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Admin Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar pb-2 pt-1 border-t border-slate-800">
          {/* Tab 1: Learner Governance & Overview */}
          <button
            type="button"
            onClick={() => setActiveAdminTab("governance")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeAdminTab === "governance"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users size={15} />
            <span>Learner Governance & Analytics</span>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
              activeAdminTab === "governance" ? "bg-slate-950 text-amber-300" : "bg-amber-500/20 text-amber-400"
            }`}>
              ROSTER
            </span>
          </button>

          {/* Tab 2: Psychometric ALA Evaluator */}
          <button
            type="button"
            onClick={() => setActiveAdminTab("ala_studio")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeAdminTab === "ala_studio"
                ? "bg-emerald-600 text-white shadow-md font-black ring-1 ring-emerald-400"
                : "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800"
            }`}
          >
            <Brain size={15} />
            <span>Psychometric ALA Evaluator</span>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
              activeAdminTab === "ala_studio" ? "bg-slate-950 text-emerald-300" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              PSYCHOMETRIC
            </span>
          </button>

          {/* Tab 3: Speech Science DSP */}
          <button
            type="button"
            onClick={() => setActiveAdminTab("speech_science")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeAdminTab === "speech_science"
                ? "bg-teal-600 text-white shadow-md font-black ring-1 ring-teal-400"
                : "text-teal-400 hover:text-teal-300 hover:bg-slate-800"
            }`}
          >
            <Activity size={15} />
            <span>Speech Science Acoustic DSP</span>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
              activeAdminTab === "speech_science" ? "bg-slate-950 text-teal-300" : "bg-teal-500/20 text-teal-400"
            }`}>
              ACOUSTIC
            </span>
          </button>

          {/* Tab 4: Compliance & HITL Proctoring */}
          <button
            type="button"
            onClick={() => setActiveAdminTab("enterprise_compliance")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeAdminTab === "enterprise_compliance"
                ? "bg-indigo-600 text-white shadow-md font-black ring-1 ring-indigo-400"
                : "text-indigo-400 hover:text-indigo-300 hover:bg-slate-800"
            }`}
          >
            <ShieldCheck size={15} />
            <span>Compliance & HITL Proctoring</span>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
              activeAdminTab === "enterprise_compliance" ? "bg-slate-950 text-indigo-300" : "bg-indigo-500/20 text-indigo-400"
            }`}>
              DPDP • GDPR
            </span>
          </button>

          {/* Tab 5: Integrity & Plagiarism Detector */}
          <button
            type="button"
            onClick={() => setActiveAdminTab("integrity_assessment")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeAdminTab === "integrity_assessment"
                ? "bg-purple-600 text-white shadow-md font-black ring-1 ring-purple-400"
                : "text-purple-400 hover:text-purple-300 hover:bg-slate-800"
            }`}
          >
            <ShieldAlert size={15} />
            <span>Dual Plagiarism & Integrity</span>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
              activeAdminTab === "integrity_assessment" ? "bg-slate-950 text-purple-300" : "bg-purple-500/20 text-purple-400"
            }`}>
              ANTI-CHEAT
            </span>
          </button>

          {/* Tab 6: Adaptive Curriculum Authoring */}
          <button
            type="button"
            onClick={() => setActiveAdminTab("adaptive_curriculum")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeAdminTab === "adaptive_curriculum"
                ? "bg-cyan-600 text-white shadow-md font-black ring-1 ring-cyan-400"
                : "text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
            }`}
          >
            <Sparkles size={15} />
            <span>Curriculum & Role-Play Authoring</span>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
              activeAdminTab === "adaptive_curriculum" ? "bg-slate-950 text-cyan-300" : "bg-cyan-500/20 text-cyan-400"
            }`}>
              AUTHORING
            </span>
          </button>

          {/* Tab 7: Anti-Gaming ASE Engine */}
          <button
            type="button"
            onClick={() => setActiveAdminTab("ase_engine")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeAdminTab === "ase_engine"
                ? "bg-rose-600 text-white shadow-md font-black ring-1 ring-rose-400"
                : "text-rose-400 hover:text-rose-300 hover:bg-slate-800"
            }`}
          >
            <ShieldAlert size={15} />
            <span>Anti-Gaming ASE Acoustic Lab</span>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
              activeAdminTab === "ase_engine" ? "bg-slate-950 text-rose-300" : "bg-rose-500/20 text-rose-400"
            }`}>
              SIGNAL DSP
            </span>
          </button>
        </nav>
      </div>

      {/* Direct Portal Links Modal */}
      <PortalLinksModal
        isOpen={isPortalLinksOpen}
        onClose={() => setIsPortalLinksOpen(false)}
      />

      {/* Anonymous Attempt Telemetry & CSV Export Modal */}
      <AnonymousAttemptTelemetryModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
      />
    </header>
  );
};
