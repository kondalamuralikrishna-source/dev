import React, { useState, useEffect, useRef } from "react";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Zap,
  Lock,
  Unlock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Brain,
  TrendingUp,
  BookOpen,
  Volume2,
  Check,
  RotateCcw,
  Mic,
  MicOff,
  RefreshCw,
  MessageSquare,
  BarChart3,
  FileText,
  Clock,
  Activity,
  Headphones,
  Edit3,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  CEFRLevel,
  UserProgress,
  EndLevelSpeakingTask,
  EndLevelSpeakingEvaluation,
  LevelAssessmentReport,
} from "../types";
import { LEVEL_BENCHMARK_EXAMS, LevelBenchmarkExam } from "../data/assessmentData";
import { END_OF_LEVEL_SPEAKING_TASKS } from "../data/speakingAssessmentData";
import { AudioButton } from "./AudioButton";
import { createSpeechRecognizer, stopSpeaking } from "../utils/speechUtils";
import { getNextCEFRLevel, saveLevelAssessmentReport } from "../utils/storageUtils";

interface LevelAdvancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLevel: CEFRLevel;
  progress: UserProgress;
  onPassExam: (completedLevel: CEFRLevel, xpEarned: number, report?: LevelAssessmentReport) => void;
}

type ExamStage = "written" | "speaking" | "report";

