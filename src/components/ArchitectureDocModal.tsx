import React, { useRef, useState } from "react";
import {
  X,
  Download,
  Printer,
  FileText,
  Layers,
  Cpu,
  Shield,
  Server,
  Database,
  Cloud,
  CheckCircle2,
  ExternalLink,
  Code2,
  Coins,
  Activity,
  Zap,
  Globe,
  Radio,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { LinguaFlowLogo } from "./LinguaFlowLogo";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ArchitectureDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocModal: React.FC<ArchitectureDocModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>("");
  const docRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!docRef.current) return;
    setIsExporting(true);
    setExportProgress("Preparing high-definition canvas capture...");

    try {
      // Temporarily ensure full visibility without scroll clipping
      const element = docRef.current;
      const originalWidth = element.style.width;
      
      setExportProgress("Rendering document pages into vector raster...");
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FBF8F1",
        windowWidth: 1200,
      });

      setExportProgress("Assembling multi-page PDF document...");
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // First Page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;

      // Subsequent Pages if document overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pdfHeight;
      }

      setExportProgress("Finalizing download...");
      pdf.save("LinguaFlow-System-Architecture-Whitepaper.pdf");
      setExportProgress("");
      setIsExporting(false);
    } catch (err) {
      console.error("PDF generation failed, falling back to browser print:", err);
      window.print();
      setIsExporting(false);
      setExportProgress("");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWordDoc = () => {
    const title = "LinguaFlow Enterprise & Special Features Technical Specification";
    const author = "Regana Kasieswaramma (regana.kasieswaramma@fluenxiaapp.com)";
    const contacts = "Support: support@fluenxiaapp.com | Sales: sales@fluenxiaapp.com";
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #1E293B; margin: 40px; }
          h1 { font-family: 'Georgia', serif; font-size: 24pt; color: #005A5B; border-bottom: 2pt solid #005A5B; padding-bottom: 6px; margin-bottom: 12px; }
          h2 { font-family: 'Georgia', serif; font-size: 16pt; color: #0F172A; border-bottom: 1pt solid #CBD5E1; padding-bottom: 4px; margin-top: 24px; }
          h3 { font-size: 13pt; color: #1E293B; margin-top: 16px; }
          p { margin: 8px 0; }
          ul { margin: 8px 0 8px 24px; }
          li { margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10.5pt; }
          th { background-color: #005A5B; color: #FFFFFF; font-weight: bold; text-align: left; padding: 8px 12px; border: 1px solid #CBD5E1; }
          td { padding: 8px 12px; border: 1px solid #CBD5E1; vertical-align: top; }
          tr:nth-child(even) { background-color: #F8FAFC; }
          .badge { display: inline-block; background-color: #F1F5F9; color: #005A5B; font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 9.5pt; }
          .meta-box { background-color: #F1F5F9; border-left: 4pt solid #005A5B; padding: 12px 16px; margin-bottom: 24px; }
          .feature-box { background-color: #FAFAF9; border: 1px solid #E2E8F0; padding: 14px 18px; border-radius: 6px; margin-bottom: 16px; }
          .footer { font-size: 9pt; color: #64748B; border-top: 1pt solid #E2E8F0; margin-top: 40px; padding-top: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta-box">
          <p><strong>System Name:</strong> LinguaFlow & Fluenxia Voice AI Platform</p>
          <p><strong>Application Owner:</strong> ${author}</p>
          <p><strong>Contact Channels:</strong> ${contacts}</p>
          <p><strong>Document Revision:</strong> 2.4 (Enterprise Edition)</p>
          <p><strong>Publication Date:</strong> ${date}</p>
        </div>

        <h2>Executive Summary</h2>
        <p>
          LinguaFlow is an enterprise-grade, pedagogically accredited English language acceleration platform aligned with the Common European Framework of Reference for Languages (CEFR A1 through C2). By combining deep psychometric adaptive learning engines, real-time acoustic speech science, interactive LLM conversational agents, and rigorous anti-gaming safeguards, LinguaFlow delivers measurable oral fluency and syntactic mastery to learners worldwide.
        </p>

        <h2>Comprehensive Inventory of Special Features</h2>

        <div class="feature-box">
          <h3>1. End-of-Level Written & Live Spoken Assessment Layer (Level Gating & Unlock System)</h3>
          <p><strong>Functional Purpose:</strong> Ensures learners demonstrate authentic communicative fluency before unlocking higher CEFR tiers.</p>
          <ul>
            <li><strong>Dual-Phase Evaluation:</strong> Combines a written benchmark (testing grammar, lexical precision, and contextual usage) with a live voice-recorded speaking assessment task.</li>
            <li><strong>CEFR Level-Specific Prompts:</strong> Custom scenario briefings and communicative goals tailored for levels A1 through C2.</li>
            <li><strong>Real-Time Speech-to-Text & Acoustic Analysis:</strong> Captures audio via Web Speech API, streams transcript in real-time, measures speech rate (WPM), pause count, and pronunciation clarity.</li>
            <li><strong>AI-Powered Graduation Evaluation:</strong> Backend analysis measures spoken performance against baseline scores, producing detailed examiner feedback, prosodic coaching, and an advancement verdict.</li>
            <li><strong>Strict Progression Gating:</strong> Level unlocks occur strictly when both the written pass mark (e.g. 70-75%) and spoken threshold (e.g. 68-75%) are satisfied.</li>
          </ul>
        </div>

        <div class="feature-box">
          <h3>2. Complete Lenin Martin English Grammar Curriculum (100 Lessons across 20 Modules)</h3>
          <p><strong>Functional Purpose:</strong> Authoritative theoretical and functional syntactic foundation.</p>
          <ul>
            <li><strong>20 Comprehensive Modules:</strong> Covering sentence structures, noun classification, pronoun agreements, all 12 tenses, voice/mood, modal auxiliaries, clauses, punctuation, business syntax, and rhetorical C2 mastery.</li>
            <li><strong>100 Exhaustive Tutorials:</strong> Each lesson includes rule deep-dives, positive/negative/interrogative formulas, common pitfalls, business collocations, and interactive practice exercises.</li>
            <li><strong>Integrated Audio & Pronunciation:</strong> Native text-to-speech audio pronunciation buttons on all grammar rules, formulas, and examples.</li>
          </ul>
        </div>

        <div class="feature-box">
          <h3>3. 4-Tier Spoken Assessment & Placement Engine</h3>
          <p><strong>Functional Purpose:</strong> Accurate initial placement into CEFR tiers without arbitrary multiple-choice guesswork.</p>
          <ul>
            <li><strong>Tier 1 - Phonemic & Segmental Clarity:</strong> Evaluates isolated vowels, diphthongs, and consonant clusters.</li>
            <li><strong>Tier 2 - Prosody, Stress & Intonation:</strong> Assesses sentence rhythm, tonic syllable stress, and pitch contours.</li>
            <li><strong>Tier 3 - Spontaneous Formulation:</strong> Evaluates oral formulation speed under semi-structured conversational prompts.</li>
            <li><strong>Tier 4 - Coherence & Discourse Structure:</strong> Tests complex discourse markers and cohesive spoken flow.</li>
          </ul>
        </div>

        <div class="feature-box">
          <h3>4. Pronunciation & Formant Acoustic Science Studio</h3>
          <p><strong>Functional Purpose:</strong> Real-time biofeedback on motor-articulatory accuracy.</p>
          <ul>
            <li><strong>Interactive IPA Phonetic Chart:</strong> Interactive phonetic symbols with audio examples and mouth position diagrams.</li>
            <li><strong>Acoustic Waveform & Pitch Tracking:</strong> Visual soundwave monitoring and real-time speech comparison against native reference recordings.</li>
            <li><strong>Accent Localization:</strong> Toggle between US (General American), UK (Received Pronunciation), Australian, and Indian English models.</li>
          </ul>
        </div>

        <div class="feature-box">
          <h3>5. Fluid Conversation Studio & Real-time AI Tutor</h3>
          <p><strong>Functional Purpose:</strong> Low-anxiety conversational roleplays with immediate pedagogical corrections.</p>
          <ul>
            <li><strong>Dynamic Personas:</strong> Executive interviewer, casual café barista, immigration officer, Cambridge oral examiner, and debate opponent.</li>
            <li><strong>Continuous Speech Mode:</strong> Natural back-and-forth spoken dialogue without manual button clicks.</li>
            <li><strong>Inline Syntactic Prescriptions:</strong> Immediate corrections of grammatical slips with polite linguistic coaching.</li>
          </ul>
        </div>

        <div class="feature-box">
          <h3>6. High-Stakes Speaking Stress Simulation Studio</h3>
          <p><strong>Functional Purpose:</strong> Desensitizes learners to performance anxiety during real-world speaking tests and interviews.</p>
          <ul>
            <li><strong>Timed Pressure Drills:</strong> Enforces 15-second response windows with countdown audio cues.</li>
            <li><strong>Cognitive Distraction Layer:</strong> Simulates ambient background office noise and unexpected follow-up interruptions.</li>
            <li><strong>Hesitation & Filler Word Analytics:</strong> Flags 'um', 'uh', 'like', and unnatural pauses exceeding 2 seconds.</li>
          </ul>
        </div>

        <div class="feature-box">
          <h3>7. Grammar Doctor & Syntactic Prescriptions</h3>
          <p><strong>Functional Purpose:</strong> Instant text diagnosis and corrective coaching.</p>
          <ul>
            <li><strong>Syntactic Error Highlighting:</strong> Color-coded categorization of tense clashes, subject-verb disagreement, preposition misuse, and awkward register.</li>
            <li><strong>Pedagogical Explanations:</strong> Plain-English explanations linking directly to relevant Lenin Martin curriculum modules.</li>
          </ul>
        </div>

        <div class="feature-box">
          <h3>8. Psychometric Adaptive Learning & Anti-Gaming Engine</h3>
          <p><strong>Functional Purpose:</strong> Prevents guessing, automated bots, or credential spoofing while tailoring difficulty dynamically.</p>
          <ul>
            <li><strong>Item Response Theory (IRT):</strong> Dynamic theta-score adjustments based on question difficulty and discrimination parameters.</li>
            <li><strong>Keystroke & Timing Heuristics:</strong> Flags suspiciously rapid responses (<800ms) or copy-paste bot signatures.</li>
            <li><strong>Longitudinal Skill Retention Spacing:</strong> Herman Ebbinghaus-inspired spaced repetition intervals for vocabulary and grammatical mastery.</li>
          </ul>
        </div>

        <div class="feature-box">
          <h3>9. Enterprise Compliance, HITL Dashboard & Data Governance</h3>
          <p><strong>Functional Purpose:</strong> Institutional administration, privacy safeguards, and human-in-the-loop oversight.</p>
          <ul>
            <li><strong>GDPR, CCPA & FERPA Compliance:</strong> Full user data sovereignty, instant export, and cryptographic anonymity controls.</li>
            <li><strong>Human-in-the-Loop (HITL) Queue:</strong> Allows certified human linguists to review and calibrate automated AI speaking evaluations.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Admin, instructor, and student segregated views with audit log telemetry.</li>
          </ul>
        </div>

        <h2>Summary Technical Architecture</h2>
        <table>
          <thead>
            <tr>
              <th>Architecture Layer</th>
              <th>Technologies & Implementations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Frontend Core</strong></td>
              <td>React 18+, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti</td>
            </tr>
            <tr>
              <td><strong>Acoustic & Audio Engine</strong></td>
              <td>Web Audio API, Web Speech API (continuous STT), Formant Synthesizer, SpeechSynthesis</td>
            </tr>
            <tr>
              <td><strong>Backend Microservices</strong></td>
              <td>Node.js Express Server, Google GenAI SDK, RESTful End-of-Level Evaluation Endpoints</td>
            </tr>
            <tr>
              <td><strong>Persistence & Security</strong></td>
              <td>Client & Server Dual-State, AES-256 Storage, OAuth 2.0 Identity Services</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} LinguaFlow & Fluenxia. All rights reserved. Registered Owner: Regana Kasieswaramma. Inquiries: support@fluenxiaapp.com | sales@fluenxiaapp.com</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", htmlContent], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "LinguaFlow-Special-Features-Specification.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FBF8F1] border border-stone-300 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#005A5B]/10 text-[#005A5B] flex items-center justify-center border border-[#005A5B]/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif leading-tight">
                LinguaFlow System Architecture Whitepaper
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Full-Stack Technical Specifications, Microservices, AI Pipelines &amp; Security Topology
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadWordDoc}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              title="Download Word Document (.doc) compatible with Microsoft Word and Google Docs"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>Export Word (.doc)</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#005A5B] hover:bg-[#004849] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{exportProgress || "Generating PDF..."}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Document</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              title="Print Document"
              className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <a
              href="/architecture"
              target="_blank"
              rel="noopener noreferrer"
              title="Open standalone web view"
              className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-[#F4EFE6]/60">
          <div
            ref={docRef}
            id="architecture-printable-sheet"
            className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-stone-200 shadow-md space-y-10 text-stone-800 font-sans"
          >
            {/* Header / Document Title */}
            <div className="border-b-2 border-[#005A5B]/20 pb-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <LinguaFlowLogo variant="horizontal" size="md" />
                </div>
                <div className="text-right text-xs text-stone-500 font-mono">
                  <div>DOC REF: LF-ARCH-2026-V3.4</div>
                  <div>SECURITY CLASSIFICATION: PUBLIC TECHNICAL SPEC</div>
                  <div>DATE: AUGUST 2026</div>
                </div>
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-[#E6F4F4] text-[#005A5B] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  System Architecture &amp; Engineering Whitepaper
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#005A5B] font-serif tracking-tight">
                  LinguaFlow: English Mastery LMS &amp; AI Voice Tutor
                </h1>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                  End-to-End Enterprise Architecture, Real-Time Acoustic &amp; Prosody Pipelines, Large Language Model (Gemini) Orchestration, Role-Based Access Control, and Cloud Run Container Topology.
                </p>
              </div>
            </div>

            {/* 1. Executive Summary */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-[#005A5B]">
                <Layers className="w-5 h-5" />
                <h2 className="text-xl font-bold font-serif">1. Executive Overview &amp; System Purpose</h2>
              </div>
              <p className="text-sm leading-relaxed text-stone-700">
                <strong>LinguaFlow</strong> is a high-throughput, modern English Language Learning &amp; Communication Management System (LMS) engineered to accelerate spoken English fluency from CEFR A1 (Beginner) through C2 (Mastery/Proficiency). It integrates a single-container full-stack Node.js/TypeScript Express server with a React 19 single-page application (SPA), featuring real-time Web Audio signal processing, contextual Gemini Generative AI voice simulations, automated pronunciation stress auditing, and comprehensive teacher/admin telemetry.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-[#005A5B]">6 Levels</div>
                  <div className="text-[11px] text-stone-500 uppercase font-semibold">CEFR A1 to C2</div>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-[#005A5B]">Gemini 3.7/2.5</div>
                  <div className="text-[11px] text-stone-500 uppercase font-semibold">Voice &amp; NLP Core</div>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-[#005A5B]">Web Audio API</div>
                  <div className="text-[11px] text-stone-500 uppercase font-semibold">Prosody &amp; Pitch Engine</div>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-[#005A5B]">Cloud Run</div>
                  <div className="text-[11px] text-stone-500 uppercase font-semibold">Container Runtime</div>
                </div>
              </div>
            </section>

            {/* 2. Visual Architecture Diagram */}
            <section className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#005A5B]">
                <Cpu className="w-5 h-5" />
                <h2 className="text-xl font-bold font-serif">2. Multi-Tier High-Level Topology</h2>
              </div>
              <p className="text-sm text-stone-600">
                The diagram below illustrates the layered communication flow from the client browser interface through the reverse proxy, Express microservices, Gemini AI orchestration layer, and local/cloud persistence stores.
              </p>

              {/* Topology SVG / Diagram Card */}
              <div className="p-6 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 space-y-4 font-mono text-xs overflow-x-auto">
                <div className="text-center font-bold text-teal-400 tracking-wider uppercase text-sm pb-2 border-b border-stone-800">
                  SYSTEM ARCHITECTURE DIAGRAM (PORT 3000 CONTAINER)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  {/* Tier 1: Client */}
                  <div className="p-4 bg-stone-800/80 rounded-xl border border-stone-700 space-y-2">
                    <div className="font-bold text-amber-400 uppercase">Tier 1: Client Layer</div>
                    <div className="text-[11px] text-stone-300 font-sans">
                      • React 19 + TypeScript SPA<br />
                      • Web Audio API &amp; AnalyserNode<br />
                      • SpeechRecognition &amp; SpeechSynthesis<br />
                      • LocalStorage &amp; Session Sync
                    </div>
                  </div>

                  {/* Tier 2: Server */}
                  <div className="p-4 bg-stone-800/80 rounded-xl border border-teal-600/50 space-y-2">
                    <div className="font-bold text-teal-400 uppercase">Tier 2: Backend Core</div>
                    <div className="text-[11px] text-stone-300 font-sans">
                      • Node.js / Express (`server.ts`)<br />
                      • REST API (`/api/auth`, `/api/gemini`)<br />
                      • RBAC &amp; JWT Token Auth<br />
                      • Anti-Gaming &amp; Plagiarism Engine
                    </div>
                  </div>

                  {/* Tier 3: External Services */}
                  <div className="p-4 bg-stone-800/80 rounded-xl border border-stone-700 space-y-2">
                    <div className="font-bold text-indigo-400 uppercase">Tier 3: AI &amp; Cloud</div>
                    <div className="text-[11px] text-stone-300 font-sans">
                      • Google Gemini 3.7 / 2.5 Flash SDK<br />
                      • Google OAuth 2.0 Identity Services<br />
                      • Cloud Run TLS 1.3 Ingress<br />
                      • Ephemeral Audio AI Evaluators
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-stone-500 pt-2 border-t border-stone-800">
                  Internal IPC &amp; REST over HTTPS • Strictly zero browser API key exposure • Server-side prompt encapsulation
                </div>
              </div>
            </section>

            {/* 3. Layer Breakdown */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-[#005A5B]">
                <Server className="w-5 h-5" />
                <h2 className="text-xl font-bold font-serif">3. Detailed Subsystem Specifications</h2>
              </div>

              {/* Subsection A */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#005A5B] text-white text-xs flex items-center justify-center font-bold">A</span>
                  Frontend Presentation &amp; Acoustic Studio Tier
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  Built on <strong>React 19, TypeScript, and Tailwind CSS</strong> with modular sub-studios. The acoustic subsystem connects directly to the client browser's hardware microphone via the <code>Web Audio API</code>. It creates an <code>AudioContext</code> and <code>AnalyserNode</code> to measure Root Mean Square (RMS) decibel volume, pitch contours (fundamental frequency $F_0$), and speech cadence without streaming raw high-bandwidth audio to external servers.
                </p>
                <ul className="text-xs text-stone-600 list-disc pl-5 space-y-1">
                  <li><strong>FluidConvoStudio &amp; L2 Coach:</strong> Dynamic roleplaying loops with conversational branching and stress-based turn taking.</li>
                  <li><strong>Pronunciation &amp; Prosody Studio:</strong> Granular phoneme, intonation, and syllable stress visualization.</li>
                  <li><strong>AssessmentIntegrityWrapper:</strong> Real-time anti-gaming ASE telemetry, acoustic repetition guards, and plagiarism audits.</li>
                </ul>
              </div>

              {/* Subsection B */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#005A5B] text-white text-xs flex items-center justify-center font-bold">B</span>
                  Backend Microservices &amp; Security Controller (`server.ts`)
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  The backend runs on <strong>Express.js</strong> bundled through <code>esbuild</code> into a CommonJS server (<code>dist/server.cjs</code>). It hosts over 40 REST endpoints including:
                </p>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px] space-y-1 text-stone-800">
                  <div>• <code>POST /api/auth/register</code>: Profile creation with unique usernames and password hashing.</div>
                  <div>• <code>POST /api/auth/login</code>: Dual identifier login (Username / Email) with JWT tokens.</div>
                  <div>• <code>POST /api/auth/google/signin</code>: Google Single Sign-On (OAuth 2.0) verification.</div>
                  <div>• <code>POST /api/gemini/speech-feedback</code>: Ephemeral voice and fluency analysis proxy.</div>
                  <div>• <code>GET /privacy &amp; GET /terms</code>: Google OAuth compliant legal trust &amp; safety endpoints.</div>
                </div>
              </div>

              {/* Subsection C */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#005A5B] text-white text-xs flex items-center justify-center font-bold">C</span>
                  Generative AI Engine &amp; Gemini SDK Integration
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  The application integrates the official <code>@google/genai</code> TypeScript SDK server-side. The <code>GEMINI_API_KEY</code> is strictly isolated within the Cloud Run environment and is never transmitted or exposed to client browser DevTools. Structured prompts inject pedagogical constraints, CEFR level rubrics, and JSON schema outputs for real-time grading.
                </p>
              </div>
            </section>

            {/* 4. Security & Compliance */}
            <section className="space-y-3 border-t border-stone-200 pt-6">
              <div className="flex items-center gap-2.5 text-[#005A5B]">
                <Shield className="w-5 h-5" />
                <h2 className="text-xl font-bold font-serif">4. Security, Identity &amp; OAuth Compliance</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700">
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Google OAuth 2.0 Compliance
                  </div>
                  <p>
                    Requests standard non-sensitive scopes (<code>openid</code>, <code>profile</code>, <code>email</code>). Adheres strictly to the Google API Services User Data Policy with published limited-use clauses on <code>/privacy</code>.
                  </p>
                </div>

                <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-1.5">
                  <div className="font-bold text-[#005A5B] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#005A5B]" />
                    Password &amp; Session Cryptography
                  </div>
                  <p>
                    User passwords are protected with salted SHA-256 cryptographic hashing. Cross-Origin Resource Sharing (CORS) and CSP headers protect user sessions against cross-site scripting.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Token Economics & Operational Cost */}
            <section className="space-y-3 border-t border-stone-200 pt-6">
              <div className="flex items-center gap-2.5 text-[#005A5B]">
                <Coins className="w-5 h-5" />
                <h2 className="text-xl font-bold font-serif">5. Token Economics &amp; Capacity Model (100 Active Users)</h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-700">
                A standard active daily learner engages in ~17.5 AI interactions across voice tutoring, pronunciation drills, and CEFR audits. Below is the operational capacity and financial model:
              </p>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Metric / Horizon</th>
                      <th className="p-2.5">Daily Volume (100 DAU)</th>
                      <th className="p-2.5">Monthly Volume (30 Days)</th>
                      <th className="p-2.5">Est. Cost (USD / INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-mono text-stone-800">
                    <tr>
                      <td className="p-2.5 font-sans font-medium">Input Tokens</td>
                      <td className="p-2.5">1,250,000 (~1.25M)</td>
                      <td className="p-2.5">37,500,000 (~37.5M)</td>
                      <td className="p-2.5 font-sans">$3.75 / ₹324 INR</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium">Output Tokens</td>
                      <td className="p-2.5">385,000 (~0.385M)</td>
                      <td className="p-2.5">11,550,000 (~11.55M)</td>
                      <td className="p-2.5 font-sans">$4.62 / ₹399 INR</td>
                    </tr>
                    <tr className="bg-teal-50 font-bold font-sans text-[#005A5B]">
                      <td className="p-2.5">Total System Cost</td>
                      <td className="p-2.5">~1.63M tokens / day</td>
                      <td className="p-2.5">~49.05M tokens / mo</td>
                      <td className="p-2.5">~$8.40 USD / ₹726 INR</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-stone-500 italic">
                * Based on Gemini Flash baseline tier ($0.10/1M input, $0.40/1M output, $1 USD ≈ ₹86.5 INR). Free tier allows up to 1,500 daily calls at $0 cost.
              </p>
            </section>

            {/* 6. Production Deployment Topology */}
            <section className="space-y-3 border-t border-stone-200 pt-6">
              <div className="flex items-center gap-2.5 text-[#005A5B]">
                <Cloud className="w-5 h-5" />
                <h2 className="text-xl font-bold font-serif">6. Cloud Run Infrastructure &amp; Deployment Topology</h2>
              </div>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs text-stone-700">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="font-semibold text-stone-900">Runtime Container:</span>
                  <span className="font-mono">Google Cloud Run (asia-southeast1)</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="font-semibold text-stone-900">Ingress Reverse Proxy:</span>
                  <span className="font-mono">NGINX routing to 0.0.0.0:3000 (TLS 1.3)</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="font-semibold text-stone-900">Build Pipeline:</span>
                  <span className="font-mono">vite build + esbuild server.ts --bundle --platform=node</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900">Production Entrypoint:</span>
                  <span className="font-mono">node dist/server.cjs</span>
                </div>
              </div>
            </section>

            {/* Signoff / Footer */}
            <div className="border-t-2 border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <LinguaFlowLogo variant="compact" size="sm" />
                <span>LinguaFlow: Language &amp; Communication Solutions</span>
              </div>
              <div>
                Lead Systems Architect: <strong>Muralikrishna Kondala</strong> (<a href="mailto:kondala.muralikrishna@gmail.com" className="text-[#005A5B] underline">kondala.muralikrishna@gmail.com</a>)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
