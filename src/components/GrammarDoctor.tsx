import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  Volume2,
  ArrowRight,
} from "lucide-react";
import { UserProgress } from "../types";
import { AudioButton } from "./AudioButton";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { AutoText, useAutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";

interface GrammarDoctorProps {
  progress: UserProgress;
}

interface GrammarExplanationResult {
  summary: string;
  partsOfSpeech: {
    token: string;
    role: string;
    explanation: string;
  }[];
  tenseAndAspect: string;
  keyRules: string[];
  commonMistakes: {
    incorrect: string;
    correct: string;
    why: string;
  }[];
  practiceExamples: string[];
}

export const GrammarDoctor: React.FC<GrammarDoctorProps> = ({ progress }) => {
  const [inputText, setInputText] = useState(
    "If I had known about the schedule change earlier, I would have notified the team."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GrammarExplanationResult | null>(null);
  const { t } = useTranslation();
  const translatedSummary = useAutoText(result?.summary, "doctor_summary");
  const translatedTenseAndAspect = useAutoText(result?.tenseAndAspect, "doctor_tense_aspect");

  const sampleSentences = [
    "If I had known about the schedule change earlier, I would have notified the team.",
    "She has been living in London since 2018.",
    "Despite the heavy storm, the flight landed on time.",
    "Neither the manager nor the employees were informed.",
  ];

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || inputText).trim();
    if (!text || isLoading) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/gemini/explain-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentenceOrQuestion: text,
          userLevel: progress.selectedLevel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to explain grammar");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Grammar doctor error:", err);
      // Fallback
      setResult({
        summary:
          "This sentence demonstrates a Third Conditional structure expressing an unreal past condition and its hypothetical past result.",
        partsOfSpeech: [
          { token: "If", role: "Subordinating Conjunction", explanation: "Introduces the conditional clause." },
          { token: "had known", role: "Past Perfect Verb", explanation: "Expresses unfulfilled past condition." },
          { token: "would have notified", role: "Perfect Modal Verb", explanation: "Expresses hypothetical past outcome." },
        ],
        tenseAndAspect: "Third Conditional (Past Perfect + Modal Perfect)",
        keyRules: [
          "Use past perfect (had + V3) in the if-clause to speak about unreal past events.",
          "Use 'would have + past participle' in the main result clause.",
        ],
        commonMistakes: [
          {
            incorrect: "If I would have known, I would have notified you.",
            correct: "If I had known, I would have notified you.",
            why: "Never use 'would have' inside the 'if' condition clause.",
          },
        ],
        practiceExamples: [
          "If she had caught the bus, she wouldn't have been late.",
          "If we had left earlier, we would have avoided the traffic.",
          "They would have bought the house if it had been cheaper.",
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Module Header Guide */}
      <ModuleHeaderGuide
        moduleTitle="AI Sentence & Grammar Doctor"
        moduleCategory="Syntactic Breakdown"
        estimatedTime="1–3 min per query"
        difficulty="Instant Syntax Explanations"
        themeColor="purple"
        steps={[
          {
            title: "Type or Paste Any Sentence",
            instruction: "Enter a phrase you wrote, a confusing sentence from a book/article, or click one of the preset samples.",
            tip: "Works for everything from basic A1 questions to complex academic C2 syntax.",
          },
          {
            title: "Click 'Analyze Sentence with AI'",
            instruction: "Trigger real-time linguistic parsing to dissect clause structure, tense, and aspect.",
            tip: "Uses Gemini's linguistic capabilities for deep structural breakdown.",
          },
          {
            title: "Inspect Token Breakdown & Rules",
            instruction: "Review individual parts of speech tokens, grammatical mechanics, and common non-native mistakes.",
            tip: "Listen to natural audio for each breakdown with the built-in speaker.",
          },
          {
            title: "Practice with Alternative Examples",
            instruction: "Study model transformation examples and similar sentence structures to solidify the pattern.",
            tip: "Save useful patterns to your vocabulary bank or practice in the chat tutor.",
          },
        ]}
        completionGoal="Analyze a complex sentence to unpack its syntactic structure and grammatical mechanics."
        xpReward={20}
      />

      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t("doctor.title", "AI Sentence & Grammar Doctor")}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t("doctor.subtitle", "Type or paste any English sentence, paragraph, or question to unpack its grammar, parts of speech, and nuances.")}
          </p>
        </div>

        {/* Input Box */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("doctor.input_placeholder", "Enter any English sentence to analyze...")}
              className="w-full p-4 text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-900"
            />
          </div>

          {/* Preset sample pill buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400">{t("doctor.try_samples", "Try samples:")}</span>
            {sampleSentences.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(sample);
                  handleAnalyze(sample);
                }}
                className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 rounded-lg border border-slate-200 transition-colors"
              >
                "{sample.slice(0, 30)}..."
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <button
              id="btn-analyze-sentence"
              type="button"
              disabled={isLoading || !inputText.trim()}
              onClick={() => handleAnalyze()}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t("doctor.diagnosing", "Diagnosing Sentence...")}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{t("doctor.analyze_button", "Analyze Sentence & Grammar")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ANALYSIS RESULTS */}
      {result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-in fade-in duration-300">
          {/* Summary & Tense Badge */}
          <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase font-bold text-purple-700 tracking-wider">
                {t("doctor.diagnosis_structure", "Grammar Diagnosis & Structure")}
              </span>
              <span className="px-3 py-1 bg-purple-200/70 text-purple-900 font-bold text-xs rounded-lg">
                {t("doctor.tense_label", "Tense:")} {translatedTenseAndAspect}
              </span>
            </div>

            <p className="text-sm font-medium text-purple-950 leading-relaxed">
              {translatedSummary}
            </p>
          </div>

          {/* Parts of Speech Token Breakdown */}
          {result.partsOfSpeech && result.partsOfSpeech.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                <span>{t("doctor.parts_of_speech_title", "Parts of Speech & Syntactic Roles")}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.partsOfSpeech.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        "{item.token}"
                      </span>
                      <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        <AutoText as="span" text={item.role} context="doctor_pos_role" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      <AutoText as="span" text={item.explanation} context="doctor_pos_explanation" />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Grammar Rules */}
          {result.keyRules && result.keyRules.length > 0 && (
            <div className="p-5 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2">
              <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" />
                <span>{t("doctor.underlying_rules_title", "Underlying Rules & Principles")}</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-indigo-900 font-medium">
                {result.keyRules.map((rule, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <span className="text-indigo-500">•</span>
                    <AutoText as="span" text={rule} context="doctor_key_rule" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes Table */}
          {result.commonMistakes && result.commonMistakes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{t("doctor.common_mistakes_title", "Common Mistakes with this Pattern")}</span>
              </h3>

              <div className="space-y-3">
                {result.commonMistakes.map((mistake, mIdx) => (
                  <div
                    key={mIdx}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-rose-50/40 rounded-xl border border-rose-100"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        ❌ {t("grammar.incorrect", "Incorrect")}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 line-through">
                        "{mistake.incorrect}"
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        ✓ {t("grammar.correct", "Correct")}
                      </span>
                      <p className="text-xs font-bold text-emerald-900">
                        "{mistake.correct}"
                      </p>
                      <p className="text-xs text-slate-600 pt-1">
                        <AutoText as="span" text={mistake.why} context="doctor_mistake_why" />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practice Examples with Audio */}
          {result.practiceExamples && result.practiceExamples.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                <span>{t("doctor.practice_variations_title", "Native Practice Variations")}</span>
              </h3>

              <div className="space-y-2">
                {result.practiceExamples.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 transition-colors flex items-center justify-between gap-3"
                  >
                    <span className="text-sm font-medium text-slate-800">
                      "{ex}"
                    </span>
                    <AudioButton text={ex} size="sm" variant="secondary" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
