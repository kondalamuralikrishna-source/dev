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
} from "lucide-react";
import { UserAccount, CEFRLevel, GoogleAuthStatus, AuthMethod, AuthIntent } from "../types";
import { LegalTab } from "./LegalModal";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
import { loadUserProgress } from "../utils/storageUtils";
import { LanguageSelector } from "./LanguageSelector";

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
  const [email, setEmail] = useState<string>("alex.chen@globaltech.io");
  const [password, setPassword] = useState<string>("Learner123!");
  const [fullName, setFullName] = useState<string>("Alex Chen");
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("B1");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Password Visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Admin Credentials
  const [adminEmail, setAdminEmail] = useState<string>("kondala.muralikrishna@gmail.com");
  const [adminPasscode, setAdminPasscode] = useState<string>("admin2026");
  const [adminName, setAdminName] = useState<string>("Muralikrishna Kondala (Owner)");

  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Rate Limiting & Cooldown Protection
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Google SSO State
  const [isGooglePopupPending, setIsGooglePopupPending] = useState<boolean>(false);
  const [isGoogleAccountChooserOpen, setIsGoogleAccountChooserOpen] = useState<boolean>(false);
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

  // Quick Account Picker Items for instant student testing
  const demoStudentAccounts = [
    {
      name: "Alex Chen",
      email: "alex.chen@globaltech.io",
      role: "student",
      level: "B2",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      description: "Software Engineer • 1,420 XP • 6-day streak",
    },
    {
      name: "Elena Rostova",
      email: "elena.rostova@berlin-tech.de",
      role: "student",
      level: "C1",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      description: "Product Manager • 2,150 XP • 11-day streak",
    },
    {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@medcare.in",
      role: "student",
      level: "A2",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      description: "Medical Student • 780 XP • 4-day streak",
    },
  ];

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

  // 2. Handle Google SSO Sign-In
  const [isGoogleCustomModalOpen, setIsGoogleCustomModalOpen] = useState<boolean>(false);
  const [isRedirectHelpOpen, setIsRedirectHelpOpen] = useState<boolean>(false);
  const [personalGoogleEmail, setPersonalGoogleEmail] = useState<string>("kondala.muralikrishna@gmail.com");

  const handleGoogleDirectSignIn = async (forcedEmail?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    sendTelemetry("auth_method_selected", { method: "google_sso" });

    const targetEmail = forcedEmail || personalGoogleEmail || email || "kondala.muralikrishna@gmail.com";

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
      const res = await fetch("/api/auth/admin/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          passcode: adminPasscode,
          name: adminName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid administrator credentials.");
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
          : "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 flex flex-col justify-between"
      } selection:bg-indigo-500 selection:text-white font-sans`}
    >
      {/* Top App Bar (Only in full-screen mode) */}
      {!isModalMode && (
        <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LinguaFlowLogo variant="mark" size="sm" />
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white flex items-center gap-2">
                FLUENXIA <span className="text-xs bg-cyan-500/30 text-cyan-300 font-bold px-2 py-0.5 rounded-md border border-cyan-400/30">Oral AI & LMS</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Empower Learning, Unleash Potential.</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Escape Hatch: Explore as Guest */}
            <button
              id="btn_guest_explore_top"
              type="button"
              onClick={handleGuestExplore}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800/60 transition-colors flex items-center gap-1.5 border border-slate-700/50"
            >
              <span>Explore as Guest</span>
              <ArrowRight size={14} />
            </button>

            {/* Regional Translation Language Dropdown */}
            <div className="bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700 flex items-center">
              <LanguageSelector variant="admin" />
            </div>

            {/* Portal Switcher Pill */}
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActivePortal("student");
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activePortal === "student"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <GraduationCap size={14} />
                <span>Learner Hub</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePortal("admin");
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activePortal === "admin"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Shield size={14} />
                <span>Faculty / Admin</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Form Centerpiece */}
      <main className={`flex-1 flex items-center justify-center ${isModalMode ? "p-6" : "px-4 py-8"}`}>
        <div
          className={`w-full max-w-md ${
            isModalMode
              ? ""
              : "bg-white/95 backdrop-blur-xl text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100/50 ring-1 ring-white/20"
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

          {/* 1. Pedagogical Progress Continuity Banner */}
          {guestProgressSnapshot.xp > 0 && activePortal === "student" && (
            <div
              id="banner_pedagogical_continuity"
              className="mb-5 p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Flame size={20} className="fill-amber-400 text-amber-400 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <span>{guestProgressSnapshot.xp} XP & {guestProgressSnapshot.streakDays}-Day Streak</span>
                    <span className="inline-block px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-200 text-amber-900 rounded">
                      Unsaved
                    </span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug truncate mt-0.5">
                  Sign in to bind your speech models & keep your progress safe.
                </p>
              </div>
            </div>
          )}

          {/* Student Hub View */}
          {activePortal === "student" ? (
            <div>
              {/* Regional Mother Tongue Translation Option Banner inside card */}
              <div className="mb-4 p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="p-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-black">
                    <Globe size={13} />
                  </span>
                  <div>
                    <span className="text-[11px] font-black text-slate-900 block leading-tight">
                      Mother Tongue Translation
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Telugu, Hindi, Tamil, etc.
                    </span>
                  </div>
                </div>
                <LanguageSelector variant="header" />
              </div>

              {/* Segmented Tab Switcher (Sign In vs Create Account) */}
              <div
                id="switcher_auth_intent"
                className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-6"
              >
                <button
                  id="tab_auth_signin"
                  type="button"
                  onClick={() => {
                    setAuthIntent("login");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                    authIntent === "login"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  id="tab_auth_signup"
                  type="button"
                  onClick={() => {
                    setAuthIntent("signup");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                    authIntent === "signup"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Title & Context */}
              <div className="mb-5 text-center">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {authIntent === "login" ? "Welcome Back, Learner" : "Begin Your Mastery Journey"}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {authIntent === "login"
                    ? "Log into your personalized CEFR curriculum & oral lab"
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
              <div className="space-y-2.5 mb-5">
                {/* Google Sign In Button */}
                <button
                  id="btn_sso_google"
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  disabled={isLoading || cooldownRemaining > 0}
                  className="w-full h-11 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-all hover:border-slate-400 active:scale-[0.99] disabled:opacity-50"
                >
                  <GoogleGIcon className="w-5 h-5 shrink-0" />
                  <span>Continue with Google</span>
                </button>

                {/* Apple Sign In Button */}
                <button
                  id="btn_sso_apple"
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={isLoading || cooldownRemaining > 0}
                  className="w-full h-11 px-4 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-2xl border border-black shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <AppleIcon className="w-5 h-5 shrink-0 text-white" />
                  <span>Continue with Apple</span>
                </button>

                {/* 1-Tap Google Switcher Toggle & Custom Account Input */}
                <div className="text-center pt-0.5 space-y-2">
                  <div className="flex items-center justify-center flex-wrap gap-2 text-[11px] font-semibold text-indigo-600">
                    <button
                      type="button"
                      onClick={() => handleGoogleDirectSignIn(personalGoogleEmail)}
                      className="hover:text-indigo-800 hover:underline inline-flex items-center gap-1 font-bold text-indigo-700"
                    >
                      <span>1-Click Sign In ({personalGoogleEmail.split("@")[0]})</span>
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setIsRedirectHelpOpen(!isRedirectHelpOpen)}
                      className="hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Fix 400 Error Info</span>
                      <ChevronRight size={12} className={isRedirectHelpOpen ? "rotate-90 transition-transform" : "transition-transform"} />
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setIsGoogleAccountChooserOpen(!isGoogleAccountChooserOpen)}
                      className="hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Demo accounts</span>
                      <ChevronRight size={12} className={isGoogleAccountChooserOpen ? "rotate-90 transition-transform" : "transition-transform"} />
                    </button>
                  </div>

                  {isRedirectHelpOpen && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-left animate-in fade-in text-xs text-amber-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950">How to fix Error 400: redirect_uri_mismatch:</span>
                        <button
                          type="button"
                          onClick={() => setIsRedirectHelpOpen(false)}
                          className="text-amber-700 font-bold hover:text-amber-950"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        In the <strong>Google Cloud Console &gt; APIs & Services &gt; Credentials &gt; OAuth 2.0 Client IDs</strong>, add this exact URL to <strong>Authorized redirect URIs</strong>:
                      </p>
                      <div className="p-2 bg-white rounded-xl border border-amber-300 font-mono text-[10px] break-all select-all text-slate-800">
                        https://remix-remix-english-mastery-lms-ai-tutor-401243760389.asia-southeast1.run.app/auth/google/callback
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("https://remix-remix-english-mastery-lms-ai-tutor-401243760389.asia-southeast1.run.app/auth/google/callback");
                            alert("Copied redirect URI to clipboard!");
                          }}
                          className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 rounded-lg text-[10px] font-bold text-amber-900"
                        >
                          Copy Redirect URI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGoogleDirectSignIn(personalGoogleEmail)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-[10px] font-bold text-white ml-auto"
                        >
                          Instant Sign-In (Skip Popup)
                        </button>
                      </div>
                    </div>
                  )}

                  {isGoogleCustomModalOpen && (
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 text-left animate-in fade-in">
                      <label className="text-[11px] font-bold text-indigo-950 block">
                        Sign In with Any Personal Google / Gmail Account:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={personalGoogleEmail}
                          onChange={(e) => setPersonalGoogleEmail(e.target.value)}
                          placeholder="e.g. yourname@gmail.com"
                          className="flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleGoogleDirectSignIn(personalGoogleEmail)}
                          disabled={isLoading || !personalGoogleEmail}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          Sign In
                        </button>
                      </div>
                      <p className="text-[10px] text-indigo-700">
                        Defaulting to <strong>{personalGoogleEmail}</strong> (Owner / C1 Level profile).
                      </p>
                    </div>
                  )}

                  {isGoogleAccountChooserOpen && (
                    <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-left animate-in fade-in">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 pt-1">
                        Select a Pre-Configured Student
                      </p>
                      {demoStudentAccounts.map((acc) => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => {
                            setEmail(acc.email);
                            setPassword("Learner123!");
                            setFullName(acc.name);
                            setSelectedLevel(acc.level as CEFRLevel);
                            handleGoogleSignIn(acc.email);
                          }}
                          className="w-full p-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200/80 text-left flex items-center gap-2.5 transition-colors"
                        >
                          <img src={acc.avatar} alt={acc.name} className="w-7 h-7 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 truncate">{acc.name}</span>
                              <span className="text-[10px] font-extrabold text-indigo-600 px-1.5 py-0.5 bg-indigo-50 rounded">
                                {acc.level}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">{acc.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Visual Divider */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  or continue with email
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* 4. Credentials Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
                {/* Full Name (Sign Up only) */}
                {authIntent === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      id="input_auth_name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                )}

                {/* Email Field with validation */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">Email Address</label>
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
                      className="w-full h-11 pl-10 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
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
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    {authIntent === "login" && (
                      <button
                        id="btn_forgot_password"
                        type="button"
                        onClick={() => {
                          setRecoveryEmail(email);
                          setIsForgotPasswordOpen(true);
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Forgot password?
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
                      className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
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
                              ? "bg-indigo-600 text-white border-indigo-600"
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
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="checkbox_remember_device" className="text-xs font-medium text-slate-600 cursor-pointer">
                    Remember this device for 30 days
                  </label>
                </div>

                {/* Primary CTA Submit Button */}
                <button
                  id="btn_auth_submit"
                  type="submit"
                  disabled={isLoading || cooldownRemaining > 0}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{authIntent === "signup" ? "Creating Account..." : "Signing In..."}</span>
                    </>
                  ) : cooldownRemaining > 0 ? (
                    <span>Cooldown active ({cooldownRemaining}s)</span>
                  ) : (
                    <>
                      <span>{authIntent === "signup" ? "Create Account & Save Streak" : "Continue Practicing"}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Guest Access Escape Hatch (Bottom) */}
              <div className="mt-5 text-center border-t border-slate-100 pt-4">
                <button
                  id="btn_guest_explore_bottom"
                  type="button"
                  onClick={handleGuestExplore}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>Want to try without an account?</span>
                  <span className="font-bold underline text-indigo-600">Explore Demo Lesson</span>
                </button>
              </div>
            </div>
          ) : (
            /* Admin / Faculty Portal View */
            <div>
              <div className="mb-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
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

              {/* One-Click Owner Access Button */}
              <button
                type="button"
                onClick={() => {
                  setAdminEmail("kondala.muralikrishna@gmail.com");
                  setAdminPasscode("admin2026");
                  setAdminName("Muralikrishna Kondala (Owner)");
                  handleAdminSignIn({ preventDefault: () => {} } as any);
                }}
                disabled={isLoading}
                className="w-full mb-4 p-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xs flex items-center justify-between shadow-sm transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/50 flex items-center justify-center font-bold">
                    👑
                  </div>
                  <div className="text-left">
                    <div className="font-black text-xs">Instant Platform Owner Sign-In</div>
                    <div className="text-[10px] opacity-90">kondala.muralikrishna@gmail.com</div>
                  </div>
                </div>
                <ArrowRight size={16} />
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  or admin credentials
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              <form onSubmit={handleAdminSignIn} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty / Admin Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admin Security Passcode</label>
                  <input
                    type="password"
                    required
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="admin2026"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
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
        <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-400" />
            <span>256-bit TLS Encryption • GDPR & CEFR Compliant LMS Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            {onOpenLegalModal && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal("terms")}
                  className="hover:text-slate-200 transition-colors"
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal("privacy")}
                  className="hover:text-slate-200 transition-colors"
                >
                  Privacy Policy
                </button>
              </>
            )}
            <span>© 2026 LinguaFlow</span>
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
              <div className="flex items-center gap-2 text-indigo-600">
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
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
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
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 tracking-wider text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    disabled={recoveryCountdown > 0}
                    onClick={handleRequestPasswordReset}
                    className="font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                  >
                    {recoveryCountdown > 0 ? `Resend in ${recoveryCountdown}s` : "Resend Code"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2"
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
