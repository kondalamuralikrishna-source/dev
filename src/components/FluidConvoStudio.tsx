import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Sliders,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  Shield,
  Activity,
  Flame,
  Award,
  ChevronDown,
  Info,
  Ear,
  MessageSquare,
  Coffee,
  PlaneTakeoff,
  Presentation,
  HeartPulse,
  ShieldAlert,
  Download,
  Share2,
} from "lucide-react";
import {
  CEFRLevel,
  GlobalDialectCode,
  ConversationalFrictionLevel,
  AmbientSoundType,
  FluidConvoScenario,
  FluidConvoTurnAnalysis,
  FluidConvoSessionReport,
  MeaningAlteringPhonemeShift,
  UserProgress,
} from "../types";
import {
  GLOBAL_DIALECT_PROFILES,
  FLUIDCONVO_SCENARIOS,
  SAGITTAL_DIAGRAM_CONFIGS,
} from "../data/fluidConvoData";
import { ambientAudioEngine } from "../utils/ambientAudioEngine";
import { speakText, stopSpeaking, createSpeechRecognizer } from "../utils/speechUtils";
import { SagittalDiagramModal } from "./SagittalDiagramModal";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { AutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";

interface FluidConvoStudioProps {
  progress: UserProgress;
  onAddXp: (amount: number) => void;
  onLogStudyMinutes?: (minutes: number) => void;
  onOpenPricing?: () => void;
}

export const FluidConvoStudio: React.FC<FluidConvoStudioProps> = ({
  progress,
  onAddXp,
  onLogStudyMinutes,
  onOpenPricing,
}) => {
  const { t } = useTranslation();
  // Configuration state
  const [selectedDialect, setSelectedDialect] = useState<GlobalDialectCode>("indian_english");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scenario_tech_sales_pitch");
  const [frictionLevel, setFrictionLevel] = useState<ConversationalFrictionLevel>("moderate");
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>("boardroom");
  const [ambientVolume, setAmbientVolume] = useState<number>(0.25);
  const [isAmbientMuted, setIsAmbientMuted] = useState<boolean>(false);

  // Active Live Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [userInterimText, setUserInterimText] = useState<string>("");
  const [turns, setTurns] = useState<FluidConvoTurnAnalysis[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);

  // Live Metrics & Real-Time Tracking
  const [liveLatencyMs, setLiveLatencyMs] = useState<number>(320);
  const [interruptionDetected, setInterruptionDetected] = useState<boolean>(false);
  const [backchannelCues, setBackchannelCues] = useState<string[]>([]);
  const [activeFrictionEvent, setActiveFrictionEvent] = useState<string | null>(null);

  // Sagittal Diagram Modal
  const [isSagittalOpen, setIsSagittalOpen] = useState<boolean>(false);
  const [sagittalKey, setSagittalKey] = useState<string>("short_i_vs_long_ee");

  // Final Session Report
  const [sessionReport, setSessionReport] = useState<FluidConvoSessionReport | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [voiceQuotaExceeded, setVoiceQuotaExceeded] = useState<string | null>(null);

  // Speech Recognition and Audio Refs
  const recognitionRef = useRef<any>(null);
  const turnStartTimeRef = useRef<number>(Date.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const activeScenario =
    FLUIDCONVO_SCENARIOS.find((s) => s.id === selectedScenarioId) || FLUIDCONVO_SCENARIOS[0];
  const activeDialectProfile =
    GLOBAL_DIALECT_PROFILES.find((d) => d.id === selectedDialect) || GLOBAL_DIALECT_PROFILES[0];

  // Auto-scroll transcript on new turn
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, userInterimText, isAiProcessing]);

  // Ambient sound management
  useEffect(() => {
    if (isSessionActive && !isAmbientMuted && ambientSound !== "none") {
      ambientAudioEngine.setVolume(ambientVolume);
      ambientAudioEngine.startAmbient(ambientSound);
    } else {
      ambientAudioEngine.stopAmbient();
    }
    return () => {
      ambientAudioEngine.stopAmbient();
    };
  }, [isSessionActive, ambientSound, isAmbientMuted, ambientVolume]);

  // Audio frequency wave visualizer canvas animation
  useEffect(() => {
    if (!isSessionActive) return;

    let phase = 0;
    const renderWave = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Base line
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isListening
        ? "#10b981"
        : isAiSpeaking
        ? "#818cf8"
        : isAiProcessing
        ? "#f59e0b"
        : "#475569";

      ctx.beginPath();
      const amplitude = isListening ? 22 : isAiSpeaking ? 16 : isAiProcessing ? 8 : 3;
      const frequency = isListening ? 0.08 : 0.05;

      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * frequency + phase) * amplitude * Math.sin((x / width) * Math.PI);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Secondary glowing harmonic
      if (isListening || isAiSpeaking) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isListening ? "rgba(16, 185, 129, 0.4)" : "rgba(129, 140, 248, 0.4)";
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.cos(x * (frequency * 1.5) - phase) * (amplitude * 0.7) * Math.sin((x / width) * Math.PI);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += isListening ? 0.12 : isAiSpeaking ? 0.08 : 0.03;
      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSessionActive, isListening, isAiSpeaking, isAiProcessing]);

  // Start a new full-duplex session
  const handleStartSession = () => {
    setTurns([]);
    setSessionReport(null);
    setCurrentTurnIndex(0);
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    turnStartTimeRef.current = Date.now();

    // Initial greeting turn from interlocutor
    const initialTurn: FluidConvoTurnAnalysis = {
      turnIndex: 0,
      userSpokenText: "",
      modelReply: activeScenario.initialMessage,
      semanticIntelligibilityScore: 100,
      phoneticFidelityScore: 100,
      dialectPreservedBonus: true,
      falsePenaltyAvoided: true,
      turnTakingLatencyMs: 290,
      backchannelCuesGenerated: ["Listening actively"],
      interruptionOccurred: false,
      frictionLevel: frictionLevel,
      meaningAlteringShifts: [],
      pragmaticHeatmapScore: "green",
    };

    setTurns([initialTurn]);
    setIsAiSpeaking(true);

    // Speak initial greeting with natural speech
    speakText(activeScenario.initialMessage, 0.95).then(() => {
      setIsAiSpeaking(false);
      startMicCapture();
    });
  };

  // Start Web Speech API microphone capture
  const startMicCapture = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        setUserInterimText(transcript);

        // Interruption detection: if user speaks while AI is speaking, trigger graceful backchannel interruption
        if (isAiSpeaking) {
          stopSpeaking();
          setIsAiSpeaking(false);
          setInterruptionDetected(true);
          ambientAudioEngine.playBackchannelAcousticCue("acknowledgment");
        }

        // Trigger dynamic backchannel sound on intermediate pause
        if (transcript.split(/\s+/).length % 6 === 0 && transcript.length > 10) {
          const cues = ["mm-hmm", "I see", "go on", "right"];
          const selectedCue = cues[Math.floor(Math.random() * cues.length)];
          setBackchannelCues((prev) => [...prev.slice(-3), selectedCue]);
          ambientAudioEngine.playBackchannelAcousticCue("affirmative");
        }

        if (isFinal && transcript.trim().length > 0) {
          const turnLatency = Math.max(180, Math.min(850, Date.now() - turnStartTimeRef.current));
          setLiveLatencyMs(turnLatency);
          processUserTurn(transcript.trim(), turnLatency);
        }
      },
      (error) => {
        console.warn("Recognition error:", error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        recognitionRef.current = recognizer;
        setIsListening(true);
        turnStartTimeRef.current = Date.now();
      } catch (err) {
        console.error("Recognizer start error:", err);
      }
    }
  };

  const handleStopMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    if (userInterimText.trim().length > 0) {
      const turnLatency = Math.max(220, Date.now() - turnStartTimeRef.current);
      processUserTurn(userInterimText.trim(), turnLatency);
    }
  };

  // Process user speech turn via Server-side FluidConvo API
  const processUserTurn = async (spokenText: string, latencyMs: number) => {
    setIsAiProcessing(true);
    setUserInterimText("");
    setIsListening(false);

    try {
      const authToken = localStorage.getItem("auth_token");
      const response = await fetch("/api/gemini/fluidconvo-turn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          spokenText,
          turnIndex: currentTurnIndex + 1,
          scenario: activeScenario,
          dialectProfile: activeDialectProfile,
          frictionLevel,
          turnTakingLatencyMs: latencyMs,
          history: turns.map((t) => ({
            role: t.userSpokenText ? "user" : "model",
            content: t.userSpokenText || t.modelReply,
          })),
        }),
      });

      if (response.status === 429) {
        const quotaData = await response.json();
        setVoiceQuotaExceeded(quotaData.error || "You've used today's free AI voice time.");
        setIsAiProcessing(false);
        return;
      }

      const data = await response.json();

      // Honest 0 / neutral placeholders when the API doesn't return a metric --
      // never substitute a plausible-looking high score the learner didn't earn.
      const hasIntelligibilityScore = typeof data.semanticIntelligibilityScore === "number";
      const newTurn: FluidConvoTurnAnalysis = {
        turnIndex: currentTurnIndex + 1,
        userSpokenText: spokenText,
        modelReply: data.reply || "Understood. Let's proceed with the details.",
        semanticIntelligibilityScore: hasIntelligibilityScore ? data.semanticIntelligibilityScore : 0,
        phoneticFidelityScore: typeof data.phoneticFidelityScore === "number" ? data.phoneticFidelityScore : 0,
        dialectPreservedBonus: data.dialectPreservedBonus ?? false,
        falsePenaltyAvoided: data.falsePenaltyAvoided ?? false,
        turnTakingLatencyMs: latencyMs,
        backchannelCuesGenerated: data.backchannelCues || [],
        interruptionOccurred: interruptionDetected,
        frictionLevel: frictionLevel,
        frictionType: data.frictionType,
        meaningAlteringShifts: data.meaningAlteringShifts || [],
        pragmaticHeatmapScore: !hasIntelligibilityScore
          ? "amber"
          : data.semanticIntelligibilityScore >= 88
          ? "green"
          : data.semanticIntelligibilityScore >= 70
          ? "amber"
          : "rose",
      };

      setTurns((prev) => [...prev, newTurn]);
      setCurrentTurnIndex((prev) => prev + 1);
      setInterruptionDetected(false);

      if (data.frictionType) {
        setActiveFrictionEvent(data.frictionMessage || "Sudden follow-up challenge!");
        setTimeout(() => setActiveFrictionEvent(null), 5000);
      }

      // Interlocutor vocalizes response
      setIsAiProcessing(false);
      setIsAiSpeaking(true);

      speakText(newTurn.modelReply, 0.95).then(() => {
        setIsAiSpeaking(false);
        // Automatically open mic for full-duplex conversational flow
        if (isSessionActive) {
          startMicCapture();
        }
      });
    } catch (err) {
      console.error("Error in processUserTurn:", err);
      setIsAiProcessing(false);

      // Be honest that this turn could not be evaluated instead of fabricating
      // a high-scoring analysis (90%/88%) the learner never earned.
      const failedTurn: FluidConvoTurnAnalysis = {
        turnIndex: currentTurnIndex + 1,
        userSpokenText: spokenText,
        modelReply: "Sorry, I couldn't process that turn. Let's continue -- please try again.",
        semanticIntelligibilityScore: 0,
        phoneticFidelityScore: 0,
        dialectPreservedBonus: false,
        falsePenaltyAvoided: false,
        turnTakingLatencyMs: latencyMs,
        backchannelCuesGenerated: [],
        interruptionOccurred: interruptionDetected,
        frictionLevel: frictionLevel,
        meaningAlteringShifts: [],
        pragmaticHeatmapScore: "rose",
        evaluationFailed: true,
      } as FluidConvoTurnAnalysis;
      setTurns((prev) => [...prev, failedTurn]);
      setCurrentTurnIndex((prev) => prev + 1);
    }
  };

  // Conclude session & generate pedagogical diagnostic report
  const handleEndSession = async () => {
    setIsSessionActive(false);
    setIsListening(false);
    stopSpeaking();
    ambientAudioEngine.stopAmbient();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const sessionDurationMins = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
    if (onLogStudyMinutes) {
      onLogStudyMinutes(sessionDurationMins);
    }

    // Call server evaluation endpoint
    try {
      const response = await fetch("/api/gemini/fluidconvo-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: activeScenario,
          dialectProfile: activeDialectProfile,
          frictionLevel,
          turns,
          durationMinutes: sessionDurationMins,
        }),
      });

      const report: FluidConvoSessionReport = await response.json();
      setSessionReport(report);
      setReportError(null);
      // Only grant XP when the server actually returned an earned amount -- never
      // assume a flat 120 XP when the field is missing.
      if (typeof report.xpEarned === "number" && report.xpEarned > 0) {
        onAddXp(report.xpEarned);
      }
    } catch (err) {
      console.error("Error generating session report:", err);
      // Be honest that the report could not be generated instead of fabricating a
      // near-perfect session report (92%/98%/96%/89%, invented phonetic praise, and
      // a "ship vs sheep" breakdown the learner never actually said) and awarding
      // 120 XP the learner never earned.
      setSessionReport(null);
      setReportError(
        "We couldn't generate your session report this time. Your conversation history is preserved -- please try ending the session again."
      );
    }
  };

  const openSagittalForShift = (shiftKey?: string) => {
    if (shiftKey && SAGITTAL_DIAGRAM_CONFIGS[shiftKey]) {
      setSagittalKey(shiftKey);
    } else {
      setSagittalKey("short_i_vs_long_ee");
    }
    setIsSagittalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-teal-300 text-xs font-black tracking-wide border border-teal-500/30">
              <Radio size={14} className="animate-pulse text-teal-400" />
              <span>{t("fluidconvo.realtime_practice", "Real-Time Conversational Practice")}</span>
              <span className="text-[10px] bg-teal-400 text-slate-950 px-1.5 py-0.2 font-black rounded-md">
                {t("fluidconvo.live_badge", "LIVE")}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{t("fluidconvo.studio_title", "Live Voice Conversation Studio")}</span>
              <span className="text-sm font-bold text-slate-300 px-2.5 py-1 bg-slate-800/80 rounded-xl border border-slate-700">
                {t("fluidconvo.studio_subtitle", "Natural Dialogue & Fluency")}
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {t("fluidconvo.studio_desc", "Practice spontaneous back-and-forth speaking in real time. Build natural conversational timing, rapid response reflexes, and acoustic clarity across everyday and professional contexts.")}
            </p>
          </div>

          {/* Quick Technical Specs Pill Group */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 text-xs">
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              <span className="text-slate-300">{t("fluidconvo.accent_false_penalty", "Accent False-Penalty:")}</span>
              <span className="font-black text-emerald-400">&lt; 5%</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              <span className="text-slate-300">{t("fluidconvo.turn_taking_latency", "Turn-Taking Latency:")}</span>
              <span className="font-black text-amber-400">&lt; 450ms</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
              <Activity size={14} className="text-teal-400" />
              <span className="text-slate-300">{t("fluidconvo.interruption_handling", "Interruption Handling:")}</span>
              <span className="font-black text-teal-400">&gt; 95%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <ModuleHeaderGuide
        moduleTitle="Live Spoken Dialogue & Latency Studio"
        moduleCategory="Spontaneous Speech"
        estimatedTime="5–12 min per session"
        difficulty="Full Duplex & Real-Time"
        themeColor="teal"
        steps={[
          {
            title: "Calibrate Dialect & Conversational Friction",
            instruction: "Select your native dialect calibration (to prevent false accent penalties) and choose your target conversational friction level.",
            tip: "High friction introduces realistic cross-talk interruptions and time pressures.",
          },
          {
            title: "Configure Ambient Background Audio",
            instruction: "Optionally toggle background café chatter, airport announcements, or boardroom ambient noise.",
            tip: "Trains auditory focus and cognitive resilience in real-world environments.",
          },
          {
            title: "Engage in Spontaneous Spoken Dialogue",
            instruction: "Start the session and speak naturally into your microphone with low latency (<450ms turn-taking).",
            tip: "Practice rapid turn-taking without long pausing or hesitation.",
          },
          {
            title: "Review Phoneme Shifts & Intelligibility",
            instruction: "End the session to inspect meaning-altering phoneme shifts, Sagittal vocal tract cross-sections, and claim +120 XP.",
            tip: "The sagittal diagrams show precise tongue placement corrections for tricky phonemes.",
          },
        ]}
        completionGoal="Complete a live spoken dialogue session to receive acoustic latency and phoneme shift metrics."
        xpReward={120}
      />

      {reportError && !sessionReport && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-semibold flex items-center gap-2">
          <span>{reportError}</span>
        </div>
      )}

      {voiceQuotaExceeded && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{voiceQuotaExceeded}</span>
          {onOpenPricing && (
            <button
              type="button"
              onClick={onOpenPricing}
              className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Upgrade Now
            </button>
          )}
        </div>
      )}

      {!isSessionActive && !sessionReport ? (
        /* Configuration & Pre-flight Controls */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dialect & Friction Calibration */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Global Dialect Calibration Selector */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Globe size={15} />
                  <span>{t("fluidconvo.dialect_calibration_title", "1. Dialect Calibration")}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">{t("fluidconvo.zero_false_penalty", "Zero False Penalty")}</span>
              </div>

              <div className="space-y-2">
                {GLOBAL_DIALECT_PROFILES.map((dialect) => {
                  const isSelected = selectedDialect === dialect.id;
                  return (
                    <button
                      key={dialect.id}
                      type="button"
                      onClick={() => setSelectedDialect(dialect.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                          : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{dialect.flag}</span>
                          <span className="text-xs font-black text-slate-900">{dialect.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 size={15} className="text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        <AutoText text={dialect.description} context="fluidconvo_dialect_description" />
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Conversational Friction & Ambient Mixer */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <Flame size={15} />
                  <span>{t("fluidconvo.friction_mixer_title", "2. Adaptive Friction & Soundscape")}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">{t("fluidconvo.real_world_simulator", "Real-World Simulator")}</span>
              </div>

              {/* Friction Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">{t("fluidconvo.friction_intensity", "Friction Intensity")}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["low", "moderate", "high", "hostile"] as ConversationalFrictionLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFrictionLevel(lvl)}
                      className={`py-1.5 text-xs font-extrabold capitalize rounded-xl transition-all cursor-pointer ${
                        frictionLevel === lvl
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {t(`fluidconvo.friction_${lvl}`, lvl)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambient Sound Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">{t("fluidconvo.background_ambient", "Background Ambient Sound")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "coffee_shop", label: t("fluidconvo.ambient_cafe", "Café Chatter"), icon: Coffee },
                    { id: "busy_airport", label: t("fluidconvo.ambient_airport", "Airport Terminal"), icon: PlaneTakeoff },
                    { id: "boardroom", label: t("fluidconvo.ambient_boardroom", "Executive Board"), icon: Presentation },
                    { id: "emergency_dispatch", label: t("fluidconvo.ambient_er", "ER Triage"), icon: HeartPulse },
                  ].map((amb) => {
                    const Icon = amb.icon;
                    const isSelected = ambientSound === amb.id;
                    return (
                      <button
                        key={amb.id}
                        type="button"
                        onClick={() => setAmbientSound(amb.id as AmbientSoundType)}
                        className={`p-2.5 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Icon size={14} className={isSelected ? "text-amber-400" : "text-slate-500"} />
                        <span className="text-xs font-bold">{amb.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAmbientMuted(!isAmbientMuted)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  {isAmbientMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isAmbientMuted ? 0 : ambientVolume}
                  onChange={(e) => {
                    setAmbientVolume(parseFloat(e.target.value));
                    setIsAmbientMuted(false);
                  }}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-500 w-8 text-right">
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Scenario Library & Launch Station */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-700">
                    {t("fluidconvo.select_scenario_label", "3. Select Dynamic Simulation Scenario")}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">
                    {t("fluidconvo.scenarios_title", "Full-Duplex Interactive Scenarios")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSagittalKey("short_i_vs_long_ee");
                    setIsSagittalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers size={14} />
                  <span>{t("fluidconvo.sagittal_guide", "Mouth/Tongue Sagittal Guide")}</span>
                </button>
              </div>

              {/* Scenario Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FLUIDCONVO_SCENARIOS.map((sc) => {
                  const isSelected = selectedScenarioId === sc.id;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => {
                        setSelectedScenarioId(sc.id);
                        setFrictionLevel(sc.defaultFriction);
                        setAmbientSound(sc.defaultAmbient);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-gradient-to-br from-indigo-50 to-teal-50/40 border-indigo-400 ring-2 ring-indigo-500/20 shadow-md"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/60"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                              CEFR {sc.level}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              <AutoText text={sc.category} context="fluidconvo_scenario_category" />
                            </span>
                          </div>
                          {isSelected && <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />}
                        </div>

                        <h3 className="text-sm font-black text-slate-900">
                          <AutoText text={sc.title} context="fluidconvo_scenario_title" />
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          <AutoText text={sc.briefing} context="fluidconvo_scenario_briefing" />
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center gap-2.5">
                        <img
                          src={sc.interlocutorAvatar}
                          alt={sc.interlocutorName}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-300 shrink-0"
                        />
                        <div className="truncate text-left">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {sc.interlocutorName}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            <AutoText text={sc.interlocutorRole} context="fluidconvo_interlocutor_role" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Scenario Preview & Objectives */}
              <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={activeScenario.interlocutorAvatar}
                      alt={activeScenario.interlocutorName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white"><AutoText text={activeScenario.title} context="fluidconvo_scenario_title" /></h4>
                      <p className="text-xs text-slate-400">
                        {t("fluidconvo.interlocutor_label", "Interlocutor:")} {activeScenario.interlocutorName} (<AutoText text={activeScenario.interlocutorRole} context="fluidconvo_interlocutor_role" />)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {t("fluidconvo.dialect_label", "Dialect:")} {activeDialectProfile.name.split(" ")[0]}
                  </span>
                </div>

                {/* Target Minimal Pairs to Watch */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                    {t("fluidconvo.phonetic_safeguards", "Phonetic Intent Safeguards (Minimal Pairs Monitored):")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeScenario.minimalPairsToWatch.map((mp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => openSagittalForShift(mp.sagittalKey)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Ear size={12} className="text-teal-400" />
                        <span>{mp.pair[0]}</span>
                        <span className="text-slate-500">vs</span>
                        <span>{mp.pair[1]}</span>
                        <span className="text-[10px] text-amber-400">({mp.ipa[0]})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Launch Action */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Info size={14} className="text-indigo-400 shrink-0" />
                    <span>{t("fluidconvo.mic_auto_note", "Microphone will activate automatically for natural full-duplex turn-taking.")}</span>
                  </div>
                  <button
                    id="btn-launch-fluidconvo-session"
                    type="button"
                    onClick={handleStartSession}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play size={16} className="fill-white" />
                    <span>{t("fluidconvo.launch_simulator", "Launch Full-Duplex Simulator")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isSessionActive ? (
        /* Active Live Full-Duplex Simulation Screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Audio Visualizer & Interlocutor Feed */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl text-white space-y-5">
              {/* Interlocutor Persona Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={activeScenario.interlocutorAvatar}
                      alt={activeScenario.interlocutorName}
                      className={`w-12 h-12 rounded-2xl object-cover border-2 transition-all ${
                        isAiSpeaking ? "border-indigo-400 ring-4 ring-indigo-500/30 animate-pulse" : "border-slate-700"
                      }`}
                    />
                    {isAiSpeaking && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <Volume2 size={9} className="text-white" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{activeScenario.interlocutorName}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-md bg-slate-800 text-slate-300">
                        {isAiSpeaking ? t("fluidconvo.speaking", "Speaking...") : isAiProcessing ? t("fluidconvo.thinking", "Thinking...") : t("fluidconvo.listening", "Listening...")}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400"><AutoText text={activeScenario.interlocutorRole} context="fluidconvo_interlocutor_role" /></p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("fluidconvo.dialect_filter", "Dialect Filter")}</span>
                  <span className="text-xs font-black text-teal-400">{activeDialectProfile.flag} {activeDialectProfile.name.split(" ")[0]}</span>
                </div>
              </div>

              {/* Dynamic Oscilloscope Wave Canvas */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 flex flex-col items-center justify-center relative">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={80}
                  className="w-full h-20 rounded-xl"
                />

                <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={12} className="text-amber-400" />
                    <span>{t("fluidconvo.turn_latency", "Turn Latency:")}</span>
                    <span className="font-black text-amber-400">{liveLatencyMs}ms</span>
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded">
                      {t("fluidconvo.optimal_450ms", "< 450ms Optimal")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Radio size={12} className="text-teal-400" />
                    <span>{t("fluidconvo.friction_label", "Friction:")}</span>
                    <span className="font-black text-rose-400 capitalize">{t(`fluidconvo.friction_${frictionLevel}`, frictionLevel)}</span>
                  </div>
                </div>
              </div>

              {/* Live Interruption / Backchannel Event Box */}
              {activeFrictionEvent && (
                <div className="p-3 bg-rose-950/80 border border-rose-600/60 rounded-2xl text-xs text-rose-200 flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <AlertCircle size={16} className="text-rose-400 shrink-0" />
                  <span><AutoText text={activeFrictionEvent} context="fluidconvo_friction_event" /></span>
                </div>
              )}

              {/* Backchannel live token chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {t("fluidconvo.backchannel_cues_label", "Real-Time Backchanneling Cues:")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {backchannelCues.length > 0 ? (
                    backchannelCues.map((cue, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-800 text-teal-300 text-xs font-bold rounded-lg border border-slate-700 animate-in fade-in"
                      >
                        🗣️ "{cue}"
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">{t("fluidconvo.streaming_tokens", "Streaming natural backchannel tokens...")}</span>
                  )}
                </div>
              </div>

              {/* Primary Session Controls */}
              <div className="pt-2 flex items-center gap-3">
                {isListening ? (
                  <button
                    type="button"
                    onClick={handleStopMic}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Mic size={18} className="animate-pulse" />
                    <span>{t("fluidconvo.transmitting", "Transmitting (Click to Send Turn)")}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startMicCapture}
                    disabled={isAiSpeaking || isAiProcessing}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Mic size={18} />
                    <span>{t("fluidconvo.activate_mic", "Activate Microphone")}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleEndSession}
                  className="px-4 py-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs rounded-2xl border border-rose-500/40 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Square size={14} className="fill-rose-400" />
                  <span>{t("fluidconvo.conclude", "Conclude")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Pragmatic Transcript Heatmap */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-[560px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    {t("fluidconvo.heatmap_title", "Pragmatic Transcript Heatmap")}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("fluidconvo.legend_intelligible", "Intelligible")}
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> {t("fluidconvo.legend_dialect_preserved", "Dialect Preserved")}
                  </span>
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> {t("fluidconvo.legend_minimal_pair_shift", "Minimal-Pair Shift")}
                  </span>
                </div>
              </div>

              {/* Turns Scroll Area */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {turns.map((turn, idx) => (
                  <div key={idx} className="space-y-2 animate-in fade-in duration-200">
                    {/* User message */}
                    {turn.userSpokenText && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] space-y-1.5">
                          <div
                            className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium shadow-xs ${
                              turn.pragmaticHeatmapScore === "green"
                                ? "bg-emerald-50 text-emerald-950 border border-emerald-200/80 rounded-tr-none"
                                : turn.pragmaticHeatmapScore === "amber"
                                ? "bg-amber-50 text-amber-950 border border-amber-200/80 rounded-tr-none"
                                : "bg-rose-50 text-rose-950 border border-rose-200/80 rounded-tr-none"
                            }`}
                          >
                            <p className="leading-relaxed">{turn.userSpokenText}</p>
                          </div>

                          {/* Turn Diagnostic Badges */}
                          <div className="flex flex-wrap items-center justify-end gap-1.5 text-[10px] font-bold">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                              {t("fluidconvo.latency_label", "Latency:")} {turn.turnTakingLatencyMs}ms
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                              {t("fluidconvo.semantic_score_label", "Semantic Score:")} {turn.semanticIntelligibilityScore}%
                            </span>
                            {turn.dialectPreservedBonus && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                                ✓ {t("fluidconvo.dialect_calibrated", "Dialect Calibrated")}
                              </span>
                            )}
                          </div>

                          {/* Minimal Pair Warning if detected */}
                          {turn.meaningAlteringShifts && turn.meaningAlteringShifts.length > 0 && (
                            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                              {turn.meaningAlteringShifts.map((shift, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center justify-between text-xs text-rose-900"
                                >
                                  <span>
                                    ⚠️ {t("fluidconvo.shift_label", "Shift:")} <strong>{shift.spokenWord}</strong> {t("fluidconvo.vs_label", "vs")}{" "}
                                    <strong>{shift.intendedWord}</strong> ({shift.phonemicContrast})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => openSagittalForShift(shift.sagittalKey)}
                                    className="text-[10px] font-black underline text-rose-700 hover:text-rose-900 cursor-pointer"
                                  >
                                    {t("fluidconvo.view_tongue_diagram", "View Tongue Diagram")}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Model reply message */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={activeScenario.interlocutorAvatar}
                            alt={activeScenario.interlocutorName}
                            className="w-5 h-5 rounded-md object-cover"
                          />
                          <span className="text-[11px] font-bold text-slate-700">
                            {activeScenario.interlocutorName}
                          </span>
                        </div>
                        <div className="p-3.5 bg-slate-100 text-slate-900 border border-slate-200 rounded-2xl rounded-tl-none text-xs sm:text-sm leading-relaxed shadow-xs">
                          {turn.modelReply}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* User interim voice streaming */}
                {userInterimText && (
                  <div className="flex justify-end animate-in fade-in">
                    <div className="max-w-[85%] p-3.5 bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-2xl rounded-tr-none text-xs sm:text-sm italic">
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mr-2 animate-ping" />
                      {userInterimText}
                    </div>
                  </div>
                )}

                {/* AI processing indicator */}
                {isAiProcessing && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                      <span>{activeScenario.interlocutorName} {t("fluidconvo.formulating_response", "is formulating response...")}</span>
                    </div>
                  </div>
                )}

                <div ref={transcriptEndRef} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Comprehensive Diagnostic Session Summary Report */
        sessionReport && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in duration-300">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-black mb-2">
                  <Award size={14} className="text-emerald-600" />
                  <span>{t("fluidconvo.report_badge", "FluidConvo Diagnostic Assessment Report")}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  <AutoText text={sessionReport.scenarioTitle} context="fluidconvo_scenario_title" />
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t("fluidconvo.dialect_calibrated_label", "Dialect Calibrated:")} {activeDialectProfile.name} • {t("fluidconvo.total_turns_label", "Total Turns:")} {sessionReport.totalTurns}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-extrabold text-indigo-600 block">{t("fluidconvo.xp_awarded", "XP Awarded")}</span>
                  <span className="text-lg font-black text-indigo-900">+{sessionReport.xpEarned} XP</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSessionReport(null)}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {t("fluidconvo.start_new_session", "Start New Session")}
                </button>
              </div>
            </div>

            {/* Core Metrics Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">{t("fluidconvo.metric_semantic", "Semantic Intelligibility")}</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {sessionReport.overallIntelligibilityScore}%
                </span>
                <span className="text-[10px] text-slate-400">{t("fluidconvo.metric_semantic_sub", "Primary Intent Passed")}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">{t("fluidconvo.metric_accent", "Accent Penalty-Free")}</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">
                  {sessionReport.accentPenaltyFreeScore}%
                </span>
                <span className="text-[10px] text-slate-400">{t("fluidconvo.metric_accent_sub", "Authentic Prosody Preserved")}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">{t("fluidconvo.metric_latency", "Turn-Taking Latency")}</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">
                  {sessionReport.avgTurnTakingLatencyMs}ms
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">{t("fluidconvo.metric_latency_sub", "Target < 450ms Met")}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">{t("fluidconvo.metric_interruption", "Interruption Defense")}</span>
                <span className="text-2xl font-black text-teal-600 mt-1 block">
                  {sessionReport.interruptionHandlingRate}%
                </span>
                <span className="text-[10px] text-slate-400">{t("fluidconvo.metric_interruption_sub", "Friction Composure")}</span>
              </div>
            </div>

            {/* Dialect Calibration Praise Card */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-5 text-white space-y-2">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-teal-400" />
                <h4 className="text-sm font-black text-white">
                  {t("fluidconvo.dialect_verification", "Regional Dialect Verification")} ({activeDialectProfile.name})
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <AutoText text={sessionReport.dialectPreservationPraise} context="fluidconvo_dialect_praise" />
              </p>
            </div>

            {/* Pedagogical Takeaways & Minimal Pair Diagnostics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Actionable Speech Directives */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>{t("fluidconvo.actionable_takeaways", "Actionable Pedagogical Takeaways")}</span>
                </h4>
                <div className="space-y-2">
                  {sessionReport.pedagogicalAdvice.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span><AutoText text={tip} context="fluidconvo_pedagogical_tip" /></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Key Minimal Pair Articulation Breakdowns */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Layers size={15} className="text-indigo-600" />
                    <span>{t("fluidconvo.minimal_pair_breakdowns", "Minimal-Pair Phonetic Breakdowns")}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setSagittalKey("short_i_vs_long_ee");
                      setIsSagittalOpen(true);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    {t("fluidconvo.open_sagittal_guide", "Open Full Sagittal Guide →")}
                  </button>
                </div>

                <div className="space-y-2">
                  {sessionReport.keyPhoneticBreakdowns.map((shift, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900">{shift.phonemicContrast}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {shift.severity === "acceptable-dialect-variation" ? t("fluidconvo.accepted_dialect", "✓ Accepted Dialect") : t("fluidconvo.meaning_altering", "⚠️ Meaning-Altering")}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]"><AutoText text={shift.explanation} context="fluidconvo_shift_explanation" /></p>
                      <p className="text-indigo-700 text-[11px] font-semibold">{t("fluidconvo.tip_label", "Tip:")} <AutoText text={shift.articulatoryFix} context="fluidconvo_articulatory_fix" /></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Sagittal Cross-Section Vocal Tract Modal */}
      <SagittalDiagramModal
        isOpen={isSagittalOpen}
        onClose={() => setIsSagittalOpen(false)}
        initialKey={sagittalKey}
      />
    </div>
  );
};