export const LevelAdvancementModal: React.FC<LevelAdvancementModalProps> = ({
  isOpen,
  onClose,
  targetLevel,
  progress,
  onPassExam,
}) => {
  // Modal Stages: "written" -> "speaking" -> "report"
  const [stage, setStage] = useState<ExamStage>("written");

  // Phase 1: Written Questions State
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [writtenScorePercent, setWrittenScorePercent] = useState<number>(0);
  const [grammarScore, setGrammarScore] = useState<number>(0);
  const [vocabScore, setVocabScore] = useState<number>(0);
  const [practicalScore, setPracticalScore] = useState<number>(0);

  // Phase 2: Speaking Assessment State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>("");
  const [isEvaluatingSpeaking, setIsEvaluatingSpeaking] = useState<boolean>(false);
  const [speakingError, setSpeakingError] = useState<string | null>(null);
  const [speakingEvaluation, setSpeakingEvaluation] = useState<EndLevelSpeakingEvaluation | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);
  const [isManualEditMode, setIsManualEditMode] = useState<boolean>(false);

  // Audio visualization simulation
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Phase 3: Composite Graduation State
  const [isPassedOverall, setIsPassedOverall] = useState<boolean>(false);
  const [compositeScore, setCompositeScore] = useState<number>(0);
  const [finalReport, setFinalReport] = useState<LevelAssessmentReport | null>(null);

  const exam: LevelBenchmarkExam = LEVEL_BENCHMARK_EXAMS[targetLevel] || LEVEL_BENCHMARK_EXAMS.A1;
  const speakingTask: EndLevelSpeakingTask =
    END_OF_LEVEL_SPEAKING_TASKS[targetLevel] || END_OF_LEVEL_SPEAKING_TASKS.A1;
  const nextLevel = getNextCEFRLevel(targetLevel);

  const timerRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);
  const recognizerRef = useRef<any>(null);

  // Reset or initialize modal
  useEffect(() => {
    if (isOpen) {
      setStage("written");
      setCurrentStep(0);
      setAnswers({});
      setWrittenScorePercent(0);
      setGrammarScore(0);
      setVocabScore(0);
      setPracticalScore(0);
      setIsRecording(false);
      setRecordingSeconds(0);
      setTranscript("");
      setIsEvaluatingSpeaking(false);
      setSpeakingError(null);
      setSpeakingEvaluation(null);
      setShowModelAnswer(false);
      setIsManualEditMode(false);
      setIsPassedOverall(false);
      setCompositeScore(0);
      setFinalReport(null);
    }
    return () => {
      cleanupAudio();
    };
  }, [isOpen, targetLevel]);

  const cleanupAudio = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognizerRef.current = null;
    }
    stopSpeaking();
  };

  if (!isOpen) return null;

  const totalQuestions = exam.questions.length;
  const currentQuestion = exam.questions[currentStep];

  // =========================================================================
  // STAGE 1: WRITTEN BENCHMARK LOGIC
  // =========================================================================
  const handleSelectOption = (qId: string, optId: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleNextWrittenQuestion = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      evaluateWrittenBenchmark();
    }
  };

  const evaluateWrittenBenchmark = () => {
    let totalPoints = 0;
    let maxPoints = 0;
    let grammarCorrect = 0;
    let grammarTotal = 0;
    let vocabCorrect = 0;
    let vocabTotal = 0;
    let practicalCorrect = 0;
    let practicalTotal = 0;

    exam.questions.forEach((q) => {
      const selectedId = answers[q.id];
      const opt = q.options.find((o) => o.id === selectedId);
      const isCorrect = opt?.isCorrect ?? false;
      const weight = Math.max(...q.options.map((o) => o.levelScore || 1));
      maxPoints += weight;

      if (isCorrect && opt) {
        totalPoints += opt.levelScore || 1;
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

    const percent = Math.round((totalPoints / Math.max(1, maxPoints)) * 100);
    const gScore = grammarTotal > 0 ? Math.round((grammarCorrect / grammarTotal) * 100) : 100;
    const vScore = vocabTotal > 0 ? Math.round((vocabCorrect / vocabTotal) * 100) : 100;
    const pScore = practicalTotal > 0 ? Math.round((practicalCorrect / practicalTotal) * 100) : 100;

    setWrittenScorePercent(percent);
    setGrammarScore(gScore);
    setVocabScore(vScore);
    setPracticalScore(pScore);

    // Transition smoothly to Stage 2: Speaking Assessment Layer!
    setStage("speaking");
  };

  // =========================================================================
  // STAGE 2: LIVE SPEAKING ASSESSMENT LAYER LOGIC
  // =========================================================================
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setSpeakingError(null);
    setIsRecording(true);
    setRecordingSeconds(0);

    // Timer
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // Audio level visualizer wave
    audioIntervalRef.current = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 60) + 30);
    }, 120);

    // Web Speech Recognizer
    try {
      const recognizer = createSpeechRecognizer(
        (recognizedText: string) => {
          setTranscript((prev) => {
            // Append or update seamlessly
            const trimmed = recognizedText.trim();
            if (!prev) return trimmed;
            if (trimmed.startsWith(prev)) return trimmed;
            return `${prev} ${trimmed}`.trim();
          });
        },
        (err) => {
          console.warn("Speech recognition notice:", err);
          if (err === "not-allowed") {
            setSpeakingError(
              "Microphone permission was not granted. You can type or edit your spoken response in the text area below."
            );
          }
        },
        () => {
          // On speech end
        },
        "en-US",
        true // continuous mode
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
      } else {
        setSpeakingError(
          "Speech recognition is not natively supported in this browser environment. You can type your spoken answer directly."
        );
      }
    } catch (e: any) {
      console.warn("Speech recognition initialization fallback:", e);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    setAudioLevel(0);

    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognizerRef.current = null;
    }
  };

  const handleUseSampleScript = () => {
    setTranscript(speakingTask.modelSpokenSample);
    setRecordingSeconds(speakingTask.minimumSpeakingDurationSeconds + 10);
  };

  const handleSubmitSpeakingAssessment = async () => {
    if (isRecording) {
      stopRecording();
    }

    const trimmed = transcript.trim();
    if (!trimmed || trimmed.split(/\s+/).length < 5) {
      setSpeakingError(
        `Please record or provide at least 15 words addressing the prompt before submitting (Target: ${speakingTask.targetWordCount} words).`
      );
      return;
    }

    setIsEvaluatingSpeaking(true);
    setSpeakingError(null);

    try {
      const duration = recordingSeconds > 5 ? recordingSeconds : speakingTask.minimumSpeakingDurationSeconds;
      const res = await fetch("/api/assessment/end-of-level-speaking-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: targetLevel,
          nextLevel: nextLevel || targetLevel,
          taskPrompt: speakingTask.speakingPrompt,
          transcript: trimmed,
          durationSeconds: duration,
          baselineBand: progress.selectedLevel || "A1",
          targetKeywords: speakingTask.targetKeywords,
          passScore: speakingTask.passSpeakingScore,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to evaluate speaking assessment");
      }

      const evaluation: EndLevelSpeakingEvaluation = await res.json();
      setSpeakingEvaluation(evaluation);

      // Determine Composite Score & Unlocking Eligibility
      // Weighted 45% Written Benchmark + 55% Spoken Performance Layer
      const calcComposite = Math.round(
        writtenScorePercent * 0.45 + evaluation.spokenScore * 0.55
      );
      setCompositeScore(calcComposite);

      const isWrittenPassed = writtenScorePercent >= exam.passThresholdPercent;
      const isSpeakingPassed = evaluation.passedSpeaking;
      const passedBoth = isWrittenPassed && isSpeakingPassed;

      setIsPassedOverall(passedBoth);

      // Compile Full Assessment Report
      const report: LevelAssessmentReport = {
        level: targetLevel,
        nextLevel: nextLevel,
        completedAt: new Date().toISOString(),
        scorePercentage: calcComposite,
        writtenScorePercentage: writtenScorePercent,
        speakingEvaluation: evaluation,
        compositeScore: calcComposite,
        unlockedNextLevel: passedBoth,
        passThresholdPercent: exam.passThresholdPercent,
        passed: passedBoth,
        xpEarned: passedBoth ? exam.xpReward + 50 : 30,
        competencyBreakdown: {
          grammarAccuracy: Math.round((grammarScore + evaluation.metrics.grammarAccuracyScore) / 2),
          vocabularyDepth: Math.round((vocabScore + evaluation.metrics.lexicalRichnessScore) / 2),
          practicalDialogue: evaluation.metrics.taskCoherenceScore,
          situationalFluency: evaluation.metrics.fluencyScore,
        },
        improvementAnalysis: {
          baselineComparison: `Demonstrated a +${evaluation.improvementVsBaseline.overallGrowthDelta}% spoken and syntactic expansion over baseline tier ${evaluation.improvementVsBaseline.baselineBand}.`,
          keyGainsAchieved: [
            ...evaluation.improvementVsBaseline.keyGainsDemonstrated,
            `Written Benchmark Accuracy: ${writtenScorePercent}% across core syntactic items.`,
          ],
          strengthsIdentified: evaluation.strengths,
          weakAreasForRevision: evaluation.growthAreas,
          nextLevelReadinessNotes: passedBoth
            ? `Student has met both the theoretical benchmark and the authentic spoken fluency standard. Qualified to unlock Level ${nextLevel || "Mastery"}.`
            : `Student requires further oral practice and syntactic consolidation before unlocking Level ${nextLevel || "Mastery"}.`,
        },
      };

      setFinalReport(report);
      saveLevelAssessmentReport(report);

      if (passedBoth) {
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.55 },
        });
        onPassExam(targetLevel, report.xpEarned, report);
      }

      setStage("report");
    } catch (err: any) {
      console.error("Speaking evaluation failed:", err);
      setSpeakingError("Evaluation request timed out or encountered an issue. Please retry.");
    } finally {
      setIsEvaluatingSpeaking(false);
    }
  };

  const spokenWordsCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const matchedKeywords = speakingTask.targetKeywords.filter((kw) =>
    transcript.toLowerCase().includes(kw.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 relative my-auto text-left max-h-[92vh] overflow-y-auto">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md border border-amber-300/40">
                  Level {targetLevel} Graduation Assessment
                </span>
                <span className="text-xs text-slate-400 font-bold">•</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Unlocks Level {nextLevel || "Mastery"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {stage === "written" && "Phase 1: Syntactic & Lexical Benchmark"}
                {stage === "speaking" && "Phase 2: Live Spoken Performance & Improvement Layer"}
                {stage === "report" && "Phase 3: Level Graduation & Diagnostic Report"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Phase Stepper Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <div
            className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              stage === "written"
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                : writtenScorePercent > 0
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200"
            }`}
          >
            {writtenScorePercent > 0 ? <Check size={14} /> : <span>1</span>}
            <span className="truncate">1. Written Exam</span>
          </div>

          <div
            className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              stage === "speaking"
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                : speakingEvaluation
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200"
            }`}
          >
            {speakingEvaluation ? <Check size={14} /> : <Mic size={14} />}
            <span className="truncate">2. Speaking Layer</span>
          </div>

          <div
            className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              stage === "report"
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200"
            }`}
          >
            <BarChart3 size={14} />
            <span className="truncate">3. Unlock Verdict</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STAGE 1: WRITTEN BENCHMARK */}
        {/* ========================================================================= */}
        {stage === "written" && currentQuestion && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Stepper & Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200/50 uppercase text-[10px] font-black">
                    {currentQuestion.category}
                  </span>
                  <span>
                    Question {currentStep + 1} of {totalQuestions} • {currentQuestion.difficultyLabel}
                  </span>
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-black">
                  Pass Mark: {exam.passThresholdPercent}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {currentQuestion.question}
                </h3>
                <AudioButton text={currentQuestion.question} size="sm" variant="secondary" />
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                      className={`w-full p-3.5 sm:p-4 rounded-xl text-left font-medium text-xs sm:text-sm border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md shadow-amber-500/20"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:bg-amber-50/40 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center uppercase shrink-0 ${
                            isSelected
                              ? "bg-slate-900 text-amber-300"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={18} className="text-slate-950 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((p) => p - 1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={!answers[currentQuestion.id]}
                onClick={handleNextWrittenQuestion}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <span>
                  {currentStep === totalQuestions - 1
                    ? "Proceed to Speaking Assessment Layer"
                    : "Next Question"}
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: LIVE SPEAKING ASSESSMENT LAYER */}
        {/* ========================================================================= */}
        {stage === "speaking" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Written Score Notification */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-emerald-900 dark:text-emerald-200 font-bold">
                  Phase 1 Written Benchmark Completed:{" "}
                  <span className="font-black text-emerald-700 dark:text-emerald-300">
                    {writtenScorePercent}%
                  </span>
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Grammar: {grammarScore}% • Vocab: {vocabScore}%
              </span>
            </div>

            {/* Speaking Task Briefing Card */}
            <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/50">
                    Speaking Assessment Layer
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                    {speakingTask.taskTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Clock size={13} className="text-amber-500" />
                    <span>Min: {speakingTask.minimumSpeakingDurationSeconds}s</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span>Target: {speakingTask.targetWordCount} words</span>
                  </div>
                </div>
              </div>

              {/* Scenario Context */}
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Context / Roleplay Scenario:
                </span>
                {speakingTask.scenarioContext}
              </div>

              {/* Core Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Spoken Prompt:
                  </span>
                  <AudioButton text={speakingTask.speakingPrompt} size="sm" variant="secondary" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40 leading-relaxed">
                  "{speakingTask.speakingPrompt}"
                </p>
              </div>

              {/* Specific Sub-questions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                  Key Points to Address in Your Response:
                </span>
                <ul className="grid grid-cols-1 gap-1">
                  {speakingTask.keyQuestionsToAddress.map((q, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target Keywords with real-time detection */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-black uppercase text-slate-500 dark:text-slate-400">
                    Recommended Level {targetLevel} Collocations ({matchedKeywords.length}/
                    {speakingTask.targetKeywords.length} used):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {speakingTask.targetKeywords.map((kw) => {
                    const isUsed = transcript.toLowerCase().includes(kw.toLowerCase());
                    return (
                      <span
                        key={kw}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                          isUsed
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {isUsed && "✓ "}
                        {kw}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Native Model Reference Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowModelAnswer((p) => !p)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Headphones size={14} />
                  <span>{showModelAnswer ? "Hide Native Model Answer" : "Listen to Native Model Answer & IPA Guide"}</span>
                </button>

                {showModelAnswer && (
                  <div className="mt-2.5 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/50 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-indigo-900 dark:text-indigo-200">
                        Exemplary Spoken Script:
                      </span>
                      <AudioButton text={speakingTask.modelSpokenSample} size="sm" variant="primary" />
                    </div>
                    <p className="text-xs text-indigo-950 dark:text-indigo-100 italic leading-relaxed">
                      "{speakingTask.modelSpokenSample}"
                    </p>
                    {speakingTask.modelSampleIPA && (
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-mono">
                        IPA: {speakingTask.modelSampleIPA}
                      </p>
                    )}
                    {speakingTask.audioModelNotes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        💡 {speakingTask.audioModelNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Live Recording Studio */}
            <div className="p-5 sm:p-6 bg-slate-900 rounded-2xl text-white space-y-4 shadow-xl border border-slate-800 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                      High-Precision Voice Capture
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-200">
                    {isRecording ? "Listening to your spoken production..." : "Ready to Record Your Spoken Response"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-center font-mono text-xs font-bold text-amber-400">
                    {Math.floor(recordingSeconds / 60)}:
                    {(recordingSeconds % 60).toString().padStart(2, "0")}
                  </div>

                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] ${
                      isRecording
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 animate-pulse"
                        : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20"
                    }`}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                    <span>{isRecording ? "Stop Recording" : "Start Speaking"}</span>
                  </button>
                </div>
              </div>

              {/* Animated Soundwave Visualizer while recording */}
              {isRecording && (
                <div className="flex items-center justify-center gap-1.5 h-10 bg-slate-800/60 rounded-xl px-4 overflow-hidden border border-slate-700">
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-amber-400 rounded-full transition-all duration-100"
                      style={{
                        height: `${Math.max(4, Math.min(36, ((audioLevel + (i % 5) * 8) % 36)))}px`,
                        opacity: 0.7 + ((i % 3) * 0.1),
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Live Transcript Display / Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>Real-time Recognized Transcript:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsManualEditMode((p) => !p)}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>{isManualEditMode ? "Lock Transcript" : "Edit / Type Fallback"}</span>
                    </button>
                    <span>•</span>
                    <span className="text-slate-300 font-bold">
                      {spokenWordsCount} words recorded
                    </span>
                  </div>
                </div>

                {isManualEditMode ? (
                  <textarea
                    rows={4}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Type or refine your spoken response here..."
                    className="w-full p-3 bg-slate-800 text-slate-100 rounded-xl border border-slate-700 text-xs sm:text-sm font-sans focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                ) : (
                  <div className="min-h-[75px] max-h-[140px] overflow-y-auto p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                    {transcript ? (
                      <span>{transcript}</span>
                    ) : (
                      <span className="text-slate-500 italic">
                        Click "Start Speaking" and deliver your response aloud, or click "Edit / Type Fallback" to type your words.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Simulation Quick Fill for Testing / Convenience */}
              {!transcript && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>No mic available?</span>
                  <button
                    type="button"
                    onClick={handleUseSampleScript}
                    className="text-amber-400 hover:underline cursor-pointer font-bold"
                  >
                    Load Practice Response for Demonstration
                  </button>
                </div>
              )}
            </div>

            {/* Error Message if any */}
            {speakingError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{speakingError}</span>
              </div>
            )}

            {/* Navigation & Submit Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStage("written")}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Back to Written Questions</span>
              </button>

              <button
                type="button"
                disabled={isEvaluatingSpeaking || spokenWordsCount < 5}
                onClick={handleSubmitSpeakingAssessment}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                {isEvaluatingSpeaking ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Evaluating Speaking & Measuring Gains...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Analyze Graduation Improvement</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: LEVEL GRADUATION & IMPROVEMENT REPORT */}
        {/* ========================================================================= */}
        {stage === "report" && speakingEvaluation && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Top Score Banner */}
            <div
              className={`p-6 rounded-3xl text-white shadow-xl space-y-4 text-center sm:text-left ${
                isPassedOverall
                  ? "bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 border border-emerald-500/30"
                  : "bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border border-rose-500/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/15">
                    {isPassedOverall ? (
                      <Unlock size={14} className="text-amber-300" />
                    ) : (
                      <Lock size={14} className="text-rose-300" />
                    )}
                    <span>
                      {isPassedOverall
                        ? `CEFR Level ${nextLevel || targetLevel} Unlocked!`
                        : `Level ${nextLevel || targetLevel} Locked - Threshold Not Met`}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {isPassedOverall
                      ? `Congratulations! Level ${nextLevel || targetLevel} Course Material Unlocked`
                      : `Keep Practicing Level ${targetLevel} Speaking & Syntax`}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                    {isPassedOverall
                      ? `You satisfied both the written syntactic benchmark (${writtenScorePercent}%) and the spoken evaluation layer (${speakingEvaluation.spokenScore}%). Your full access to Level ${nextLevel || targetLevel} tutorials, quizzes, and stress tests is now unlocked!`
                      : `To unlock Level ${nextLevel || targetLevel}, students must pass both the written benchmark (min ${exam.passThresholdPercent}%) and the speaking assessment layer (min ${speakingTask.passSpeakingScore}%). Review your diagnostic breakdown below and retake the speaking assessment.`}
                  </p>
                </div>

                {/* Score Pill */}
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[140px] shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">
                    Composite Score
                  </span>
                  <span
                    className={`text-3xl font-black ${
                      isPassedOverall ? "text-amber-300" : "text-rose-300"
                    }`}
                  >
                    {compositeScore}%
                  </span>
                  <div className="text-[11px] text-slate-300 mt-1 font-medium">
                    Written: {writtenScorePercent}% • Spoken: {speakingEvaluation.spokenScore}%
                  </div>
                  {isPassedOverall && (
                    <span className="text-[11px] text-emerald-200 block mt-1 font-bold">
                      +{exam.xpReward + 50} XP Earned
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Dual Benchmark Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Written Benchmark Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Written Syntactic Benchmark</span>
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      writtenScorePercent >= exam.passThresholdPercent
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {writtenScorePercent}% (Pass: {exam.passThresholdPercent}%)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Grammar</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{grammarScore}%</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Vocab</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{vocabScore}%</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Context</span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">{practicalScore}%</span>
                  </div>
                </div>
              </div>

              {/* Speaking Assessment Layer Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Mic size={14} className="text-amber-500" />
                    <span>Spoken Performance Layer</span>
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      speakingEvaluation.passedSpeaking
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {speakingEvaluation.spokenScore}% (Pass: {speakingTask.passSpeakingScore}%)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Fluency</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {speakingEvaluation.metrics.fluencyScore}%
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Pronunciation</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {speakingEvaluation.metrics.pronunciationScore}%
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Coherence</span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                      {speakingEvaluation.metrics.taskCoherenceScore}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post-Assessment Spoken Improvement Analysis */}
            <div className="p-5 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                    Spoken Language Improvement vs. Entry Baseline
                  </h4>
                </div>
                <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2.5 py-0.5 rounded-lg">
                  +{speakingEvaluation.improvementVsBaseline.overallGrowthDelta}% Spoken Growth
                </span>
              </div>

              <p className="text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                {speakingEvaluation.detailedExaminerFeedback}
              </p>

              {/* Key Gains & Acoustic Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-950 dark:text-indigo-300 uppercase block">
                    Key Spoken Gains Demonstrated:
                  </span>
                  <ul className="space-y-1">
                    {speakingEvaluation.improvementVsBaseline.keyGainsDemonstrated.map((gain, i) => (
                      <li key={i} className="text-xs text-indigo-800 dark:text-indigo-200 flex items-start gap-1.5">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                        <span>{gain}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-950 dark:text-indigo-300 uppercase block">
                    Oral Delivery Metrics & Prosody Notes:
                  </span>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Speech Rate:</span>
                      <span className="font-bold">{speakingEvaluation.metrics.speechRateWpm} WPM</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Hesitation / Pause Count:</span>
                      <span className="font-bold">{speakingEvaluation.metrics.pauseCount} pauses</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                      💡 {speakingEvaluation.phoneticAndProsodyNotes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verbatim Transcript Preview with Audio */}
              <div className="pt-2 border-t border-indigo-200/50 dark:border-indigo-800/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase text-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                    <MessageSquare size={13} />
                    <span>Your Evaluated Spoken Words:</span>
                  </span>
                  <AudioButton text={speakingEvaluation.transcript} size="sm" variant="secondary" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900 italic">
                  "{speakingEvaluation.transcript}"
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              {!isPassedOverall ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setStage("speaking");
                      setTranscript("");
                      setRecordingSeconds(0);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Mic size={15} />
                    <span>Retake Spoken Assessment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStage("written");
                      setCurrentStep(0);
                      setAnswers({});
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={15} />
                    <span>Retake Written Benchmark</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={16} />
                  <span>CEFR Level {nextLevel || targetLevel} Course Material Unlocked!</span>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <span>
                  {isPassedOverall
                    ? `Proceed to Level ${nextLevel || targetLevel} Course Portal`
                    : "Close & Review Level Lessons"}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
