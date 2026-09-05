import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  BookOpen,
  Bot,
  UserCheck,
  Scale,
  Search,
  Code2,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { CEFRLevel, IntegrityAssessmentResponse, FlaggedPassage } from "../types";
import { FlaggedPassageDrillDownModal } from "./FlaggedPassageDrillDownModal";
import { AnonymousAttemptTelemetryModal } from "./AnonymousAttemptTelemetryModal";
import { BarChart3 } from "lucide-react";

const SAMPLE_SUBMISSIONS: {
  title: string;
  category: string;
  tag: string;
  tagColor: string;
  prompt: string;
  level: CEFRLevel;
  text: string;
}[] = [
  {
    title: "Authentic Student Essay",
    category: "Genuine Human Response",
    tag: "Low Risk Target",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    prompt: "Describe a significant obstacle you encountered in a team project and how you resolved it.",
    level: "B2",
    text: `During our quarterly system upgrade last month, our engineering team hit an unexpected roadblock when the legacy database migration script failed two hours before the launch deadline. As the technical lead, I gathered the team for an emergency 10-minute huddle to triage the issue. 

We discovered that customer timezone formatting in the legacy records had inconsistent date strings. Rather than delaying the entire release, we decided to partition the rollout into two phases: we deployed the non-critical microservices first while two developers rewrote the parsing function. We communicated the revised 45-minute window to stakeholders honestly. In the end, we completed the data transfer safely without losing any user records. This experience reinforced why dry-run stress testing and transparent team coordination are essential under high pressure.`,
  },
  {
    title: "Formulaic AI-Generated Text",
    category: "Synthetic LLM Pattern",
    tag: "High AI Risk",
    tagColor: "bg-rose-50 text-rose-700 border-rose-200",
    prompt: "Explain the importance of effective communication in modern organizations.",
    level: "C1",
    text: `In today's fast-paced world, communication plays a pivotal role in navigating the complexities of modern organizational frameworks. It is crucial to remember that effective collaboration serves as a testament to the power of shared vision. 

Furthermore, it is worth highlighting that leaders must adopt a multifaceted approach to foster an intricate tapestry of interpersonal relationships. When organizations delve into the dynamic landscape of cross-functional workflows, they unlock unprecedented synergies. 

In conclusion, it is clear that transparent dialogue is not merely a beneficial practice, but rather an indispensable beacon of hope for sustainable corporate success.`,
  },
  {
    title: "Verbatim Unattributed Excerpt",
    category: "Known Published Literature",
    tag: "High Plagiarism Match",
    tagColor: "bg-rose-50 text-rose-700 border-rose-200",
    prompt: "Write a short narrative describing a cold morning in a tense setting.",
    level: "B1",
    text: `It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him. The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features.`,
  },
  {
    title: "Mixed Template & Modified Text",
    category: "Hybrid / Partial Attribution",
    tag: "Medium Risk",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
    prompt: "Explain the fundamental biology behind plant energy conversion.",
    level: "B2",
    text: `In our high school lab experiment last week, we observed that photosynthesis is the process by which green plants convert light energy into chemical energy. 

During the experiment, my lab partner and I measured oxygen bubbles released by Elodea water plants under varying light intensities. We noticed that when we moved the lamp closer (from 30cm to 10cm), bubble generation nearly tripled. This demonstrated how light absorption directly impacts the photochemical rate in living chloroplasts.`,
  },
];

