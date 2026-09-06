import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Flame,
  Zap,
  KeyRound,
  X,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Shield,
  HelpCircle,
  Check,
  Layers,
  Award,
  Globe,
  BookOpen,
  Mic,
} from "lucide-react";
import { UserAccount, CEFRLevel, GoogleAuthStatus, AuthMethod, AuthIntent } from "../types";
import { LegalTab } from "./LegalModal";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
import { loadUserProgress } from "../utils/storageUtils";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "../context/TranslationContext";

interface AuthAccessHubProps {
  onLoginSuccess: (user: UserAccount, targetTab?: string) => void;
  onOpenLegalModal?: (tab?: LegalTab) => void;
  initialPortal?: "student" | "admin";
  initialIntent?: AuthIntent;
  onGuestBypass?: () => void;
  isModalMode?: boolean;
  onCloseModal?: () => void;
}

// Google Official G Logo SVG
const GoogleGIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// Apple Official Logo SVG
const AppleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 170 170" fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.77-11.7-14.21-5.99-9.48-10.74-20.2-14.26-32.16-3.52-11.96-5.28-23.28-5.28-33.97 0-14.45 3.52-26.4 10.56-35.84 7.04-9.44 16.03-14.28 26.97-14.53 4.89 0 10.22 1.25 15.98 3.75 5.76 2.5 9.78 3.82 12.06 3.96 1.95-.14 6.12-1.53 12.51-4.17 6.39-2.64 12.07-3.83 17.04-3.56 12.63.75 22.86 5.48 30.69 14.19-11.02 6.66-16.39 15.75-16.12 27.27.27 9.17 3.75 16.89 10.44 23.16 6.69 6.27 14.7 9.87 24.03 10.8-2.18 6.53-4.8 13.06-7.86 19.59zM119.22 33.39c-.14-5.32 1.69-10.78 5.48-16.38 3.79-5.6 8.78-9.98 14.98-13.14.81 5.32-.97 10.87-5.34 16.65-4.37 5.78-9.41 10.07-15.12 12.87z" />
  </svg>
);

