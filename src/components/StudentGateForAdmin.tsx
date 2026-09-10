import React from "react";
import { ShieldAlert, Crown, ArrowRight, LogOut, Lock, ShieldCheck } from "lucide-react";
import { UserAccount } from "../types";

interface StudentGateForAdminProps {
  currentUser: UserAccount;
  onNavigateToAdminPortal: () => void;
  onLogout: () => void;
}

export const StudentGateForAdmin: React.FC<StudentGateForAdminProps> = ({
  currentUser,
  onNavigateToAdminPortal,
  onLogout,
}) => {
  // role alone is authoritative -- no email fallback.
  const isOwner = currentUser.role === "owner";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 text-center animate-in zoom-in-95">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
          <ShieldAlert size={32} />
        </div>

        {/* Badge & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-black">
            <Lock size={13} />
            <span>Administrator Access Isolation</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Portal Restricted for Administrators
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            You are currently signed in as an <strong>Administrator ({currentUser.name})</strong>. To preserve psychometric calibration, assessment benchmark integrity, and anti-gaming baseline telemetry, administrator accounts are restricted from accessing the Student Learning Portal.
          </p>
        </div>

        {/* Current User Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-left flex items-center gap-3">
          <img
            src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
            alt={currentUser.name}
            className="w-11 h-11 rounded-xl border border-slate-200 object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {currentUser.email || "admin@gmail.com"}
            </div>
          </div>
          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0 uppercase">
            {isOwner ? "👑 Owner" : "🛡️ Admin"}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onNavigateToAdminPortal}
            className="w-full py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-indigo-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Crown size={16} className="text-amber-400" />
            <span>Go to Administrator Command Center</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out to Log In with a Student Account</span>
          </button>
        </div>

        {/* Security Note */}
        <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100 flex items-start gap-2 text-[11px] text-cyan-900 text-left">
          <ShieldCheck size={14} className="text-cyan-700 shrink-0 mt-0.5" />
          <span>
            Dedicated Admin Portal URL: <strong className="font-mono">/?portal=admin</strong>. All assessment telemetry and student roster governance remain securely isolated.
          </span>
        </div>
      </div>
    </div>
  );
};
