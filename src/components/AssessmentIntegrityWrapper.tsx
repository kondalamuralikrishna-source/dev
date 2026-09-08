import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Mic,
  FileText,
  BookOpen,
  Sparkles,
  Layers,
  Code2,
  Copy,
  Check,
  Download,
  RotateCcw,
  CheckCircle2,
  Bot,
  UserCheck,
  Scale,
  Search,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  Flame,
  Clock,
  Award,
} from "lucide-react";
import {
  CEFRLevel,
  UserAccount,
  UserProgress,
  SpokenAssessmentEvaluationResponse,
  IntegrityAssessmentResponse,
  AssessmentPayload,
  PlagiarismAnalysis,
  FlaggedPassage,
} from "../types";
import { SpokenAssessmentScreen } from "./SpokenAssessmentScreen";
import { PlagiarismIntegrityStudio } from "./PlagiarismIntegrityStudio";
import { AudioButton } from "./AudioButton";
import { FlaggedPassageDrillDownModal } from "./FlaggedPassageDrillDownModal";
import { AutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";

interface AssessmentIntegrityWrapperProps {
  currentUser: UserAccount | null;
  progress: UserProgress;
  onAssessmentCompleted?: (result: SpokenAssessmentEvaluationResponse) => void;
  onCancel?: () => void;
  initialResult?: SpokenAssessmentEvaluationResponse | null;
}

export type AssessmentDomain = "speaking" | "writing" | "grammar" | "studio";

const WRITING_PROMPTS = [
  {
    topic: "Workplace Conflict & Resolution",
    level: "B2" as CEFRLevel,
    prompt: "Describe a situation where team members disagreed on a project strategy. Explain the compromise reached and the lessons learned for future leadership.",
    sampleAuthentic: "During the redesign of our client portal last quarter, our design and backend teams were divided over whether to adopt a single-page architecture. The frontend team prioritized snappy transitions, while backend engineers were concerned about initial load latencies and SEO indexing. As project coordinator, I scheduled a focused whiteboard session where each team presented latency benchmarks. We agreed on a server-side rendered hybrid model that preserved fast initial paint times while maintaining smooth client-side routing. This compromise taught us that early metric-driven debates prevent weeks of painful refactoring.",
    sampleAI: "In today's fast-paced world, effective conflict resolution plays a pivotal role in organizational harmony. It is crucial to remember that navigating the complex landscape of team dynamics requires a multifaceted approach. Furthermore, when stakeholders delve into collaborative synergy, they create an intricate tapestry of shared success.",
  },
  {
    topic: "Technological Impact on Education",
    level: "C1" as CEFRLevel,
    prompt: "Evaluate the extent to which automated AI tutoring tools will transform traditional higher education over the next decade.",
    sampleAuthentic: "While generative AI systems provide unprecedented immediate feedback on syntax and repetitive drill exercises, they cannot replace the rigorous dialectical debate of a university seminar. In my own graduate studies, the most valuable breakthroughs occurred when professors challenged our unstated assumptions—something pattern-matching algorithms inherently lack. AI will likely automate grading and foundational tutoring, but human mentorship will remain the cornerstone of critical synthesis.",
    sampleAI: "It is worth highlighting that artificial intelligence stands as a testament to human innovation. In the contemporary era, educational paradigms are undergoing a transformative evolution. To sum up, AI tools serve as an indispensable beacon of knowledge.",
  },
];

const GRAMMAR_PROMPTS = [
  {
    topic: "Complex Conditionals & Inversion",
    level: "C1" as CEFRLevel,
    sentence: "Had the committee been apprised of the financial discrepancies earlier, they would have halted the acquisition immediately.",
    explanation: "Subject-auxiliary inversion in the conditional clause ('Had the committee been apprised') replaces 'If the committee had been', creating formal, elevated C1/C2 discourse register.",
  },
  {
    topic: "Subjunctive Mood in Formal Resolutions",
    level: "B2" as CEFRLevel,
    sentence: "The board recommended that each department head submit a revised contingency budget by Friday.",
    explanation: "Mandative subjunctive structure: The verb 'submit' remains in its base infinitive form regardless of the singular third-person subject 'department head'.",
  },
];

export const AssessmentIntegrityWrapper: React.FC<AssessmentIntegrityWrapperProps> = ({
  currentUser,
  progress,
  onAssessmentCompleted,
  onCancel,
  initialResult,
}) => {
  const { t } = useTranslation();
  const [activeDomain, setActiveDomain] = useState<AssessmentDomain>("speaking");

  // Writing Assessment State
  const [writingPromptIndex, setWritingPromptIndex] = useState<number>(0);
  const [writingSubmission, setWritingSubmission] = useState<string>(WRITING_PROMPTS[0].sampleAuthentic);
  const [writingLevel, setWritingLevel] = useState<CEFRLevel>("B2");
  const [isEvaluatingWriting, setIsEvaluatingWriting] = useState<boolean>(false);
  const [writingResult, setWritingResult] = useState<IntegrityAssessmentResponse | null>(null);

  // Grammar Diagnostic State
  const [grammarInput, setGrammarInput] = useState<string>(GRAMMAR_PROMPTS[0].sentence);
  const [grammarLevel, setGrammarLevel] = useState<CEFRLevel>("C1");
  const [isEvaluatingGrammar, setIsEvaluatingGrammar] = useState<boolean>(false);
  const [grammarResult, setGrammarResult] = useState<IntegrityAssessmentResponse | null>(null);

  // JSON copy state
  const [copiedWritingJson, setCopiedWritingJson] = useState<boolean>(false);
  const [copiedGrammarJson, setCopiedGrammarJson] = useState<boolean>(false);

  // Drill-Down Modal State
  const [selectedDrillDownPassage, setSelectedDrillDownPassage] = useState<FlaggedPassage | null>(null);

  // Writing evaluation through integrity pipeline
  const handleEvaluateWriting = async (textToEval?: string) => {
    const text = (textToEval || writingSubmission).trim();
    if (!text || isEvaluatingWriting) return;

    setIsEvaluatingWriting(true);
    try {
      const response = await fetch("/api/assessment/evaluate-with-integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionText: text,
          prompt: WRITING_PROMPTS[writingPromptIndex].prompt,
          level: writingLevel,
          rubric: "CEFR Written Coherence, Lexical Precision, Syntax, and Academic Integrity",
        }),
      });

      const data: IntegrityAssessmentResponse = await response.json();
      setWritingResult(data);
    } catch (err) {
      console.error("Writing evaluation error:", err);
    } finally {
      setIsEvaluatingWriting(false);
    }
  };

  // Grammar evaluation through integrity pipeline
  const handleEvaluateGrammar = async (textToEval?: string) => {
    const text = (textToEval || grammarInput).trim();
    if (!text || isEvaluatingGrammar) return;

    setIsEvaluatingGrammar(true);
    try {
      const response = await fetch("/api/assessment/evaluate-with-integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionText: text,
          prompt: `Grammar & Syntax Diagnostic: Analyze structural accuracy, tense/aspect usage, and stylistic authenticity of: "${text}"`,
          level: grammarLevel,
          rubric: "Syntactic Complexity, Clause Linkage, and Natural Human Style",
        }),
      });

      const data: IntegrityAssessmentResponse = await response.json();
      setGrammarResult(data);
    } catch (err) {
      console.error("Grammar evaluation error:", err);
    } finally {
      setIsEvaluatingGrammar(false);
    }
  };

  const copyJson = (data: any, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Global Engine Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-black tracking-wide">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>{t("assessment.engine_badge", "GLOBAL AI ASSESSMENT & INTEGRITY PIPELINE")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t("assessment.title", "Unified Assessment Engine")}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {t("assessment.subtitle_part1", "All Speaking, Writing, and Grammar AI evaluations are routed through the mandatory Plagiarism & Integrity Gate. Every evaluation output strictly adheres to the standardized")} <code className="text-emerald-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">assessment</code> {t("assessment.subtitle_and", "and")} <code className="text-emerald-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">plagiarism_analysis</code> {t("assessment.subtitle_schema", "schema.")}
            </p>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex flex-wrap gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              id="btn-domain-speaking"
              type="button"
              onClick={() => setActiveDomain("speaking")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeDomain === "speaking"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Mic size={15} />
              <span>{t("assessment.mode_speaking", "Speaking CEFR")}</span>
            </button>

            <button
              id="btn-domain-writing"
              type="button"
              onClick={() => setActiveDomain("writing")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeDomain === "writing"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText size={15} />
              <span>{t("assessment.mode_writing", "Writing Assessment")}</span>
            </button>

            <button
              id="btn-domain-grammar"
              type="button"
              onClick={() => setActiveDomain("grammar")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeDomain === "grammar"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen size={15} />
              <span>{t("assessment.mode_grammar", "Grammar Diagnostic")}</span>
            </button>

            <button
              id="btn-domain-studio"
              type="button"
              onClick={() => setActiveDomain("studio")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeDomain === "studio"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-emerald-400 hover:text-emerald-300"
              }`}
            >
              <ShieldCheck size={15} />
              <span>{t("assessment.mode_studio", "Integrity Studio")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* DOMAIN 1: SPEAKING ASSESSMENT (Wraps SpokenAssessmentScreen with Plagiarism Gate) */}
      {activeDomain === "speaking" && (
        <div className="space-y-4">
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Mic size={16} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-indigo-950">
                  {t("assessment.speaking_banner_title", "Oral Proficiency CEFR Assessor • Protected by Integrity Gate")}
                </h3>
                <p className="text-xs text-indigo-700">
                  {t("assessment.speaking_banner_desc", "Transcripts are continuously cross-examined for read-aloud flags, canned response templates, and AI generation markers.")}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              <ShieldCheck size={14} />
              <span>{t("assessment.standard_json_enabled", "Standard JSON Enabled")}</span>
            </div>
          </div>

          <SpokenAssessmentScreen
            currentUser={currentUser}
            onAssessmentCompleted={onAssessmentCompleted || (() => {})}
            onCancel={onCancel || (() => {})}
            initialResult={initialResult}
          />
        </div>
      )}

      {/* DOMAIN 2: WRITING ASSESSMENT */}
      {activeDomain === "writing" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {t("assessment.writing_title", "Writing Performance & Originality Evaluator")}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t("assessment.writing_desc", "Evaluates task achievement, syntactic range, cohesion, and verifies authenticity.")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("assessment.level_label", "Level:")}</span>
                <select
                  id="select-writing-cefr"
                  value={writingLevel}
                  onChange={(e) => setWritingLevel(e.target.value as CEFRLevel)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="B1">{t("cefr_select.b1_intermediate", "B1 Intermediate")}</option>
                  <option value="B2">{t("cefr_select.b2_upper_intermediate", "B2 Upper Intermediate")}</option>
                  <option value="C1">{t("cefr_select.c1_advanced", "C1 Advanced")}</option>
                  <option value="C2">{t("cefr_select.c2_mastery", "C2 Mastery")}</option>
                </select>
              </div>
            </div>

            {/* Prompt Selector */}
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                {t("assessment.select_task", "Select Assessment Task:")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WRITING_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setWritingPromptIndex(idx);
                      setWritingSubmission(p.sampleAuthentic);
                      setWritingLevel(p.level);
                      setWritingResult(null);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      writingPromptIndex === idx
                        ? "border-indigo-500 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900">
                        <AutoText text={p.topic} context="assessment_writing_topic" />
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                        {p.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      <AutoText text={p.prompt} context="assessment_writing_prompt" />
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Writing Prompt Card */}
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <span className="text-[11px] font-black text-indigo-800 uppercase tracking-wider block mb-1">
                {t("assessment.candidate_prompt", "Candidate Prompt:")}
              </span>
              <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
                "<AutoText as="span" text={WRITING_PROMPTS[writingPromptIndex].prompt} context="assessment_writing_prompt" />"
              </p>
            </div>

            {/* Submission Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {t("assessment.submission_label", "Student Essay / Written Response:")}
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setWritingSubmission(WRITING_PROMPTS[writingPromptIndex].sampleAuthentic)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    {t("assessment.load_authentic", "Load Authentic Sample")}
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setWritingSubmission(WRITING_PROMPTS[writingPromptIndex].sampleAI)}
                    className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    {t("assessment.load_synthetic", "Load Synthetic AI Sample")}
                  </button>
                </div>
              </div>

              <textarea
                id="textarea-writing-submission"
                rows={6}
                value={writingSubmission}
                onChange={(e) => setWritingSubmission(e.target.value)}
                placeholder={t("assessment.submission_placeholder", "Compose or paste your written response...")}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-normal"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                {writingSubmission.trim().split(/\s+/).filter(Boolean).length} {t("assessment.words_suffix", "words")}
              </span>

              <button
                id="btn-evaluate-writing-integrity"
                type="button"
                disabled={isEvaluatingWriting || !writingSubmission.trim()}
                onClick={() => handleEvaluateWriting()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                {isEvaluatingWriting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("assessment.evaluating_writing", "Evaluating Writing & Integrity...")}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>{t("assessment.evaluate_with_integrity", "Evaluate with Integrity Gate")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Writing Result Card */}
          {writingResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Award size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {t("assessment.writing_result_title", "Writing Assessment Result")}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t("assessment.writing_result_desc", "Evaluated under CEFR Rubrics with Automated Plagiarism Telemetry")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                      writingResult.plagiarism_analysis.risk_level === "LOW"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : writingResult.plagiarism_analysis.risk_level === "MEDIUM"
                        ? "bg-amber-50 text-amber-700 border-amber-300"
                        : "bg-rose-50 text-rose-700 border-rose-300"
                    }`}
                  >
                    {t("assessment.integrity_risk_prefix", "Integrity:")} {writingResult.plagiarism_analysis.risk_level} {t("assessment.risk_suffix", "Risk")}
                  </span>

                  <button
                    type="button"
                    onClick={() => copyJson(writingResult, setCopiedWritingJson)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedWritingJson ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedWritingJson ? t("assessment.copied", "Copied") : t("assessment.copy_json", "Copy JSON")}</span>
                  </button>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("assessment.score_label", "Score")}
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {writingResult.assessment.score !== null ? `${writingResult.assessment.score} / 100` : "N/A"}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("assessment.similarity_score_label", "Similarity Score")}
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {writingResult.plagiarism_analysis.estimated_similarity_score}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("assessment.ai_probability_label", "AI Probability")}
                  </span>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      writingResult.plagiarism_analysis.ai_generated_probability === "HIGH"
                        ? "text-rose-600"
                        : writingResult.plagiarism_analysis.ai_generated_probability === "MEDIUM"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {writingResult.plagiarism_analysis.ai_generated_probability}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {t("assessment.feedback_label", "Constructive Pedagogical Feedback:")}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <AutoText text={writingResult.assessment.feedback} context="assessment_feedback" />
                </p>
              </div>

              {/* Integrity Verdict */}
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed ${
                  writingResult.plagiarism_analysis.risk_level === "LOW"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : writingResult.plagiarism_analysis.risk_level === "MEDIUM"
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-rose-50 text-rose-900 border-rose-200"
                }`}
              >
                <div className="font-black text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>{t("assessment.integrity_verdict_label", "Integrity Verdict")}</span>
                </div>
                <AutoText text={writingResult.plagiarism_analysis.integrity_verdict} context="assessment_integrity_verdict" />
              </div>

              {/* Flagged Snippets */}
              {writingResult.plagiarism_analysis.flagged_passages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      {t("assessment.flagged_passages_label", "Flagged Passages")} ({writingResult.plagiarism_analysis.flagged_passages.length}):
                    </span>
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      {t("assessment.click_drill_down", "Click any snippet to drill down & view revision tips")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {writingResult.plagiarism_analysis.flagged_passages.map((f, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedDrillDownPassage(f)}
                        className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 hover:border-indigo-300 text-xs transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-rose-600 font-semibold block truncate">
                            "{f.text_snippet}"
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 shrink-0 group-hover:underline flex items-center gap-0.5">
                            <span>{t("assessment.drill_down", "Drill Down")}</span>
                            <ArrowRight size={12} />
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{t("assessment.reason_label", "Reason:")} {f.reason}</span>
                          {f.category && (
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold">
                              {f.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* DOMAIN 3: GRAMMAR DIAGNOSTIC */}
      {activeDomain === "grammar" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {t("assessment.grammar_title", "Grammar & Syntax Diagnostic with Integrity Filter")}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t("assessment.grammar_desc", "Deep structural parsing, error classification, and synthetic phrase detection.")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("assessment.target_level_label", "Target Level:")}</span>
                <select
                  id="select-grammar-cefr"
                  value={grammarLevel}
                  onChange={(e) => setGrammarLevel(e.target.value as CEFRLevel)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="A1">{t("cefr_select.a1_foundation", "A1 Foundation")}</option>
                  <option value="A2">{t("cefr_select.a2_waystage", "A2 Waystage")}</option>
                  <option value="B1">{t("cefr_select.b1_intermediate", "B1 Intermediate")}</option>
                  <option value="B2">{t("cefr_select.b2_upper_intermediate", "B2 Upper Intermediate")}</option>
                  <option value="C1">{t("cefr_select.c1_advanced", "C1 Advanced")}</option>
                  <option value="C2">{t("cefr_select.c2_mastery", "C2 Mastery")}</option>
                </select>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                {t("assessment.grammar_presets", "Grammar Case Presets:")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GRAMMAR_PROMPTS.map((g, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setGrammarInput(g.sentence);
                      setGrammarLevel(g.level);
                      setGrammarResult(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      grammarInput === g.sentence
                        ? "border-indigo-500 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900">
                        <AutoText text={g.topic} context="assessment_grammar_topic" />
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                        {g.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono italic truncate">
                      "{g.sentence}"
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sentence Input */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                {t("assessment.sentence_to_diagnose", "Sentence or Construction to Diagnose:")}
              </label>
              <textarea
                id="textarea-grammar-input"
                rows={3}
                value={grammarInput}
                onChange={(e) => setGrammarInput(e.target.value)}
                placeholder={t("assessment.sentence_placeholder", "Enter a sentence to analyze its syntactic integrity and grammar...")}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-normal"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                id="btn-diagnose-grammar-integrity"
                type="button"
                disabled={isEvaluatingGrammar || !grammarInput.trim()}
                onClick={() => handleEvaluateGrammar()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                {isEvaluatingGrammar ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("assessment.analyzing_grammar", "Analyzing Grammar & Integrity...")}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>{t("assessment.diagnose_with_integrity", "Diagnose with Integrity Gate")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Grammar Result Card */}
          {grammarResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {t("assessment.grammar_result_title", "Grammar Diagnostic Result")}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t("assessment.grammar_result_desc", "Standard JSON payload: `assessment` + `plagiarism_analysis`")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                      grammarResult.plagiarism_analysis.risk_level === "LOW"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-amber-50 text-amber-700 border-amber-300"
                    }`}
                  >
                    {t("assessment.risk_label", "Risk:")} {grammarResult.plagiarism_analysis.risk_level}
                  </span>

                  <button
                    type="button"
                    onClick={() => copyJson(grammarResult, setCopiedGrammarJson)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedGrammarJson ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedGrammarJson ? t("assessment.copied", "Copied") : t("assessment.copy_json", "Copy JSON")}</span>
                  </button>
                </div>
              </div>

              {/* Feedback */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {t("assessment.diagnostic_analysis_label", "Diagnostic Analysis:")}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  <AutoText text={grammarResult.assessment.feedback} context="assessment_feedback" />
                </p>
              </div>

              {/* Flagged Passages if any */}
              {grammarResult.plagiarism_analysis.flagged_passages &&
                grammarResult.plagiarism_analysis.flagged_passages.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      {t("assessment.flagged_passages_label", "Flagged Passages")} ({grammarResult.plagiarism_analysis.flagged_passages.length}):
                    </span>
                    <div className="space-y-2">
                      {grammarResult.plagiarism_analysis.flagged_passages.map((f, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedDrillDownPassage(f)}
                          className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 hover:border-indigo-300 text-xs transition-all cursor-pointer group shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-mono text-rose-600 font-semibold block truncate">
                              "{f.text_snippet}"
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 shrink-0 group-hover:underline flex items-center gap-0.5">
                              <span>{t("assessment.drill_down", "Drill Down")}</span>
                              <ArrowRight size={12} />
                            </span>
                          </div>
                          <span className="text-slate-500 text-[11px]">{t("assessment.reason_label", "Reason:")} {f.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Integrity Verdict */}
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed ${
                  grammarResult.plagiarism_analysis.risk_level === "LOW"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : "bg-amber-50 text-amber-900 border-amber-200"
                }`}
              >
                <div className="font-black text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>{t("assessment.integrity_authenticity_check", "Integrity & Authenticity Check")}</span>
                </div>
                <AutoText text={grammarResult.plagiarism_analysis.integrity_verdict} context="assessment_integrity_verdict" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* DOMAIN 4: UNIVERSAL INTEGRITY STUDIO */}
      {activeDomain === "studio" && (
        <PlagiarismIntegrityStudio />
      )}

      {/* Drill-down modal for flagged passages */}
      <FlaggedPassageDrillDownModal
        passage={selectedDrillDownPassage}
        isOpen={!!selectedDrillDownPassage}
        onClose={() => setSelectedDrillDownPassage(null)}
        onApplyRevision={(original, revision) => {
          if (activeDomain === "writing") {
            setWritingSubmission((prev) => prev.replace(original, revision));
          } else if (activeDomain === "grammar") {
            setGrammarInput((prev) => prev.replace(original, revision));
          }
        }}
      />
    </div>
  );
};
