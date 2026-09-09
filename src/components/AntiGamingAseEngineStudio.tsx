import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Mic,
  MicOff,
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Layers,
  ArrowRight,
  RotateCcw,
  Volume2,
  HelpCircle,
  FileCheck,
  Scale,
  Gauge,
  Compass,
  Download,
  Info,
  Flame,
  Award,
  Play,
  Send,
} from "lucide-react";
import {
  AseMetricInput,
  AseEvaluationResult,
  AseBenchmarkPreset,
  AseGamingRiskLevel,
  UserProgress,
} from "../types";
import { ASE_BENCHMARK_PRESETS } from "../data/aseEngineData";
import { createSpeechRecognizer, speakText } from "../utils/speechUtils";
import { evaluatePromptTranscriptRelevancy } from "../utils/vectorSimilarityUtils";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";

interface AntiGamingAseEngineStudioProps {
  progress?: UserProgress;
  onGrantXp?: (amount: number, reason: string) => void;
}

export const AntiGamingAseEngineStudio: React.FC<AntiGamingAseEngineStudioProps> = ({
  progress,
  onGrantXp,
}) => {
  // Mode selection: Sandbox Simulator vs Live Microphone Speech Test
  const [activeTabMode, setActiveTabMode] = useState<"simulator" | "live_voice">("simulator");

  // Selected Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    ASE_BENCHMARK_PRESETS[0].id
  );

  // Metric Form State for Simulator
  const [speechRateWpm, setSpeechRateWpm] = useState<number>(142);
  const [pauseRatio, setPauseRatio] = useState<number>(0.21);
  const [spectralEnergyDb, setSpectralEnergyDb] = useState<number>(-17.5);
  const [semanticCoherenceScore, setSemanticCoherenceScore] = useState<number>(94);
  const [grammarScore, setGrammarScore] = useState<number>(92);
  const [f0StdDevHz, setF0StdDevHz] = useState<number>(38);
  const [pitchRangeSemitones, setPitchRangeSemitones] = useState<number>(8.5);
  const [artificialFlatnessIndex, setArtificialFlatnessIndex] = useState<number>(8);
  const [unnaturalJumpsCount, setUnnaturalJumpsCount] = useState<number>(0);
  const [contourDescription, setContourDescription] = useState<string>(
    "Organic clause-level pitch movement with authentic falling declaratives."
  );
  const [transcribedText, setTranscribedText] = useState<string>(
    "When architecting distributed data pipelines, we prioritize backpressure and partition isolation to guarantee fault tolerance under sudden traffic surges."
  );
  const [topicPrompt, setTopicPrompt] = useState<string>(
    "Explain how you design fault-tolerant systems under high throughput."
  );

  // Live Microphone State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [liveWpmEst, setLiveWpmEst] = useState<number>(135);
  const [livePauseEst, setLivePauseEst] = useState<number>(0.2);

  // Evaluation & Processing State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<AseEvaluationResult | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);

  // Audio recognition & canvas visualizer refs
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Synchronize when a preset is selected
  const handleApplyPreset = (preset: AseBenchmarkPreset) => {
    setSelectedPresetId(preset.id);
    setSpeechRateWpm(preset.metrics.speechRateWpm);
    setPauseRatio(preset.metrics.pauseRatio);
    setSpectralEnergyDb(preset.metrics.spectralEnergyDb);
    setSemanticCoherenceScore(preset.metrics.semanticCoherenceScore);
    setGrammarScore(preset.metrics.grammarScore);
    setF0StdDevHz(preset.metrics.pitchContourDynamics.f0StdDevHz);
    setPitchRangeSemitones(preset.metrics.pitchContourDynamics.pitchRangeSemitones);
    setArtificialFlatnessIndex(preset.metrics.pitchContourDynamics.artificialFlatnessIndex);
    setUnnaturalJumpsCount(preset.metrics.pitchContourDynamics.unnaturalJumpsCount);
    setContourDescription(preset.metrics.pitchContourDynamics.contourDescription);
    setTranscribedText(preset.metrics.transcribedText || "");
    setTopicPrompt(preset.metrics.topicPrompt || "");
    // Automatically trigger evaluation for instant inspection
    executeEvaluation({
      speechRateWpm: preset.metrics.speechRateWpm,
      pauseRatio: preset.metrics.pauseRatio,
      spectralEnergyDb: preset.metrics.spectralEnergyDb,
      semanticCoherenceScore: preset.metrics.semanticCoherenceScore,
      grammarScore: preset.metrics.grammarScore,
      pitchContourDynamics: preset.metrics.pitchContourDynamics,
      transcribedText: preset.metrics.transcribedText,
      topicPrompt: preset.metrics.topicPrompt,
    });
  };

  // Initial evaluation on mount
  useEffect(() => {
    handleApplyPreset(ASE_BENCHMARK_PRESETS[0]);
  }, []);

  // Audio waveform animation
  useEffect(() => {
    let phase = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isListening
        ? "#0d9488"
        : evaluationResult?.gamingRiskLevel === "FLAGGED_STRUCTURAL_GAMING"
        ? "#f43f5e"
        : evaluationResult?.gamingRiskLevel === "SUSPECTED_METRIC_IMBALANCE"
        ? "#f59e0b"
        : "#10b981";

      ctx.beginPath();
      const amplitude = isListening ? 18 : Math.min(22, (f0StdDevHz / 40) * 12);
      const frequency = (speechRateWpm / 140) * 0.05;

      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          Math.sin(x * frequency + phase) *
            amplitude *
            Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += (speechRateWpm / 130) * 0.06;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening, speechRateWpm, f0StdDevHz, evaluationResult]);

  // Execute Joint Multi-Metric ASE Evaluation
  const executeEvaluation = async (metricsPayload?: AseMetricInput) => {
    setIsEvaluating(true);
    const payload: AseMetricInput = metricsPayload || {
      speechRateWpm,
      pauseRatio,
      spectralEnergyDb,
      semanticCoherenceScore,
      grammarScore,
      pitchContourDynamics: {
        f0StdDevHz,
        pitchRangeSemitones,
        artificialFlatnessIndex,
        unnaturalJumpsCount,
        contourDescription,
      },
      transcribedText,
      topicPrompt,
    };

    try {
      // 1. Instant local vector embeddings & cosine similarity pre-filter check (Low-cost client-side guardrail)
      const localRelevancyCheck = evaluatePromptTranscriptRelevancy(
        payload.topicPrompt || topicPrompt || "",
        payload.transcribedText || transcribedText || "",
        0.35
      );

      const response = await fetch("/api/gemini/ase-engine-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Honest: if the evaluator didn't return a score, treat it as 0 rather than
      // assuming a plausible-looking 85/88 the learner never earned.
      const hasJointScore = typeof data.jointCommunicativeScore === "number";

      // Calculate final joint score applying the Relevancy Multiplier (0.0 to 1.0)
      const baseJoint = hasJointScore ? data.jointCommunicativeScore : 0;
      const finalJointWithMultiplier = localRelevancyCheck.isOffTopic
        ? 0
        : Math.round(baseJoint * localRelevancyCheck.relevancyMultiplier);

      const result: AseEvaluationResult = {
        evaluationId: `ase_${Date.now()}`,
        timestamp: Date.now(),
        inputMetrics: payload,
        jointCommunicativeScore: finalJointWithMultiplier,
        rawUnpenalizedScore: typeof data.rawUnpenalizedScore === "number" ? data.rawUnpenalizedScore : 0,
        antiGamingPenaltyTotal: localRelevancyCheck.isOffTopic ? 100 : (data.antiGamingPenaltyTotal ?? 0),
        // Never default an unknown result to "AUTHENTIC_NATURAL" -- that's a false
        // clearance. Fall back to the cautious middle tier instead.
        gamingRiskLevel: localRelevancyCheck.isOffTopic
          ? "FLAGGED_STRUCTURAL_GAMING"
          : data.gamingRiskLevel ?? "SUSPECTED_METRIC_IMBALANCE",
        authenticityAudit: data.authenticityAudit || {
          is_relevant_to_prompt: !localRelevancyCheck.isOffTopic,
          is_read_aloud_detected: localRelevancyCheck.isOffTopic,
          relevancy_score_out_of_10: Math.round(localRelevancyCheck.similarityScore * 10),
          audit_flags: localRelevancyCheck.isOffTopic ? ["OFF_TOPIC_RECITATION", "VECTOR_EMBEDDING_FAIL_LT_0.35"] : [],
          cap_applied: localRelevancyCheck.isOffTopic,
          cap_reason: localRelevancyCheck.reason,
        },
        subScores: data.subScores ?? {
          naturalnessScore: 0,
          expressivenessScore: 0,
          communicativeAccuracyScore: 0,
          structuralIntegrityScore: 0,
        },
        detectedViolations: localRelevancyCheck.isOffTopic
          ? [
              {
                id: "viol_vector_off_topic",
                type: "OFF_TOPIC_RECITATION",
                severity: "CRITICAL",
                penaltyWeight: 100,
                metricImbalanceFactor: `Vector cosine similarity (${localRelevancyCheck.similarityScore}) failed minimum threshold (0.35). Relevancy Multiplier = 0.0.`,
                explanation: localRelevancyCheck.reason || "Transcript is completely off-topic from the assigned task.",
                evidence: payload.transcribedText || "Extrinsic recitation.",
                remediationGuidance: "Directly answer the specific prompt context. Avoid reciting outside literature or canned passages.",
              },
              ...(data.detectedViolations || []),
            ]
          : (data.detectedViolations ?? []),
        jointDependencies: [
          {
            id: "dep_vector_relevancy",
            pairName: "Vector Embedding Relevancy vs. Task Score Multiplier",
            metricA: {
              name: "Cosine Similarity",
              value: `${(localRelevancyCheck.similarityScore * 100).toFixed(1)}%`,
              expectedNorm: "≥ 35.0%",
            },
            metricB: {
              name: "Score Multiplier",
              value: `${localRelevancyCheck.relevancyMultiplier.toFixed(2)}x`,
              expectedNorm: "1.00x",
            },
            correlationStatus: localRelevancyCheck.isOffTopic ? "PATHOLOGICAL_DIVERGENCE" : "BALANCED_AUTHENTIC",
            healthScore: Math.round(localRelevancyCheck.similarityScore * 100),
            diagnosis: localRelevancyCheck.isOffTopic
              ? "Relevancy Multiplier = 0.0: Cosine similarity is below the 0.35 threshold. The ASE final score is multiplied by 0.0."
              : "Topic-aligned discourse with authentic contextual semantic coupling.",
          },
          ...(data.jointDependencies ?? []),
        ],
        synthesisReport:
          data.synthesisReport ??
          "Analysis incomplete -- the evaluator did not return a synthesis report for this attempt.",
        radarBreakdown: data.radarBreakdown ?? [],
        actionableRemediation: data.actionableRemediation ?? [],
      };

      setEvaluationResult(result);
      if (onGrantXp && result.jointCommunicativeScore > 75) {
        onGrantXp(40, "Completed Joint Multi-Metric ASE Speech Evaluation");
      }
    } catch (err) {
      console.error("ASE Engine evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Toggle Live Speech Recording
  const handleToggleLiveRecord = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);

      // Estimate live metrics from recording
      const durationSeconds = Math.max(
        3,
        (Date.now() - recordingStartTime) / 1000
      );
      const wordsCount = liveTranscript.trim().split(/\s+/).filter(Boolean).length;
      const computedWpm = Math.round((wordsCount / durationSeconds) * 60);

      // Estimate pause ratio and prosodic parameters based on word velocity and punctuation
      const estimatedPause = Math.max(
        0.1,
        Math.min(0.45, (liveTranscript.split(/[,.?]/).length * 0.4) / durationSeconds)
      );

      // Note: this client has no real audio-DSP pipeline (no spectral/pitch analysis),
      // so speechRateWpm/pauseRatio are the only metrics genuinely derived from the
      // actual recording. The remaining acoustic fields are honest placeholders (not
      // per-recording fabrications with fake decimal precision) since real values
      // aren't measurable client-side without new signal-processing infrastructure.
      const liveMetrics: AseMetricInput = {
        speechRateWpm: wordsCount > 0 ? Math.max(70, Math.min(260, computedWpm)) : 0,
        pauseRatio: parseFloat(estimatedPause.toFixed(2)),
        spectralEnergyDb: 0,
        semanticCoherenceScore: 0,
        grammarScore: 0,
        pitchContourDynamics: {
          f0StdDevHz: 0,
          pitchRangeSemitones: 0,
          artificialFlatnessIndex: 0,
          unnaturalJumpsCount: 0,
          contourDescription: "Not measured -- no client-side acoustic analysis available.",
        },
        transcribedText: liveTranscript || "",
        topicPrompt: topicPrompt || "Oral presentation test",
      };

      setSpeechRateWpm(liveMetrics.speechRateWpm);
      setPauseRatio(liveMetrics.pauseRatio);
      setTranscribedText(liveMetrics.transcribedText || "");
      executeEvaluation(liveMetrics);
    } else {
      setLiveTranscript("");
      setRecordingStartTime(Date.now());

      const recognizer = createSpeechRecognizer(
        (text, isFinal) => {
          setLiveTranscript(text);
          const words = text.trim().split(/\s+/).filter(Boolean).length;
          const elapsed = (Date.now() - recordingStartTime) / 1000;
          if (elapsed > 2) {
            setLiveWpmEst(Math.round((words / elapsed) * 60));
          }
        },
        (err) => {
          console.warn("Speech recognizer notice:", err);
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
        } catch (e) {
          console.error("Recognizer start error:", e);
        }
      }
    }
  };

  const getRiskBadge = (risk: AseGamingRiskLevel) => {
    switch (risk) {
      case "AUTHENTIC_NATURAL":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
            <ShieldCheck size={14} className="text-emerald-700" />
            AUTHENTIC & BALANCED (PASSED)
          </span>
        );
      case "SUSPECTED_METRIC_IMBALANCE":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-xs">
            <AlertTriangle size={14} className="text-amber-700" />
            SUSPECTED METRIC IMBALANCE
          </span>
        );
      case "FLAGGED_STRUCTURAL_GAMING":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-950 border border-rose-400 flex items-center gap-1.5 shadow-xs animate-pulse">
            <ShieldAlert size={14} className="text-rose-700" />
            FLAGGED: STRUCTURAL METRIC GAMING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Module Header Guide */}
      <ModuleHeaderGuide
        moduleTitle="Acoustic Diagnostics & Anti-Gaming Lab"
        moduleCategory="Acoustic Phonetics"
        estimatedTime="3–7 min per test"
        difficulty="Applied Linguistics & Audio"
        themeColor="cyan"
        steps={[
          {
            title: "Choose Test Mode",
            instruction: "Select 'Live Speech Microphone Test' to test your own spoken voice, or 'Metric Sandbox Simulator' to experiment with acoustic thresholds.",
            tip: "The Sandbox simulates robotic rate-hacking, filler spam, and over-rehearsed speeches.",
          },
          {
            title: "Record or Configure Acoustic Parameters",
            instruction: "Speak into your mic to measure real-time Words-Per-Minute (WPM), pause frequency, phoneme clarity, and filler ratio.",
            tip: "Target 120–160 WPM with natural 250ms+ pauses between clauses.",
          },
          {
            title: "Inspect Cross-Parameter Diagnostics",
            instruction: "Examine the 5-point balance radar, gaming penalty matrix, and authentic delivery confidence score.",
            tip: "Prevents artificial speed-reading and rewards authentic, expressive delivery.",
          },
          {
            title: "Export Diagnostic Audit Summary",
            instruction: "Review the applied linguistics recommendations to balance cadence, intonation, and lexical density.",
            tip: "Claim +45 XP upon completing an authentic live speech evaluation.",
          },
        ]}
        completionGoal="Perform a Live Voice Test or Sandbox Audit to analyze acoustic balance & authentic oral delivery."
        xpReward={45}
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-teal-950 to-indigo-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <Scale size={13} className="text-teal-400" />
              ACOUSTIC SPEECH LAB
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <Activity size={13} /> Pacing & Voice Diagnostics
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white mb-2">
            Acoustic Diagnostics & Evaluation Lab
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Evaluates spoken English performance using balanced multi-metric analysis across articulation speed, natural phrasing, acoustic pitch contours, and topic coherence.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">Core Approach</p>
              <p className="text-sm font-black text-teal-400">Multi-Metric Balance</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">Pacing Analysis</p>
              <p className="text-sm font-black text-teal-300">Speech Rhythm Guard</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">Calibrated Output</p>
              <p className="text-sm font-black text-amber-300">Communicative Score</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
              <p className="text-xs text-slate-400 font-medium">Diagnostics</p>
              <p className="text-sm font-black text-indigo-300">Acoustic Matrix</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Controls: Mode Switcher & Benchmark Presets */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTabMode("simulator")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTabMode === "simulator"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sliders size={14} />
              <span>Multi-Metric Sandbox Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabMode("live_voice")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTabMode === "live_voice"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mic size={14} />
              <span>Live Voice Assessment</span>
            </button>
          </div>

          {/* Verification Certificate Action */}
          {evaluationResult && (
            <button
              type="button"
              onClick={() => setIsCertificateOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <FileCheck size={14} className="text-teal-400" />
              <span>View ASE Forensic Audit Sheet</span>
            </button>
          )}
        </div>

        {/* Benchmark Presets Selector */}
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">
            Load Calibrated Benchmark Presets & Pathological Edge Cases:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {ASE_BENCHMARK_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs"
                      : "bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {preset.name}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 block line-clamp-2">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Workbench: Left Parameters (5 cols) & Right ASE Diagnostics (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Performance Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-black text-base text-slate-900">
                  {activeTabMode === "simulator"
                    ? "Input Performance Metrics"
                    : "Live Audio & Speech Capture"}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeTabMode === "simulator"
                    ? "Dial metric parameters to test joint multi-metric dependencies"
                    : "Speak freely to evaluate real-time acoustic & linguistic balance"}
                </p>
              </div>
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Gauge size={18} />
              </span>
            </div>

            {/* LIVE VOICE MODE DECK */}
            {activeTabMode === "live_voice" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Topic Prompt / Context:
                    </span>
                    <span className="text-[10px] font-black text-teal-400 uppercase">
                      Spontaneous Speech
                    </span>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed font-medium bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                    "{topicPrompt}"
                  </p>

                  <div className="h-12 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center px-4 relative">
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={48}
                      className="w-full h-full"
                    />
                    <span className="absolute right-3 text-[10px] font-bold text-slate-400">
                      {isListening ? "🔴 Recording Live Voice" : "Microphone Ready"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleLiveRecord}
                    className={`flex-1 py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                      isListening
                        ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                        : "bg-teal-700 hover:bg-teal-800 text-white active:scale-95"
                    }`}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    <span>{isListening ? "Stop & Run ASE Evaluation" : "Start Live Speaking Test"}</span>
                  </button>
                </div>

                {liveTranscript && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                      <span>Live Transcript:</span>
                      <span>Est. Speed: {liveWpmEst} WPM</span>
                    </div>
                    <p className="text-xs text-slate-800 italic leading-relaxed">
                      "{liveTranscript}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SIMULATOR SLIDERS DECK */}
            <div className="space-y-4">
              {/* Metric 1: Speech Rate (Words/Min) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <TrendingUp size={13} className="text-teal-600" />
                    Speech Rate (Words/Min):
                  </span>
                  <span className="font-black text-teal-700 font-mono text-sm">
                    {speechRateWpm} WPM
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="280"
                  step="5"
                  value={speechRateWpm}
                  onChange={(e) => setSpeechRateWpm(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-medium text-slate-600">
                  <span>Hesitant (&lt;110)</span>
                  <span className="text-emerald-800 font-bold">Norm (120-160)</span>
                  <span>Fast (160-190)</span>
                  <span className="text-rose-800 font-bold">Rushing (&gt;190)</span>
                </div>
              </div>

              {/* Metric 2: Pause Ratio & Spectral Energy */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Pause Ratio:</span>
                    <span className="font-black text-indigo-700 font-mono">
                      {pauseRatio.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.65"
                    step="0.01"
                    value={pauseRatio}
                    onChange={(e) => setPauseRatio(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-600 block">Norm: 0.15 - 0.30</span>
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Spectral Energy:</span>
                    <span className="font-black text-indigo-700 font-mono">
                      {spectralEnergyDb} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-35"
                    max="-8"
                    step="0.5"
                    value={spectralEnergyDb}
                    onChange={(e) => setSpectralEnergyDb(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-600 block">Norm: -22 to -14 dB</span>
                </div>
              </div>

              {/* Metric 3: Semantic Coherence & Grammar Score */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Semantic Coherence:</span>
                    <span className="font-black text-amber-700 font-mono">
                      {semanticCoherenceScore}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={semanticCoherenceScore}
                    onChange={(e) => setSemanticCoherenceScore(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-600 block">Target: &gt;75%</span>
                </div>

                <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Grammar Score:</span>
                    <span className="font-black text-emerald-700 font-mono">
                      {grammarScore}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={grammarScore}
                    onChange={(e) => setGrammarScore(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-600 block">Target: &gt;80%</span>
                </div>
              </div>

              {/* Metric 4: Pitch Contour Dynamics */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Activity size={13} className="text-purple-600" />
                  Pitch Contour Dynamics (F0 Variance & Range):
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">F0 StdDev:</span>
                      <span className="font-bold font-mono">{f0StdDevHz} Hz</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="110"
                      step="2"
                      value={f0StdDevHz}
                      onChange={(e) => setF0StdDevHz(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-500 block">
                      &lt;12 = Robotic; &gt;75 = Wild
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Pitch Range:</span>
                      <span className="font-bold font-mono">{pitchRangeSemitones} st</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="22"
                      step="0.5"
                      value={pitchRangeSemitones}
                      onChange={(e) => setPitchRangeSemitones(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-500 block">
                      Norm: 4 - 12 semitones
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Artificial Flatness Index:</span>
                  <span className="font-bold font-mono text-purple-800">
                    {artificialFlatnessIndex}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="98"
                  step="2"
                  value={artificialFlatnessIndex}
                  onChange={(e) => setArtificialFlatnessIndex(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Transcribed Text Preview */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Utterance Syntax / Transcribed Text:
                </label>
                <textarea
                  value={transcribedText}
                  onChange={(e) => setTranscribedText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Spoken text for semantic and syntactic evaluation..."
                />
              </div>

              {/* Trigger Evaluation Button */}
              <button
                type="button"
                onClick={() => executeEvaluation()}
                disabled={isEvaluating}
                className="w-full py-3 bg-gradient-to-r from-teal-700 via-indigo-700 to-slate-900 hover:from-teal-800 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Multi-Metric Dependencies...</span>
                  </>
                ) : (
                  <>
                    <Scale size={16} />
                    <span>Run Joint Multi-Metric ASE Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Joint Multi-Metric Evaluation & Anti-Gaming Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {evaluationResult ? (
            <div className="space-y-5">
              {/* FINAL SCORE & GAMING RISK BANNER */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Joint Multi-Metric Evaluation Verdict
                    </span>
                    <h3 className="font-serif font-black text-lg text-slate-900">
                      Weighted Communicative Final Score
                    </h3>
                  </div>
                  <div>{getRiskBadge(evaluationResult.gamingRiskLevel)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Calibrated Final Joint Score */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-teal-950 text-white flex flex-col justify-between">
                    <span className="text-xs text-teal-300 font-bold">
                      Calibrated Joint Score
                    </span>
                    <div className="my-2">
                      <span className="text-3xl sm:text-4xl font-black text-white font-serif">
                        {evaluationResult.jointCommunicativeScore}
                      </span>
                      <span className="text-slate-400 text-sm"> / 100</span>
                    </div>
                    <span className="text-[10px] text-teal-200">
                      Balancing speed, naturalness & semantics
                    </span>
                  </div>

                  {/* Raw Unpenalized Score */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <span className="text-xs text-slate-500 font-bold">
                      Raw Metric Score
                    </span>
                    <div className="my-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-800">
                        {evaluationResult.rawUnpenalizedScore}
                      </span>
                      <span className="text-slate-400 text-xs"> / 100</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Before anti-gaming balance adjustment
                    </span>
                  </div>

                  {/* Anti-Gaming Penalty */}
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col justify-between">
                    <span className="text-xs text-rose-800 font-bold flex items-center gap-1">
                      <ShieldAlert size={13} />
                      Gaming Penalty Total
                    </span>
                    <div className="my-2">
                      <span className="text-2xl sm:text-3xl font-black text-rose-700">
                        -{evaluationResult.antiGamingPenaltyTotal}
                      </span>
                      <span className="text-rose-400 text-xs"> pts</span>
                    </div>
                    <span className="text-[10px] text-rose-800">
                      {evaluationResult.detectedViolations.length} anomaly violations flagged
                    </span>
                  </div>
                </div>

                {/* Sub-Metric Score Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block">
                      Naturalness
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {evaluationResult.subScores.naturalnessScore}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block">
                      Expressiveness
                    </span>
                    <span className="text-sm font-black text-indigo-700">
                      {evaluationResult.subScores.expressivenessScore}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block">
                      Communicative Acc.
                    </span>
                    <span className="text-sm font-black text-teal-700">
                      {evaluationResult.subScores.communicativeAccuracyScore}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block">
                      Structural Integrity
                    </span>
                    <span className="text-sm font-black text-amber-700">
                      {evaluationResult.subScores.structuralIntegrityScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* JOINT MULTI-METRIC DEPENDENCY MATRIX */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Scale size={14} className="text-teal-600" />
                    Joint Multi-Metric Dependency Matrix
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Cross-Metric Coupling Diagnostic
                  </span>
                </div>

                <div className="space-y-2.5">
                  {evaluationResult.jointDependencies.map((dep) => {
                    const isHealthy = dep.correlationStatus === "BALANCED_AUTHENTIC";
                    return (
                      <div
                        key={dep.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          isHealthy
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-rose-50/60 border-rose-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-serif text-sm">
                            {dep.pairName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                              isHealthy
                                ? "bg-emerald-200 text-emerald-950"
                                : "bg-rose-200 text-rose-950"
                            }`}
                          >
                            {dep.correlationStatus.replace("_", " ")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-white/70 p-2 rounded-lg border border-slate-200/60 text-[11px]">
                          <div>
                            <span className="text-slate-500 font-medium">
                              {dep.metricA.name}:
                            </span>{" "}
                            <span className="font-bold text-slate-900">
                              {dep.metricA.value}
                            </span>{" "}
                            <span className="text-[10px] text-slate-400">
                              (Norm: {dep.metricA.expectedNorm})
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">
                              {dep.metricB.name}:
                            </span>{" "}
                            <span className="font-bold text-slate-900">
                              {dep.metricB.value}
                            </span>{" "}
                            <span className="text-[10px] text-slate-400">
                              (Norm: {dep.metricB.expectedNorm})
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-700 leading-relaxed font-medium">
                          {dep.diagnosis}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DETECTED GAMING VIOLATIONS & ANOMALIES */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-rose-600" />
                    Anti-Gaming Anomaly Breakdown & Evidence
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {evaluationResult.detectedViolations.length} Violations
                  </span>
                </div>

                {evaluationResult.detectedViolations.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-center text-xs space-y-1">
                    <CheckCircle2 size={22} className="text-emerald-600 mx-auto" />
                    <p className="font-black text-sm">Zero Structural Gaming Detected</p>
                    <p className="text-emerald-800">
                      All acoustic parameters, delivery tempo, and syntactic structures exhibit
                      authentic human conversational balance.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {evaluationResult.detectedViolations.map((viol) => (
                      <div
                        key={viol.id}
                        className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-950 font-black text-[10px] uppercase">
                            {viol.type.replace(/_/g, " ")}
                          </span>
                          <span className="text-rose-800 font-black">
                            -{viol.penaltyWeight} pts ({viol.severity} SEVERITY)
                          </span>
                        </div>

                        <div className="text-rose-950 font-bold">
                          {viol.metricImbalanceFactor}
                        </div>

                        <p className="text-slate-700 leading-relaxed">
                          {viol.explanation}
                        </p>

                        <div className="p-2.5 rounded-lg bg-white border border-rose-200/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Forensic Evidence:
                          </span>
                          <p className="text-slate-800 italic font-mono text-[11px]">
                            "{viol.evidence}"
                          </p>
                        </div>

                        <div className="pt-1 flex items-start gap-1.5 text-teal-900 font-medium">
                          <Sparkles size={13} className="text-teal-600 mt-0.5 shrink-0" />
                          <span>
                            <strong>Remediation:</strong> {viol.remediationGuidance}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SYNTHESIS & ACTIONABLE REMEDIATION */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <Brain size={14} />
                    ASE Forensic Synthesis & Coaching Remediations
                  </h4>
                  <span className="text-[10px] text-slate-400">Pedagogical Guardrails</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {evaluationResult.synthesisReport}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-amber-300 block">
                    Actionable Steps to Eliminate Metric Gaming:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
                    {evaluationResult.actionableRemediation.map((rem, i) => (
                      <li key={i} className="leading-relaxed">
                        {rem}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Blank state */
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
              <Scale size={32} className="text-slate-400 mx-auto" />
              <h3 className="font-serif font-black text-slate-800 text-lg">
                ASE Anti-Gaming Engine Ready
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a benchmark preset or adjust the metrics on the left, then click
                "Run Joint Multi-Metric ASE Evaluation".
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FORENSIC AUDIT CERTIFICATE MODAL */}
      {isCertificateOpen && evaluationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-slate-900">
                    Official ASE Forensic Evaluation Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Certificate ID: {evaluationResult.evaluationId} • Calibrated Joint Scoring
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCertificateOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-teal-400 uppercase font-black">
                    Final Certified Score
                  </span>
                  <p className="text-3xl font-black font-serif text-white">
                    {evaluationResult.jointCommunicativeScore}/100
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Gaming Risk Level
                  </span>
                  <span className="text-xs font-black text-teal-300">
                    {evaluationResult.gamingRiskLevel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400">Raw Unpenalized:</span>{" "}
                  <span className="font-bold">{evaluationResult.rawUnpenalizedScore}</span>
                </div>
                <div>
                  <span className="text-slate-400">Anti-Gaming Penalty:</span>{" "}
                  <span className="font-bold text-rose-400">
                    -{evaluationResult.antiGamingPenaltyTotal}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Flagged Anomalies:</span>{" "}
                  <span className="font-bold text-amber-400">
                    {evaluationResult.detectedViolations.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-500">
                Joint Metric Coupling Analysis:
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                {evaluationResult.jointDependencies.map((d, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <span className="font-bold">{d.pairName}</span>
                    <span className="font-black text-[10px]">{d.correlationStatus}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Institutional Automated Speech Evaluation Standard
              </span>
              <button
                type="button"
                onClick={() => setIsCertificateOpen(false)}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
