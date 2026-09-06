import React, { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Mail,
  Scale,
  Eye,
  AlertTriangle,
  Database,
  Cpu,
  Mic,
  KeyRound,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { LinguaFlowLogo } from "./LinguaFlowLogo";

export type LegalTab = "terms" | "privacy";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

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
    const content =
      activeTab === "terms"
        ? document.getElementById("legal-terms-content")?.innerText || ""
        : document.getElementById("legal-privacy-content")?.innerText || "";
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
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
                  v2026.1
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Fluenxia: Language & Communication Solutions • Effective 2026
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
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "terms"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={14} />
              <span>Terms of Usage</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("privacy")}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "privacy"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lock size={14} />
              <span>Privacy Policy</span>
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
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Modal Body - Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-700 leading-relaxed text-sm">
          {activeTab === "terms" ? (
            <div id="legal-terms-content" className="space-y-6">
              {/* Summary Card */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={22} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-indigo-950">
                    Summary of Fluenxia Terms of Usage
                  </h3>
                  <p className="text-xs text-indigo-900/80">
                    By accessing or using Fluenxia LMS ("the Platform"), you agree to these Terms of Usage. Fluenxia provides AI-powered CEFR English learning tools, conversational practice with Google Gemini AI, phonetic analysis, and curriculum progression tracking for educational purposes.
                  </p>
                </div>
              </div>

              {/* Section 1 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">1</span>
                  <span>Acceptance of Terms & Eligibility</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  These Terms of Usage constitute a legally binding agreement between you ("User", "Learner", or "Student") and Fluenxia ("we", "us", or "our"). By registering with your Google / Gmail account or browsing the platform, you represent that you are at least 13 years of age (or the minimum legal age for digital consent in your jurisdiction) and possess the authority to enter into these terms. If you do not agree to all terms, you must discontinue platform use immediately.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">2</span>
                  <span>Google Authentication & Account Security</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Access to learner profiles, daily streak tracking, XP leaderboards, and personalized lessons requires authentication via Google OAuth or verified Gmail. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access or breach of security.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <strong>Single Account Policy:</strong> Learner progression, unlocked CEFR stages, and voice history are tied to your primary Gmail identifier. Impersonating other learners or transmitting misleading identity parameters is strictly prohibited.
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">3</span>
                  <span>AI Conversational Tutoring & Speech Recognition</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Fluenxia incorporates Google Gemini generative artificial intelligence and browser-based Web Speech Recognition APIs to simulate authentic English dialogues, offer phonetic feedback, and generate adaptive grammar corrections.
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                  <li><strong>Educational Purpose:</strong> AI-generated outputs, translations, and explanations are for language learning assistance only. While our algorithms strive for high CEFR fidelity, AI models may occasionally generate unintended variations.</li>
                  <li><strong>Respectful Communication:</strong> You agree not to transmit abusive, hateful, sexually explicit, defamatory, or unlawful prompts to the AI Tutor or voice recognition modules.</li>
                  <li><strong>No Confidential Data Input:</strong> You should not submit highly sensitive personal data, financial identifiers, or confidential credentials into interactive conversational chat sessions.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">4</span>
                  <span>Intellectual Property & Platform Rights</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  All curriculum structures, interactive quizzes, CEFR grammar rubrics, design components, software code, graphic interfaces, and trademarks contained within Fluenxia are the exclusive intellectual property of the platform owner and its licensors. You are granted a limited, personal, non-exclusive, non-transferable license to access and use the educational materials for your individual, non-commercial English study.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">5</span>
                  <span>Role-Based Access & Owner Command Center</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  The Owner & Administrator Command Center (`?portal=admin`) is restricted to the platform owner (<strong>kondala.muralikrishna@gmail.com</strong>) and authorized administrators. Any unauthorized attempt to bypass route guards, tamper with XP point balances, or extract administrative telemetry will result in immediate session revocation and permanent account termination.
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">6</span>
                  <span>Limitation of Liability & Disclaimers</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Fluenxia is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied, including fitness for a particular academic or certification exam (e.g., IELTS, TOEFL, CEFR official exams). In no event shall Fluenxia or its maintainers be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the platform.
                </p>
              </section>

              {/* Section 7 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">7</span>
                  <span>Contact & Questions</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  For inquiries regarding these Terms of Usage, contact the platform governance team at:{" "}
                  <a
                    href="mailto:kondala.muralikrishna@gmail.com"
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    kondala.muralikrishna@gmail.com
                  </a>
                </p>
              </section>
            </div>
          ) : (
            <div id="legal-privacy-content" className="space-y-6">
              {/* Privacy Summary Card */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Lock size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-emerald-950">
                    Fluenxia Privacy & Data Protection Commitment
                  </h3>
                  <p className="text-xs text-emerald-900/80">
                    We respect your privacy. Fluenxia complies with global privacy principles, Google API User Data Policies, and industry-standard TLS encryption. We do not sell, rent, or trade your personal information.
                  </p>
                </div>
              </div>

              {/* Section 1 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">1</span>
                  <span>Information We Collect</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  To provide personalized English learning experiences, Fluenxia collects the following types of information:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Mail size={14} className="text-indigo-600" />
                      <span>Account & Identity Data</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Your verified Gmail address, display name, profile avatar URL (when using Google OAuth), and assigned student role.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Database size={14} className="text-indigo-600" />
                      <span>Curriculum & Progress Records</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Completed grammar lessons, quiz scores, XP points earned, daily streaks, CEFR target level, and saved vocabulary cards.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Mic size={14} className="text-indigo-600" />
                      <span>Voice & Audio Input</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Transient spoken audio processed in real-time by your device browser and AI speech analyzers for phonetic pronunciation feedback.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Cpu size={14} className="text-indigo-600" />
                      <span>Interactive AI Tutor Logs</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Chat queries submitted to the Gemini AI tutor for the purpose of conversational responses and grammar correction suggestions.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">2</span>
                  <span>Google User Data Policy Compliance</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Fluenxia's use and transfer to any other app of information received from Google APIs adheres to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 font-bold inline-flex items-center gap-0.5 hover:underline"
                  >
                    Google API Services User Data Policy
                    <ExternalLink size={12} />
                  </a>
                  , including the Limited Use requirements:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                  <li>We only request minimum necessary scopes (`openid`, `profile`, `email`) for authentication and profile display.</li>
                  <li>We do not transfer your Google data to third parties for advertising or commercial surveillance.</li>
                  <li>Human access to user data is strictly forbidden unless necessary for security debugging or with your explicit consent.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">3</span>
                  <span>Audio & Microphone Processing Safeguards</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  When you use the Pronunciation Studio or Crisis Hot Seat speaking drills, microphone access is requested strictly upon your explicit user interaction (e.g. clicking the "Start Speaking" button).
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <strong>Non-Permanent Voice Storage:</strong> Raw audio recordings are processed in-memory for immediate phonetic comparison and are NOT saved as permanent sound files on external cloud servers without your explicit prompt.
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">4</span>
                  <span>Data Security & Encryption</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  We employ industry-leading security practices to safeguard your educational and profile data:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                  <li><strong>TLS 1.3 Encryption:</strong> All data transmissions between your browser and our servers are encrypted via HTTPS with TLS 1.3 certificates.</li>
                  <li><strong>Secure Server-Side Proxies:</strong> All Google Gemini AI API keys and sensitive server tokens remain protected on the backend container and are never exposed to client browsers.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">5</span>
                  <span>Your Privacy Rights & Data Erasure</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  You retain full control over your learning data:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                  <li><strong>Local Progress Reset:</strong> You can reset all local grammar progress, quiz scores, and saved vocabulary directly from the Progress Tracker tab at any time.</li>
                  <li><strong>Account Deletion Request:</strong> You can request full deletion of your registered Gmail profile, XP history, and stored session logs by emailing{" "}
                  <a
                    href="mailto:kondala.muralikrishna@gmail.com?subject=Fluenxia%20Data%20Deletion%20Request"
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    kondala.muralikrishna@gmail.com
                  </a>. All records will be permanently purged within 7 business days.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">6</span>
                  <span>Privacy Inquiries & Data Protection Officer</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  For any privacy questions or data compliance inquiries, please contact our Data Protection representative:
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-0.5">
                  <p><strong>Fluenxia English LMS</strong></p>
                  <p>Attn: Muralikrishna Kondala (Platform Owner & Data Controller)</p>
                  <p>Email: <a href="mailto:kondala.muralikrishna@gmail.com" className="text-indigo-600 font-semibold hover:underline">kondala.muralikrishna@gmail.com</a></p>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Adheres to the Google API Services User Data Policy</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
