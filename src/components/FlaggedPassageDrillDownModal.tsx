import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  FileText,
  RotateCcw,
} from "lucide-react";
import { FlaggedPassage } from "../types";
import { AutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";

interface FlaggedPassageDrillDownModalProps {
  passage: FlaggedPassage | null;
  isOpen: boolean;
  onClose: () => void;
  submissionContext?: string;
  onApplyRevision?: (original: string, revision: string) => void;
}

export const FlaggedPassageDrillDownModal: React.FC<FlaggedPassageDrillDownModalProps> = ({
  passage,
  isOpen,
  onClose,
  submissionContext,
  onApplyRevision,
}) => {
  const { t } = useTranslation();
  const [copiedRevision, setCopiedRevision] = useState<boolean>(false);
  const [copiedOriginal, setCopiedOriginal] = useState<boolean>(false);

  if (!isOpen || !passage) return null;

  const tip =
    passage.improvement_tip ||
    (passage.reason.toLowerCase().includes("orwell") || passage.reason.toLowerCase().includes("dickens") || passage.reason.toLowerCase().includes("melville")
      ? "Direct quotation detected without bibliographic attribution. Either surround with quotation marks and credit the author, or paraphrase the concept in your own original words."
      : passage.reason.toLowerCase().includes("ai") || passage.reason.toLowerCase().includes("synthetic") || passage.reason.toLowerCase().includes("cliché")
      ? "Generic synthetic phrasing diminishes your authentic voice. Replace formulaic idioms with concrete, personal details and direct verbs."
      : "Rephrase this segment using specific context, natural sentence variation, and your own authentic analytical perspective.");

  const revision =
    passage.suggested_revision ||
    (passage.text_snippet.toLowerCase().includes("in today's fast-paced world")
      ? "In our department over the past year, ..."
      : passage.text_snippet.toLowerCase().includes("delve into")
      ? "examine"
      : passage.text_snippet.toLowerCase().includes("intricate tapestry")
      ? "interconnected system of team workflows"
      : passage.text_snippet.toLowerCase().includes("plays a pivotal role")
      ? "directly improved our project turnaround time"
      : passage.text_snippet.toLowerCase().includes("it was a bright cold day in april")
      ? "As George Orwell famously described in 1984, 'It was a bright cold day in April...'"
      : "Authentic, contextual rephrasing tailored to your specific experience.");

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPublishedSource =
    passage.category === "published_source" ||
    passage.reason.toLowerCase().includes("published") ||
    passage.reason.toLowerCase().includes("match to known");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                isPublishedSource
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {isPublishedSource ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  {t("flagged.deep_dive_title", "Integrity Flag Deep Dive")}
                </h3>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    isPublishedSource
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {isPublishedSource ? t("flagged.source_match", "Source Match") : t("flagged.pattern_alert", "Pattern Alert")}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("flagged.subtitle", "Passage diagnostics and targeted revision coaching")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
          {/* Flagged Snippet Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText size={13} />
                <span>{t("flagged.submission_segment", "Flagged Submission Segment")}</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(passage.text_snippet, setCopiedOriginal)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                {copiedOriginal ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copiedOriginal ? t("flagged.copied", "Copied") : t("flagged.copy_segment", "Copy Segment")}</span>
              </button>
            </div>

            <div className="p-4 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl">
              <p className="text-sm font-mono text-rose-900 dark:text-rose-300 leading-relaxed font-semibold">
                "{passage.text_snippet}"
              </p>
            </div>
          </div>

          {/* Why Was This Flagged? */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Info size={14} className="text-indigo-500" />
              <span>{t("flagged.why_flagged", "Why Was This Flagged?")}</span>
            </span>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              <AutoText text={passage.reason} context="flagged_reason" />
            </p>
          </div>

          {/* Specific Improvement Tips */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-amber-500" />
              <span>{t("flagged.improvement_tip_label", "Actionable Improvement Tip:")}</span>
            </span>
            <p className="text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">
              <AutoText text={tip} context="flagged_improvement_tip" />
            </p>
          </div>

          {/* Suggested Revision (Before & After) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-500" />
                <span>{t("flagged.rephrasing_recommendation", "Authentic Rephrasing Recommendation")}</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(revision, setCopiedRevision)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                {copiedRevision ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copiedRevision ? t("flagged.copied", "Copied") : t("flagged.copy_revision", "Copy Revision")}</span>
              </button>
            </div>

            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl">
              <p className="text-sm font-medium text-emerald-950 dark:text-emerald-200 leading-relaxed">
                "{revision}"
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t("flagged.footer_label", "PlagiarismIntegrityStudio • Pedagogical Feedback Loop")}
          </span>

          <div className="flex items-center gap-2">
            {onApplyRevision && (
              <button
                type="button"
                onClick={() => {
                  onApplyRevision(passage.text_snippet, revision);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>{t("flagged.apply_revision", "Apply Revision")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {t("flagged.close", "Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
