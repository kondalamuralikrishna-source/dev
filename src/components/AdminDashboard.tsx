import React, { useState, useEffect } from "react";
import {
  Crown,
  Shield,
  Users,
  TrendingUp,
  Activity,
  Flame,
  Award,
  Zap,
  BookOpen,
  Mic,
  CheckCircle2,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  BarChart3,
  PieChart,
  ShieldAlert,
  GraduationCap,
  Mail,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  Link2,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Scale,
} from "lucide-react";
import {
  AdminAnalyticsSummary,
  UserAccount,
  CEFRLevel,
  ActivityFeedItem,
  GoogleAuthStatus,
  AuthTelemetryEvent,
} from "../types";
import { LegalModal, LegalTab } from "./LegalModal";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { AnonymousAttemptTelemetryModal } from "./AnonymousAttemptTelemetryModal";
import { AdminActivityLog } from "./AdminActivityLog";
import { FileSpreadsheet } from "lucide-react";

interface AdminDashboardProps {
  currentUser: UserAccount | null;
  onNavigateToTab?: (tab: string) => void;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Must mirror ADMIN_SECTIONS in server.ts and the item list in AdminSidebar.tsx.
const ACCESS_SECTIONS: { key: string; label: string }[] = [
  { key: "governance", label: "User Management & Analytics" },
  { key: "subscriptions", label: "Subscriptions & Revenue" },
  { key: "content_settings", label: "Content & Site Settings" },
  { key: "ala_studio", label: "Psychometric ALA Evaluator" },
  { key: "speech_science", label: "Speech Science Acoustic DSP" },
  { key: "integrity_assessment", label: "Dual Plagiarism & Integrity" },
  { key: "ase_engine", label: "Anti-Gaming ASE Acoustic Lab" },
  { key: "adaptive_curriculum", label: "Curriculum & Role-Play Authoring" },
  { key: "enterprise_compliance", label: "Compliance & HITL Proctoring" },
];

interface AdminAccessRowProps {
  admin: UserAccount;
  onChanged: () => void;
}

const AdminAccessRow: React.FC<AdminAccessRowProps> = ({ admin, onChanged }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState<string[] | null>(admin.allowedSections ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFullAccess = draft === null;

  const toggleSection = (key: string) => {
    setDraft((prev) => {
      const base = prev ?? ACCESS_SECTIONS.map((s) => s.key); // starting to restrict from "full access"
      return base.includes(key) ? base.filter((k) => k !== key) : [...base, key];
    });
  };

  const save = async (next: string[] | null) => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/user/${admin.id}/access`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ allowedSections: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save access.");
      setDraft(next);
      onChanged();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-3.5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={admin.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${admin.name}`}
            alt={admin.name}
            className="w-8 h-8 rounded-lg border border-slate-200 object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{admin.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{admin.email}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${
            hasFullAccess ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {hasFullAccess ? "Full Access" : `${draft!.length} of ${ACCESS_SECTIONS.length} Sections`}
        </span>
      </button>

      {isExpanded && (
        <div className="p-3.5 pt-0 border-t border-slate-100 space-y-3">
          {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}

          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={() => save(null)}
              disabled={isSaving || hasFullAccess}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              Grant Full Access
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {ACCESS_SECTIONS.map((section) => {
              const checked = hasFullAccess || draft!.includes(section.key);
              return (
                <label
                  key={section.key}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSection(section.key)}
                    className="rounded border-slate-300"
                  />
                  <span>{section.label}</span>
                </label>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => save(hasFullAccess ? ACCESS_SECTIONS.map((s) => s.key) : draft)}
            disabled={isSaving}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save Restrictions"}
          </button>
        </div>
      )}
    </div>
  );
};

interface AdminAccessControlSectionProps {
  admins: UserAccount[];
  onChanged: () => void;
}

const AdminAccessControlSection: React.FC<AdminAccessControlSectionProps> = ({ admins, onChanged }) => (
  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
    <div>
      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
        <ShieldCheck size={20} className="text-indigo-600" />
        <span>Manage Admin Access</span>
      </h3>
      <p className="text-xs text-slate-500">
        Control which admin-panel sections each admin account can see and use. New admins start with full access.
      </p>
    </div>
    {admins.length === 0 ? (
      <p className="text-xs text-slate-400 py-4 text-center">No admin accounts yet.</p>
    ) : (
      <div className="space-y-2">
        {admins.map((admin) => (
          <AdminAccessRow key={admin.id} admin={admin} onChanged={onChanged} />
        ))}
      </div>
    )}
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onNavigateToTab,
}) => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsSummary | null>(null);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [googleStatus, setGoogleStatus] = useState<GoogleAuthStatus | null>(null);
  const [authTelemetry, setAuthTelemetry] = useState<{
    summary?: {
      totalEvents?: number;
      byEvent?: Record<string, number>;
      byMethod?: Record<string, number>;
      byIntent?: Record<string, number>;
    };
    totalEvents?: number;
    completedLogins?: number;
    completedSignups?: number;
    methodBreakdown?: {
      google?: number;
      apple?: number;
      email?: number;
    };
    failedAttempts?: number;
    resetRequests?: number;
    recentEvents?: AuthTelemetryEvent[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserAccount | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [copiedStudent, setCopiedStudent] = useState<boolean>(false);
  const [copiedAdmin, setCopiedAdmin] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<LegalTab>("terms");

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : "";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const studentPortalUrl = `${cleanBase}/?portal=student`;
  const adminPortalUrl = `${cleanBase}/?portal=admin`;

  const handleCopyUrl = (url: string, type: "student" | "admin") => {
    navigator.clipboard.writeText(url);
    if (type === "student") {
      setCopiedStudent(true);
      setTimeout(() => setCopiedStudent(false), 2500);
    } else {
      setCopiedAdmin(true);
      setTimeout(() => setCopiedAdmin(false), 2500);
    }
  };

  // Fetch Analytics, Users List, Google Auth Status & Auth Telemetry
  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const [analyticsRes, usersRes, googleRes, telemetryRes] = await Promise.all([
        fetch("/api/admin/analytics", { headers: authHeaders() }),
        fetch("/api/admin/users", { headers: authHeaders() }),
        fetch("/api/auth/google/status"),
        fetch("/api/admin/auth-telemetry", { headers: authHeaders() }),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsersList(data.users || []);
      }
      if (googleRes.ok) {
        const data = await googleRes.json();
        setGoogleStatus(data);
      }
      if (telemetryRes.ok) {
        const data = await telemetryRes.json();
        setAuthTelemetry(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Admin action: Grant XP to a student
  const handleGrantXp = async (userId: string, amount: number) => {
    try {
      const res = await fetch("/api/admin/grant-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ userId, xp: amount }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionSuccessMsg(`Successfully awarded +${amount} XP to ${data.user?.name || "learner"}!`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to grant XP:", err);
    }
  };

  // Admin action: Toggle user account status
  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setActionSuccessMsg(
          `User account is now ${data.user?.status === "active" ? "Active" : "Suspended"}.`
        );
        setTimeout(() => setActionSuccessMsg(null), 3500);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleChangeRole = async (userId: string, role: "student" | "admin") => {
    setActionErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/user/${userId}/change-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change role.");
      setActionSuccessMsg(`${data.user?.name || "User"} is now ${role === "admin" ? "an Admin" : "a Student"}.`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
      fetchDashboardData();
    } catch (err: any) {
      console.error("Failed to change role:", err);
      setActionErrorMsg(err.message || "Failed to change role.");
      setTimeout(() => setActionErrorMsg(null), 4000);
    }
  };

  // Filter users list
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.googleId && u.googleId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel =
      levelFilter === "ALL" || u.progress?.selectedLevel === levelFilter;
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesLevel && matchesRole;
  });

  const isOwner =
    currentUser?.role === "owner" ||
    currentUser?.email === "reganakasieswaramma@fluenxiaapp.com";

  if (isLoading && !analytics) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Owner Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title -- plain heading in place of the old hero banner, matching the sidebar's
          own label for this section. */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          User Management & Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect student progression across CEFR standards and manage learner accounts.
        </p>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <ShieldAlert size={16} className="text-rose-600 shrink-0" />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* 4 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Learners */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Enrolled Learners
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {analytics?.totalUsers || usersList.length || 0}
            </span>
            {usersList.length > 0 && (
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <TrendingUp size={12} className="mr-0.5" />
                {Math.round(
                  (usersList.filter((u) => u.authProvider === "google").length / usersList.length) * 100
                )}
                % Google Verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Active learner accounts synced via Google & Gmail
          </p>
        </div>

        {/* Total Platform XP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Total Student XP Earned
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {(analytics?.totalXpEarned || 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-600 flex items-center">
              <Flame size={12} className="mr-0.5" />
              XP
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Across quizzes, speaking stress drills & lessons
          </p>
        </div>

        {/* Avg CEFR Mastery Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Avg Grammar Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {analytics?.avgScore ? `${analytics.avgScore}%` : "No data yet"}
            </span>
            {!!analytics?.avgScore && (
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                High Mastery
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Overall quiz accuracy across A1–C1 curriculum
          </p>
        </div>

        {/* Crisis Speaking Drills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Speaking Drills Finished
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {analytics?.totalStressTests || 0}
            </span>
            <span className="text-xs font-bold text-rose-600">Hot Seat AI</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Real-time audio and stress scenarios completed
          </p>
        </div>
      </div>

      {/* 2-Column Visual Charts: CEFR Level Distribution & 7-Day Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Activity Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-600" />
                <span>7-Day Student Engagement & Drills</span>
              </h3>
              <p className="text-xs text-slate-500">
                Daily active practice sessions across lessons, quizzes, and speaking hot seats.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
              Last 7 Days
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div className="pt-4 flex items-end justify-between gap-2 h-44 px-2">
            {(analytics?.dailyActivity || analytics?.activityTrends || []).length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-slate-400">
                No activity data yet
              </div>
            )}
            {(analytics?.dailyActivity || analytics?.activityTrends || []).map((day: any) => {
              const compCount = day.completions ?? day.lessonsFinished ?? day.activeUsers ?? 0;
              const heightPercent = compCount > 0 ? Math.min(100, Math.max(15, (compCount / 40) * 100)) : 2;
              const displayDate = day.date && String(day.date).includes("-") ? String(day.date).split("-").slice(1).join("/") : String(day.date || "Day");
              return (
                <div key={day.date || Math.random()} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-extrabold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {compCount}
                  </div>
                  <div className="w-full bg-slate-100 rounded-xl overflow-hidden h-32 flex items-end p-1">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-lg transition-all duration-700 group-hover:from-indigo-500 group-hover:to-indigo-300"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    {displayDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CEFR Level Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PieChart size={18} className="text-indigo-600" />
                <span>CEFR Proficiency Distribution</span>
              </h3>
              <p className="text-xs text-slate-500">Active students by target standard</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {(["A1", "A2", "B1", "B2", "C1"] as CEFRLevel[]).map((lvl) => {
              const count = analytics?.levelBreakdown?.[lvl] || analytics?.levelDistribution?.[lvl] || 0;
              const total = analytics?.totalUsers || analytics?.totalLearners || usersList.length || 1;
              const pct = Math.round((count / Math.max(1, total)) * 100) || 0;
              const colorMap: Record<CEFRLevel, string> = {
                A1: "bg-emerald-500",
                A2: "bg-sky-500",
                B1: "bg-indigo-600",
                B2: "bg-purple-600",
                C1: "bg-amber-500",
                C2: "bg-rose-500",
              };

              return (
                <div key={lvl} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">
                      Level {lvl} ({lvl === "A1" ? "Beginner" : lvl === "A2" ? "Elementary" : lvl === "B1" ? "Intermediate" : lvl === "B2" ? "Upper-Int" : "Advanced"})
                    </span>
                    <span className="text-slate-500 font-mono">
                      {count} students ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorMap[lvl]} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION: Dedicated Paginated System Activity & Audit Log */}
      <AdminActivityLog
        initialActivities={analytics?.recentActivityFeed}
        onRefreshParent={fetchDashboardData}
      />

      {/* SECTION: Owner-only control over which admin-panel sections each admin can access */}
      {isOwner && (
        <AdminAccessControlSection admins={usersList.filter((u) => u.role === "admin")} onChanged={fetchDashboardData} />
      )}

      {/* SECTION: Learners & User Accounts Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-indigo-600" />
              <span>Learners Directory & User Accounts</span>
            </h3>
            <p className="text-xs text-slate-500">
              Manage accounts, inspect learner progress, award bonus XP, and control access permissions.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or email..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="A1">A1 Beginner</option>
              <option value="A2">A2 Elementary</option>
              <option value="B1">B1 Intermediate</option>
              <option value="B2">B2 Upper Inter</option>
              <option value="C1">C1 Advanced</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Learner Profile</th>
                <th className="py-3 px-3">Google Email</th>
                <th className="py-3 px-3">Level & Role</th>
                <th className="py-3 px-3">Streak & XP</th>
                <th className="py-3 px-3">Lessons & Drills</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Owner Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const stressCount = user.progress?.stressTestsCompleted?.length || 0;
                const lessonsCount = user.progress?.completedLessonIds?.length || 0;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Learner Name & Avatar */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                          alt={user.name}
                          className="w-9 h-9 rounded-xl border border-slate-200 object-cover shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.role === "owner" && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded">
                                OWNER
                              </span>
                            )}
                            {user.role === "admin" && (
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      <div className="truncate max-w-[180px] flex items-center gap-1">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span>{user.email || "No email on file"}</span>
                      </div>
                    </td>

                    {/* Level & Role */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold rounded-md text-[11px]">
                        CEFR {user.progress?.selectedLevel || "Unset"}
                      </span>
                    </td>

                    {/* Streak & XP */}
                    <td className="py-3.5 px-3">
                      <div className="font-black text-amber-600 flex items-center gap-1">
                        <Zap size={13} className="fill-amber-500 text-amber-500" />
                        <span>{(user.progress?.xp || 0).toLocaleString()} XP</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Flame size={11} className="text-orange-500" />
                        <span>{user.progress?.streakDays || 0} day streak</span>
                      </div>
                    </td>

                    {/* Lessons & Stress */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-800">
                        {lessonsCount} lessons • {user.progress?.completedQuizIds?.length || 0} quizzes
                      </div>
                      <div className="text-[11px] text-rose-600 font-semibold">
                        {stressCount} Speaking Drills
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {user.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleGrantXp(user.id, 100)}
                          title="Award +100 Bonus XP"
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg border border-amber-200 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>100 XP</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUserDetail(user)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Details
                        </button>

                        {isOwner && (user.role === "student" || user.role === "admin") && (
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeRole(user.id, user.role === "admin" ? "student" : "admin")
                            }
                            title={user.role === "admin" ? "Demote to Student" : "Promote to Admin"}
                            className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              user.role === "admin"
                                ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200"
                                : "text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                            }`}
                          >
                            <ShieldCheck size={12} />
                            <span>{user.role === "admin" ? "Demote" : "Make Admin"}</span>
                          </button>
                        )}

                        {isOwner && user.role !== "owner" && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user.id)}
                            title={user.status === "active" ? "Suspend user" : "Reactivate user"}
                            className={`p-1 rounded-lg border text-xs transition-colors cursor-pointer ${
                              user.status === "active"
                                ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200"
                                : "text-emerald-600 bg-emerald-50 border-emerald-200"
                            }`}
                          >
                            {user.status === "active" ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs">
              No learners found matching the search criteria.
            </div>
          )}
        </div>
      </div>

      {/* Drill-down Detail Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedUserDetail(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold text-sm w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <img
                src={selectedUserDetail.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUserDetail.name}`}
                alt={selectedUserDetail.name}
                className="w-12 h-12 rounded-2xl border-2 border-indigo-200"
              />
              <div>
                <h3 className="text-lg font-black text-slate-900">{selectedUserDetail.name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedUserDetail.email || "No email on file"} • CEFR {selectedUserDetail.progress?.selectedLevel || "Unset"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">XP Score</span>
                <div className="text-base font-black text-amber-600">{selectedUserDetail.progress?.xp || 0}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Streak</span>
                <div className="text-base font-black text-orange-500">{selectedUserDetail.progress?.streakDays || 0} Days</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stress Tests</span>
                <div className="text-base font-black text-rose-600">
                  {selectedUserDetail.progress?.stressTestsCompleted?.length || 0}
                </div>
              </div>
            </div>

            {/* Stress test history if any */}
            {selectedUserDetail.progress?.stressTestsCompleted &&
              selectedUserDetail.progress.stressTestsCompleted.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Speaking Crisis History:
                  </h4>
                  <div className="space-y-1.5">
                    {selectedUserDetail.progress.stressTestsCompleted.map((st: any) => (
                      <div
                        key={st.id}
                        className="p-2.5 bg-rose-50/50 border border-rose-200 rounded-xl text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">{st.scenarioTitle}</span>
                          <span className="text-[10px] text-slate-500">{st.stressGrade} • {st.wpm} WPM</span>
                        </div>
                        <span className="font-black text-rose-600">{st.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  handleGrantXp(selectedUserDetail.id, 250);
                  setSelectedUserDetail(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap size={14} />
                <span>Award +250 XP Reward</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Legal & Privacy Document Viewer */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalTab}
      />

      {/* Anonymous Attempt Telemetry & CSV Export Modal (Option C) */}
      <AnonymousAttemptTelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
      />
    </div>
  );
};
