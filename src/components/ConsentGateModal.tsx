import React, { useState } from "react";
import { ShieldCheck, LogOut } from "lucide-react";
import { UserAccount } from "../types";
import { LegalTab } from "./LegalModal";

interface ConsentGateModalProps {
  currentUser: UserAccount;
  onConsentRecorded: (updatedUser: UserAccount) => void;
  onOpenLegalModal: (tab?: LegalTab) => void;
  onLogout: () => void;
}

// Shown once for accounts created via Google/Apple sign-in, which never present our Terms of
// Usage / Privacy Policy / age gate the way the email+password signup form does. Blocking (no
// close button) until the required checkbox is accepted -- the only escape hatch is signing out.
export const ConsentGateModal: React.FC<ConsentGateModalProps> = ({
  currentUser,
  onConsentRecorded,
  onOpenLegalModal,
  onLogout,
}) => {
  const [agreeAgeAndTerms, setAgreeAgeAndTerms] = useState(false);
  const [agreeAiTraining, setAgreeAiTraining] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!agreeAgeAndTerms || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/auth/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ageAndTermsAccepted: true,
          aiTrainingOptIn: agreeAiTraining,
          marketingOptIn: agreeMarketing,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record consent.");

      const updatedUser: UserAccount = { ...currentUser, consent: data.user?.consent };
      localStorage.setItem("linguaflow_user_session", JSON.stringify(updatedUser));
      onConsentRecorded(updatedUser);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">One quick thing</h2>
            <p className="text-xs text-slate-500">Before you continue with Fluenxia</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Since you signed in with Google, we still need your confirmation before you can use the
          platform:
        </p>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <input
              id="consent_gate_age_terms"
              type="checkbox"
              required
              checked={agreeAgeAndTerms}
              onChange={(e) => setAgreeAgeAndTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0"
            />
            <label htmlFor="consent_gate_age_terms" className="text-xs font-medium text-slate-600 cursor-pointer">
              I confirm I'm 18+ (or have parent/guardian consent) and agree to the{" "}
              <button type="button" onClick={() => onOpenLegalModal("terms")} className="text-blue-600 font-bold hover:underline">
                Terms of Usage
              </button>{" "}
              and{" "}
              <button type="button" onClick={() => onOpenLegalModal("privacy")} className="text-blue-600 font-bold hover:underline">
                Privacy Policy
              </button>
              , including AI-generated feedback and voice/audio processing.
            </label>
          </div>

          <div className="flex items-start gap-2">
            <input
              id="consent_gate_ai_training"
              type="checkbox"
              checked={agreeAiTraining}
              onChange={(e) => setAgreeAiTraining(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0"
            />
            <label htmlFor="consent_gate_ai_training" className="text-xs font-medium text-slate-600 cursor-pointer">
              (Optional) Use my anonymized voice & interaction data to improve Fluenxia's AI models
            </label>
          </div>

          <div className="flex items-start gap-2">
            <input
              id="consent_gate_marketing"
              type="checkbox"
              checked={agreeMarketing}
              onChange={(e) => setAgreeMarketing(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0"
            />
            <label htmlFor="consent_gate_marketing" className="text-xs font-medium text-slate-600 cursor-pointer">
              (Optional) Send me product updates and learning tips by email
            </label>
          </div>
        </div>

        <button
          type="button"
          id="btn-consent-gate-continue"
          onClick={handleContinue}
          disabled={!agreeAgeAndTerms || isSubmitting}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors"
        >
          <LogOut size={13} />
          <span>Sign out instead</span>
        </button>
      </div>
    </div>
  );
};
