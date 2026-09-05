import React, { useState } from "react";
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Volume2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Award,
} from "lucide-react";
import { UserProgress, AfterActionAuditReport } from "../types";
import { saveAfterActionAudit } from "../utils/storageUtils";

interface AfterActionAuditStudioProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onGrantXp: (amount: number, reason: string) => void;
}

export const AfterActionAuditStudio: React.FC<AfterActionAuditStudioProps> = ({
  progress,
  onUpdateProgress,
  onGrantXp,
}) => {
  const audits = progress.afterActionAudits || [];
  const [selectedAuditId, setSelectedAuditId] = useState<string>(audits[0]?.sessionId || "audit_init_demo_1");
  const [isGeneratingLiveAudit, setIsGeneratingLiveAudit] = useState(false);

  const currentAudit = audits.find((a) => a.sessionId === selectedAuditId) || audits[0];

  const handleSpeakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = progress.speechSpeed || 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGenerateLiveAudit = async () => {
    setIsGeneratingLiveAudit(true);
    try {
      const res = await fetch("/api/gemini/after-action-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionTitle: "Cross-Functional Executive Debrief & SLA Negotiation",
          sessionType: "domain_scenario",
          durationSeconds: 210,
          transcripts: [
            { speaker: "interlocutor", text: "Why should we renew our enterprise contract after this week's latency spike?" },
            { speaker: "user", text: "I think that we have very big growth and our team will fix the bug so users won't be mad." },
            { speaker: "interlocutor", text: "That is too vague. What concrete countermeasures have you implemented?" },
            { speaker: "user", text: "Like, basically, um, our team did automated rollbacks and we have 99.99% uptime now." },
          ],
        }),
      });

      const auditData: AfterActionAuditReport = await res.json();
      const updated = saveAfterActionAudit(auditData);
      onUpdateProgress(updated);
      setSelectedAuditId(auditData.sessionId);
      onGrantXp(50, "Completed Live After-Action Audit Review");
    } catch (e) {
      console.error("Error generating live audit:", e);
    } finally {
      setIsGeneratingLiveAudit(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <BarChart3 size={13} className="text-emerald-400" />
              MARKET DIFFERENTIATOR 6
            </span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Sparkles size={13} /> Detailed After-Action Audits (AAR)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white mb-2">
            After-Action Audit & Linguistic ROI Reports
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Comprehensive post-session analytics providing quantifiable ROI for your practice:
            Lexical Reach CEFR distribution (% A1-A2 vs C1-C2), filler frequency ratios, syntactic
            crutch detection, and line-by-line before/after executive polish rewrites.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateLiveAudit}
              disabled={isGeneratingLiveAudit}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {isGeneratingLiveAudit ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Synthesizing Deep Linguistic Audit...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate New Live Post-Session Audit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Audit History Selector */}
      {audits.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Audit Records:
          </span>
          {audits.map((a) => (
            <button
              key={a.sessionId}
              type="button"
              onClick={() => setSelectedAuditId(a.sessionId)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedAuditId === a.sessionId
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              <span>{a.sessionTitle}</span>
              <span className="text-[10px] ml-1.5 opacity-70">
                ({a.overallFluencyScore}% Fluency)
              </span>
            </button>
          ))}
        </div>
      )}

      {currentAudit && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Session Overview Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {currentAudit.sessionType}
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">{currentAudit.sessionTitle}</h2>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {currentAudit.durationSeconds}s duration
                </span>
                <span>•</span>
                <span className="font-bold text-slate-800">
                  {currentAudit.totalWordsSpoken} total words
                </span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Executive Linguistic Summary
              </p>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {currentAudit.executiveSummary}
              </p>
            </div>

            {/* Quantifiable ROI Gains */}
            {currentAudit.roiGainsSummary?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentAudit.roiGainsSummary.map((gain, gIdx) => (
                  <div
                    key={gIdx}
                    className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2"
                  >
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{gain}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Lexical Reach & CEFR Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  1. Lexical Reach & CEFR Distribution
                </h3>
                <span className="text-xs font-black text-indigo-600">
                  {currentAudit.lexicalReach?.c1_c2 || 20}% Advanced
                </span>
              </div>

              {/* CEFR Tier Bars */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>A1–A2 (Foundational)</span>
                    <span>{currentAudit.lexicalReach?.cefrDistribution?.a1_a2}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full"
                      style={{ width: `${currentAudit.lexicalReach?.cefrDistribution?.a1_a2}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>B1–B2 (Operational)</span>
                    <span>{currentAudit.lexicalReach?.cefrDistribution?.b1_b2}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${currentAudit.lexicalReach?.cefrDistribution?.b1_b2}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>C1–C2 (Executive & Fluent)</span>
                    <span>{currentAudit.lexicalReach?.cefrDistribution?.c1_c2}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${currentAudit.lexicalReach?.cefrDistribution?.c1_c2}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sophisticated Words List */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-700 mb-1.5">
                  High-Precision Vocabulary Used:
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentAudit.lexicalReach?.sophisticatedWordsUsed?.map((word, wIdx) => (
                    <span
                      key={wIdx}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Filler Word Ratio & Hesitation Frequency */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  2. Filler Word Frequency
                </h3>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    currentAudit.fillerWordAnalysis?.fillerRatioPercent < 2
                      ? "bg-emerald-100 text-emerald-800"
                      : currentAudit.fillerWordAnalysis?.fillerRatioPercent < 5
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {currentAudit.fillerWordAnalysis?.rating || "Elite (<2%)"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-2xl font-black text-slate-900">
                  {currentAudit.fillerWordAnalysis?.totalFillers || 0}
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  Total Filler Words ({currentAudit.fillerWordAnalysis?.fillerRatioPercent}% of speech)
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5">
                {currentAudit.fillerWordAnalysis?.fillerBreakdown?.map((fb, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <span className="font-semibold text-slate-700">"{fb.word}"</span>
                    <span className="font-black text-rose-600">{fb.count}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Conversational Fluency Velocity & Cadence */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  3. Conversational Velocity
                </h3>
                <span className="text-xs font-bold text-amber-700">
                  {currentAudit.fluencyVelocity?.avgWpm} WPM
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Speech Cadence Band</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {currentAudit.fluencyVelocity?.targetWpmBand}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Turn-Taking Interlocutor Latency
                  </p>
                  <p className="text-sm font-black text-indigo-700 mt-0.5">
                    {currentAudit.fluencyVelocity?.turnTakingLatencyMs} ms (Rapid Cognitive Retrieval)
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Long Pauses (&gt;2.5s)</span>
                  <span className="font-black text-slate-900">
                    {currentAudit.fluencyVelocity?.longPausesCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Syntactic Crutch Detection */}
          {currentAudit.syntacticCrutches?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Syntactic Crutch & Repetitive Pattern Detection
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentAudit.syntacticCrutches.map((crutch, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-900">{crutch.crutchPattern}</span>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                        {crutch.occurrences}x detected
                      </span>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-slate-700 mb-1">
                        Executive Structural Alternatives:
                      </p>
                      <div className="space-y-1">
                        {crutch.alternativeStructures?.map((alt, aIdx) => (
                          <p key={aIdx} className="text-emerald-900 font-semibold">
                            ➔ "{alt}"
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line-by-Line Before & After Executive Polish Rewrites */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Line-by-Line Executive Polish Rewrites
              </h3>
              <span className="text-xs text-slate-500">Click speaker icon to listen</span>
            </div>

            <div className="space-y-3">
              {currentAudit.lineByLineRevisions?.map((rev, rIdx) => (
                <div
                  key={rIdx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-rose-700 tracking-wider">
                      As Spoken in Session:
                    </p>
                    <p className="font-semibold text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
                      "{rev.userSpoken}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                        Executive Polish Transformation:
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSpeakText(rev.executivePolishRewrite)}
                        className="p-1 text-emerald-700 hover:bg-emerald-100 rounded flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Volume2 size={14} />
                        <span>Listen</span>
                      </button>
                    </div>
                    <p className="font-bold text-emerald-950 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
                      "{rev.executivePolishRewrite}"
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    💡 <strong>Linguistic Rationale:</strong> {rev.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
