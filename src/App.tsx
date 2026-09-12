import React, { useState, useEffect, useRef } from "react";
import { Header, NavTab } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { AdminHeader, AdminNavTab } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";
import { SubscriptionsRevenuePanel } from "./components/SubscriptionsRevenuePanel";
import { ContentManagementPanel } from "./components/ContentManagementPanel";
import { Dashboard } from "./components/Dashboard";
import { GrammarHub } from "./components/GrammarHub";
import { VocabularyHub } from "./components/VocabularyHub";
import { QuizEngine } from "./components/QuizEngine";
import { AIChatTutor } from "./components/AIChatTutor";
import { PronunciationStudio } from "./components/PronunciationStudio";
import { FluidConvoStudio } from "./components/FluidConvoStudio";
import { StressSpeakingStudio } from "./components/StressSpeakingStudio";
import { GrammarDoctor } from "./components/GrammarDoctor";
import { ProgressTracker } from "./components/ProgressTracker";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminGate } from "./components/AdminGate";
import { StudentGateForAdmin } from "./components/StudentGateForAdmin";
import { AuthModal } from "./components/AuthModal";
import { LegalModal, LegalTab } from "./components/LegalModal";
import { ConsentGateModal } from "./components/ConsentGateModal";
import { PricingModal } from "./components/PricingModal";
import { ProfileEditModal } from "./components/ProfileEditModal";
import { LoginPage } from "./components/LoginPage";
import { PlacementAssessmentModal } from "./components/PlacementAssessmentModal";
import { SpokenAssessmentScreen } from "./components/SpokenAssessmentScreen";
import { AdaptiveModuleConfigurator } from "./components/AdaptiveModuleConfigurator";
import { C2CoursePathway } from "./components/C2CoursePathway";
import { LevelAdvancementModal } from "./components/LevelAdvancementModal";
import { FluencySuiteHub } from "./components/FluencySuiteHub";
import { L2SpeakingCoachStudio } from "./components/L2SpeakingCoachStudio";
import { AntiGamingAseEngineStudio } from "./components/AntiGamingAseEngineStudio";
import { PsychometricALAEvaluatorStudio } from "./components/PsychometricALAEvaluatorStudio";
import { AcousticSpeechScienceStudio } from "./components/AcousticSpeechScienceStudio";
import { EnterpriseComplianceHitlStudio } from "./components/EnterpriseComplianceHitlStudio";
import { AdaptiveCurriculumStudio } from "./components/AdaptiveCurriculumStudio";
import { PlagiarismIntegrityStudio } from "./components/PlagiarismIntegrityStudio";
import { AssessmentIntegrityWrapper } from "./components/AssessmentIntegrityWrapper";
import { ArchitectureDocModal } from "./components/ArchitectureDocModal";
import { LanguageSelector } from "./components/LanguageSelector";
import {
  CEFRLevel,
  StressTestHistoryItem,
  UserProgress,
  UserAccount,
  PlacementAssessmentResult,
  SpokenAssessmentEvaluationResponse,
  LevelAssessmentReport,
} from "./types";
import {
  loadUserProgress,
  saveUserProgress,
  addXp,
  markLessonCompleted,
  recordQuizScore,
  toggleSavedWord,
  markWordMastered,
  updateStreak,
  resetProgress,
  recordStressTestResult,
  saveAssessmentResult,
  saveSpokenAssessmentResult,
  recordBenchmarkExamPassed,
  isLevelUnlocked,
  updateDailyGoalSettings,
  logStudyTime,
  getTodayDateString,
} from "./utils/storageUtils";

export type PortalType = "student" | "admin";