export const PlagiarismIntegrityStudio: React.FC = () => {
  const [submissionText, setSubmissionText] = useState<string>(SAMPLE_SUBMISSIONS[0].text);
  const [promptTopic, setPromptTopic] = useState<string>(SAMPLE_SUBMISSIONS[0].prompt);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("B2");
  const [activeMode, setActiveMode] = useState<"evaluate" | "generate">("evaluate");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IntegrityAssessmentResponse | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [showJsonView, setShowJsonView] = useState<boolean>(true);
  const [selectedPassage, setSelectedPassage] = useState<FlaggedPassage | null>(null);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState<boolean>(false);

  const wordCount = submissionText.trim() ? submissionText.trim().split(/\s+/).length : 0;
  const charCount = submissionText.length;

  const handleEvaluate = async () => {
    if (!submissionText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/assessment/evaluate-with-integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionText,
          prompt: promptTopic,
          level: selectedLevel,
        }),
      });
      const data: IntegrityAssessmentResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/assessment/generate-with-integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: promptTopic,
          level: selectedLevel,
          taskType: "Educational Writing & Spoken Evaluation",
        }),
      });
      const data: IntegrityAssessmentResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Generate error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment-integrity-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyRevision = (original: string, revision: string) => {
    if (!original || !revision) return;
    setSubmissionText((prev) => prev.replace(original, revision));
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-xs font-semibold tracking-wide border border-white/15">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Automated Plagiarism & Academic Integrity Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Assessment Evaluation & Integrity Analysis
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every assessment output returns a structured JSON payload coupling educational performance evaluation with multi-metric plagiarism detection, synthetic AI probability auditing, and flagged passage telemetry.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              id="btn-mode-evaluate"
              type="button"
              onClick={() => {
                setActiveMode("evaluate");
                if (result?.assessment?.status === "generated") setResult(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === "evaluate"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <FileCheck size={16} />
              <span>Evaluate Submission</span>
            </button>

            <button
              id="btn-mode-generate"
              type="button"
              onClick={() => {
                setActiveMode("generate");
                if (result?.assessment?.status === "evaluated") setResult(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === "generate"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <Sparkles size={16} />
              <span>Generate Task</span>
            </button>

            <button
              id="btn-open-anonymous-telemetry"
              type="button"
              onClick={() => setIsTelemetryModalOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 shadow-sm"
              title="View anonymous attempt stats and download raw CSV export"
            >
              <BarChart3 size={16} />
              <span>Attempts & CSV Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Submissions Picker (Only in Evaluate mode) */}
      {activeMode === "evaluate" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Pre-Loaded Submission Test Cases
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Click to load instantly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SAMPLE_SUBMISSIONS.map((sample, idx) => (
              <button
                key={idx}
                id={`btn-sample-case-${idx}`}
                type="button"
                onClick={() => {
                  setSubmissionText(sample.text);
                  setPromptTopic(sample.prompt);
                  setSelectedLevel(sample.level);
                  setResult(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 ${
                  submissionText === sample.text
                    ? "border-indigo-500 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-800">{sample.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sample.tagColor}`}>
                    {sample.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {sample.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Workbench */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {activeMode === "evaluate" ? "Assessment Prompt / Task Topic" : "Topic to Generate Assessment For"}
            </label>
            <input
              id="input-prompt-topic"
              type="text"
              value={promptTopic}
              onChange={(e) => setPromptTopic(e.target.value)}
              placeholder="e.g. Workplace Problem Solving, Formal Email, Argumentative Essay..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target CEFR Proficiency
            </label>
            <select
              id="select-cefr-level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as CEFRLevel)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="A1">A1 - Breakthrough Foundation</option>
              <option value="A2">A2 - Waystage</option>
              <option value="B1">B1 - Threshold Intermediate</option>
              <option value="B2">B2 - Vantage Upper Intermediate</option>
              <option value="C1">C1 - Effective Operational Proficiency</option>
              <option value="C2">C2 - Mastery / Native Fluency</option>
            </select>
          </div>
        </div>

        {activeMode === "evaluate" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FileText size={15} className="text-indigo-600" />
                <span>Candidate Submission Text (Essay / Spoken Transcript)</span>
              </label>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} characters</span>
                {submissionText.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSubmissionText("")}
                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="textarea-submission-text"
              rows={7}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Paste student written submission or spoken transcript here for automated evaluation & plagiarism analysis..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y font-normal"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Scale size={14} className="text-indigo-500" />
            <span>Dual-Stream Evaluation: Qualitative Pedagogical Grade + Automated Integrity Audit</span>
          </div>

          <button
            id="btn-run-integrity-assessment"
            type="button"
            disabled={isLoading || (activeMode === "evaluate" && !submissionText.trim())}
            onClick={activeMode === "evaluate" ? handleEvaluate : handleGenerate}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Integrity Engine...</span>
              </>
            ) : activeMode === "evaluate" ? (
              <>
                <ShieldCheck size={18} />
                <span>Evaluate & Check Plagiarism</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Assessment & Baseline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Dual Main Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Assessment */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg">
                        Assessment Result
                      </h3>
                      <p className="text-xs text-slate-500">Payload Section: `assessment`</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                      result.assessment.status === "evaluated"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}
                  >
                    {result.assessment.status}
                  </span>
                </div>

                {/* Score Dial */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Overall Score
                    </span>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                      {result.assessment.score !== null ? (
                        <>
                          <span>{result.assessment.score}</span>
                          <span className="text-sm font-semibold text-slate-400 ml-1">/ 100</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-slate-500">null (Generating)</span>
                      )}
                    </div>
                  </div>

                  {result.assessment.score !== null && (
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 flex items-center justify-center font-black text-indigo-700 text-sm">
                      {result.assessment.score}%
                    </div>
                  )}
                </div>

                {/* Feedback */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>Detailed Constructive Feedback</span>
                  </span>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                    {result.assessment.feedback}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Evaluator Engine: CEFR Standardized Model</span>
                <span>Status: Complete</span>
              </div>
            </div>

            {/* Right Card: Plagiarism & Integrity Analysis */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      result.plagiarism_analysis.risk_level === "LOW"
                        ? "bg-emerald-50 text-emerald-600"
                        : result.plagiarism_analysis.risk_level === "MEDIUM"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {result.plagiarism_analysis.risk_level === "LOW" ? (
                      <ShieldCheck size={20} />
                    ) : result.plagiarism_analysis.risk_level === "MEDIUM" ? (
                      <AlertTriangle size={20} />
                    ) : (
                      <ShieldAlert size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      Plagiarism & Integrity Analysis
                    </h3>
                    <p className="text-xs text-slate-500">Payload Section: `plagiarism_analysis`</p>
                  </div>
                </div>

                <div
                  className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                    result.plagiarism_analysis.risk_level === "LOW"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : result.plagiarism_analysis.risk_level === "MEDIUM"
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>Risk Level: {result.plagiarism_analysis.risk_level}</span>
                </div>
              </div>

              {/* Metric Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Search size={14} className="text-slate-600" />
                    <span>Estimated Similarity Score</span>
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {result.plagiarism_analysis.estimated_similarity_score}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">External overlap</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Bot size={14} className="text-slate-600" />
                    <span>AI Generated Probability</span>
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-black ${
                        result.plagiarism_analysis.ai_generated_probability === "HIGH"
                          ? "text-rose-600"
                          : result.plagiarism_analysis.ai_generated_probability === "MEDIUM"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {result.plagiarism_analysis.ai_generated_probability}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Synthetic syntax flag</span>
                  </div>
                </div>
              </div>

              {/* Integrity Verdict Banner */}
              <div
                className={`p-4 rounded-2xl border text-sm leading-relaxed font-medium ${
                  result.plagiarism_analysis.risk_level === "LOW"
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                    : result.plagiarism_analysis.risk_level === "MEDIUM"
                    ? "bg-amber-50/70 border-amber-200 text-amber-900"
                    : "bg-rose-50/70 border-rose-200 text-rose-900"
                }`}
              >
                <div className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <UserCheck size={14} />
                  <span>Integrity Verdict</span>
                </div>
                <p>{result.plagiarism_analysis.integrity_verdict}</p>
              </div>

              {/* Flagged Passages Explorer */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span>Flagged Passages & Telemetry ({result.plagiarism_analysis.flagged_passages.length})</span>
                  </span>
                  {result.plagiarism_analysis.flagged_passages.length === 0 && (
                    <span className="text-xs text-emerald-600 font-semibold">No anomalous passages flagged</span>
                  )}
                </div>

                {result.plagiarism_analysis.flagged_passages.length > 0 ? (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {result.plagiarism_analysis.flagged_passages.map((flag, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPassage(flag)}
                        className="p-3.5 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-200 hover:border-indigo-300 space-y-2 transition-all cursor-pointer group shadow-sm hover:shadow"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-200 group-hover:bg-indigo-200 text-slate-700 group-hover:text-indigo-800 text-[10px] flex items-center justify-center font-black">
                              {idx + 1}
                            </span>
                            <span>Passage #{idx + 1}</span>
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-200">
                            {flag.reason}
                          </span>
                        </div>

                        <p className="text-xs font-mono bg-white p-2 rounded-lg border border-slate-100 text-slate-800 break-words group-hover:text-indigo-950">
                          "{flag.text_snippet}"
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                            <span>Inspect Flag & Improvement Tips</span>
                            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                          </span>
                          <span className="text-[10px] text-slate-600 font-medium">Click to drill down</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                    All submitted sentences demonstrate organic human structure, original phrasing, and valid contextual tone.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Strict JSON Output Inspector & Export */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-sm font-bold border border-indigo-500/30">
                  <Code2 size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-100">
                    Engine JSON Output Specification
                  </h4>
                  <p className="text-xs text-slate-400">
                    Strict JSON payload with `assessment` and `plagiarism_analysis` sections
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-copy-engine-json"
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  {copiedJson ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedJson ? "Copied!" : "Copy JSON"}</span>
                </button>

                <button
                  id="btn-download-engine-json"
                  type="button"
                  onClick={handleDownloadJson}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJsonView(!showJsonView)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {showJsonView ? "Collapse" : "Expand"}
                </button>
              </div>
            </div>

            {showJsonView && (
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drill-down modal for flagged passages */}
      <FlaggedPassageDrillDownModal
        passage={selectedPassage}
        isOpen={!!selectedPassage}
        onClose={() => setSelectedPassage(null)}
        onApplyRevision={handleApplyRevision}
      />

      {/* Anonymous Attempt Telemetry & CSV Export Modal (Option C) */}
      <AnonymousAttemptTelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
      />
    </div>
  );
};
