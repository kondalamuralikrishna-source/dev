import React, { useState } from "react";
import {
  Layers,
  CheckCircle2,
  Clock,
  Zap,
  Search,
  BookOpen,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Award,
  ChevronRight,
  Volume2,
  Info,
  HelpCircle as QuestionIcon,
  Lock,
  Unlock,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CEFRLevel, GrammarLesson, UserProgress } from "../types";
import { GRAMMAR_LESSONS } from "../data/curriculumData";
import { CLASSICAL_GRAMMAR_MODULES } from "../data/classicalGrammarCurriculum";
import { AudioButton } from "./AudioButton";
import { InteractiveSentence } from "./InteractiveSentence";
import { AccentSelector } from "./AccentSelector";
import { EnglishAccent, getSavedAccent } from "../utils/speechUtils";
import { isLevelUnlocked, CEFR_LEVEL_ORDER } from "../utils/storageUtils";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { RegionalConceptHelper } from "./RegionalConceptHelper";
import { AutoText, useAutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";

interface GrammarHubProps {
  progress: UserProgress;
  activeLessonId: string | null;
  onSelectLesson: (lessonId: string | null) => void;
  onCompleteLesson: (lessonId: string, xpEarned: number) => void;
  onOpenAssessment?: () => void;
  onOpenAdvancementExam?: (level: CEFRLevel) => void;
}

export const GrammarHub: React.FC<GrammarHubProps> = ({
  progress,
  activeLessonId,
  onSelectLesson,
  onCompleteLesson,
  onOpenAssessment,
  onOpenAdvancementExam,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<number | "all">("all");
  const [currentAccent, setCurrentAccent] = useState<EnglishAccent>(getSavedAccent());

  // Inline quiz states for currently opened lesson
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const activeLesson = GRAMMAR_LESSONS.find((l) => l.id === activeLessonId);
  // Hooks must run unconditionally (before the early `if (activeLesson)` return below), so this
  // resolves to "" via useAutoText's own null-handling whenever no lesson is open.
  const translatedActiveLessonTitle = useAutoText(activeLesson?.title, "grammar_lesson_title");

  // Filter lessons
  const filteredLessons = GRAMMAR_LESSONS.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.classicalChapterRef && lesson.classicalChapterRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lesson.moduleTitle && lesson.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel =
      selectedLevel === "all" || lesson.level === selectedLevel;
    const matchesModule =
      selectedModule === "all" || lesson.moduleNumber === selectedModule;
    return matchesSearch && matchesLevel && matchesModule;
  });

  const handleSelectLesson = (lesson: GrammarLesson) => {
    onSelectLesson(lesson.id);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const handleAnswerQuiz = (qId: string, answer: string) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmitQuiz = () => {
    if (!activeLesson) return;
    let correctCount = 0;
    activeLesson.quickCheckQuestions.forEach((q) => {
      const userAns = (quizAnswers[q.id] || "").trim().toLowerCase();
      const expected = (q.correctAnswer || "").trim().toLowerCase();
      if (userAns === expected) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round(
      (correctCount / activeLesson.quickCheckQuestions.length) * 100
    );
    setQuizScore(calculatedScore);
    setQuizSubmitted(true);
    if (calculatedScore >= 50) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      onCompleteLesson(activeLesson.id, activeLesson.xpReward);
    }
  };

  // If a lesson is active, show the detailed Lesson Viewer
  if (activeLesson) {
    const isAlreadyCompleted = progress.completedLessonIds.includes(activeLesson.id);

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
        {/* Module Header Guide */}
        <ModuleHeaderGuide
          moduleTitle={`Grammar Lesson: ${activeLesson.title}`}
          moduleCategory="Grammar & Syntax"
          estimatedTime={`${activeLesson.durationMins || 10} min`}
          difficulty={`Level ${activeLesson.level}`}
          themeColor="indigo"
          steps={[
            {
              title: "Study Syntactic Formula & Rules",
              instruction: "Review the formula blueprint, structural mechanics, and timeline diagram.",
              tip: "Pay attention to common non-native pitfall examples.",
            },
            {
              title: "Listen with Word-by-Word Audio",
              instruction: "Tap any word or complete sentence to listen in your chosen regional accent.",
              tip: "Switch between US, UK, and AUS accents in the top selector.",
            },
            {
              title: "Solve Quick-Check Exercises",
              instruction: "Answer the multiple-choice and sentence completion questions at the bottom.",
              tip: "Immediate feedback explains the correct syntactic reasoning.",
            },
            {
              title: "Submit & Claim XP Reward",
              instruction: `Score ≥ 50% on the quick-check quiz to mark lesson complete and earn +${activeLesson.xpReward} XP.`,
              tip: "Completed lessons permanently count towards your daily and CEFR goals.",
            },
          ]}
          completionGoal={`Score ≥ 50% on the Quick-Check Quiz to mark this lesson as completed and claim +${activeLesson.xpReward} XP.`}
          xpReward={activeLesson.xpReward}
        />

        {/* Back Button and Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <button
            id="btn-back-to-lessons"
            type="button"
            onClick={() => onSelectLesson(null)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{t("grammar.back_to_lessons", "Back to All Grammar Lessons")}</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <AccentSelector
              currentAccent={currentAccent}
              onAccentChange={setCurrentAccent}
              size="sm"
            />
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200">
              {t("common.level", "Level")} {activeLesson.level}
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold text-xs rounded-lg border border-amber-200 flex items-center gap-1">
              <Zap size={14} className="text-amber-500 fill-amber-500" />
              +{activeLesson.xpReward} XP
            </span>
            {isAlreadyCompleted && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 size={14} /> {t("common.completed", "Completed")}
              </span>
            )}
          </div>
        </div>

        {/* Lesson Hero Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
                <AutoText text={activeLesson.category} context="grammar_category_label" />
              </span>
              {activeLesson.moduleTitle && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-indigo-200 border border-white/15">
                  <AutoText text={activeLesson.moduleTitle} context="grammar_module_title" />
                </span>
              )}
              {activeLesson.classicalChapterRef && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                  <BookOpen size={11} />
                  <span>{activeLesson.classicalChapterRef}</span>
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-indigo-200 flex items-center gap-1">
              <Clock size={13} /> {activeLesson.durationMins} min study
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {translatedActiveLessonTitle}
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-2xl">
            <AutoText text={activeLesson.summary} context="grammar_lesson_summary" />
          </p>

          {/* Key Rule & Formula Box */}
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
              <Sparkles size={16} />
              <span>{t("grammar.core_rule_formula", "Core Grammar Rule & Syntax Formula")}</span>
            </div>
            <p className="text-sm font-medium text-white">
              {activeLesson.keyRule}
            </p>
            {activeLesson.formula && (
              <div className="mt-2 p-2.5 bg-black/30 rounded-xl font-mono text-xs text-amber-200 border border-white/10 overflow-x-auto">
                {activeLesson.formula}
              </div>
            )}
            {/* Regional Translation & Native Language Scaffold */}
            <div className="pt-2">
              <RegionalConceptHelper
                englishText={activeLesson.keyRule}
                context={`Grammar rule: ${activeLesson.title}`}
              />
            </div>
          </div>
        </div>

        {/* Lesson Detailed Content Sections */}
        <div className="space-y-6">
          {activeLesson.sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4"
            >
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AutoText as="span" text={section.heading} context="grammar_section_heading" />
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed">
                {section.content}
              </p>

              {/* Regional Translation Scaffold for Section */}
              <RegionalConceptHelper
                englishText={section.content}
                context={`Section: ${section.heading}`}
              />

              {/* Examples with Interactive Word-by-Word Audio and Sentence Audio */}
              {section.examples && section.examples.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider flex items-center gap-1.5">
                      <Volume2 size={14} />
                      <span>{t("grammar.contextual_examples", "Contextual Examples & Interactive Pronunciation")}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 bg-indigo-50/70 border border-indigo-100/80 px-2.5 py-0.5 rounded-full">
                      {t("grammar.click_word_hint", "👆 Click any individual word to hear its pronunciation")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {section.examples.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="p-4 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl border border-slate-200 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex-1 w-full">
                          <InteractiveSentence
                            sentence={ex.sentence}
                            highlight={ex.highlight}
                            accent={currentAccent}
                            translationOrMeaning={ex.translationOrMeaning}
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <AudioButton
                            text={ex.sentence}
                            accent={currentAccent}
                            size="md"
                            variant="secondary"
                            label="Sentence Audio"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {section.notes && section.notes.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  {section.notes.map((note, nIdx) => (
                    <p key={nIdx}>
                      📌 <AutoText as="span" text={note} context="grammar_section_note" />
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Common Pitfalls & Mistakes Table */}
        {activeLesson.commonMistakes && activeLesson.commonMistakes.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertTriangle size={20} />
              <h3>{t("grammar.common_traps", "Common Learner Traps & How to Avoid Them")}</h3>
            </div>

            <div className="space-y-3">
              {activeLesson.commonMistakes.map((mistake, mIdx) => (
                <div
                  key={mIdx}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-rose-50/40 rounded-xl border border-rose-100"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      ❌ {t("grammar.incorrect", "Incorrect")}
                    </span>
                    <p className="text-sm font-medium text-slate-800 line-through">
                      "{mistake.incorrect}"
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ✓ {t("grammar.correct", "Correct")}
                    </span>
                    <p className="text-sm font-bold text-emerald-900">
                      "{mistake.correct}"
                    </p>
                    <p className="text-xs text-slate-600 pt-1">
                      <AutoText text={mistake.explanation} context="grammar_mistake_explanation" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Check Knowledge Quiz */}
        {activeLesson.quickCheckQuestions && activeLesson.quickCheckQuestions.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {t("grammar.quick_check_mastery", "Quick Check & Mastery Check")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t("grammar.quiz_earn_xp", "Test what you've learned to earn your XP.")} (+{activeLesson.xpReward} XP)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {activeLesson.quickCheckQuestions.map((q, qIndex) => {
                const userAns = quizAnswers[q.id] || "";
                const expectedAns = (q.correctAnswer || "").trim().toLowerCase();
                const isCorrect =
                  quizSubmitted &&
                  expectedAns.length > 0 &&
                  userAns.trim().toLowerCase() === expectedAns;
                const isIncorrect =
                  quizSubmitted &&
                  expectedAns.length > 0 &&
                  userAns.trim().toLowerCase() !== expectedAns;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCorrect
                        ? "bg-emerald-50 border-emerald-300"
                        : isIncorrect
                        ? "bg-rose-50 border-rose-300"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-sm mb-3">
                      {qIndex + 1}. <AutoText as="span" text={q.question} context="grammar_quiz_question" />
                    </p>

                    {q.type === "multiple-choice" && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => handleAnswerQuiz(q.id, opt)}
                            className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all cursor-pointer ${
                              userAns === opt
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {q.type === "fill-in-the-blank" && (
                      <input
                        type="text"
                        disabled={quizSubmitted}
                        placeholder={t("grammar.type_answer", "Type your answer...")}
                        value={userAns}
                        onChange={(e) => handleAnswerQuiz(q.id, e.target.value)}
                        className="w-full max-w-sm px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    )}

                    {quizSubmitted && (
                      <div className="mt-2 text-xs">
                        {isCorrect ? (
                          <p className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 size={13} /> {t("grammar.correct_bang", "Correct!")}{" "}
                            <AutoText as="span" text={q.explanation} context="grammar_quiz_explanation" />
                          </p>
                        ) : (
                          <p className="text-rose-700 font-medium">
                            {t("grammar.expected_answer", "Expected answer:")} <strong>{q.correctAnswer}</strong>.{" "}
                            <AutoText as="span" text={q.explanation} context="grammar_quiz_explanation" />
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                {t("grammar.submit_answers", "Submit Answers & Check Mastery")}
              </button>
            ) : (
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-900 block">
                    {t("grammar.mastery_score", "Mastery Score:")} {quizScore}%
                  </span>
                  <span className="text-xs text-slate-600">
                    {quizScore && quizScore >= 50
                      ? t("grammar.quiz_pass_msg", "🎉 Excellent work! Lesson marked as completed.")
                      : t("grammar.quiz_fail_msg", "Review the lesson materials and try again to improve your score.")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                  }}
                  className="px-4 py-2 bg-white text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 hover:bg-slate-50 cursor-pointer"
                >
                  {t("grammar.retake_check", "Retake Check")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // DEFAULT CATALOG VIEW: All Grammar Lessons
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Module Header Guide */}
      <ModuleHeaderGuide
        moduleTitle="Grammar Hub & Syntax Curriculum"
        moduleCategory="Structural Grammar"
        estimatedTime="10–15 min per lesson"
        difficulty="CEFR A1 to C1"
        themeColor="indigo"
        steps={[
          {
            title: "Filter by CEFR Level & Topic",
            instruction: "Use the level filter tabs (A1 to C1) or search bar to find relevant structural grammar topics.",
            tip: "Start with your active CEFR level for optimal difficulty alignment.",
          },
          {
            title: "Select a Lesson to Open",
            instruction: "Click on any unlocked lesson card to enter the full lesson view with formulas and examples.",
            tip: "Lessons with the green checkmark are already completed.",
          },
          {
            title: "Practice Word-by-Word Audio",
            instruction: "Click highlighted words or complete sample sentences to hear pronunciation in your selected accent.",
            tip: "Switch between American, British, and Australian accents anytime.",
          },
          {
            title: "Pass the Quick-Check Quiz",
            instruction: "Answer the practice questions at the bottom of the lesson and achieve ≥50% to earn your XP.",
            tip: "Earn +25 to +40 XP per completed lesson to boost your daily streak.",
          },
        ]}
        completionGoal="Pass the Quick-Check Quiz with ≥ 50% score on each lesson to mark it complete and earn XP."
        xpReward={30}
      />

      {/* Purpose Banner & Explainer */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t("grammar.hub_title", "Grammar Hub & Syntax Curriculum")}
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold rounded-md border border-indigo-200">
                CEFR A1–C1
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              <AutoText
                as="span"
                text="Intended Purpose: The Grammar Hub is your core structural learning engine. It systematically breaks down English sentence construction, verb tense timelines, modal auxiliaries, and real-life conversational rules."
                context="grammar_hub_purpose_banner"
              />
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AccentSelector
              currentAccent={currentAccent}
              onAccentChange={setCurrentAccent}
              size="md"
            />
          </div>
        </div>

        {/* 3 Value Pillars of Grammar Hub */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 space-y-1">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs">
              <Sparkles size={14} className="text-indigo-600" />
              <AutoText as="span" text="Formulas & Key Rules" context="grammar_pillar_title" />
            </div>
            <p className="text-[11px] text-slate-600">
              <AutoText
                as="span"
                text="Clear syntactic blueprints for every CEFR level from A1 to C1 with visual formulas."
                context="grammar_pillar_desc"
              />
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 space-y-1">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <Volume2 size={14} className="text-emerald-600" />
              <AutoText as="span" text="Interactive Word Audio" context="grammar_pillar_title" />
            </div>
            <p className="text-[11px] text-slate-600">
              <AutoText
                as="span"
                text="Click individual words or listen to complete sentences in British 🇬🇧, American 🇺🇸, or Australian 🇦🇺 accents."
                context="grammar_pillar_desc"
              />
            </p>
          </div>

          <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100/80 space-y-1">
            <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs">
              <AlertTriangle size={14} className="text-rose-600" />
              <AutoText as="span" text="Trap Prevention & Quizzes" context="grammar_pillar_title" />
            </div>
            <p className="text-[11px] text-slate-600">
              <AutoText
                as="span"
                text="Avoid common learner mistakes with quick check mastery tests that award XP."
                context="grammar_pillar_desc"
              />
            </p>
          </div>
        </div>

        {/* Search & Level Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-extrabold text-slate-400 mr-1">{t("common.level", "Level")}:</span>
            {(["all", "A1", "A2", "B1", "B2", "C1", "C2"] as const).map((lvl) => {
              const isLvlUnlocked = lvl === "all" || isLevelUnlocked(lvl as CEFRLevel, progress);
              const isCurrent = lvl === progress.selectedLevel;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedLevel === lvl
                      ? "bg-indigo-600 text-white shadow-xs"
                      : isLvlUnlocked
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-slate-100/70 text-slate-400 hover:bg-slate-100 border border-dashed border-slate-300"
                  }`}
                >
                  {!isLvlUnlocked && <Lock size={11} className="text-slate-400" />}
                  {isCurrent && lvl !== "all" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  )}
                  <span>{lvl === "all" ? t("common.all_levels", "All Levels") : `${t("common.level", "Level")} ${lvl}`}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={t("common.search_placeholder_grammar", "Search grammar lessons...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Wren & Martin Classical Grammar Syllabus Modules Navigator */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-extrabold text-[11px] border border-amber-400/30 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={12} />
                <span>Wren & Martin Classical Syllabus</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                <AutoText as="span" text="High School English Grammar & Composition" context="grammar_module_navigator" />
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              <AutoText as="span" text="5 Comprehensive Core Modules" context="grammar_module_navigator" />
            </h2>
          </div>

          {selectedModule !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedModule("all")}
              className="self-start md:self-auto px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-white/10"
            >
              <ArrowLeft size={13} />
              <span>
                <AutoText as="span" text="Show All Lessons" context="grammar_module_navigator" /> ({GRAMMAR_LESSONS.length})
              </span>
            </button>
          )}
        </div>

        {/* 5 Module Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedModule("all")}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedModule === "all"
                ? "bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/50"
                : "bg-slate-800/80 text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-300">
                <AutoText as="span" text="All Modules" context="grammar_module_navigator" />
              </span>
              <Layers size={13} className="text-indigo-300" />
            </div>
            <span className="text-xs font-black truncate mt-1">
              <AutoText as="span" text="Full Curriculum" context="grammar_module_navigator" />
            </span>
            <span className="text-[10px] text-slate-300 mt-1 font-mono">
              {GRAMMAR_LESSONS.length} <AutoText as="span" text="Units" context="grammar_module_navigator" />
            </span>
          </button>

          {CLASSICAL_GRAMMAR_MODULES.map((mod) => {
            const modLessons = GRAMMAR_LESSONS.filter((l) => l.moduleNumber === mod.moduleNumber);
            const completedCount = modLessons.filter((l) => progress.completedLessonIds.includes(l.id)).length;
            const isSelected = selectedModule === mod.moduleNumber;

            return (
              <button
                key={mod.moduleNumber}
                type="button"
                onClick={() => setSelectedModule(mod.moduleNumber)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/50"
                    : "bg-slate-800/80 text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider text-indigo-300">
                    Mod {mod.moduleNumber}
                  </span>
                  <span className="text-[10px] font-bold text-amber-300">
                    {completedCount}/{modLessons.length}
                  </span>
                </div>
                <span className="text-xs font-black line-clamp-1 mt-1">
                  <AutoText
                    as="span"
                    text={mod.title.replace(`Module ${mod.moduleNumber}: `, "")}
                    context="grammar_module_card_title"
                  />
                </span>
                <span className="text-[10px] text-slate-300 mt-1 font-mono">
                  {mod.cefrSpan}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Module Banner details (if a specific module is selected) */}
        {selectedModule !== "all" && (() => {
          const mod = CLASSICAL_GRAMMAR_MODULES.find((m) => m.moduleNumber === selectedModule);
          if (!mod) return null;
          const modLessons = GRAMMAR_LESSONS.filter((l) => l.moduleNumber === mod.moduleNumber);
          const completedCount = modLessons.filter((l) => progress.completedLessonIds.includes(l.id)).length;
          const pct = Math.round((completedCount / (modLessons.length || 1)) * 100);

          return (
            <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-3 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                      <AutoText as="span" text={mod.classicalFocus} context="grammar_module_focus" />
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-indigo-300">{mod.cefrSpan}</span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    <AutoText as="span" text={mod.title} context="grammar_module_title" />
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mt-1">
                    <AutoText as="span" text={mod.description} context="grammar_module_description" />
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs font-bold text-slate-300 block">
                    <AutoText as="span" text="Module Mastery:" context="grammar_module_navigator" /> {pct}%
                  </span>
                  <div className="w-32 bg-slate-700 h-2 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* End-of-Level Assessment Trigger Banner */}
      {progress.selectedLevel && (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-300/40 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md shadow-amber-500/20">
              <Award size={20} />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md">
                  <AutoText as="span" text="Active Course:" context="grammar_end_of_level_banner" /> {t("common.level", "Level")} {progress.selectedLevel}
                </span>
                <span className="text-xs font-bold text-slate-500">•</span>
                <span className="text-xs font-bold text-slate-600">
                  {progress.completedLessonIds.filter((id) =>
                    GRAMMAR_LESSONS.some((l) => l.id === id && l.level === progress.selectedLevel)
                  ).length}{" "}
                  <AutoText as="span" text="of" context="grammar_end_of_level_banner" />{" "}
                  {GRAMMAR_LESSONS.filter((l) => l.level === progress.selectedLevel).length}{" "}
                  <AutoText as="span" text="lessons completed" context="grammar_end_of_level_banner" />
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                <AutoText as="span" text="End-of-Level Written & Spoken Assessment Layer" context="grammar_end_of_level_banner" />
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                <AutoText
                  as="span"
                  text={`Ready to test your improvement post-session? Complete the Level ${progress.selectedLevel} written benchmark and live voice performance assessment to evaluate your real-world oral fluency and unlock the next CEFR Level!`}
                  context="grammar_end_of_level_banner"
                />
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenAdvancementExam) {
                onOpenAdvancementExam(progress.selectedLevel);
              } else if (onOpenAssessment) {
                onOpenAssessment();
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-all active:scale-[0.98] shrink-0"
          >
            <Sparkles size={14} />
            <span>
              <AutoText as="span" text="Take Level" context="grammar_end_of_level_banner" /> {progress.selectedLevel}{" "}
              <AutoText as="span" text="Assessment" context="grammar_end_of_level_banner" />
            </span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Grammar Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => {
          const isCompleted = progress.completedLessonIds.includes(lesson.id);
          const unlocked = isLevelUnlocked(lesson.level, progress);

          if (!unlocked) {
            return (
              <div
                key={lesson.id}
                id={`lesson-card-${lesson.id}`}
                onClick={() => {
                  const prevLevel = CEFR_LEVEL_ORDER[CEFR_LEVEL_ORDER.indexOf(lesson.level) - 1];
                  if (prevLevel && onOpenAdvancementExam) {
                    onOpenAdvancementExam(prevLevel);
                  } else if (onOpenAssessment) {
                    onOpenAssessment();
                  }
                }}
                className="bg-slate-50/80 rounded-3xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group cursor-pointer hover:border-amber-300 hover:bg-amber-50/30 transition-all"
              >
                <div className="space-y-3 opacity-75">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-lg">
                        {lesson.level} • <AutoText as="span" text={lesson.category} context="grammar_category_label" />
                      </span>
                      {lesson.moduleNumber && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                          Mod {lesson.moduleNumber}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                      <Lock size={12} className="text-slate-500" /> {t("common.locked_level", "Locked Level")}
                    </span>
                  </div>

                  {lesson.classicalChapterRef && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md w-fit">
                      <BookOpen size={11} className="text-slate-500 shrink-0" />
                      <span>{lesson.classicalChapterRef}</span>
                    </div>
                  )}

                  <h3 className="font-extrabold text-slate-700 text-base">
                    <AutoText as="span" text={lesson.title} context="grammar_lesson_title" />
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    <AutoText as="span" text={lesson.summary} context="grammar_lesson_summary" />
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-amber-700">
                  <span className="flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-500" /> {t("common.unlock_via_test", "Unlock via Level Test")}
                  </span>
                  <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>{t("common.take_test", "Take Test")}</span>
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={lesson.id}
              id={`lesson-card-${lesson.id}`}
              onClick={() => handleSelectLesson(lesson)}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                      {lesson.level} • <AutoText as="span" text={lesson.category} context="grammar_category_label" />
                    </span>
                    {lesson.moduleNumber && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        Mod {lesson.moduleNumber}
                      </span>
                    )}
                  </div>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 size={13} /> {t("common.completed", "Completed")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <Zap size={13} className="fill-amber-400 text-amber-500" /> +{lesson.xpReward} XP
                    </span>
                  )}
                </div>

                {lesson.classicalChapterRef && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50/80 border border-amber-200/90 px-2.5 py-1 rounded-xl w-fit">
                    <BookOpen size={12} className="text-amber-600 shrink-0" />
                    <span>{lesson.classicalChapterRef}</span>
                  </div>
                )}

                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                  <AutoText as="span" text={lesson.title} context="grammar_lesson_title" />
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  <AutoText as="span" text={lesson.summary} context="grammar_lesson_summary" />
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {lesson.durationMins} mins
                </span>
                <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{t("common.start_lesson", "Start Lesson")}</span>
                  <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