// Shown when an admin's account has been restricted (by the owner) from a section they're
// currently pointed at -- e.g. they had access, the owner revoked it, and their tab state is
// stale, or they typed the URL's ?tab= param directly.
function SectionAccessDenied() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2">
      <p className="text-sm font-black text-slate-900">Access Restricted</p>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Your account does not have access to this section. Contact the platform owner if you believe this is a mistake.
      </p>
    </div>
  );
}

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);
  const [portal, setPortal] = useState<PortalType>("student");
  const [studentTab, setStudentTab] = useState<NavTab>("dashboard");
  const [adminTab, setAdminTab] = useState<AdminNavTab>("governance");

  const [activeGrammarLessonId, setActiveGrammarLessonId] = useState<string | null>(null);
  const [activeVocabCollectionId, setActiveVocabCollectionId] = useState<string | null>(null);

  // Auth & Session state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTab>("terms");
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [paymentStatusMsg, setPaymentStatusMsg] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Assessment & Level Advancement state
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState<boolean>(false);
  const [advancementExamTargetLevel, setAdvancementExamTargetLevel] = useState<CEFRLevel | null>(null);

  // currentUser.role is the sole authority here -- it's never re-derived from an email address,
  // client-side or server-side, so no hardcoded-email fallback is needed (or safe: it would just
  // ship the owner's real email into the client bundle for no functional benefit).
  const isOwnerOrAdmin = currentUser?.role === "owner" || currentUser?.role === "admin";

  // Owner-managed per-admin section restriction -- owner always has access; an admin with no
  // allowedSections set (the default) also has full access; only a non-empty restriction narrows it.
  const hasSectionAccess = (section: string) =>
    currentUser?.role !== "admin" || !currentUser.allowedSections || currentUser.allowedSections.includes(section);

  const handleOpenLegalModal = (tab: LegalTab = "terms") => {
    setLegalInitialTab(tab);
    setIsLegalModalOpen(true);
  };

  // Initialize session and URL routing
  useEffect(() => {
    let savedUser: UserAccount | null = null;
    const savedUserJson =
      localStorage.getItem("linguaflow_user_session") ||
      localStorage.getItem("auth_user") ||
      sessionStorage.getItem("linguaflow_user_session");

    if (savedUserJson) {
      try {
        savedUser = JSON.parse(savedUserJson);
        setCurrentUser(savedUser);
        if (savedUser?.progress) {
          setProgress(savedUser.progress);
          // If student has not completed initial assessment, prompt them to Screen 2
          if (!savedUser.progress.assessmentCompleted && savedUser.role === "student") {
            setStudentTab("assessment");
          }
        }
      } catch (e) {
        console.error("Error loading session:", e);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if ((e.key === "linguaflow_user_session" || e.key === "auth_user") && e.newValue) {
        try {
          const user = JSON.parse(e.newValue);
          if (user?.email) {
            setCurrentUser(user);
            if (user.progress) setProgress(user.progress);
          }
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // Inspect URL for portal query param or pathname
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname.toLowerCase();
    const portalParam = params.get("portal")?.toLowerCase();
    const tabParam = params.get("tab") as string | null;

    if (portalParam === "admin" || pathname.endsWith("/admin")) {
      setPortal("admin");
      if (
        tabParam &&
        [
          "governance",
          "subscriptions",
          "content_settings",
          "ala_studio",
          "speech_science",
          "enterprise_compliance",
          "integrity_assessment",
          "adaptive_curriculum",
          "ase_engine",
        ].includes(tabParam)
      ) {
        setAdminTab(tabParam as AdminNavTab);
      } else {
        setAdminTab("governance");
      }
    } else {
      setPortal("student");
      if (
        tabParam &&
        [
          "dashboard",
          "assessment",
          "c2course",
          "adaptive",
          "grammar",
          "vocabulary",
          "quizzes",
          "roleplay_coach",
          "fluidconvo",
          "fluency_suite",
          "chat",
          "pronunciation",
          "stress",
          "doctor",
          "progress",
        ].includes(tabParam)
      ) {
        setStudentTab(tabParam as NavTab);
      } else {
        setStudentTab("dashboard");
      }
    }

    setIsAuthInitialized(true);
  }, []);

  // Cashfree redirects back here with ?payment_return=1&order_id=... after checkout. Verify the
  // order server-side (idempotent -- the webhook may have already applied it) and refresh the
  // subscription so the UI reflects the new plan immediately, without waiting for a re-login.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment_return") !== "1") return;
    const orderId = params.get("order_id");
    const token = localStorage.getItem("auth_token");
    if (!orderId || !token) return;

    fetch(`/api/payments/cashfree/verify/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "paid") {
          setPaymentStatusMsg("Payment successful! Your plan is now active.");
          setCurrentUser((prev) => {
            if (!prev) return prev;
            // Prefer the full user record when the server sends one -- checkout may have also
            // saved a phone/email as part of this same purchase, and merging only `subscription`
            // (the old behavior) left those stale in the app's cached currentUser until the next
            // full login, even though the database had the real value all along.
            const updated = data.user ? { ...prev, ...data.user } : { ...prev, subscription: data.subscription };
            localStorage.setItem("linguaflow_user_session", JSON.stringify(updated));
            return updated;
          });
        } else {
          setPaymentStatusMsg("Payment wasn't completed. No charge was made.");
        }
      })
      .catch(() => setPaymentStatusMsg("Couldn't confirm payment status. Contact support if you were charged."))
      .finally(() => {
        // Strip the payment params from the URL so a refresh doesn't re-trigger verification
        const url = new URL(window.location.href);
        url.searchParams.delete("payment_return");
        url.searchParams.delete("order_id");
        window.history.replaceState({}, "", url.toString());
      });
  }, []);

  // Dynamically sync browser URL address bar with current portal / tab. Each tab/portal change
  // pushes a real history entry (rather than replacing the current one) so the browser's Back
  // button steps through the app's own navigation one screen at a time, instead of skipping
  // straight past every in-app screen to whatever page was open before the app loaded. The ref
  // guards against the popstate handler below re-triggering this same push when the user is the
  // one going back/forward -- that state change must only ever update the URL bar via pushState,
  // never re-push (which would turn Back into a no-op by immediately re-adding the entry it just
  // stepped off of).
  const isPopStateNavRef = useRef(false);
  useEffect(() => {
    if (!isAuthInitialized) return;
    if (isPopStateNavRef.current) {
      isPopStateNavRef.current = false;
      return;
    }
    try {
      const url = new URL(window.location.href);
      if (portal === "admin") {
        url.searchParams.set("portal", "admin");
        if (adminTab !== "governance") {
          url.searchParams.set("tab", adminTab);
        } else {
          url.searchParams.delete("tab");
        }
      } else {
        url.searchParams.set("portal", "student");
        if (studentTab !== "dashboard") {
          url.searchParams.set("tab", studentTab);
        } else {
          url.searchParams.delete("tab");
        }
      }
      window.history.pushState(null, "", url.toString());
    } catch (e) {
      console.warn("Could not sync URL state:", e);
    }
  }, [portal, studentTab, adminTab, isAuthInitialized]);

  // Handles the browser's actual Back/Forward buttons: re-read the URL that the browser just
  // navigated to and update React state to match, so the visible screen actually changes instead
  // of just the address bar (pushState/replaceState alone don't re-render anything on their own).
  useEffect(() => {
    const handlePopState = () => {
      isPopStateNavRef.current = true;
      // Fallback in case the parsed portal/tab end up identical to current state (e.g. duplicate
      // history entries) -- the sync effect above then never re-runs to clear this flag itself,
      // which would otherwise incorrectly skip the *next* legitimate forward navigation's push.
      setTimeout(() => {
        isPopStateNavRef.current = false;
      }, 0);
      const params = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname.toLowerCase();
      const portalParam = params.get("portal")?.toLowerCase();
      const tabParam = params.get("tab");

      if (portalParam === "admin" || pathname.endsWith("/admin")) {
        setPortal("admin");
        if (
          tabParam &&
          [
            "governance",
            "subscriptions",
            "content_settings",
            "ala_studio",
            "speech_science",
            "enterprise_compliance",
            "integrity_assessment",
            "adaptive_curriculum",
            "ase_engine",
          ].includes(tabParam)
        ) {
          setAdminTab(tabParam as AdminNavTab);
        } else {
          setAdminTab("governance");
        }
      } else {
        setPortal("student");
        if (
          tabParam &&
          [
            "dashboard",
            "assessment",
            "c2course",
            "adaptive",
            "grammar",
            "vocabulary",
            "quizzes",
            "roleplay_coach",
            "fluidconvo",
            "fluency_suite",
            "chat",
            "pronunciation",
            "stress",
            "doctor",
            "progress",
          ].includes(tabParam)
        ) {
          setStudentTab(tabParam as NavTab);
        } else {
          setStudentTab("dashboard");
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update streak on mount. Must NOT clobber a just-restored logged-in user's server progress
  // with the guest-only localStorage progress (updateStreak() reads/writes that guest key
  // unconditionally) — this effect and the session-restore effect above both run on mount, and
  // this one ran second, silently overwriting real progress with stale/empty guest data on every
  // refresh. Guests still use the original localStorage-backed path; logged-in users get the same
  // streak math applied to their already-restored progress instead.
  useEffect(() => {
    const hasSession =
      localStorage.getItem("linguaflow_user_session") ||
      localStorage.getItem("auth_user") ||
      sessionStorage.getItem("linguaflow_user_session");

    if (hasSession) {
      setProgress((prev) => {
        const today = getTodayDateString();
        const lastActive = prev.lastActiveDate || today;
        const diffDays = Math.floor(
          (new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 3600 * 24)
        );
        // Honest: don't coerce a real 0-day streak into a fabricated 1 on mere page load.
        let streak = prev.streakDays ?? 0;
        if (diffDays === 1) streak += 1;
        else if (diffDays > 1) streak = 1;
        return { ...prev, streakDays: streak, lastActiveDate: today };
      });
    } else {
      const updated = updateStreak();
      setProgress(updated);
    }
  }, []);

  // Sync progress to server when progress changes
  useEffect(() => {
    if (currentUser?.id) {
      const syncWithServer = async () => {
        try {
          const token = localStorage.getItem("auth_token");
          if (!token) return;
          await fetch(`/api/auth/sync-progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ progress }),
          });
        } catch (err) {
          // Fallback to local storage
        }
      };
      syncWithServer();
    }
  }, [progress, currentUser]);

  const logPlatformActivity = async (
    type: "lesson" | "quiz" | "level_up" | "streak" | "stress" | "assessment" | "vocab" | "chat",
    title: string,
    description: string,
    score?: number
  ) => {
    if (!currentUser) return;
    try {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userAvatar: currentUser.avatarUrl,
          userLevel: progress.selectedLevel,
          type,
          title,
          description,
          score,
        }),
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem("linguaflow_user_session", JSON.stringify(user));
    if (user.progress) {
      setProgress(user.progress);
    }
    // Route user appropriately based on their assigned role -- role alone, no email fallback.
    if (user.role === "owner" || user.role === "admin") {
      setPortal("admin");
      setAdminTab("governance");
    } else {
      setPortal("student");
      if (!user.progress?.assessmentCompleted) {
        setStudentTab("assessment");
      } else {
        setStudentTab("dashboard");
      }
    }
  };

  const handleQuickOwnerLogin = async () => {
    try {
      const res = await fetch("/api/auth/owner-bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem("linguaflow_user_session", JSON.stringify(data.user));
          handleLoginSuccess(data.user);
        }
      }
    } catch (e) {
      console.error("Owner bypass error:", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("linguaflow_user_session");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("linguaflow_user_session");
    setCurrentUser(null);
  };

  const handleSelectLevel = (lvl: CEFRLevel) => {
    if (!isLevelUnlocked(lvl, progress)) return;
    const updated = { ...progress, selectedLevel: lvl };
    saveUserProgress(updated);
    setProgress(updated);
  };

  const handleCompletePlacementAssessment = (res: PlacementAssessmentResult) => {
    const updated = saveAssessmentResult(res);
    setProgress(updated);
    logPlatformActivity(
      "assessment",
      "Completed CEFR Placement Assessment",
      `Assigned level ${res.diagnosedLevel} with score ${res.totalScorePercentage}%`,
      res.totalScorePercentage
    );
  };

  const handleCompleteSpokenAssessment = (evalRes: SpokenAssessmentEvaluationResponse) => {
    const updated = saveSpokenAssessmentResult(evalRes);
    setProgress(updated);
    logPlatformActivity(
      "assessment",
      "Completed 4-Tier Spoken Assessment",
      `Achieved CEFR ${evalRes.cefr_rating} with fluency ${evalRes.fluency_score}%`,
      evalRes.fluency_score
    );
    setStudentTab("c2course");
  };

  const handlePassBenchmarkExam = (
    completedLevel: CEFRLevel,
    xpEarned: number,
    report?: LevelAssessmentReport
  ) => {
    const updated = recordBenchmarkExamPassed(completedLevel, xpEarned, report);
    saveUserProgress(updated);
    setProgress(updated);
  };

  const handleSelectGrammarLesson = (lessonId: string | null) => {
    setActiveGrammarLessonId(lessonId);
    setStudentTab("grammar");
  };

  const handleSelectVocabCollection = (collectionId: string | null) => {
    setActiveVocabCollectionId(collectionId);
    setStudentTab("vocabulary");
  };

  const handleCompleteGrammarLesson = (lessonId: string, xpEarned: number) => {
    const updated = markLessonCompleted(lessonId, xpEarned);
    setProgress(updated);
    logPlatformActivity(
      "lesson",
      "Completed Grammar Lesson",
      `Finished lesson module: ${lessonId}`
    );
  };

  const handleCompleteQuiz = (quizId: string, score: number, xpEarned: number) => {
    const updated = recordQuizScore(quizId, score, xpEarned);
    setProgress(updated);
    logPlatformActivity(
      "quiz",
      "Finished Grammar Quiz",
      `Scored ${score}% on quiz challenge`,
      score
    );
  };

  const handleToggleSaveWord = (wordId: string) => {
    const updated = toggleSavedWord(wordId);
    setProgress(updated);
  };

  const handleMarkWordMastered = (wordId: string) => {
    const updated = markWordMastered(wordId);
    setProgress(updated);
    logPlatformActivity("vocab", "Mastered Vocabulary Term", `Mastered card ${wordId}`);
  };

  const handleGrantXp = (amount: number) => {
    const updated = addXp(amount);
    setProgress(updated);
  };

  const handleRecordStressResult = (item: StressTestHistoryItem, xpEarned: number) => {
    const updated = recordStressTestResult(item, xpEarned);
    setProgress(updated);
    logPlatformActivity(
      "stress",
      "Survived Speaking Stress Test",
      `Scored ${item.score}% on ${item.scenarioTitle} (${item.wpm} WPM)`,
      item.score
    );
  };

  const handleUpdateGoalSettings = (settings: {
    dailyGoalType: "minutes" | "lessons";
    dailyGoalMinutes: number;
    dailyGoalLessons: number;
    dailyGoalTargetStreak: number;
  }) => {
    const updated = updateDailyGoalSettings(settings);
    setProgress(updated);
    if (currentUser) {
      const updatedUser = { ...currentUser, progress: updated };
      setCurrentUser(updatedUser);
      localStorage.setItem("linguaflow_user_session", JSON.stringify(updatedUser));
    }
  };

  const handleLogStudyMinutes = (minutes: number) => {
    const { progress: updated, goalCompleted } = logStudyTime(minutes, 10);
    setProgress(updated);
    if (currentUser) {
      const updatedUser = { ...currentUser, progress: updated };
      setCurrentUser(updatedUser);
      localStorage.setItem("linguaflow_user_session", JSON.stringify(updatedUser));
    }
    if (goalCompleted) {
      logPlatformActivity(
        "lesson",
        "Completed Daily Study Goal",
        `Hit daily study goal of ${updated.dailyGoalType === "minutes" ? `${updated.dailyGoalMinutes} mins` : `${updated.dailyGoalLessons} lessons`}`
      );
    }
  };

  const handleResetProgress = () => {
    const initial = resetProgress();
    setProgress(initial);
  };

  // Wait for initial session check
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-indigo-400">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400">Initializing Fluenxia LMS...</span>
        </div>
      </div>
    );
  }

  // Strict Authentication Gate: User cannot access LMS without logging in
  if (!currentUser) {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const isExplicitAdminPortal =
      portal === "admin" ||
      params?.get("portal") === "admin" ||
      (typeof window !== "undefined" && window.location.pathname.endsWith("/admin"));

    return (
      <>
        <LoginPage
          initialPortal={isExplicitAdminPortal ? "admin" : "student"}
          onLoginSuccess={handleLoginSuccess}
          onOpenLegalModal={handleOpenLegalModal}
        />
        <LegalModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          initialTab={legalInitialTab}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white flex">
      {/* Left sidebar navigation — student and admin portals each get their own, mutually
          exclusive since only one portal is ever active at a time, so they share the single
          isMobileSidebarOpen drawer state. */}
      {portal === "student" && !isOwnerOrAdmin && (
        <Sidebar
          activeTab={studentTab}
          setActiveTab={setStudentTab}
          onLogout={handleLogout}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenPricing={() => setIsPricingModalOpen(true)}
        />
      )}
      {portal === "admin" && isOwnerOrAdmin && (
        <AdminSidebar
          activeTab={adminTab}
          setActiveTab={setAdminTab}
          onLogout={handleLogout}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          allowedSections={currentUser?.role === "admin" ? currentUser.allowedSections : undefined}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Dynamic Navigation Header based on Portal Mode */}
        {portal === "admin" && isOwnerOrAdmin ? (
          <AdminHeader
            activeAdminTab={adminTab}
            setActiveAdminTab={setAdminTab}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenLegalModal={handleOpenLegalModal}
            onOpenArchitectureDoc={() => setIsArchitectureModalOpen(true)}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />
        ) : portal === "student" && !isOwnerOrAdmin ? (
          <Header
            activeTab={studentTab}
            setActiveTab={setStudentTab}
            progress={progress}
            onUpdateLevel={handleSelectLevel}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onOpenLegalModal={handleOpenLegalModal}
            onOpenArchitectureDoc={() => setIsArchitectureModalOpen(true)}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
            onOpenPricing={() => setIsPricingModalOpen(true)}
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
          />
        ) : null}

        {/* Main Content Area with Strict Isolation Gates */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* SCENARIO 1: Admin User accesses Student Portal -> HARD RESTRICTION GATE */}
        {portal === "student" && isOwnerOrAdmin && (
          <StudentGateForAdmin
            currentUser={currentUser}
            onNavigateToAdminPortal={() => {
              setPortal("admin");
              setAdminTab("governance");
            }}
            onLogout={handleLogout}
          />
        )}

        {/* SCENARIO 2: Non-Admin User accesses Admin Portal -> ADMIN GATE (ACCESS DENIED) */}
        {portal === "admin" && !isOwnerOrAdmin && (
          <AdminGate
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onNavigateToStudentPortal={() => {
              setPortal("student");
              setStudentTab("dashboard");
            }}
            onQuickOwnerLogin={handleQuickOwnerLogin}
          />
        )}

        {/* SCENARIO 3: Authorized Admin in Admin Portal */}
        {portal === "admin" && isOwnerOrAdmin && (
          <>
            {adminTab === "governance" && (
              hasSectionAccess("governance") ? (
                <AdminDashboard
                  currentUser={currentUser}
                  onNavigateToTab={(t) => {
                    if (
                      [
                        "governance",
                        "subscriptions",
                        "content_settings",
                        "ala_studio",
                        "speech_science",
                        "enterprise_compliance",
                        "integrity_assessment",
                        "adaptive_curriculum",
                        "ase_engine",
                      ].includes(t)
                    ) {
                      setAdminTab(t as AdminNavTab);
                    }
                  }}
                />
              ) : (
                <SectionAccessDenied />
              )
            )}

            {adminTab === "subscriptions" && (hasSectionAccess("subscriptions") ? <SubscriptionsRevenuePanel /> : <SectionAccessDenied />)}

            {adminTab === "content_settings" && (hasSectionAccess("content_settings") ? <ContentManagementPanel /> : <SectionAccessDenied />)}

            {adminTab === "ala_studio" && (
              <PsychometricALAEvaluatorStudio
                progress={progress}
                onGrantXp={handleGrantXp}
              />
            )}

            {adminTab === "speech_science" && (
              <AcousticSpeechScienceStudio
                progress={progress}
                onGrantXp={handleGrantXp}
              />
            )}

            {adminTab === "enterprise_compliance" && (
              <EnterpriseComplianceHitlStudio
                progress={progress}
                onGrantXp={handleGrantXp}
              />
            )}

            {adminTab === "adaptive_curriculum" && (
              <AdaptiveCurriculumStudio
                progress={progress}
                onGrantXp={handleGrantXp}
              />
            )}

            {adminTab === "integrity_assessment" && (
              <PlagiarismIntegrityStudio />
            )}

            {adminTab === "ase_engine" && (
              <AntiGamingAseEngineStudio
                progress={progress}
                onGrantXp={handleGrantXp}
              />
            )}
          </>
        )}

        {/* SCENARIO 4: Student User in Student Portal */}
        {portal === "student" && !isOwnerOrAdmin && (
          <>
            {studentTab === "dashboard" && (
              <Dashboard
                progress={progress}
                learnerName={currentUser?.name}
                setActiveTab={setStudentTab}
                onSelectGrammarLesson={handleSelectGrammarLesson}
                onSelectVocabCollection={handleSelectVocabCollection}
                onSelectLevel={handleSelectLevel}
                onOpenAssessment={() => setStudentTab("assessment")}
                onOpenAdvancementExam={(lvl) => setAdvancementExamTargetLevel(lvl)}
                onUpdateGoalSettings={handleUpdateGoalSettings}
                onLogStudyMinutes={handleLogStudyMinutes}
                onOpenPricing={() => setIsPricingModalOpen(true)}
              />
            )}

            {studentTab === "assessment" && (
              <AssessmentIntegrityWrapper
                currentUser={currentUser}
                progress={progress}
                onAssessmentCompleted={handleCompleteSpokenAssessment}
                onCancel={() => setStudentTab("dashboard")}
                initialResult={progress.spokenAssessmentResult}
              />
            )}

            {studentTab === "c2course" && (
              <C2CoursePathway
                course={progress.spokenAssessmentResult?.personalized_c2_course}
                progress={progress}
                onSelectLesson={(lessonId) => {
                  setActiveGrammarLessonId(lessonId);
                  setStudentTab("grammar");
                }}
                onStartSpokenDrill={() => {
                  setStudentTab("fluidconvo");
                }}
                onTakeBenchmark={(level) => {
                  setAdvancementExamTargetLevel(level);
                }}
                onRetakeAssessment={() => {
                  setStudentTab("assessment");
                }}
                onUpdateLevel={handleSelectLevel}
              />
            )}

            {studentTab === "adaptive" && (
              <AdaptiveModuleConfigurator
                progress={progress}
                onUpdateProgress={(updated) => {
                  setProgress(updated);
                  saveUserProgress(updated);
                }}
                onLaunchFluidConvo={() => setStudentTab("fluidconvo")}
                onRetakeAssessment={() => setStudentTab("assessment")}
                onOpenLesson={(id) => {
                  setActiveGrammarLessonId(id);
                  setStudentTab("grammar");
                }}
              />
            )}

            {studentTab === "grammar" && (
              <GrammarHub
                progress={progress}
                activeLessonId={activeGrammarLessonId}
                onSelectLesson={setActiveGrammarLessonId}
                onCompleteLesson={handleCompleteGrammarLesson}
                onOpenAssessment={() => setIsAssessmentModalOpen(true)}
                onOpenAdvancementExam={(lvl) => setAdvancementExamTargetLevel(lvl)}
              />
            )}

            {studentTab === "vocabulary" && (
              <VocabularyHub
                progress={progress}
                activeCollectionId={activeVocabCollectionId}
                onToggleSaveWord={handleToggleSaveWord}
                onMarkWordMastered={handleMarkWordMastered}
              />
            )}

            {studentTab === "quizzes" && (
              <QuizEngine
                progress={progress}
                onCompleteQuiz={handleCompleteQuiz}
              />
            )}

            {studentTab === "roleplay_coach" && (
              <L2SpeakingCoachStudio
                progress={progress}
                onGrantXp={handleGrantXp}
                onLogStudyMinutes={handleLogStudyMinutes}
                onOpenPricing={() => setIsPricingModalOpen(true)}
              />
            )}

            {studentTab === "chat" && (
              <AIChatTutor
                progress={progress}
                onGrantXp={handleGrantXp}
              />
            )}

            {studentTab === "fluidconvo" && (
              <FluidConvoStudio
                progress={progress}
                onAddXp={handleGrantXp}
                onLogStudyMinutes={handleLogStudyMinutes}
                onOpenPricing={() => setIsPricingModalOpen(true)}
              />
            )}

            {studentTab === "fluency_suite" && (
              <FluencySuiteHub
                progress={progress}
                onUpdateProgress={setProgress}
                onGrantXp={handleGrantXp}
              />
            )}

            {studentTab === "pronunciation" && (
              <PronunciationStudio
                progress={progress}
                onGrantXp={handleGrantXp}
              />
            )}

            {studentTab === "stress" && (
              <StressSpeakingStudio
                progress={progress}
                onGrantXp={handleGrantXp}
                onRecordStressResult={handleRecordStressResult}
                onOpenPricing={() => setIsPricingModalOpen(true)}
              />
            )}

            {studentTab === "doctor" && (
              <GrammarDoctor
                progress={progress}
              />
            )}

            {studentTab === "progress" && (
              <ProgressTracker
                progress={progress}
                setActiveTab={setStudentTab}
                onSelectGrammarLesson={handleSelectGrammarLesson}
                onResetProgress={handleResetProgress}
              />
            )}
          </>
        )}
      </main>

      {/* Post-Login / On-Demand CEFR Placement Assessment Questionnaire Modal */}
      <PlacementAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        progress={progress}
        onCompleteAssessment={handleCompletePlacementAssessment}
        isMandatoryFirstTime={!progress.assessmentCompleted}
      />

      {/* Level Advancement / Benchmark Exam Modal */}
      {advancementExamTargetLevel && (
        <LevelAdvancementModal
          isOpen={!!advancementExamTargetLevel}
          onClose={() => setAdvancementExamTargetLevel(null)}
          targetLevel={advancementExamTargetLevel}
          progress={progress}
          onPassExam={(completedLvl, xp, report) => {
            handlePassBenchmarkExam(completedLvl, xp, report);
          }}
        />
      )}

      {/* Google Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onOpenLegalModal={handleOpenLegalModal}
      />

      {/* Terms of Usage & Privacy Policy Legal Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalInitialTab}
      />

      {/* One-time blocking consent gate for accounts created via Google/Apple sign-in, which
          never show our Terms/Privacy/age confirmation the way the email+password signup form
          does. Student accounts only -- admin/owner accounts are pre-existing/trusted internal
          logins, not the compliance target here. */}
      {currentUser && currentUser.role === "student" && !currentUser.consent?.ageAndTermsAcceptedAt && (
        <ConsentGateModal
          currentUser={currentUser}
          onConsentRecorded={(updatedUser) => setCurrentUser(updatedUser)}
          onOpenLegalModal={handleOpenLegalModal}
          onLogout={handleLogout}
        />
      )}

      {/* System Architecture Whitepaper & PDF Export Modal */}
      <ArchitectureDocModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Subscription tier upgrade / Cashfree checkout modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onProfileUpdated={(updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem("linguaflow_user_session", JSON.stringify(updatedUser));
        }}
      />

      {/* Edit Profile (name, avatar, phone) */}
      {currentUser && isEditProfileModalOpen && (
        <ProfileEditModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          currentUser={currentUser}
          onProfileUpdated={(updatedUser) => setCurrentUser(updatedUser)}
        />
      )}

      {/* Post-checkout confirmation banner (dismissable) */}
      {paymentStatusMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <span>{paymentStatusMsg}</span>
          <button type="button" onClick={() => setPaymentStatusMsg(null)} className="text-slate-400 hover:text-white text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Fluenxia</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => handleOpenLegalModal("terms")}
              className="text-slate-600 hover:text-indigo-600 font-semibold hover:underline cursor-pointer transition-colors"
            >
              Terms of Usage
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleOpenLegalModal("privacy")}
              className="text-slate-600 hover:text-indigo-600 font-semibold hover:underline cursor-pointer transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <a
              href="mailto:support@fluenxaapp.com"
              className="text-slate-600 hover:text-indigo-600 font-semibold hover:underline transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </footer>

      {/* Persistent Floating Quick-Translation Widget */}
      <LanguageSelector variant="floating" />
      </div>
    </div>
  );
}