export const AuthAccessHub: React.FC<AuthAccessHubProps> = ({
  onLoginSuccess,
  onOpenLegalModal,
  initialPortal = "student",
  initialIntent = "login",
  onGuestBypass,
  isModalMode = false,
  onCloseModal,
}) => {
  // Tab Switcher: "login" vs "signup"
  const [authIntent, setAuthIntent] = useState<AuthIntent>(initialIntent);

  // Portal Switcher: "student" vs "admin"
  const { t } = useTranslation();

  const [activePortal, setActivePortal] = useState<"student" | "admin">(() => {
    if (initialPortal) return initialPortal;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("portal") === "admin" || window.location.pathname.endsWith("/admin")) {
        return "admin";
      }
    }
    return "student";
  });

  // Form Fields
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("B1");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Password Visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Admin Credentials — never pre-fill real values here. This state used to default to the
  // actual owner email and the real admin passcode, which shipped those secrets in plaintext to
  // every visitor's browser (view-source, not just "hidden" UI) regardless of whether the login
  // attempt itself would succeed.
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminPasscode, setAdminPasscode] = useState<string>("");
  const [adminName, setAdminName] = useState<string>("");

  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Rotating, contextual loading messages shown while a sign-in/sign-up request is in flight —
  // cycles every ~1.1s so the wait feels active rather than a single frozen "Loading..." label.
  const LOGIN_LOADING_STEPS = [
    "Verifying your credentials...",
    "Unlocking your CEFR curriculum...",
    "Syncing your progress...",
    "Almost there...",
  ];
  const SIGNUP_LOADING_STEPS = [
    "Creating your account...",
    "Setting up your oral AI lab...",
    "Migrating your guest progress...",
    "Almost there...",
  ];
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIndex(0);
      return;
    }
    const steps = authIntent === "signup" ? SIGNUP_LOADING_STEPS : LOGIN_LOADING_STEPS;
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, 1100);
    return () => clearInterval(interval);
  }, [isLoading, authIntent]);

  // Rate Limiting & Cooldown Protection
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Google SSO State
  const [isGooglePopupPending, setIsGooglePopupPending] = useState<boolean>(false);
  const [googleAuthStatus, setGoogleAuthStatus] = useState<GoogleAuthStatus | null>(null);

  // Forgot Password Modal State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);
  const [recoveryEmail, setRecoveryEmail] = useState<string>("");
  const [recoverySent, setRecoverySent] = useState<boolean>(false);
  const [recoveryCountdown, setRecoveryCountdown] = useState<number>(0);
  const [recoveryDemoCode, setRecoveryDemoCode] = useState<string | null>(null);
  const [recoveryInputCode, setRecoveryInputCode] = useState<string>("");
  const [newRecoveryPassword, setNewRecoveryPassword] = useState<string>("");
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState<boolean>(false);

  // Guest Progress Snapshot for Continuity Migration
  const [guestProgressSnapshot, setGuestProgressSnapshot] = useState<{
    xp: number;
    streakDays: number;
    completedCount: number;
    masteredCount: number;
  }>({ xp: 150, streakDays: 1, completedCount: 1, masteredCount: 1 });

  // Input Ref
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Send Auth Telemetry Event
  const sendTelemetry = (
    eventName: "auth_page_viewed" | "auth_method_selected" | "auth_completed" | "auth_failed" | "password_reset_requested",
    details?: { method?: AuthMethod; intent?: AuthIntent; errorCode?: string; migratedGuestXp?: number }
  ) => {
    try {
      fetch("/api/auth/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          method: details?.method,
          intent: details?.intent || authIntent,
          email: email || adminEmail,
          errorCode: details?.errorCode,
          migratedGuestXp: details?.migratedGuestXp,
          attemptCount: failedAttempts,
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    } catch (e) {}
  };

  // On Mount: Load Guest Progress & check Google OAuth status & trigger pageview telemetry
  useEffect(() => {
    const currentProgress = loadUserProgress();
    if (currentProgress) {
      setGuestProgressSnapshot({
        xp: currentProgress.xp || 0,
        streakDays: currentProgress.streakDays || 1,
        completedCount: currentProgress.completedLessonIds?.length || 0,
        masteredCount: currentProgress.masteredVocabIds?.length || 0,
      });
    }

    sendTelemetry("auth_page_viewed");

    fetch("/api/auth/google/status")
      .then((res) => res.json())
      .then((data) => {
        setGoogleAuthStatus({
          isLive: Boolean(data.isConfigured),
          hasClientId: Boolean(data.clientId),
          clientIdMasked: data.clientIdMasked,
          callbackUrl: data.callbackUrl,
          statusMessage: data.statusMessage,
        });
      })
      .catch(() => {});
  }, []);

  // Cooldown Countdown Timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  // Recovery Resend Countdown Timer
  useEffect(() => {
    if (recoveryCountdown <= 0) return;
    const interval = setInterval(() => {
      setRecoveryCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [recoveryCountdown]);

  // Google OAuth postMessage & Cross-Tab Storage Listener
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data?.user) {
        setIsGooglePopupPending(false);
        setIsLoading(false);
        setSuccessMsg(`Welcome, ${event.data.user.name}! Synchronizing your English pathway...`);
        sendTelemetry("auth_completed", { method: "google_sso", intent: authIntent });
        if (event.data.token) localStorage.setItem("auth_token", event.data.token);
        setTimeout(() => {
          onLoginSuccess(event.data.user, activePortal === "admin" ? "admin" : undefined);
        }, 400);
      } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
        setIsGooglePopupPending(false);
        setIsLoading(false);
        setErrorMsg(event.data.error || "Google Sign-In was cancelled or failed.");
        sendTelemetry("auth_failed", { method: "google_sso", errorCode: "user_canceled" });
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "linguaflow_user_session" && event.newValue) {
        try {
          const user = JSON.parse(event.newValue);
          if (user?.email) {
            setIsGooglePopupPending(false);
            setIsLoading(false);
            setSuccessMsg(`Welcome back, ${user.name}!`);
            setTimeout(() => {
              onLoginSuccess(user, activePortal === "admin" ? "admin" : undefined);
            }, 300);
          }
        } catch (e) {}
      }
    };

    window.addEventListener("message", handleAuthMessage);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("message", handleAuthMessage);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [onLoginSuccess, activePortal, authIntent]);

  // Trigger Error Shake Animation
  const triggerErrorShake = (msg: string, code = "invalid_credentials") => {
    setErrorMsg(msg);
    setIsShaking(true);
    setFailedAttempts((prev) => {
      const updated = prev + 1;
      if (updated >= 5) {
        setCooldownRemaining(30);
      }
      return updated;
    });
    sendTelemetry("auth_failed", { method: "native_email", errorCode: code });
    setTimeout(() => setIsShaking(false), 600);
  };

  // Calculate Password Strength Score (0 to 4)
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength(password);
  const strengthLabels = ["Very Weak", "Fair", "Moderate", "Strong", "Rock-Solid"];
  const strengthColors = ["bg-slate-200", "bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  // 1. Handle Primary Email / Password Submit
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownRemaining > 0) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    // Email format validation
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      triggerErrorShake("Please enter a valid email address (e.g. learner@domain.com)");
      return;
    }

    if (!password || password.length < 6) {
      triggerErrorShake("Password must contain at least 6 characters.");
      return;
    }

    setIsLoading(true);
    sendTelemetry("auth_method_selected", { method: "native_email", intent: authIntent });

    try {
      const endpoint = authIntent === "signup" ? "/api/auth/register" : "/api/auth/login";
      const currentGuestProgress = loadUserProgress();

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          name: fullName || cleanEmail.split("@")[0],
          targetLevel: selectedLevel,
          guestProgress: currentGuestProgress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setSuccessMsg(authIntent === "signup" ? "Account created successfully! Migrating learning progress..." : `Welcome back, ${data.user.name}!`);
      sendTelemetry("auth_completed", { method: "native_email", intent: authIntent, migratedGuestXp: currentGuestProgress?.xp || 0 });

      if (data.token) localStorage.setItem("auth_token", data.token);

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err: any) {
      triggerErrorShake(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Google SSO Sign-In (dev-only fallback path — the real OAuth popup flow is what
  // production actually uses; this direct endpoint is disabled server-side unless ALLOW_DEV_AUTH
  // is set). Never default to a real person's email here — if no email is available, fail loudly
  // instead of silently impersonating whoever happened to be hardcoded.
  const handleGoogleDirectSignIn = async (forcedEmail?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    sendTelemetry("auth_method_selected", { method: "google_sso" });

    const targetEmail = forcedEmail || email;
    if (!targetEmail) {
      triggerErrorShake("No Google account email available. Please use the Google Sign-In button instead.");
      return;
    }

    setIsLoading(true);
    try {
      const currentGuestProgress = loadUserProgress();
      const res = await fetch("/api/auth/google/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          name: targetEmail ? targetEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Google Learner",
          targetLevel: selectedLevel,
          guestProgress: currentGuestProgress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed");
      }

      setSuccessMsg(`Signed in with Google as ${data.user.email}`);
      sendTelemetry("auth_completed", { method: "google_sso", intent: authIntent });

      if (data.token) localStorage.setItem("auth_token", data.token);

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || "Google authentication encountered an issue.");
      sendTelemetry("auth_failed", { method: "google_sso" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOAuthPopup = async (forcedEmail?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const origin = window.location.origin;
      const urlRes = await fetch(`/api/auth/google/url?origin=${encodeURIComponent(origin)}`);
      const urlData = await urlRes.json();
      if (urlData.configured && urlData.url) {
        const popup = window.open(
          urlData.url,
          "GoogleLoginPopup",
          "width=520,height=640,status=no,toolbar=no,menubar=no,location=no"
        );
        if (popup) {
          setIsGooglePopupPending(true);
          setIsLoading(false);

          // Watch for popup close if user dismisses without finishing
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              setIsGooglePopupPending(false);
            }
          }, 600);

          return;
        }
      }
      // If popup was blocked or Google OAuth URL not configured, use direct verified sign-in
      await handleGoogleDirectSignIn(forcedEmail);
    } catch (e: any) {
      await handleGoogleDirectSignIn(forcedEmail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (forcedEmail?: string) => {
    if (forcedEmail) {
      await handleGoogleDirectSignIn(forcedEmail);
      return;
    }
    await handleGoogleOAuthPopup();
  };

  // 3. Handle Apple SSO Sign-In
  const handleAppleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    sendTelemetry("auth_method_selected", { method: "apple_sso" });

    try {
      const currentGuestProgress = loadUserProgress();
      const appleEmail = email.includes("@") ? email : "learner.apple@icloud.com";
      const res = await fetch("/api/auth/apple/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: appleEmail,
          name: fullName || "Apple Learner",
          guestProgress: currentGuestProgress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Apple ID authentication failed");
      }

      setSuccessMsg(`Signed in with Apple as ${data.user.email}`);
      sendTelemetry("auth_completed", { method: "apple_sso", intent: authIntent });

      if (data.token) localStorage.setItem("auth_token", data.token);

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || "Apple Sign-In failed.");
      sendTelemetry("auth_failed", { method: "apple_sso" });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Admin Portal Sign-In
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      // The admin gateway has its own form, but authenticates through the same real,
      // password-verified endpoint students use — there's no separate passcode auth anymore.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPasscode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid administrator credentials.");
      }

      // This form is for admins/owners only — a valid student login here is rejected with a
      // clear redirect message rather than silently dropping them into the admin shell (the real
      // access control is still server-side on every /api/admin/* route regardless).
      if (data.user.role !== "admin" && data.user.role !== "owner") {
        throw new Error("This account doesn't have administrator access. Please use the student Sign In instead.");
      }

      setSuccessMsg(`Authenticated as ${data.user.role.toUpperCase()}: ${data.user.email}`);
      if (data.token) localStorage.setItem("auth_token", data.token);
      setTimeout(() => {
        onLoginSuccess(data.user, "admin");
      }, 400);
    } catch (err: any) {
      triggerErrorShake(err.message || "Failed to authenticate administrator.");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Forgot Password Request Dispatch
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTarget = recoveryEmail.trim().toLowerCase();
    if (!cleanTarget || !cleanTarget.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsResettingPassword(true);
    sendTelemetry("password_reset_requested", { intent: authIntent });

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanTarget }),
      });
      const data = await res.json();
      setRecoverySent(true);
      setRecoveryCountdown(45);
      if (data.demoCode) {
        setRecoveryDemoCode(data.demoCode);
      }
    } catch (err: any) {
      // Affirmative fallback for safety
      setRecoverySent(true);
      setRecoveryCountdown(45);
    } finally {
      setIsResettingPassword(false);
    }
  };

  // 6. Handle Password Reset Confirmation Submit
  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryInputCode || !newRecoveryPassword) {
      setErrorMsg("Please enter the recovery code and your new password.");
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recoveryEmail.trim().toLowerCase(),
          code: recoveryInputCode.trim(),
          newPassword: newRecoveryPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setPasswordResetSuccess(true);
      setPassword(newRecoveryPassword);
      setEmail(recoveryEmail);
      setTimeout(() => {
        setIsForgotPasswordOpen(false);
        setPasswordResetSuccess(false);
        setRecoverySent(false);
        setSuccessMsg("Password updated! You can now sign in with your new password.");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired recovery code.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Guest Bypass Action
  const handleGuestExplore = () => {
    sendTelemetry("auth_method_selected", { method: "guest_bypass" });
    if (onGuestBypass) {
      onGuestBypass();
    } else {
      // Default guest user
      const guestProgress = loadUserProgress();
      const guestUser: UserAccount = {
        id: `usr_guest_${Date.now()}`,
        name: "Guest Explorer",
        role: "student",
        authProvider: "guest",
        isGuest: true,
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=guest",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        status: "active",
        progress: guestProgress,
      };
      onLoginSuccess(guestUser);
    }
  };

  return (
    <div
      id="auth_access_hub"
      className={`${
        isModalMode
          ? "w-full max-w-lg mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
          : "min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/60 to-blue-100 text-slate-900 flex flex-col justify-between relative overflow-hidden"
      } selection:bg-blue-500 selection:text-white font-sans`}
    >
      {/* Soft decorative background shapes (purely visual, matches design reference) */}
      {!isModalMode && (
        <>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Minimal utility row — kept deliberately quiet so it doesn't compete with the clean card
          design below. All the same functionality (guest mode, language, admin portal) as before,
          just no heavy header bar. */}
      {!isModalMode && (
        <header className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-end gap-4">
          <button
            id="btn_guest_explore_top"
            type="button"
            onClick={handleGuestExplore}
            className="text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            <span>{t("auth.explore_guest", "Explore as Guest")}</span>
            <ArrowRight size={12} />
          </button>

          <div className="text-slate-500">
            <LanguageSelector variant="compact" />
          </div>

          <button
            type="button"
            onClick={() => {
              const next = activePortal === "student" ? "admin" : "student";
              setActivePortal(next);
              setErrorMsg(null);
              const url = new URL(window.location.href);
              url.searchParams.set("portal", next);
              window.history.replaceState({}, "", url);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            {activePortal === "student" ? <Shield size={12} /> : <GraduationCap size={12} />}
            <span>{activePortal === "student" ? t("auth.faculty_admin", "Faculty / Admin") : t("auth.learner_hub", "Learner Hub")}</span>
          </button>
        </header>
      )}

      {/* Main Form Centerpiece */}
      <main className={`flex-1 flex items-center justify-center ${isModalMode ? "p-6" : "px-4 py-8"}`}>
        <div
          className={`w-full ${
            !isModalMode && activePortal === "student" ? "max-w-md lg:max-w-5xl" : "max-w-md"
          } ${
            isModalMode
              ? "bg-white/95 backdrop-blur-xl text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100/50 ring-1 ring-white/20"
              : "bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden"
          } ${isShaking ? "animate-shake" : ""}`}
        >
          {/* Modal Close Button if in modal mode */}
          {isModalMode && onCloseModal && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <LinguaFlowLogo variant="mark" size="xs" />
                <span className="font-black text-sm text-slate-900 tracking-wide">FLUENXIA Access</span>
              </div>
              <button
                type="button"
                onClick={onCloseModal}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* 1. Pedagogical Progress Continuity Notice — compact pill, only shown when relevant
              (a guest has unsaved progress), kept subtle so it doesn't compete with the clean layout */}
          {guestProgressSnapshot.xp > 0 && activePortal === "student" && (
            <div
              id="banner_pedagogical_continuity"
              className={`${isModalMode ? "" : "mx-6 mt-4"} mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-[11px] text-amber-800 font-semibold`}
            >
              <Flame size={13} className="fill-amber-500 text-amber-500 shrink-0" />
              <span>
                {guestProgressSnapshot.xp} XP unsaved — sign in to keep your progress safe.
              </span>
            </div>
          )}

          {/* Student Hub View */}
          {activePortal === "student" ? (
            <div className={!isModalMode ? "lg:grid lg:grid-cols-2" : undefined}>
              {/* LEFT COLUMN: Branded content panel — logo, headline, feature highlights, illustration */}
              <div
                className={
                  !isModalMode
                    ? "bg-gradient-to-br from-blue-50 via-indigo-50/60 to-blue-100 p-8 lg:p-10 lg:sticky lg:top-0 lg:self-start flex flex-col"
                    : undefined
                }
              >
                {!isModalMode && (
                  <>
                    <div className="flex items-center gap-2.5 mb-8">
                      <LinguaFlowLogo variant="mark" size="sm" />
                      <div>
                        <span className="block text-lg font-black text-blue-700 tracking-tight">Fluenxia</span>
                        <span className="block text-[10px] font-bold text-slate-500 tracking-wide">
                          Learn &bull; Practice &bull; Speak &bull; Grow
                        </span>
                      </div>
                    </div>

                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                      {t("auth.cefr_journey_title", "Your AI-Powered English Learning Partner")}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">
                      {t("auth.cefr_journey_desc", "Build your confidence, improve your skills, and speak English fluently — one step at a time.")}
                    </p>

                    {/* Feature Highlight Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                      {[
                        { icon: BookOpen, label: "Learn", desc: "Structured lessons", color: "bg-blue-500" },
                        { icon: Mic, label: "Practice", desc: "Interactive drills", color: "bg-teal-500" },
                        { icon: Sparkles, label: "AI Speaking", desc: "Real conversations", color: "bg-purple-500" },
                        { icon: Zap, label: "Track Progress", desc: "See improvement", color: "bg-amber-500" },
                      ].map((f) => (
                        <div key={f.label} className="flex flex-col items-center text-center gap-1.5">
                          <div className={`w-11 h-11 rounded-full ${f.color} text-white flex items-center justify-center shadow-sm`}>
                            <f.icon size={18} />
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-800 leading-tight">{f.label}</span>
                          <span className="text-[10px] text-slate-500 leading-tight hidden sm:block">{f.desc}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Regional Mother Tongue Translation — compact single-line control (same feature,
                    just no longer a heavy standalone card) */}
                <div className="mb-4 flex items-center gap-1.5 text-slate-500">
                  <Globe size={13} className="shrink-0" />
                  <span className="text-[11px] font-semibold whitespace-nowrap">Read in your language:</span>
                  <LanguageSelector variant="header" />
                </div>

                {/* Simple illustration placeholder (icon-based — no illustration assets exist in the
                    codebase yet; swap for real artwork if the client provides it) */}
                {!isModalMode && (
                  <div className="hidden lg:flex mt-auto pt-6 items-end gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shrink-0">
                      <GraduationCap size={30} />
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm border border-blue-100">
                      <p className="text-xs font-bold text-slate-700 italic">Small steps make big progress!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Sign In / Create Account form — scrolls independently so the left
                  column (content) stays fixed in place instead of the whole page scrolling. */}
              <div className={!isModalMode ? "p-8 lg:p-10 lg:max-h-[75vh] lg:overflow-y-auto no-scrollbar" : undefined}>
              {/* Quick link to switch between Sign In / Create Account (top-right, matches design) */}
              <div className="flex justify-end mb-2">
                <button
                  id="tab_auth_switch_link"
                  type="button"
                  onClick={() => {
                    const next = authIntent === "login" ? "signup" : "login";
                    setAuthIntent(next);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-blue-700"
                >
                  {authIntent === "login" ? (
                    <>
                      New here?{" "}
                      <span className="text-blue-600 font-extrabold hover:underline">
                        {t("auth.create_account_tab", "Create an account")}
                      </span>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <span className="text-blue-600 font-extrabold hover:underline">
                        {t("auth.sign_in_tab", "Sign In")}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Title & Context */}
              <div className="mb-4 text-left">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {authIntent === "login" ? t("auth.welcome_back_title", "Welcome Back, Learner") : t("auth.create_account_title", "Begin Your Mastery Journey")}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {authIntent === "login"
                    ? t("auth.welcome_back_subtitle", "Log into your personalized CEFR curriculum & oral lab")
                    : "Create your permanent account with full cloud synchronization"}
                </p>
              </div>

              {/* Notification Banners */}
              {errorMsg && (
                <div
                  id="banner_auth_error"
                  className="mb-4 p-3 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs flex items-start gap-2 animate-in fade-in"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1 font-medium">{errorMsg}</div>
                  <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
                    <X size={14} />
                  </button>
                </div>
              )}

              {successMsg && (
                <div
                  id="banner_auth_success"
                  className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs flex items-start gap-2 animate-in fade-in"
                >
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                  <div className="flex-1 font-medium">{successMsg}</div>
                </div>
              )}

              {/* Rate Limit Cooldown Notice */}
              {cooldownRemaining > 0 && (
                <div
                  id="banner_rate_limit"
                  className="mb-4 p-3 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 text-xs flex items-center gap-2"
                >
                  <Clock size={16} className="shrink-0 text-amber-600 animate-spin" />
                  <span className="font-semibold">
                    Too many attempts. Security cooldown active: {cooldownRemaining}s remaining.
                  </span>
                </div>
              )}

              {/* 2. Social Authentication (SSO) Stack */}
              <div className="space-y-2 mb-4">
                {/* Google Sign In Button */}
                <button
                  id="btn_sso_google"
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  disabled={isLoading || cooldownRemaining > 0}
                  className="w-full h-10 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-2.5 transition-all hover:border-slate-400 active:scale-[0.99] disabled:opacity-50"
                >
                  <GoogleGIcon className="w-5 h-5 shrink-0" />
                  <span>{t("auth.continue_google", "Continue with Google")}</span>
                </button>

                {/* Apple Sign In Button */}
                <button
                  id="btn_sso_apple"
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={isLoading || cooldownRemaining > 0}
                  className="w-full h-10 px-4 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl border border-black shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <AppleIcon className="w-5 h-5 shrink-0 text-white" />
                  <span>{t("auth.continue_apple", "Continue with Apple")}</span>
                </button>

              </div>

              {/* 3. Visual Divider */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  {t("auth.or_continue_email", "or continue with email")}
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* 4. Credentials Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
                {/* Full Name (Sign Up only) */}
                {authIntent === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t("auth.full_name_label", "Full Name")}</label>
                    <input
                      id="input_auth_name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                )}

                {/* Email Field with validation */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">{t("auth.email_label", "Email Address")}</label>
                  </div>
                  <div className="relative">
                    <input
                      id="input_email_field"
                      ref={emailInputRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="learner@domain.com"
                      className="w-full h-11 pl-10 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    {email && (
                      <button
                        type="button"
                        onClick={() => setEmail("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Password Field with Eye Toggle */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">{t("auth.password_label", "Password")}</label>
                    {authIntent === "login" && (
                      <button
                        id="btn_forgot_password"
                        type="button"
                        onClick={() => {
                          setRecoveryEmail(email);
                          setIsForgotPasswordOpen(true);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {t("auth.forgot_password", "Forgot password?")}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="input_password_field"
                      type={showPassword ? "text military" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      id="btn_toggle_password"
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Dynamic Password Strength Meter for Sign-Up */}
                  {authIntent === "signup" && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1.5 h-1.5 w-full">
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              passwordScore >= seg ? strengthColors[passwordScore] : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-medium">Strength</span>
                        <span
                          className={`font-bold ${
                            passwordScore <= 1
                              ? "text-rose-600"
                              : passwordScore <= 2
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {strengthLabels[passwordScore]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Target Level Selection on Sign-Up */}
                {authIntent === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Initial Target Level</label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {(["A1", "A2", "B1", "B2", "C1", "C2"] as CEFRLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelectedLevel(lvl)}
                          className={`py-1.5 text-xs font-extrabold rounded-lg border transition-all ${
                            selectedLevel === lvl
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remember Device Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="checkbox_remember_device"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="checkbox_remember_device" className="text-xs font-medium text-slate-600 cursor-pointer">
                    {t("auth.remember_device", "Remember this device for 30 days")}
                  </label>
                </div>

                {/* Primary CTA Submit Button */}
                <button
                  id="btn_auth_submit"
                  type="submit"
                  disabled={isLoading || cooldownRemaining > 0}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin shrink-0" />
                      <span className="animate-in fade-in" key={loadingStepIndex}>
                        {(authIntent === "signup" ? SIGNUP_LOADING_STEPS : LOGIN_LOADING_STEPS)[loadingStepIndex]}
                      </span>
                    </>
                  ) : cooldownRemaining > 0 ? (
                    <span>Cooldown active ({cooldownRemaining}s)</span>
                  ) : (
                    <>
                      <span>{authIntent === "signup" ? t("auth.create_account_save_streak", "Create Account & Save Streak") : t("auth.continue_practicing", "Continue Practicing")}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <ShieldCheck size={13} />
                <span>Your data is safe and secure</span>
              </p>
              </div>
            </div>
          ) : (
            /* Admin / Faculty Portal View */
            <div className={!isModalMode ? "p-8 lg:p-10" : undefined}>
              <div className="mb-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center mb-3">
                  <Shield size={24} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Faculty & Admin Gateway</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Access LMS administration, telemetry logs, and learner management
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1 font-medium">{errorMsg}</div>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs flex items-start gap-2">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                  <div className="flex-1 font-medium">{successMsg}</div>
                </div>
              )}

              <form onSubmit={handleAdminSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty / Admin Email</label>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="off"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="w-full h-11 pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide passcode" : "Show passcode"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>Open Admin Console</span>}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer Legal & Security Notice (Only in full-screen mode) */}
      {!isModalMode && (
        <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200/70">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-500" />
            <span>256-bit TLS Encryption • CEFR-Aligned LMS Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            {onOpenLegalModal && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal("terms")}
                  className="hover:text-blue-700 transition-colors"
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal("privacy")}
                  className="hover:text-blue-700 transition-colors"
                >
                  Privacy Policy
                </button>
              </>
            )}
            <span>© 2026 Fluenxia</span>
          </div>
        </footer>
      )}

      {/* Context-Aware Password Recovery Modal (modal_password_recovery) */}
      {isForgotPasswordOpen && (
        <div
          id="modal_password_recovery"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in"
        >
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-blue-600">
                <KeyRound size={20} />
                <h3 className="text-lg font-black text-slate-900">Password Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {!recoverySent ? (
              <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter your registered email address. If an account exists in our system, we will dispatch a secure reset verification code.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="learner@domain.com"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    {isResettingPassword ? <Loader2 size={16} className="animate-spin" /> : <span>Send Reset Code</span>}
                  </button>
                </div>
              </form>
            ) : passwordResetSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-black text-slate-900">Password Reset Complete!</h4>
                <p className="text-xs text-slate-600">Your account password has been updated successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
                  <div className="font-bold mb-1">Verification Instructions Sent</div>
                  <p className="text-[11px] text-indigo-700">
                    If an account exists for <strong>{recoveryEmail}</strong>, instructions and a 6-digit code have been dispatched.
                  </p>
                  {recoveryDemoCode && (
                    <div className="mt-2 pt-2 border-t border-indigo-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-800">Sandbox Code:</span>
                      <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-950">
                        {recoveryDemoCode}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Recovery Code</label>
                  <input
                    type="text"
                    required
                    value={recoveryInputCode}
                    onChange={(e) => setRecoveryInputCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 tracking-wider text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newRecoveryPassword}
                    onChange={(e) => setNewRecoveryPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    disabled={recoveryCountdown > 0}
                    onClick={handleRequestPasswordReset}
                    className="font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {recoveryCountdown > 0 ? `Resend in ${recoveryCountdown}s` : "Resend Code"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  {isResettingPassword ? <Loader2 size={16} className="animate-spin" /> : <span>Update Password & Sign In</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
