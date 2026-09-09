import React from "react";
import { Crown, Shield, LogIn, GraduationCap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { UserAccount } from "../types";

interface AdminGateProps {
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  onNavigateToStudentPortal: () => void;
  onQuickOwnerLogin?: () => void;
}

export const AdminGate: React.FC<AdminGateProps> = ({
  currentUser,
  onOpenAuthModal,
  onNavigateToStudentPortal,
  onQuickOwnerLogin,
}) => {
  return (
    <div className="py-12 px-4 max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-xl space-y-6 text-center">
        {/* Crown Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
          <Crown size={32} />
        </div>

        {/* Heading & description */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-black">
            <Shield size={13} />
            <span>Restricted Administrator Access</span>
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Owner & Admin Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            This URL portal (<code>?portal=admin</code>) is protected and reserved for the platform owner (<strong>reganakasieswaramma@fluenxiaapp.com</strong>) and authorized administrators.
          </p>
        </div>

        {/* Current User Status Banner if logged in as student */}
        {currentUser && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left flex items-center gap-3">
            <img
              src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl border border-slate-200 object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                Signed in as: {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {currentUser.email || "student@gmail.com"} • Role: <span className="font-bold uppercase text-indigo-600">{currentUser.role}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              Student Role
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Direct Owner Login Button */}
          {onQuickOwnerLogin ? (
            <button
              type="button"
              onClick={onQuickOwnerLogin}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Crown size={16} />
              <span>Sign In as Platform Owner (reganakasieswaramma@fluenxiaapp.com)</span>
            </button>
          ) : null}

          {/* Regular Google Sign-In */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogIn size={16} />
            <span>Sign In with Different Google Account</span>
          </button>

          {/* Go to Student Portal */}
          <button
            type="button"
            onClick={onNavigateToStudentPortal}
            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <GraduationCap size={15} />
            <span>← Go to Student Learning Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
