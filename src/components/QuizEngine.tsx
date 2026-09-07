import React, { useState } from "react";
import {
  Award,
  Zap,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Volume2,
  ArrowRight,
  Loader2,
  PlusCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CEFRLevel, QuizQuestion, QuizSet, UserProgress } from "../types";
import { PRESET_QUIZ_SETS } from "../data/curriculumData";
import { AudioButton } from "./AudioButton";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { AutoText, useAutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";

interface QuizEngineProps {
  progress: UserProgress;
  onCompleteQuiz: (quizId: string, score: number, xpEarned: number) => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  progress,
  onCompleteQuiz,
}) => {
  const [activeQuizSet, setActiveQuizSet] = useState<QuizSet | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [scrambleSelections, setScrambleSelections] = useState<{ [qId: string]: string[] }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // AI Generator Modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("Modal Verbs of Deduction & Probability");
  const [aiLevel, setAiLevel] = useState<CEFRLevel>("B1");
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { t } = useTranslation();

  const startQuiz = (quiz: QuizSet) => {
    setActiveQuizSet(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScrambleSelections({});
    setShowExplanation(false);
    setQuizFinished(false);
    setFinalScore(0);
  };

  const currentQ: QuizQuestion | undefined =
    activeQuizSet?.questions[currentQuestionIndex];
  const translatedQuestion = useAutoText(currentQ?.question, "quiz_question");
  const translatedHint = useAutoText(currentQ?.hint, "quiz_hint");
  const translatedExplanation = useAutoText(currentQ?.explanation, "quiz_explanation");

  const handleSelectAnswer = (qId: string, answer: string) => {
    if (showExplanation) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  // Handling sentence scramble click
  const handleScrambleWordClick = (qId: string, word: string) => {
    if (showExplanation) return;
    const currentList = scrambleSelections[qId] || [];
    const updated = [...currentList, word];
    setScrambleSelections((prev) => ({ ...prev, [qId]: updated }));
    setUserAnswers((prev) => ({ ...prev, [qId]: updated.join(" ") }));
  };

  const handleResetScramble = (qId: string) => {
    if (showExplanation) return;
    setScrambleSelections((prev) => ({ ...prev, [qId]: [] }));
    setUserAnswers((prev) => ({ ...prev, [qId]: "" }));
  };

  const handleCheckAnswer = () => {
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!activeQuizSet) return;
    setShowExplanation(false);
    if (currentQuestionIndex < activeQuizSet.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate final score
      let correct = 0;
      activeQuizSet.questions.forEach((q) => {
        const uAns = (userAnswers[q.id] || "").trim().toLowerCase();
        const expected = (q.correctAnswer || q.correctSentence || "").trim().toLowerCase();
        // Allow fuzzy punctuation matching on sentences
        const cleanU = uAns.replace(/[.,?!]/g, "").trim();
        const cleanE = expected.replace(/[.,?!]/g, "").trim();

        if (cleanU === cleanE || uAns === expected) {
          correct++;
        }
      });

      const scorePercent = Math.round(
        (correct / activeQuizSet.questions.length) * 100
      );
      setFinalScore(scorePercent);
      setQuizFinished(true);

      const xpEarned = Math.max(30, Math.round(scorePercent * 0.8));
      onCompleteQuiz(activeQuizSet.id, scorePercent, xpEarned);

      if (scorePercent >= 60) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleGenerateAiQuiz = async () => {
    try {
      setIsGeneratingAiQuiz(true);
      setAiError(null);

      const response = await fetch("/api/gemini/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          level: aiLevel,
          count: 5,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI quiz.");
      }

      const data = await response.json();
      const newQuizSet: QuizSet = {
        id: `ai_quiz_${Date.now()}`,
        title: data.title || `AI Quiz: ${aiTopic}`,
        description: data.description || `Custom tailored AI quiz testing ${aiTopic}`,
        level: aiLevel,
        category: "AI Dynamic Quiz",
        questions: data.questions || [],
      };

      setShowAiModal(false);
      startQuiz(newQuizSet);
    } catch (err: any) {
      console.error("AI quiz error:", err);
      setAiError(err.message || "Could not generate AI quiz. Please try again.");
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Module Header Guide */}
      <ModuleHeaderGuide
        moduleTitle="Interactive Quiz Arena"
        moduleCategory="Assessment & Drills"
        estimatedTime="3–5 min per quiz"
        difficulty="Multiple Choice & Syntax Scramble"
        themeColor="amber"
        steps={[
          {
            title: "Choose or Generate a Quiz",
            instruction: "Select any preset CEFR topic or click 'Generate Custom AI Quiz' for tailored practice.",
            tip: "Custom quizzes can focus on any domain, from job interviews to academic research.",
          },
          {
            title: "Solve Interactive Questions",
            instruction: "Work through multiple-choice, listening audio prompts, and word scramble reorder drills.",
            tip: "Click word chips to arrange syntax in the proper English clause structure.",
          },
          {
            title: "Review Instant Explanations",
            instruction: "Check why answers are correct or incorrect before continuing to the next question.",
            tip: "Helps solidify the grammatical reason behind each error.",
          },
          {
            title: "Achieve ≥80% for Mastered Badge",
            instruction: "Score 80%+ accuracy to earn full XP rewards (+30 to +50 XP) and mark the quiz as passed.",
            tip: "You can retake quizzes anytime to improve your accuracy score.",
          },
        ]}
        completionGoal="Complete all quiz questions and achieve ≥ 80% accuracy score to claim XP rewards."
        xpReward={40}
      />

      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t("quiz.arena_title", "Interactive Quiz Arena")}
            </h1>
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
              {t("quiz.multi_format_engine", "Multi-Format Engine")}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t("quiz.arena_subtitle", "Test grammar, vocabulary, listening comprehension, and sentence construction.")}
          </p>
        </div>

        <button
          id="btn-open-ai-quiz-modal"
          type="button"
          onClick={() => setShowAiModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all self-start md:self-auto"
        >
          <Sparkles size={16} className="text-amber-300" />
          <span>{t("quiz.generate_custom_ai", "Generate Custom AI Quiz")}</span>
        </button>
      </div>

      {/* ACTIVE QUIZ RUNNER */}
      {activeQuizSet && !quizFinished && currentQ ? (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          {/* Progress bar and Quiz Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="font-bold text-indigo-600 uppercase tracking-wide">
                <AutoText as="span" text={activeQuizSet.title} context="quiz_set_title" />
              </span>
              <span>
                {t("quiz.question_of", "Question")} {currentQuestionIndex + 1} {t("common.of", "of")} {activeQuizSet.questions.length}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / activeQuizSet.questions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Current Question Body */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {currentQ.type.replace("-", " ")}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {translatedQuestion}
                </h2>
              </div>

              {/* Audio Prompt if available */}
              {currentQ.audioPrompt && (
                <div className="flex flex-col items-center gap-1">
                  <AudioButton text={currentQ.audioPrompt} size="lg" variant="primary" />
                  <span className="text-[10px] font-semibold text-indigo-600">{t("quiz.listen", "Listen")}</span>
                </div>
              )}
            </div>

            {/* Question Type: Multiple Choice or Listening */}
            {(currentQ.type === "multiple-choice" || currentQ.type === "listening-match" || currentQ.type === "error-identification") &&
              currentQ.options && (
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQ.id] === opt;
                    const isCorrect =
                      showExplanation &&
                      opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
                    const isWrongSelected =
                      showExplanation &&
                      isSelected &&
                      opt.trim().toLowerCase() !== currentQ.correctAnswer.trim().toLowerCase();

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={showExplanation}
                        onClick={() => handleSelectAnswer(currentQ.id, opt)}
                        className={`p-4 rounded-2xl text-sm font-medium text-left border-2 transition-all flex items-center justify-between ${
                          isCorrect
                            ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold"
                            : isWrongSelected
                            ? "bg-rose-50 border-rose-500 text-rose-950 font-bold"
                            : isSelected
                            ? "bg-indigo-50 border-indigo-600 text-indigo-950 font-semibold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && <CheckCircle2 size={18} className="text-emerald-600" />}
                        {isWrongSelected && <XCircle size={18} className="text-rose-600" />}
                      </button>
                    );
                  })}
                </div>
              )}

            {/* Question Type: Fill in the blank */}
            {currentQ.type === "fill-in-the-blank" && (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  disabled={showExplanation}
                  placeholder={t("quiz.type_answer_placeholder", "Type your answer here...")}
                  value={userAnswers[currentQ.id] || ""}
                  onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                  className="w-full px-4 py-3 text-base bg-slate-50 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                />
                {currentQ.hint && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Lightbulb size={14} className="text-amber-500" />
                    <span>{t("quiz.hint_label", "Hint:")} {translatedHint}</span>
                  </p>
                )}
              </div>
            )}

            {/* Question Type: Sentence Scramble */}
            {currentQ.type === "sentence-scramble" && (
              <div className="space-y-4 pt-2">
                {/* Constructed sentence box */}
                <div className="min-h-[56px] p-3 bg-slate-50 border-2 border-dashed border-indigo-300 rounded-2xl flex flex-wrap gap-2 items-center">
                  {(scrambleSelections[currentQ.id] || []).map((w, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      {w}
                    </span>
                  ))}
                  {(!scrambleSelections[currentQ.id] ||
                    scrambleSelections[currentQ.id].length === 0) && (
                    <span className="text-xs text-slate-400 italic">
                      {t("quiz.click_chips_hint", "Click the word chips below in the correct order...")}
                    </span>
                  )}
                </div>

                {/* Available Scrambled Chips */}
                <div className="flex flex-wrap gap-2 items-center">
                  {currentQ.scrambledWords?.map((w, idx) => {
                    const countInSentence = (
                      scrambleSelections[currentQ.id] || []
                    ).filter((sw) => sw === w).length;
                    const countInOriginal = currentQ.scrambledWords?.filter(
                      (sw) => sw === w
                    ).length || 0;
                    const isUsed = countInSentence >= countInOriginal;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isUsed || showExplanation}
                        onClick={() => handleScrambleWordClick(currentQ.id, w)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isUsed
                            ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                            : "bg-white text-slate-800 border-slate-300 hover:border-indigo-500 hover:shadow-xs active:scale-95"
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={showExplanation}
                    onClick={() => handleResetScramble(currentQ.id)}
                    className="p-2 text-slate-400 hover:text-slate-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <RotateCcw size={14} />
                    <span>{t("quiz.reset", "Reset")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Explanation Drawer */}
            {showExplanation && (
              <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-xs space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-sm">
                  <Lightbulb size={16} className="text-amber-500" />
                  <span>{t("quiz.grammar_rule_explanation", "Grammar Rule & Explanation")}</span>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {translatedExplanation}
                </p>
                {currentQ.correctSentence && (
                  <p className="text-emerald-800 font-bold">
                    {t("quiz.target_label", "Target:")} "{currentQ.correctSentence}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveQuizSet(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              {t("quiz.exit_quiz", "Exit Quiz")}
            </button>

            {!showExplanation ? (
              <button
                id="btn-check-quiz-answer"
                type="button"
                disabled={!userAnswers[currentQ.id]}
                onClick={handleCheckAnswer}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all"
              >
                {t("quiz.check_answer", "Check Answer")}
              </button>
            ) : (
              <button
                id="btn-next-quiz-question"
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>
                  {currentQuestionIndex < activeQuizSet.questions.length - 1
                    ? t("quiz.next_question", "Next Question")
                    : t("quiz.complete_quiz", "Complete Quiz")}
                </span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : quizFinished && activeQuizSet ? (
        /* QUIZ SUMMARY & SCORE SCREEN */
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            <Award size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              {t("quiz.completed", "Quiz Completed!")}
            </h2>
            <p className="text-sm text-slate-500"><AutoText as="span" text={activeQuizSet.title} context="quiz_set_title" /></p>
          </div>

          <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
            <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
              {t("quiz.accuracy_score", "Accuracy Score")}
            </span>
            <div className="text-4xl font-black text-indigo-900">
              {finalScore}%
            </div>
            <p className="text-xs text-slate-600">
              {finalScore >= 80
                ? t("quiz.result_outstanding", "🌟 Outstanding mastery! You demonstrated great accuracy.")
                : finalScore >= 50
                ? t("quiz.result_good_effort", "👍 Good effort! Review your weak topics to achieve full fluency.")
                : t("quiz.result_keep_practicing", "💡 Keep practicing! Review the grammar rules in the Grammar Hub.")}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => startQuiz(activeQuizSet)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} />
              <span>{t("quiz.retake_quiz", "Retake Quiz")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveQuizSet(null)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              {t("quiz.back_to_arena", "Back to Arena")}
            </button>
          </div>
        </div>
      ) : (
        /* QUIZ CATALOG */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_QUIZ_SETS.map((quiz) => {
            const isCompleted = progress.completedQuizIds.includes(quiz.id);
            const prevScore = progress.quizScores[quiz.id];

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {t("common.level", "Level")} {quiz.level} • <AutoText as="span" text={quiz.category} context="quiz_category" />
                    </span>
                    {isCompleted && prevScore !== undefined && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {t("quiz.score_label", "Score:")} {prevScore}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <AutoText as="span" text={quiz.title} context="quiz_set_title" />
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <AutoText as="span" text={quiz.description} context="quiz_set_description" />
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {quiz.questions.length} {t("quiz.interactive_questions", "Interactive Questions")}
                  </span>
                  <button
                    id={`btn-start-quiz-${quiz.id}`}
                    type="button"
                    onClick={() => startQuiz(quiz)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>{isCompleted ? t("quiz.practice_again", "Practice Again") : t("quiz.start_quiz", "Start Quiz")}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI QUIZ GENERATOR MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles size={18} />
                </div>
                <h3 className="font-black text-lg text-slate-900">
                  {t("quiz.ai_generator_title", "AI Quiz Generator")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {t("quiz.ai_generator_desc", "Gemini will craft a customized 5-question test with multiple question formats and explanations.")}
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {t("quiz.topic_focus_label", "Topic or Grammar Focus:")}
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder={t("quiz.topic_focus_placeholder", "e.g., Conditionals, Phrasal verbs with 'get', Business Idioms")}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {t("quiz.target_cefr_label", "Target CEFR Level:")}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(["A1", "A2", "B1", "B2", "C1"] as CEFRLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAiLevel(lvl)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        aiLevel === lvl
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {aiError && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{aiError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                {t("quiz.cancel", "Cancel")}
              </button>
              <button
                id="btn-generate-ai-quiz-submit"
                type="button"
                disabled={isGeneratingAiQuiz || !aiTopic.trim()}
                onClick={handleGenerateAiQuiz}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
              >
                {isGeneratingAiQuiz ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t("quiz.generating_quiz", "Generating Quiz...")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>{t("quiz.generate_and_start", "Generate & Start")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
