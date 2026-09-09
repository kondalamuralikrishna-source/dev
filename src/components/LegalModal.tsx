import React, { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle2,
  X,
  Search,
  Copy,
  Check,
  Scale,
} from "lucide-react";
import { LinguaFlowLogo } from "./LinguaFlowLogo";

export type LegalTab = "terms" | "privacy" | "consent";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

const CONTENT_ELEMENT_ID: Record<LegalTab, string> = {
  terms: "legal-terms-content",
  privacy: "legal-privacy-content",
  consent: "legal-consent-content",
};

interface SiteSettings {
  contactEmail: string;
  salesEmail: string;
  platformTagline: string;
  logoUrl?: string;
  termsContent: string;
  privacyContent: string;
}

// Renders the CMS's small "## heading" / "- bullet" content convention (see the comment on
// DEFAULT_SITE_SETTINGS in db.ts) into the same numbered-badge section look this modal already
// used for its hardcoded content. A leading block with no "## " heading (an intro paragraph) is
// skipped here since the modal already shows its own fixed summary card above these sections.
function renderLegalSections(content: string): React.ReactNode {
  const blocks = content.split(/\n\s*\n/);
  const sections: { title: string; lines: string[] }[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    if (!lines[0].startsWith("## ")) continue; // intro paragraph, already shown in the summary card
    sections.push({ title: lines[0].slice(3), lines: lines.slice(1) });
  }

  return sections.map((section, i) => {
    const isBulletList = section.lines.length > 0 && section.lines.every((l) => l.startsWith("- "));
    return (
      <section key={i} className="space-y-2">
        <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">
            {i + 1}
          </span>
          <span>{section.title}</span>
        </h4>
        {isBulletList ? (
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
            {section.lines.map((l, j) => (
              <li key={j}>{l.slice(2)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-slate-600">{section.lines.join(" ")}</p>
        )}
      </section>
    );
  });
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = "terms",
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Sync initialTab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
      setCopied(false);
    }
  }, [isOpen, initialTab]);

  // Terms & Privacy body content is CMS-driven (edited from the admin panel) rather than
  // hardcoded here, so this and the server-rendered /terms & /privacy pages read from one source.
  React.useEffect(() => {
    if (!isOpen) return;
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyText = () => {
    const content = document.getElementById(CONTENT_ELEMENT_ID[activeTab])?.innerText || "";
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
              <LinguaFlowLogo variant="mark" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-serif uppercase">
                  Fluenxia Legal & Trust Center
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded-full">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Effective September 7, 2026 &bull; Fluenxia Inc.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              title="Copy to Clipboard"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Selector & Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("terms")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "terms"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={14} />
              <span>Terms of Usage</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("privacy")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "privacy"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lock size={14} />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("consent")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "consent"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 size={14} />
              <span>Consent Form</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search clauses or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Modal Body - Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-700 leading-relaxed text-sm">
          {activeTab === "terms" && (
            <div id="legal-terms-content" className="space-y-6">
              {/* Summary Card */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={22} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-blue-950">
                    Summary of Fluenxia Terms of Usage
                  </h3>
                  <p className="text-xs text-blue-900/80">
                    By accessing or using the Fluenxia mobile application, website
                    (www.fluenxiaapp.com), or related services ("Services"), operated by Fluenxia
                    Inc. and its registered owner Regana Kasieswaramma ("Company", "we", "us"),
                    you agree to be bound by these Terms of Usage. If you do not agree, you must
                    not access or use the Services.
                  </p>
                </div>
              </div>

              {settings ? renderLegalSections(settings.termsContent) : <p className="text-xs text-slate-400">Loading...</p>}
            </div>
          )}

          {activeTab === "privacy" && (
            <div id="legal-privacy-content" className="space-y-6">
              {/* Privacy Summary Card */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Lock size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-emerald-950">
                    Fluenxia Data Governance Framework
                  </h3>
                  <p className="text-xs text-emerald-900/80">
                    Fluenxia Inc. operates as the Data Fiduciary (Data Controller). We do not
                    sell your personal data.
                  </p>
                </div>
              </div>

              {settings ? renderLegalSections(settings.privacyContent) : <p className="text-xs text-slate-400">Loading...</p>}
            </div>
          )}

          {activeTab === "consent" && (
            <div id="legal-consent-content" className="space-y-6">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-start gap-3">
                <Scale size={22} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-indigo-950">
                    End-User Consent Statement
                  </h3>
                  <p className="text-xs text-indigo-900/80">
                    Please review these preferences before account creation and initial audio
                    capture. One is required; two are optional and can be changed at any time.
                  </p>
                </div>
              </div>

              <section className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-1.5">
                <h4 className="text-sm font-extrabold text-slate-900">
                  1. Mandatory Operational & AI Processing Consent (Required)
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  By checking this box, I confirm that I am at least 18 years of age (or a
                  parent/guardian acting on behalf of a minor), and I agree to the Terms of Usage
                  and Privacy Policy. I expressly consent to Fluenxia collecting and processing my
                  Voice Audio Recordings, Text Transcripts, and System Usage Metrics solely for
                  real-time speech feedback, CEFR assessments, and grammar evaluation. I
                  acknowledge that content and feedback are generated by Artificial Intelligence
                  and may occasionally hallucinate or contain inaccuracies.
                </p>
              </section>

              <section className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <h4 className="text-sm font-extrabold text-slate-900">
                  2. Optional AI Model Improvement Consent (Optional)
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  By checking this box, I permit Fluenxia to use my anonymized voice recordings
                  and interaction logs to train, calibrate, and improve Fluenxia's proprietary
                  speech recognition algorithms and conversational AI models. I understand that I
                  can withdraw this consent at any time in Privacy Settings without affecting my
                  app subscription or functionality.
                </p>
              </section>

              <section className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <h4 className="text-sm font-extrabold text-slate-900">
                  3. Optional Marketing Communications (Optional)
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  By checking this box, I consent to receiving promotional offers, product
                  updates, and learning tips via email or push notifications.
                </p>
              </section>

              <p className="text-xs text-slate-500">
                <strong>Withdrawal of Consent:</strong> You may withdraw your optional consents at
                any time by updating your preferences in the in-app Privacy Settings or by
                emailing{" "}
                <a href="mailto:privacy@fluenxiaapp.com" className="text-blue-600 font-bold hover:underline">
                  privacy@fluenxiaapp.com
                </a>.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Governed by the laws of India &bull; Arbitration seated in Hyderabad</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
