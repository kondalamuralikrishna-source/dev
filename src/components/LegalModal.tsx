import React, { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  Mail,
  Database,
  Cpu,
  Mic,
  Copy,
  Check,
  Gavel,
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

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = "terms",
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Sync initialTab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
      setCopied(false);
    }
  }, [isOpen, initialTab]);

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

              {/* Section 1 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">1</span>
                  <span>Acceptance of Terms</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  By accessing or using the Services, you agree to be bound by these Terms of
                  Usage ("Terms"). If you do not agree to these Terms, you must not access or use
                  the Services.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">2</span>
                  <span>Description of Services & AI Educational Disclaimer</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Fluenxia provides an AI-powered conversational language tutoring platform
                  incorporating real-time speech-to-text, acoustic formant analysis, and automated
                  grammar feedback aligned with CEFR benchmarks.
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                  <li>
                    <strong>Educational Tool Only:</strong> Fluenxia is an independent learning
                    tool. It is not affiliated with, endorsed by, or accredited by IELTS,
                    Cambridge Assessment, or any official testing body.
                  </li>
                  <li>
                    <strong>No Guarantee:</strong> Fluenxia does not guarantee specific exam
                    scores, professional certifications, or employment outcomes.
                  </li>
                  <li>
                    <strong>AI Output & Hallucination Disclaimer:</strong> You acknowledge and
                    agree that the lessons, dynamic conversational roleplays, oral feedback, score
                    evaluations, and diagnostic feedback provided across the Services are
                    generated by automated Artificial Intelligence (AI) algorithms and Large
                    Language Models (LLMs). While Fluenxia strives for high pedagogical precision,
                    AI-generated content is probabilistic and may occasionally contain errors,
                    inaccuracies, or hallucinations. Fluenxia does not warrant that AI-generated
                    feedback is completely error-free or suitable as an official accreditation.
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">3</span>
                  <span>Account Registration & Age Eligibility</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Users must be at least 18 years of age (or the legal age of majority) to
                  register independently. Users under 18 may only use the platform under the
                  supervision of a parent or legal guardian who accepts these Terms and provides
                  verifiable consent.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">4</span>
                  <span>Subscriptions, Trials, and Auto-Renewal</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Fluenxia may offer free or discounted trials (e.g., 7-day trials). Unless
                  canceled prior to the trial expiration, the subscription automatically converts
                  into a paid recurring plan at the rates displayed at checkout. Subscriptions
                  automatically renew until canceled via account settings or the respective app
                  store. Fees are inclusive/exclusive of statutory taxes as indicated at purchase.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">5</span>
                  <span>Proprietary Rights & Prohibited Conduct</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  All software, algorithms, speech models, prompt libraries, assessment
                  frameworks, and the Lenin Martin English Grammar Curriculum are the exclusive
                  Intellectual Property of the Company. Users shall not: (i) reverse engineer,
                  decompile, or extract the source code or voice pipeline; (ii) use automated bots
                  or scrapers to bypass the Anti-Gaming Engine or extract curriculum materials; or
                  (iii) upload unlawful or infringing content.
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">6</span>
                  <span>Anti-Gaming Heuristics & System Integrity</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  To maintain standard assessment validity, Fluenxia monitors response timing,
                  keystroke patterns, and interaction metrics. Suspicious activities indicative of
                  automated scripts or spoofing may result in standard score invalidation or
                  account suspension.
                </p>
              </section>

              {/* Section 7 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">7</span>
                  <span>Limitation of Liability</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  To the maximum extent permitted by law, Fluenxia Inc. shall not be liable for
                  indirect, incidental, or consequential damages. Total aggregate liability for
                  any claims under these Terms shall be limited to the total amount paid by the
                  user to Fluenxia in the twelve (12) months preceding the claim.
                </p>
              </section>

              {/* Section 8 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">8</span>
                  <span>Governing Law & Dispute Resolution</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 flex items-start gap-2">
                  <Gavel size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    These Terms are governed by the laws of India. Any legal dispute arising out
                    of these Terms shall be settled by binding arbitration under the Arbitration
                    and Conciliation Act, 1996, with the venue of arbitration in Hyderabad,
                    Telangana, India.
                  </span>
                </p>
              </section>
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

              {/* Section 1 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">1</span>
                  <span>Data Fiduciary & Contact Details</span>
                </h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-0.5">
                  <p><strong>Data Protection Officer:</strong> Regana Kasieswaramma</p>
                  <p>
                    Contact Channels:{" "}
                    <a href="mailto:support@fluenxiaapp.com" className="text-blue-600 font-semibold hover:underline">
                      support@fluenxiaapp.com
                    </a>{" "}
                    |{" "}
                    <a href="mailto:privacy@fluenxiaapp.com" className="text-blue-600 font-semibold hover:underline">
                      privacy@fluenxiaapp.com
                    </a>
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">2</span>
                  <span>Categories of Personal Data Collected</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Mail size={14} className="text-blue-600" />
                      <span>Identity & Contact Data</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Name, email address, user credentials, and billing details.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Mic size={14} className="text-blue-600" />
                      <span>Acoustic & Voice Data</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Audio recordings of spoken assessments, voice practice sessions, real-time
                      conversation streams, pitch contours, and formant speech features.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Database size={14} className="text-blue-600" />
                      <span>Text & Assessment Data</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Transcripts, written benchmark tests, error history, and CEFR progress
                      scores.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Cpu size={14} className="text-blue-600" />
                      <span>Technical & Behavioral Data</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      IP address, device identifiers, keystroke timing, and response latency
                      heuristics.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">3</span>
                  <span>Purposes of Data Processing & Legal Basis</span>
                </h4>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                  <li>
                    <strong>Service Provision (Contract / Consent):</strong> Generating real-time
                    voice feedback, STT transcripts, acoustic analysis, and CEFR evaluations
                    through automated AI models. Users are advised that AI processing is
                    probabilistic and output may occasionally exhibit inaccuracies or
                    hallucinations.
                  </li>
                  <li>
                    <strong>System Security & Anti-Gaming (Legitimate Interest / Statutory Duty):</strong>{" "}
                    Analyzing keystrokes and timing parameters to verify authentic human
                    interaction and prevent assessment gaming.
                  </li>
                  <li>
                    <strong>AI Model Improvement (Explicit Opt-In Consent):</strong> Fine-tuning
                    proprietary speech recognition models using anonymized audio and text data.
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">4</span>
                  <span>Data Sharing & Third-Party Processors</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  We do not sell personal data. Data is shared strictly with:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                  <li>
                    <strong>Cloud & AI Pipeline Providers:</strong> Managed infrastructure
                    processing voice streams under strict non-retention Data Processing
                    Agreements (DPAs).
                  </li>
                  <li>
                    <strong>Payment Processors:</strong> Secure gateways handling subscription
                    billing transactions.
                  </li>
                  <li>
                    <strong>Human-in-the-Loop (HITL) Linguists:</strong> Certified human evaluators
                    reviewing flagged audio samples or disputed AI outputs in the queue for
                    assessment calibration.
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">5</span>
                  <span>Data Retention & Erasure</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Personal data is retained only for operational necessities or statutory
                  requirements. Live audio streams are deleted or anonymized upon session
                  completion unless saved by the user or opted-in for model training. Account
                  deletion and complete data erasure can be requested at any time by emailing{" "}
                  <a href="mailto:privacy@fluenxiaapp.com" className="text-blue-600 font-bold hover:underline">
                    privacy@fluenxiaapp.com
                  </a>.
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">6</span>
                  <span>Data Principal Rights</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Under applicable data protection laws (including the DPDP Act 2023 and GDPR),
                  users hold the right to access, correct, export, or erase their personal data,
                  and withdraw consent at any time via in-app privacy settings or by contacting{" "}
                  <a href="mailto:privacy@fluenxiaapp.com" className="text-blue-600 font-bold hover:underline">
                    privacy@fluenxiaapp.com
                  </a>.
                </p>
              </section>
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
