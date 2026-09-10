import React, { useState } from "react";
import {
  Layers,
  Link2,
  LogOut,
  ChevronDown,
  FileSpreadsheet,
  ShieldCheck,
  Menu,
} from "lucide-react";
import { UserAccount } from "../types";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
import { PortalLinksModal } from "./PortalLinksModal";
import { AnonymousAttemptTelemetryModal } from "./AnonymousAttemptTelemetryModal";
import { LegalTab } from "./LegalModal";
import { LanguageSelector } from "./LanguageSelector";

export type AdminNavTab =
  | "governance"
  | "subscriptions"
  | "content_settings"
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
  onOpenMobileMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeAdminTab,
  setActiveAdminTab,
  currentUser,
  onLogout,
  onOpenLegalModal,
  onOpenArchitectureDoc,
  onOpenMobileMenu,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isPortalLinksOpen, setIsPortalLinksOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  // role alone is authoritative -- no email fallback.
  const isOwner = currentUser.role === "owner";

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xl">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-2">
            {/* Hamburger — opens the AdminSidebar as a slide-in drawer below the lg breakpoint,
                where the static sidebar column is hidden and this is otherwise the only way to
                switch admin sections. */}
            {onOpenMobileMenu && (
              <button
                type="button"
                onClick={onOpenMobileMenu}
                aria-label="Open menu"
                className="lg:hidden p-2 -ml-1 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
              >
                <Menu size={20} />
              </button>
            )}
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setActiveAdminTab("governance")}
            >
              <div className="p-1 rounded-xl bg-white shadow-md flex items-center justify-center">
                <LinguaFlowLogo variant="mark" size="sm" />
              </div>
              {/* Tagline dropped here -- the AdminSidebar's own brand block already shows it,
                  and this row no longer has room to wrap it without spilling past the fixed
                  header height into the content below. */}
              <span className="font-sans font-black text-lg text-white tracking-wider uppercase">
                FLUENXI<span className="text-cyan-400">A</span>
              </span>
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
