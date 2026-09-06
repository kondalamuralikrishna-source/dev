import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Award,
  BookOpen,
  Layers,
  Zap,
  RotateCcw,
  Volume2,
  Lock,
  Unlock,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CEFRLevel, PlacementAssessmentResult, UserProgress } from "../types";
import { INITIAL_PLACEMENT_QUESTIONS, AssessmentQuestion } from "../data/assessmentData";
import { AudioButton } from "./AudioButton";
import { CEFR_LEVEL_ORDER } from "../utils/storageUtils";

interface PlacementAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onCompleteAssessment: (result: PlacementAssessmentResult) => void;
  isMandatoryFirstTime?: boolean;
}

export const PlacementAssessmentModal: React.FC<PlacementAssessmentModalProps> = ({
  isOpen,
  onClose,
  progress,
  onCompleteAssessment,
  isMandatoryFirstTime = false,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<PlacementAssessmentResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setAnswers({});
      setIsCompleted(false);
      setAssessmentResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalQuestions = INITIAL_PLACEMENT_QUESTIONS.length;
  const currentQuestion: AssessmentQuestion | undefined = INITIAL_PLACEMENT_QUESTIONS[currentStep];

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      calculateAndFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const calculateAndFinish = () => {
    let totalScorePoints = 0;
    let maxPoints = 0;
    let grammarCorrect = 0;
    let grammarTotal = 0;
    let vocabCorrect = 0;
    let vocabTotal = 0;
    let practicalCorrect = 0;
    let practicalTotal = 0;

    INITIAL_PLACEMENT_QUESTIONS.forEach((q) => {
      const selectedOptionId = answers[q.id];
      const selectedOption = q.options.find((opt) => opt.id === selectedOptionId);
      const isCorrect = selectedOption?.isCorrect ?? false;
      const questionMax = Math.max(...q.options.map((o) => o.levelScore || 1));
      maxPoints += questionMax;

      if (isCorrect && selectedOption) {
        totalScorePoints += selectedOption.levelScore || 1;
      }

      if (q.category === "grammar") {
        grammarTotal++;
        if (isCorrect) grammarCorrect++;
      } else if (q.category === "vocabulary") {
        vocabTotal++;
        if (isCorrect) vocabCorrect++;
      } else {
        practicalTotal++;
        if (isCorrect) practicalCorrect++;
      }
    });

    const percent = Math.round((totalScorePoints / maxPoints) * 100);

    // Determine CEFR level based on weighted percentage
    let diagnosed: CEFRLevel = "A1";
    let summary = "";
    let recommended: string[] = [];

    if (percent >= 88) {
      diagnosed = "C1";
      summary = "Exceptional language mastery! You demonstrate nuanced syntactic control, rhetorical sophistication, and idiomatic precision.";
      recommended = [
        "Advanced Stylistic Nuances & Subjunctive Mood",
        "Executive Negotiation & High-Stakes Public Speaking",
        "Nuanced Vocabulary & Rhetorical Obfuscation Analysis",
      ];
    } else if (percent >= 72) {
      diagnosed = "B2";
      summary = "Upper-Intermediate proficiency. Strong command of complex tenses, passive reporting, and professional diplomatic communication.";
      recommended = [
        "Passive Voice & Negative Inversion Drills",
        "Crisis Communication & Real-time Speaking Stress Tests",
        "Advanced Collocations & Formal Hedging Techniques",
      ];
    } else if (percent >= 52) {
      diagnosed = "B1";
      summary = "Solid Intermediate foundation. Comfortable with everyday conversational interactions, conditionals, and standard phrasal verbs.";
      recommended = [
        "Conditionals (Second & Third) and Modal Verbs",
        "Workplace & Social AI Conversational Roleplays",
        "Expanding Phrasal Verbs and Idiomatic Expressions",
      ];
    } else if (percent >= 32) {
      diagnosed = "A2";
      summary = "Elementary English skills. Good understanding of past routines, simple comparatives, and basic questions.";
      recommended = [
        "Past Simple vs Present Perfect Timelines",
        "Everyday Vocabulary Decks & Pronunciation Stress",
        "Daily Conversational Scenarios (Ordering, Travel, Directions)",
      ];
    } else {
      diagnosed = "A1";
      summary = "Foundational beginner level. Ready to build strong grammatical fundamentals, core sentence formulas, and essential vocabulary.";
      recommended = [
        "Parts of Speech Formulas (Subject + Verb + Object)",
        "High-Frequency 500 Daily Vocabulary Flashcards",
        "Interactive Sentence Audio Drills & Basic Pronunciation",
      ];
    }

    const result: PlacementAssessmentResult = {
      completedAt: new Date().toISOString(),
      diagnosedLevel: diagnosed,
      totalScorePercentage: percent,
      grammarScore: grammarTotal > 0 ? Math.round((grammarCorrect / grammarTotal) * 100) : 100,
      vocabularyScore: vocabTotal > 0 ? Math.round((vocabCorrect / vocabTotal) * 100) : 100,
      practicalScore: practicalTotal > 0 ? Math.round((practicalCorrect / practicalTotal) * 100) : 100,
      totalPoints: totalScorePoints,
      maxPoints,
      summaryFeedback: summary,
      recommendedNextSteps: recommended,
    };

    setAssessmentResult(result);
    setIsCompleted(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleApplyResult = () => {
    if (assessmentResult) {
      onCompleteAssessment(assessmentResult);
      onClose();
    }
  };

  const levelColorMap: Record<CEFRLevel, { bg: string; text: string; border: string }> = {
    A1: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    A2: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
    B1: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    B2: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    C1: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    C2: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 relative my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                CEFR Language Skill Assessment
              </h2>
              <p className="text-xs text-slate-500">
                Diagnostic questionnaire to unlock your tailored LMS level portal
              </p>
            </div>
          </div>

          {!isMandatoryFirstTime && !isCompleted && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 cursor-pointer"
            >
              Skip for now
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: QUESTIONNAIRE STEPPER */}
        {/* ========================================================================= */}
        {!isCompleted && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Stepper Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px]">
                    Question {currentStep + 1} of {totalQuestions}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                    Target: {currentQuestion.targetLevel} ({currentQuestion.difficultyLabel})
                  </span>
                </span>
                <span className="text-blue-600">
                  {Math.round(((currentStep + 1) / totalQuestions) * 100)}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 px-2 py-0.5 bg-blue-50 rounded border border-blue-200 inline-block">
                    {currentQuestion.category} competency
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentQuestion.question}
                  </h3>
                </div>

                <AudioButton text={currentQuestion.question} size="sm" variant="secondary" />
              </div>

              {currentQuestion.context && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 italic">
                  💡 Hint / Context: {currentQuestion.context}
                </div>
              )}

              {/* Options Grid */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                      className={`w-full p-3.5 sm:p-4 rounded-xl text-left font-medium text-xs sm:text-sm border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                          : "bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center uppercase shrink-0 ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {option.id}
                        </span>
                        <span>{option.text}</span>
                      </div>

                      {isSelected && <CheckCircle2 size={18} className="text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={handlePrev}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={!answers[currentQuestion.id]}
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <span>{currentStep === totalQuestions - 1 ? "Evaluate Placement" : "Next Question"}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DIAGNOSTIC RESULTS REPORT */}
        {/* ========================================================================= */}
        {isCompleted && assessmentResult && (
          <div className="space-y-6 text-left animate-in fade-in duration-300">
            {/* Result Hero Banner */}
            <div className="p-6 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-3xl text-white shadow-xl space-y-4 text-center sm:text-left relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-amber-300 text-xs font-bold border border-white/15">
                    <Award size={14} />
                    <span>Official CEFR Placement Diagnosis</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                    You have unlocked <span className="text-amber-400">Level {assessmentResult.diagnosedLevel}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-200 max-w-lg leading-relaxed">
                    {assessmentResult.summaryFeedback}
                  </p>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[120px]">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
                    Diagnostic Score
                  </span>
                  <span className="text-3xl font-black text-amber-300">
                    {assessmentResult.totalScorePercentage}%
                  </span>
                  <span className="text-[11px] text-white/70 block mt-0.5">
                    +{150} XP Awarded
                  </span>
                </div>
              </div>

              {/* Unlocked Levels Progression Map */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block mb-2">
                  Your CEFR Unlocked Curriculum Portals:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {CEFR_LEVEL_ORDER.map((lvl) => {
                    const targetIdx = CEFR_LEVEL_ORDER.indexOf(assessmentResult.diagnosedLevel);
                    const currIdx = CEFR_LEVEL_ORDER.indexOf(lvl);
                    const isUnlocked = currIdx <= targetIdx;
                    const isCurrent = lvl === assessmentResult.diagnosedLevel;

                    return (
                      <div
                        key={lvl}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isCurrent
                            ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md"
                            : isUnlocked
                            ? "bg-white/15 text-white border-white/25 font-bold"
                            : "bg-black/30 text-white/40 border-white/5"
                        }`}
                      >
                        <div className="text-xs font-black">{lvl}</div>
                        <div className="text-[9px] mt-0.5 flex items-center justify-center gap-0.5">
                          {isUnlocked ? (
                            <>
                              <Unlock size={10} />
                              <span>{isCurrent ? "Active" : "Unlocked"}</span>
                            </>
                          ) : (
                            <>
                              <Lock size={10} />
                              <span>Locked</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Competency Breakdown Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Grammar Core
                </span>
                <span className="text-lg font-black text-blue-600">
                  {assessmentResult.grammarScore}%
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Vocabulary
                </span>
                <span className="text-lg font-black text-emerald-600">
                  {assessmentResult.vocabularyScore}%
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Practical Fluency
                </span>
                <span className="text-lg font-black text-amber-600">
                  {assessmentResult.practicalScore}%
                </span>
              </div>
            </div>

            {/* Recommended Learning Focus */}
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-2">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} className="text-blue-600" />
                <span>Recommended Level {assessmentResult.diagnosedLevel} Learning Modules:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-blue-950">
                {assessmentResult.recommendedNextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Apply & Enter LMS Portal Button */}
            <button
              type="button"
              onClick={handleApplyResult}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>Unlock & Enter Level {assessmentResult.diagnosedLevel} LMS Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
