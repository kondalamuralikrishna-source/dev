import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Layers,
  Sparkles,
  X,
  ExternalLink,
  Code2,
} from "lucide-react";
import { AnonymousTelemetryStats, AnonymousAttemptRecord } from "../types";

interface AnonymousAttemptTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnonymousAttemptTelemetryModal: React.FC<AnonymousAttemptTelemetryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [stats, setStats] = useState<AnonymousTelemetryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) {
        throw new Error(`Failed to fetch stats: HTTP ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching anonymous telemetry:", err);
      setError(err.message || "Failed to load telemetry stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyEndpoint = (url: string, key: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedEndpoint(key);
    setTimeout(() => setCopiedEndpoint(null), 2500);
  };

  const handleDownloadCsv = () => {
    window.open("/api/stats/export.csv", "_blank");
  };

  const filteredAttempts = stats?.recent_attempts.filter((a) => {
    if (filterType === "all") return true;
    return a.test_type === filterType;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <BarChart3 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Anonymous Test Attempts & Telemetry</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Option C: Zero-PII API
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Public global attempt counters and raw CSV export routes (no user credentials or login required)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              title="Refresh Stats"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50 dark:bg-slate-950/50">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Attempts (All-Time)
              </span>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 flex items-baseline gap-1">
                {loading && !stats ? "--" : stats?.total_attempts_all_time || 0}
                <span className="text-xs font-semibold text-slate-400">runs</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Attempts (Last 24h)
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-baseline gap-1">
                {loading && !stats ? "--" : stats?.attempts_last_24h || 0}
                <span className="text-xs font-semibold text-slate-400">recent</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Average Score
              </span>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 flex items-baseline gap-1">
                {loading && !stats ? "--" : stats?.average_score || 0}
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Integrity Pass Rate
              </span>
              <div className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-1 flex items-baseline gap-1">
                {stats && stats.total_attempts_all_time > 0
                  ? `${Math.round(((stats.plagiarism_risk_distribution.LOW || 0) / stats.total_attempts_all_time) * 100)}%`
                  : "100%"}
              </div>
            </div>
          </div>

          {/* Option C: Direct API & CSV Export Quick-Actions */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <Code2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                  Option C: Public Telemetry Endpoints & CSV Export
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Access live metrics or stream clean CSV logs via curl, automated pipelines, or direct browser downloads.
                </p>
              </div>

              <button
                onClick={handleDownloadCsv}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Download size={14} />
                <span>Download CSV Export</span>
              </button>
            </div>

            {/* Endpoints Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="truncate font-mono">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1.5">GET</span>
                  <span className="text-slate-700 dark:text-slate-300">/api/stats</span>
                </div>
                <button
                  onClick={() => handleCopyEndpoint("/api/stats", "json")}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedEndpoint === "json" ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="truncate font-mono">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mr-1.5">GET</span>
                  <span className="text-slate-700 dark:text-slate-300">/api/stats/export.csv</span>
                </div>
                <button
                  onClick={() => handleCopyEndpoint("/api/stats/export.csv", "csv")}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedEndpoint === "csv" ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown by Type & CEFR */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type breakdown */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Attempts by Assessment Domain
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">CEFR Spoken Speaking Assessments</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{stats.breakdown_by_type.spoken_assessments}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Written Diagnostic Evaluations</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{stats.breakdown_by_type.writing_diagnostics}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Grammar & Syntax Audits</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{stats.breakdown_by_type.grammar_diagnostics}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Integrity Studio Scans</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{stats.breakdown_by_type.integrity_studio_scans}</span>
                  </div>
                </div>
              </div>

              {/* CEFR Level distribution */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  CEFR Grade Distribution
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                    <div key={lvl} className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-[11px] font-bold text-slate-500 block">{lvl}</span>
                      <span className="text-base font-black text-slate-800 dark:text-slate-200">
                        {stats.cefr_distribution[lvl] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Attempts Log Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-3 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Recent Anonymous Attempts Log ({filteredAttempts.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Zero personally identifiable information (PII) stored.
                </span>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filterType === "all"
                      ? "bg-slate-900 text-white dark:bg-indigo-600"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("spoken_assessment")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filterType === "spoken_assessment"
                      ? "bg-slate-900 text-white dark:bg-indigo-600"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  Speaking
                </button>
                <button
                  onClick={() => setFilterType("writing_diagnostic")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filterType === "writing_diagnostic"
                      ? "bg-slate-900 text-white dark:bg-indigo-600"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  Writing
                </button>
                <button
                  onClick={() => setFilterType("grammar_diagnostic")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filterType === "grammar_diagnostic"
                      ? "bg-slate-900 text-white dark:bg-indigo-600"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  Grammar
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="py-2.5 px-3">Attempt ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Test Type</th>
                    <th className="py-2.5 px-3">Level / Score</th>
                    <th className="py-2.5 px-3">Integrity Risk</th>
                    <th className="py-2.5 px-3">Words</th>
                    <th className="py-2.5 px-3">Anon Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {filteredAttempts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400 font-sans">
                        No attempts recorded matching this filter yet.
                      </td>
                    </tr>
                  ) : (
                    filteredAttempts.slice(0, 15).map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-semibold">{att.id}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans">
                          {new Date(att.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </td>
                        <td className="py-2 px-3 font-sans capitalize text-slate-700 dark:text-slate-300">
                          {att.test_type.replace(/_/g, " ")}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                          {att.achieved_cefr_or_score}
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              att.plagiarism_risk === "HIGH"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                                : att.plagiarism_risk === "MEDIUM"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            }`}
                          >
                            {att.plagiarism_risk}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-sans">{att.word_count || 0}</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{att.client_session_hash}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Anonymous telemetry complies with Zero-PII privacy protocols.</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
