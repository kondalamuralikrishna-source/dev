import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Zap,
  Mic,
  MicOff,
  Clock,
  Lock,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  HelpCircle,
  Layers,
  ArrowRight,
  Radio,
  Sliders,
  Send,
  Loader2,
  Ear,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  CEFRLevel,
  StressScenario,
  StressSpeakingEvaluation,
  StressTestHistoryItem,
  UserProgress,
} from "../types";
import { STRESS_SCENARIOS } from "../data/stressScenariosData";
import { soundFx } from "../utils/soundSynthesizer";
import { AudioButton } from "./AudioButton";
import { createSpeechRecognizer } from "../utils/speechUtils";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { AutoText, useAutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";
import { useEffectiveTier, FREE_TIER_SCENARIO_LIMIT } from "../utils/useEffectiveTier";
import { ScenarioLockOverlay } from "./ScenarioLockOverlay";

interface StressSpeakingStudioProps {
  progress: UserProgress;
  onGrantXp: (amount: number) => void;
  onRecordStressResult: (item: StressTestHistoryItem, xp: number) => void;
  onOpenPricing?: () => void;
}

export const StressSpeakingStudio: React.FC<StressSpeakingStudioProps> = ({
  progress,
  onGrantXp,
  onRecordStressResult,
  onOpenPricing,
}) => {
  const { tier } = useEffectiveTier();
  // Navigation & selection
  const [selectedScenario, setSelectedScenario] = useState<StressScenario>(
    STRESS_SCENARIOS[0]
  );
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");
  
  // Custom scenario generator modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [customLevel, setCustomLevel] = useState<CEFRLevel>(progress.selectedLevel || "B1");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customGenError, setCustomGenError] = useState<string | null>(null);

  // Active Test Engine States
  const [stage, setStage] = useState<"briefing" | "active" | "evaluating" | "results">("briefing");
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ambientSoundType, setAmbientSoundType] = useState<"silent" | "airport" | "office" | "emergency">("silent");
  const [surpriseTriggered, setSurpriseTriggered] = useState<boolean>(false);

  // Recording and Text Input
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [manualText, setManualText] = useState<string>("");
  const [inputMode, setInputMode] = useState<"mic" | "text">("mic");
  
  // Evaluation Result
  const [evaluation, setEvaluation] = useState<StressSpeakingEvaluation | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const recognizerRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const categories = [
    "All",
    "Emergency & Medical",
    "Workplace & Executive Crisis",
    "Travel & Border Control",
    "High-Stakes Negotiation",
    "Customer Conflict",
    "Public Speaking & Media",
  ];

  const filteredScenarios =
    activeCategoryFilter === "All"
      ? STRESS_SCENARIOS
      : STRESS_SCENARIOS.filter((s) => s.category === activeCategoryFilter);

  // Clean up sounds on unmount
  useEffect(() => {
    return () => {
      soundFx.cleanup();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognizerRef.current) recognizerRef.current.stop();
    };
  }, []);

  // Handle Scenario Change
  const handleSelectScenario = (scenario: StressScenario) => {
    soundFx.cleanup();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognizerRef.current) recognizerRef.current.stop();
    
    setSelectedScenario(scenario);
    setStage("briefing");
    setTimeLeft(scenario.timeLimitSeconds);
    setElapsedTime(0);
    setSurpriseTriggered(false);
    setLiveTranscript("");
    setManualText("");
    setEvaluation(null);
  };

  // Toggle Sound FX
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  };

  // Start the High-Pressure Simulation
  const handleStartStressTest = () => {
    setStage("active");
    setTimeLeft(selectedScenario.timeLimitSeconds);
    setElapsedTime(0);
    setSurpriseTriggered(false);
    setLiveTranscript("");
    setManualText("");
    setEvaluation(null);
    setEvalError(null);

    // Start audio stress effects
    soundFx.startHeartbeat(75);
    if (ambientSoundType !== "silent") {
      soundFx.startAmbientNoise(ambientSoundType);
    }

    // Start speech recognition if mic mode
    if (inputMode === "mic") {
      startSpeechRecognition();
    }

    // Start countdown timer
    const totalTime = selectedScenario.timeLimitSeconds;
    let currentSeconds = totalTime;
    let elapsed = 0;

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      currentSeconds -= 1;
      elapsed += 1;
      setTimeLeft(currentSeconds);
      setElapsedTime(elapsed);

      // Accelerate heartbeat BPM under 15 seconds
      if (currentSeconds <= 10) {
        soundFx.updateHeartbeatBpm(135);
        soundFx.playClockTick(true);
      } else if (currentSeconds <= 20) {
        soundFx.updateHeartbeatBpm(105);
        soundFx.playClockTick(false);
      }

      // Check surprise interruption trigger
      if (
        selectedScenario.surpriseInterruption &&
        currentSeconds === selectedScenario.surpriseInterruption.triggerAtSecondsRemaining
      ) {
        setSurpriseTriggered(true);
        soundFx.playSurpriseInterruptionAlert();
      }

      // Time expired
      if (currentSeconds <= 0) {
        clearInterval(timerIntervalRef.current);
        soundFx.playTimeExpiredBuzzer();
        soundFx.stopHeartbeat();
        soundFx.stopAmbient();
        if (recognizerRef.current) {
          recognizerRef.current.stop();
        }
        setIsRecording(false);
        finishAndEvaluate(elapsed);
      }
    }, 1000);
  };

  // Start Web Speech API
  const startSpeechRecognition = () => {
    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
      },
      (err) => {
        console.warn("Speech mic error:", err);
      },
      () => {
        // Auto restart if still in active stage
        if (stage === "active" && isRecording) {
          try {
            recognizer.start();
          } catch (e) {}
        }
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Failed to start recognizer:", e);
      }
    }
  };

  // Early finish by user
  const handleEarlySubmit = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    soundFx.stopHeartbeat();
    soundFx.stopAmbient();
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsRecording(false);
    finishAndEvaluate(elapsedTime);
  };

  // Abort test
  const handleAbortTest = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    soundFx.cleanup();
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsRecording(false);
    setStage("briefing");
    setTimeLeft(selectedScenario.timeLimitSeconds);
    setElapsedTime(0);
    setSurpriseTriggered(false);
  };

  // Finish and trigger Gemini evaluation
  const finishAndEvaluate = async (usedSeconds: number) => {
    setStage("evaluating");
    const spokenContent =
      inputMode === "mic"
        ? liveTranscript.trim()
        : manualText.trim();

    if (!spokenContent) {
      setEvalError(
        t("stress.no_speech_detected", "No speech or text was detected during the time limit. Try speaking clearly into your microphone or switch to text mode.")
      );
      setStage("results");
      return;
    }

    try {
      const response = await fetch("/api/gemini/stress-speaking-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioTitle: selectedScenario.title,
          scenarioCategory: selectedScenario.category,
          level: selectedScenario.level,
          interlocutorRole: selectedScenario.interlocutorRole,
          briefing: selectedScenario.briefing,
          spokenTranscript: spokenContent,
          timeLimitSeconds: selectedScenario.timeLimitSeconds,
          elapsedSeconds: Math.max(1, usedSeconds),
          requiredStructures: selectedScenario.requiredTargetStructures,
        }),
      });

      if (!response.ok) {
        throw new Error("Evaluation request failed");
      }

      const evalData: StressSpeakingEvaluation = await response.json();
      setEvaluation(evalData);
      setStage("results");

      // Gamification & XP
      const xpEarned = Math.round((evalData.overallScore / 100) * 60) + 15;
      onGrantXp(xpEarned);

      // Record to history
      const historyItem: StressTestHistoryItem = {
        id: `stress_rec_${Date.now()}`,
        scenarioId: selectedScenario.id,
        scenarioTitle: selectedScenario.title,
        timestamp: Date.now(),
        score: evalData.overallScore,
        stressGrade: evalData.stressGrade,
        wpm: evalData.wpm,
        fillerCount: evalData.fillerWordTotal,
      };
      onRecordStressResult(historyItem, xpEarned);

      // Confetti for score >= 75
      if (evalData.overallScore >= 75) {
        soundFx.playCelebrationChime();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      console.error("Stress evaluation error:", err);
      setEvalError(t("stress.eval_connection_error", "Could not connect to AI evaluation. Please try again."));
      setStage("results");
    }
  };

  // Generate dynamic custom scenario via Gemini
  const handleGenerateCustomScenario = async () => {
    if (!customTopic.trim()) return;
    try {
      setIsGeneratingCustom(true);
      setCustomGenError(null);
      const authToken = localStorage.getItem("auth_token");
      const response = await fetch("/api/gemini/generate-stress-scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          topic: customTopic,
          level: customLevel,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to generate scenario");
      }
      const newScenario: StressScenario = await response.json();
      setSelectedScenario(newScenario);
      setShowCustomModal(false);
      setCustomTopic("");
      setCustomGenError(null);
      handleSelectScenario(newScenario);
    } catch (e) {
      console.error("Custom scenario generation error:", e);
      setCustomGenError(t("stress.custom_gen_error", "Failed to generate custom scenario. Please try a different topic or check connection."));
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Percentage of timer remaining
  const timePercent = Math.round((timeLeft / selectedScenario.timeLimitSeconds) * 100);
  const isTimeCritical = timeLeft <= 10;
  const isTimeWarning = timeLeft <= 20 && !isTimeCritical;
  const { t } = useTranslation();
  const translatedScenarioBriefing = useAutoText(selectedScenario.briefing, "stress_scenario_briefing");
  const translatedInterlocutorRole = useAutoText(selectedScenario.interlocutorRole, "stress_interlocutor_role");
  const translatedComposureBadge = useAutoText(evaluation?.composureBadge, "stress_composure_badge");
  const translatedStressGrade = useAutoText(evaluation?.stressGrade, "stress_grade");
  const translatedIntonationFeedback = useAutoText(evaluation?.intonationFeedback, "stress_intonation_feedback");
  const translatedCalmModelExplanation = useAutoText(evaluation?.calmModelExplanation, "stress_calm_model_explanation");

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Module Header Guide */}
      <ModuleHeaderGuide
        moduleTitle="Speaking Stress Test & Adrenaline Coach"
        moduleCategory="Pressure Simulation"
        estimatedTime="3–6 min per simulation"
        difficulty="High Stakes & Timed"
        themeColor="rose"
        steps={[
          {
            title: "Select Pressure Scenario",
            instruction: "Choose from high-stakes simulations (e.g. Boardroom Defense, Hostile Media, Emergency Call, Unexpected Tech Outage).",
            tip: "Review the crisis brief and key pressure variables before hitting start.",
          },
          {
            title: "Deliver Under Real-Time Stress Audio",
            instruction: "Hit 'Start Stress Challenge' and speak into your mic while the heartbeat audio and countdown timer tick.",
            tip: "Focus on slow, deliberate articulation to resist panic rushes.",
          },
          {
            title: "Manage Mid-Speech Curveball Interruptions",
            instruction: "Handle unexpected crisis injects by maintaining poise, diplomatic tone, and clear logic.",
            tip: "Use bridging phrases like 'That is a critical point; let us address that directly...'",
          },
          {
            title: "Inspect Adrenaline Breakdown Matrix",
            instruction: "Analyze your 5-axis composure score, filler word count, grammatical stability, and earn up to +100 XP.",
            tip: "Scores ≥80% earn high-resilience badges for your portfolio.",
          },
        ]}
        completionGoal="Complete the crisis countdown response and pass the 5-axis composure evaluation."
        xpReward={75}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 border border-rose-400/30 rounded-full text-rose-300 text-xs font-bold tracking-wide">
              <ShieldAlert size={14} className="text-rose-400 animate-pulse" />
              <span>{t("stress.simulator_badge", "Crisis Speaking Simulator • Real-Time Pressure")}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t("stress.hero_title", "Speaking Stress Test & Adrenaline Coach")}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t("stress.hero_subtitle", "Master the art of articulate English speech under extreme pressure. Overcome panic freezes, maintain grammatical precision, eliminate filler words, and project unshakeable executive composure.")}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold bg-white/10 px-3 py-1 rounded-lg">
                <Clock size={14} /> {t("stress.countdown_timer", "Countdown Timer")}
              </span>
              <span className="flex items-center gap-1.5 text-rose-300 font-semibold bg-white/10 px-3 py-1 rounded-lg">
                <Activity size={14} /> {t("stress.synthesized_heartbeat", "Synthesized Heartbeat Audio")}
              </span>
              <span className="flex items-center gap-1.5 text-indigo-300 font-semibold bg-white/10 px-3 py-1 rounded-lg">
                <Sparkles size={14} /> {t("stress.gemini_diagnostic", "Gemini 5-Axis Diagnostic")}
              </span>
            </div>
          </div>

          {/* Action & Audio settings */}
          <div className="flex flex-col gap-3">
            <button
              id="btn-custom-scenario-modal"
              type="button"
              onClick={() => {
                // Custom Scenario Builder is Pro-only per the board doc's tier matrix -- Free,
                // Plus, and Sachet all get the fixed scenario library, not the AI generator.
                if (tier !== "pro") {
                  onOpenPricing?.();
                  return;
                }
                setShowCustomModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Sparkles size={15} />
              <span>{t("stress.create_custom_crisis", "Create AI Custom Crisis")}</span>
              {tier !== "pro" && <Lock size={12} className="ml-0.5" />}
            </button>

            <div className="flex items-center justify-between gap-2 p-2 bg-white/10 rounded-xl border border-white/15 text-xs">
              <span className="text-slate-300 font-medium">{t("stress.sound_effects_label", "Sound Effects:")}</span>
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors ${
                  isMuted ? "bg-rose-500/30 text-rose-300" : "bg-emerald-500/30 text-emerald-300"
                }`}
                title={isMuted ? t("stress.unmute_title", "Unmute sound effects") : t("stress.mute_title", "Mute heartbeat and ticks")}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isMuted ? t("stress.muted", "Muted") : t("stress.active", "Active")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Scenario Browser & Right Active Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Scenario Selector & Filter */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" />
                <span>{t("stress.crisis_situations", "Crisis Situations")} ({STRESS_SCENARIOS.length})</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                {t("stress.pick_scenario", "Pick Scenario")}
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    activeCategoryFilter === cat
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat === "All" ? t("stress.all_situations", "All Situations") : <AutoText as="span" text={cat.split(" ")[0]} context="stress_category_short" />}
                </button>
              ))}
            </div>

            {/* Scenario Card List */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredScenarios.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                const isCritical = sc.urgencyLevel === "Critical";
                const isExtreme = sc.urgencyLevel === "Extreme";
                const overallIdx = STRESS_SCENARIOS.findIndex((s) => s.id === sc.id);
                const isLocked = tier === "free" && overallIdx >= FREE_TIER_SCENARIO_LIMIT;

                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      if (isLocked) return;
                      handleSelectScenario(sc);
                    }}
                    className={`relative p-3.5 rounded-xl border transition-all space-y-2 ${
                      isLocked ? "cursor-default" : "cursor-pointer"
                    } ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 shadow-xs"
                        : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/70"
                    }`}
                  >
                    {isLocked && <ScenarioLockOverlay onUpgradeClick={onOpenPricing} />}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                          isCritical
                            ? "bg-rose-100 text-rose-800"
                            : isExtreme
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {sc.urgencyLevel} {t("stress.stakes_suffix", "Stakes")}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Clock size={12} />
                        <span>{sc.timeLimitSeconds}s</span>
                        <span className="font-bold text-indigo-700 bg-indigo-100/70 px-1 rounded">
                          {sc.level}
                        </span>
                      </div>
                    </div>

                    <h4
                      className={`text-xs font-bold line-clamp-1 ${
                        isSelected ? "text-indigo-950" : "text-slate-900"
                      }`}
                    >
                      <AutoText as="span" text={sc.title} context="stress_scenario_title" />
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      <AutoText as="span" text={sc.stressorType} context="stress_scenario_stressor_type" />
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats on Completed Stress Tests */}
          {progress.stressTestsCompleted && progress.stressTestsCompleted.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>{t("stress.recent_drills", "Recent Stress Drills")}</span>
                <span className="text-[11px] text-indigo-600 font-semibold">
                  {progress.stressTestsCompleted.length} {t("common.completed", "Completed")}
                </span>
              </h4>
              <div className="space-y-2">
                {progress.stressTestsCompleted.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[170px]">
                      <span className="font-bold text-slate-800 block truncate">
                        <AutoText as="span" text={item.scenarioTitle} context="stress_scenario_title" />
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.stressGrade} • {item.wpm} WPM
                      </span>
                    </div>
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded ${
                        item.score >= 80
                          ? "bg-emerald-100 text-emerald-800"
                          : item.score >= 65
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {item.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (8 cols): The Active Simulation Arena */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. BRIEFING STAGE */}
          {stage === "briefing" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      <AutoText as="span" text={selectedScenario.category} context="stress_category" />
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {t("common.level", "Level")} {selectedScenario.level}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    <AutoText as="span" text={selectedScenario.title} context="stress_scenario_title" />
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      {t("stress.pressure_limit", "Pressure Limit")}
                    </span>
                    <span className="text-xl font-black text-rose-600 flex items-center gap-1 justify-end">
                      <Clock size={18} />
                      {selectedScenario.timeLimitSeconds}s
                    </span>
                  </div>
                </div>
              </div>

              {/* High-Stakes Briefing Context */}
              <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                    {t("stress.emergency_briefing", "Emergency Situation Briefing")}
                  </span>
                  <span className="text-xs text-rose-300 font-bold flex items-center gap-1">
                    <AlertTriangle size={14} /> {selectedScenario.urgencyLevel} {t("stress.urgency_suffix", "Urgency")}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {translatedScenarioBriefing}
                </p>
              </div>

              {/* Interlocutor Confrontation Prompt with Native Audio */}
              <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert size={15} className="text-rose-600" />
                    <span>{t("stress.confronting_role", "Confronting Role:")} {translatedInterlocutorRole}</span>
                  </span>
                  <AudioButton
                    text={selectedScenario.interlocutorVoicePrompt}
                    size="sm"
                    variant="primary"
                    label={t("stress.listen_prompt", "Listen Prompt")}
                  />
                </div>
                <p className="text-base font-bold text-rose-950 italic">
                  "{selectedScenario.interlocutorVoicePrompt}"
                </p>
              </div>

              {/* Target Grammar & Vocabulary Checkpoints */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Award size={15} className="text-indigo-600" />
                  <span>{t("stress.required_structures", "Required Target Structures to Include Under Pressure:")}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedScenario.requiredTargetStructures.map((struct, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs font-semibold text-indigo-900 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <AutoText as="span" text={struct} context="stress_required_structure" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation Environment Settings & Mode Select */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t("stress.input_method_label", "Input Method:")}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode("mic")}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                        inputMode === "mic"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Mic size={14} />
                      <span>{t("stress.live_voice_mic", "Live Voice Mic (Recommended)")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("text")}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                        inputMode === "text"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Send size={14} />
                      <span>{t("stress.keyboard_input", "Keyboard Input")}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t("stress.ambient_tension_label", "Ambient Background Tension:")}
                  </label>
                  <select
                    value={ambientSoundType}
                    onChange={(e) => setAmbientSoundType(e.target.value as any)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="silent">{t("stress.ambient_silent", "Silent (No ambient noise)")}</option>
                    <option value="airport">{t("stress.ambient_airport", "Airport Terminal Background")}</option>
                    <option value="office">{t("stress.ambient_office", "Executive Boardroom Murmurs")}</option>
                    <option value="emergency">{t("stress.ambient_emergency", "Emergency Sirens / High Urgency")}</option>
                  </select>
                </div>
              </div>

              {/* Start Simulation Launch Button */}
              <div className="pt-4 flex justify-end">
                <button
                  id="btn-launch-stress-test"
                  type="button"
                  onClick={handleStartStressTest}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Flame size={20} className="fill-amber-300 text-amber-300" />
                  <span>{t("stress.start_stress_test", "Start Stress Test")} ({selectedScenario.timeLimitSeconds}s)</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* 2. ACTIVE STRESS DRILL ARENA */}
          {stage === "active" && (
            <div
              className={`rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all space-y-6 ${
                isTimeCritical
                  ? "bg-gradient-to-br from-rose-950 via-slate-950 to-rose-900 border-rose-500/80 shadow-rose-500/20 animate-pulse"
                  : isTimeWarning
                  ? "bg-gradient-to-br from-amber-950 via-slate-900 to-indigo-950 border-amber-500/60 shadow-amber-500/10"
                  : "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-slate-700"
              } text-white`}
            >
              {/* Top Countdown Bar & Interlocutor header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Activity size={14} className="animate-spin text-rose-400" />
                    <span>{t("stress.rapid_drill_active", "RAPID DRILL ACTIVE")} • {translatedInterlocutorRole}</span>
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    "{selectedScenario.interlocutorVoicePrompt}"
                  </h3>
                </div>

                {/* Pulsing Timer Circle */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-full border-4 shadow-lg transition-all ${
                      isTimeCritical
                        ? "border-rose-500 bg-rose-600/30 text-rose-300 scale-110"
                        : isTimeWarning
                        ? "border-amber-400 bg-amber-500/30 text-amber-300"
                        : "border-indigo-400 bg-indigo-600/30 text-indigo-200"
                    }`}
                  >
                    <span className="text-2xl font-black font-mono">
                      {timeLeft}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Sudden Mid-Speech Surprise Interruption Alert Banner */}
              {surpriseTriggered && selectedScenario.surpriseInterruption && (
                <div className="p-4 bg-rose-600/90 border-2 border-rose-300 rounded-2xl text-white shadow-lg animate-bounce space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <AlertTriangle size={16} /> {t("stress.surprise_interrupt", "SURPRISE INTERRUPT!")}
                    </span>
                    <span className="text-[11px] font-bold bg-black/40 px-2 py-0.5 rounded">
                      {t("stress.answer_directly", "Answer directly!")}
                    </span>
                  </div>
                  <p className="text-sm font-black text-white">
                    <AutoText as="span" text={selectedScenario.surpriseInterruption.message} context="stress_surprise_message" />
                  </p>
                </div>
              )}

              {/* Audio Waveform / Live Speech Feedback Display */}
              {inputMode === "mic" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-indigo-200 font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      {t("stress.listening_transcript", "Listening to speech transcript...")}
                    </span>
                    <span>{t("stress.speak_steady_volume", "Speak clearly with steady volume")}</span>
                  </div>

                  <div className="min-h-[120px] p-5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md flex flex-col justify-between">
                    <p className="text-base font-bold text-white leading-relaxed">
                      {liveTranscript || (
                        <span className="text-slate-400 italic font-normal">
                          {t("stress.start_speaking_hint", "Start speaking into your microphone immediately... Speak in complete sentences!")}
                        </span>
                      )}
                    </p>

                    {/* Visualizer bars */}
                    <div className="flex items-center gap-1 pt-4">
                      {[...Array(16)].map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-rose-500 to-amber-400 rounded-full transition-all duration-150"
                          style={{
                            height: liveTranscript
                              ? `${Math.max(6, Math.sin((i + Date.now() / 200) * 1.5) * 24 + 14)}px`
                              : "6px",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-bold block">
                    {t("stress.type_response_label", "Type your crisis response before time runs out:")}
                  </label>
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder={t("stress.type_response_placeholder", "Type your rapid response here under pressure...")}
                    autoFocus
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white text-base focus:ring-2 focus:ring-amber-400 focus:outline-none placeholder-slate-400"
                  />
                </div>
              )}

              {/* Target check reminder pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="text-slate-400 font-bold">{t("stress.remember_to_include", "Remember to include:")}</span>
                {selectedScenario.requiredTargetStructures.map((st, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white/10 rounded-lg text-indigo-200 border border-white/10 text-[11px]"
                  >
                    ✓ <AutoText as="span" text={st.slice(0, 32)} context="stress_required_structure" />...
                  </span>
                ))}
              </div>

              {/* Bottom Actions: Submit Early or Abort */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleAbortTest}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  {t("stress.cancel_abort", "Cancel / Abort")}
                </button>

                <button
                  type="button"
                  onClick={handleEarlySubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 size={16} />
                  <span>{t("stress.done_speaking_submit", "Done Speaking (Submit Early)")}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. EVALUATING LOADING SPINNER */}
          {stage === "evaluating" && (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm animate-in fade-in">
              <Loader2 size={40} className="animate-spin text-rose-600 mx-auto" />
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">
                  {t("stress.analyzing_metrics", "Analyzing Stress Speech Metrics...")}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t("stress.analyzing_metrics_desc", "Gemini is calculating Words Per Minute (WPM), pinpointing stress-induced grammar slips, evaluating phonetic clarity, and grading tactical crisis resolution.")}
                </p>
              </div>
            </div>
          )}

          {/* 4. IN-DEPTH SCORECARD & DIAGNOSTIC RESULTS */}
          {stage === "results" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {evalError ? (
                <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200 text-center space-y-3">
                  <AlertCircle size={32} className="text-rose-600 mx-auto" />
                  <h3 className="font-bold text-rose-900 text-base">{evalError}</h3>
                  <button
                    type="button"
                    onClick={() => setStage("briefing")}
                    className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl"
                  >
                    {t("stress.try_again", "Try Again")}
                  </button>
                </div>
              ) : evaluation ? (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
                  {/* Top Score Banner */}
                  <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-rose-500/30 border border-rose-400/40 text-rose-300 text-xs font-bold rounded-full">
                          {translatedComposureBadge}
                        </span>
                        <span className="text-xs text-indigo-300 font-mono">
                          <AutoText as="span" text={selectedScenario.title} context="stress_scenario_title" />
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {translatedStressGrade}
                      </h2>
                      <p className="text-xs text-slate-300">
                        {evaluation.overallScore >= 80
                          ? t("stress.result_outstanding", "🔥 Outstanding composure! You maintained syntactic integrity and native-level fluency under pressure.")
                          : evaluation.overallScore >= 65
                          ? t("stress.result_strong_effort", "👍 Strong effort! Effective resolution with minor stress slips in verb inflections and cadence.")
                          : t("stress.result_minor_hesitations", "🎯 Adrenaline caused minor hesitations. Study the tactical survival tips below.")}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center p-3 bg-white/10 rounded-xl border border-white/15">
                        <span className="text-[10px] uppercase font-bold text-slate-300 block">
                          {t("stress.stress_score", "Stress Score")}
                        </span>
                        <span className="text-3xl font-black text-amber-400">
                          {evaluation.overallScore}%
                        </span>
                      </div>

                      <div className="text-center p-3 bg-white/10 rounded-xl border border-white/15">
                        <span className="text-[10px] uppercase font-bold text-slate-300 block">
                          {t("stress.cadence_wpm", "Cadence (WPM)")}
                        </span>
                        <span className="text-2xl font-black text-white font-mono">
                          {evaluation.wpm}
                        </span>
                        <span className="text-[10px] text-indigo-300 block">
                          <AutoText as="span" text={evaluation.wpmStatus.split(" ")[0]} context="stress_wpm_status" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Key Metric Gauges: Grammar, Pronunciation, Crisis Resolution */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 space-y-1">
                      <span className="text-xs uppercase font-bold text-indigo-700 tracking-wider block">
                        {t("stress.grammar_accuracy", "Grammar Accuracy")}
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-indigo-950">
                          {evaluation.grammarScore}%
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600">
                          {evaluation.grammarMistakes.length} {t("stress.slips_noted", "slips noted")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600"
                          style={{ width: `${evaluation.grammarScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-100 space-y-1">
                      <span className="text-xs uppercase font-bold text-rose-700 tracking-wider block">
                        {t("stress.phonetic_clarity", "Phonetic Clarity")}
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-rose-950">
                          {evaluation.pronunciationScore}%
                        </span>
                        <span className="text-[11px] font-bold text-rose-600">
                          {evaluation.pronunciationIssues.length} {t("stress.words_flagged", "words flagged")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-rose-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-600"
                          style={{ width: `${evaluation.pronunciationScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 space-y-1">
                      <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider block">
                        {t("stress.crisis_resolution", "Crisis Resolution")}
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-emerald-950">
                          {evaluation.crisisResolutionScore}%
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">
                          {evaluation.fillerWordTotal} {t("stress.filler_words", "filler words")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600"
                          style={{ width: `${evaluation.crisisResolutionScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1. Grammar Under Pressure Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers size={16} className="text-indigo-600" />
                      <span>{t("stress.grammar_breakdown_title", "Grammar Under Pressure Breakdown")}</span>
                    </h3>

                    {evaluation.grammarMistakes.length === 0 ? (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>{t("stress.flawless_grammar", "Flawless grammar! No tense or agreement slips detected even under severe time constraints.")}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {evaluation.grammarMistakes.map((slip, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="line-through text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                "{slip.original}"
                              </span>
                              <ArrowRight size={14} className="text-slate-400" />
                              <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                "{slip.correction}"
                              </span>
                            </div>
                            <p className="text-slate-700 font-medium leading-relaxed">
                              <AutoText as="span" text={slip.reason} context="stress_grammar_reason" />
                            </p>
                            <p className="text-[11px] text-indigo-700 italic">
                              💡 {t("stress.stress_factor_label", "Stress factor:")} <AutoText as="span" text={slip.stressFactor} context="stress_factor" />
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Phonetic Pronunciation & Syllable Clarity */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Ear size={16} className="text-rose-600" />
                      <span>{t("stress.pronunciation_clarity_title", "Pronunciation Clarity & Slurred Words")}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {evaluation.pronunciationIssues.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-rose-950 text-sm">
                              {item.word}
                            </span>
                            <span className="font-mono text-indigo-700 font-bold">
                              {item.ipa}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium">
                            ⚠️ <AutoText as="span" text={item.spokenIssue} context="stress_spoken_issue" />
                          </p>
                          <p className="text-[11px] text-rose-900 font-semibold pt-1">
                            🎯 {t("stress.coaching_label", "Coaching:")} <AutoText as="span" text={item.coachingTip} context="stress_coaching_tip" />
                          </p>
                        </div>
                      ))}
                    </div>

                    {evaluation.intonationFeedback && (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900 block uppercase text-[10px] tracking-wider text-indigo-700">
                          {t("stress.pitch_intonation_title", "Pitch & Intonation Contour")}
                        </span>
                        <p>{translatedIntonationFeedback}</p>
                      </div>
                    )}
                  </div>

                  {/* 3. Calm Model Native Response with Audio Playback */}
                  <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl text-white space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Sparkles size={14} /> {t("stress.calm_model_title", "Masterful Calm Native Response")}
                      </span>
                      <AudioButton
                        text={evaluation.calmModelResponse}
                        size="sm"
                        variant="secondary"
                        label={t("stress.listen_model_answer", "Listen Model Answer")}
                      />
                    </div>
                    <p className="text-sm font-semibold text-indigo-100 leading-relaxed italic">
                      "{evaluation.calmModelResponse}"
                    </p>
                    <p className="text-xs text-slate-300 pt-1 border-t border-white/10">
                      💡 {t("stress.strategy_label", "Strategy:")} {translatedCalmModelExplanation}
                    </p>
                  </div>

                  {/* 4. 3 Tactical Speaking Survival Hacks */}
                  <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
                    <span className="text-xs uppercase font-bold text-amber-900 tracking-wider flex items-center gap-1.5">
                      <Zap size={15} className="text-amber-600 fill-amber-600" />
                      <span>{t("stress.survival_hacks_title", "3 Tactical Speaking Hacks for This Scenario:")}</span>
                    </span>
                    <ul className="space-y-1 text-xs text-amber-950 font-medium list-disc list-inside">
                      {evaluation.survivalHacks.map((hack, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <AutoText as="span" text={hack} context="stress_survival_hack" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom Try Again & Next Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStage("briefing")}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw size={14} />
                      <span>{t("stress.retry_scenario", "Retry Scenario")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const nextIdx =
                          (STRESS_SCENARIOS.findIndex((s) => s.id === selectedScenario.id) + 1) %
                          STRESS_SCENARIOS.length;
                        if (tier === "free" && nextIdx >= FREE_TIER_SCENARIO_LIMIT) {
                          onOpenPricing?.();
                          return;
                        }
                        handleSelectScenario(STRESS_SCENARIOS[nextIdx]);
                      }}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>{t("stress.next_crisis_challenge", "Next Crisis Challenge")}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* AI Custom Scenario Generator Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                <h3 className="font-black text-slate-900 text-lg">
                  {t("stress.generate_custom_crisis_title", "Generate Custom High-Stress Crisis")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {t("stress.generate_custom_crisis_desc", "Describe any high-pressure situation you want to conquer (e.g. salary negotiation with strict CEO, medical emergency abroad, product recall, hostile press question).")}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t("stress.crisis_topic_label", "Crisis Topic / Scenario:")}
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder={t("stress.crisis_topic_placeholder", "e.g. Defending missed quarterly revenue to angry investors")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t("quiz.target_cefr_label", "Target CEFR Level:")}
                </label>
                <select
                  value={customLevel}
                  onChange={(e) => setCustomLevel(e.target.value as CEFRLevel)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="A2">{t("stress.level_a2_option", "Level A2 (Elementary Emergency)")}</option>
                  <option value="B1">{t("stress.level_b1_option", "Level B1 (Intermediate Practical)")}</option>
                  <option value="B2">{t("stress.level_b2_option", "Level B2 (Upper-Intermediate Professional)")}</option>
                  <option value="C1">{t("stress.level_c1_option", "Level C1 (Advanced Executive & Nuance)")}</option>
                </select>
              </div>
            </div>

            {customGenError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                <span>{customGenError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t("quiz.cancel", "Cancel")}
              </button>
              <button
                type="button"
                disabled={isGeneratingCustom || !customTopic.trim()}
                onClick={handleGenerateCustomScenario}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGeneratingCustom ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{t("stress.designing_scenario", "Designing Scenario...")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>{t("stress.generate_and_practice", "Generate & Practice")}</span>
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
