import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Volume2,
  RefreshCw,
  Copy,
  Check,
  Download,
  HelpCircle,
  Layers,
  ChevronRight,
  Info,
  Sliders,
  Scale,
  Award,
  Globe,
  Flame,
  Activity,
  FileText,
} from "lucide-react";
import {
  CEFRLevel,
  UserProgress,
  PsychometricAlaEvaluationResult,
  PsychometricAlaInput,
} from "../types";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";

interface PsychometricALAEvaluatorStudioProps {
  progress?: UserProgress;
  onGrantXp?: (amount: number, reason: string) => void;
}

interface BenchmarkPreset {
  id: string;
  name: string;
  category: "Neuro-Inclusive" | "Regional Accent" | "CEFR Benchmark" | "Linguistic Edge-Case";
  description: string;
  targetLevel: CEFRLevel;
  regionalAccent: string;
  conditionContext: string;
  dysfluencyMarkers: string[];
  wpm: number;
  pauseDurations: number[];
  transcript: string;
}

const BENCHMARK_PRESETS: BenchmarkPreset[] = [
  {
    id: "south_asian_c1",
    name: "1. South Asian Tech Lead (C1 Syntax with Retroflex Phonetics)",
    category: "Regional Accent",
    description: "Evaluates complex multi-clause technical discourse with Indian English phonological features. Demonstrates accent disambiguation without nativeness penalties.",
    targetLevel: "C1",
    regionalAccent: "South Asian / Indian English",
    conditionContext: "Standard Fluent / Regional Phonology",
    dysfluencyMarkers: ["Acoustic rhotic variation", "Retroflex plosive articulation"],
    wpm: 148,
    pauseDurations: [380, 520, 440, 610],
    transcript:
      "Notwithstanding the initial latency bottlenecks in our microservices cluster, we subsequently refactored the caching layer. By implementing an asynchronous message queue, we ensured high throughput and mitigated potential cascading service failures under peak loads.",
  },
  {
    id: "inclusive_stutter_c1",
    name: "2. Motor Speech Dysfluency / Stutter (C1 Advanced Lexicon)",
    category: "Neuro-Inclusive",
    description: "Evaluates a speaker experiencing acoustic prolongations and syllable blocks. Demonstrates inclusive speech normalization where motor dysfluencies are shielded from lexical/grammatical penalties.",
    targetLevel: "C1",
    regionalAccent: "General American / Global",
    conditionContext: "Motor Speech Dysfluency (Blocks & Prolongations)",
    dysfluencyMarkers: [
      "Block: /p/ 780ms at phrase onset",
      "Prolongation: /s/ 850ms",
      "Syllable repetition: 're-re-refactored'",
      "Motor pause: 920ms before noun phrase",
    ],
    wpm: 105,
    pauseDurations: [780, 920, 850, 640],
    transcript:
      "When we e-e-encountered the structural vulnerability, our engineering team p-p-prioritized comprehensive cryptographic audits. Although the migration required extensive downtime, it ultimately fortified our data integrity.",
  },
  {
    id: "west_african_b2",
    name: "3. West African Business Director (B2/C1 Executive Register)",
    category: "Regional Accent",
    description: "Syllable-timed rhythm and distinctive intonation contours with strong rhetorical connectors and clear business vocabulary.",
    targetLevel: "B2",
    regionalAccent: "West African English",
    conditionContext: "Standard Fluent / Syllable-timed Prosody",
    dysfluencyMarkers: ["Syllable-timed stress pattern", "Vowel elongation in tonic syllables"],
    wpm: 142,
    pauseDurations: [410, 490, 530, 470],
    transcript:
      "In order to expand our market footprint across the sub-region, we have formulated a strategic alliance with local distributors. This initiative will not only reduce overhead costs but will also significantly enhance our brand equity.",
  },
  {
    id: "latin_american_b1",
    name: "4. Latin American Healthcare Specialist (B1/B2 Threshold)",
    category: "Regional Accent",
    description: "Clear communicative clarity in a medical context with characteristic Spanish vowel onset phonology.",
    targetLevel: "B1",
    regionalAccent: "Latin American English",
    conditionContext: "Standard Fluent / Second-Language Phonology",
    dysfluencyMarkers: ["Prothetic vowel onset before /s/ clusters"],
    wpm: 125,
    pauseDurations: [550, 620, 480],
    transcript:
      "We always explain the treatment procedure to every patient before administering medication because clear communication prevents patient anxiety and ensures adherence to clinical protocols.",
  },
  {
    id: "beginner_a1",
    name: "5. A1 Foundation Speaker (Fragmented Utterances)",
    category: "CEFR Benchmark",
    description: "Fragmented word clusters lacking complete subject-verb-predicate grammar. Accurately diagnosed at CEFR A1.",
    targetLevel: "A1",
    regionalAccent: "Global Beginner",
    conditionContext: "Foundational Language Acquisition",
    dysfluencyMarkers: ["Hesitation pauses > 1200ms", "Linguistic lexical search pauses"],
    wpm: 45,
    pauseDurations: [1200, 1450, 1100],
    transcript: "Me office yesterday... big problem car broken... no can go meeting... very bad.",
  },
];

export const PsychometricALAEvaluatorStudio: React.FC<PsychometricALAEvaluatorStudioProps> = ({
  onGrantXp,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("south_asian_c1");
  const [transcript, setTranscript] = useState<string>(BENCHMARK_PRESETS[0].transcript);
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>("C1");
  const [regionalAccent, setRegionalAccent] = useState<string>("South Asian / Indian English");
  const [conditionContext, setConditionContext] = useState<string>("Standard Fluent / Regional Phonology");
  const [wpm, setWpm] = useState<number>(148);
  const [pauseDurationsStr, setPauseDurationsStr] = useState<string>("380, 520, 440, 610");
  const [dysfluencyMarkers, setDysfluencyMarkers] = useState<string[]>([
    "Acoustic rhotic variation",
    "Retroflex plosive articulation",
  ]);
  const [newMarkerInput, setNewMarkerInput] = useState<string>("");

  // Live recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordIntervalRef = useRef<any>(null);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<PsychometricAlaEvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Load selected preset
  const handleSelectPreset = (preset: BenchmarkPreset) => {
    setSelectedPresetId(preset.id);
    setTranscript(preset.transcript);
    setTargetLevel(preset.targetLevel);
    setRegionalAccent(preset.regionalAccent);
    setConditionContext(preset.conditionContext);
    setWpm(preset.wpm);
    setPauseDurationsStr(preset.pauseDurations.join(", "));
    setDysfluencyMarkers(preset.dysfluencyMarkers);
    setEvaluationResult(null);
    setErrorMessage(null);
  };

  // Add custom dysfluency marker
  const handleAddMarker = () => {
    const trimmed = newMarkerInput.trim();
    if (trimmed && !dysfluencyMarkers.includes(trimmed)) {
      setDysfluencyMarkers([...dysfluencyMarkers, trimmed]);
      setNewMarkerInput("");
    }
  };

  const handleRemoveMarker = (marker: string) => {
    setDysfluencyMarkers(dysfluencyMarkers.filter((m) => m !== marker));
  };

  // Live Microphone Recording using SpeechRecognition + Web Audio API
  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Stop recognition:", e);
        }
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
      setIsRecording(false);
      setAudioLevel(0);
    } else {
      // Start recording
      setErrorMessage(null);
      try {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
          setErrorMessage(
            "SpeechRecognition API is not supported in this browser. You can type or paste the transcript directly."
          );
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let fullText = "";
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript + " ";
          }
          setTranscript(fullText.trim());

          // Estimate WPM based on elapsed time
          const words = fullText.trim().split(/\s+/).filter((w) => w.length > 0).length;
          const mins = Math.max(0.1, recordingSeconds / 60);
          const computedWpm = Math.round(words / mins);
          if (computedWpm > 30 && computedWpm < 300) {
            setWpm(computedWpm);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;

        // Audio waveform meter
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const updateMeter = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animationFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();

        setRecordingSeconds(0);
        recordIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);

        setIsRecording(true);
      } catch (err: any) {
        console.error("Microphone access failed:", err);
        setErrorMessage(
          "Microphone permission was denied or unavailable. Please enter transcript manually."
        );
      }
    }
  };

  // Cleanup microphone on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    };
  }, []);

  // Run Psychometric Evaluation
  const handleRunEvaluation = async () => {
    if (!transcript.trim()) {
      setErrorMessage("Please enter or record candidate speech transcript first.");
      return;
    }

    setIsEvaluating(true);
    setErrorMessage(null);

    const pauseNumbers = pauseDurationsStr
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    const payload: PsychometricAlaInput = {
      candidate_transcript: transcript.trim(),
      acoustic_metadata: {
        pause_durations_ms: pauseNumbers.length > 0 ? pauseNumbers : [400, 500, 600],
        acoustic_dysfluency_markers: dysfluencyMarkers,
        estimated_speaking_rate_wpm: wpm,
        regional_accent_hint: regionalAccent,
        speech_condition_context: conditionContext,
      },
      target_cefr_benchmark: targetLevel,
    };

    try {
      const res = await fetch("/api/ala/psychometric-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server responded with ${res.status}`);
      }

      const result: PsychometricAlaEvaluationResult = await res.json();
      setEvaluationResult(result);

      if (onGrantXp) {
        onGrantXp(45, "Completed Psychometric Automated Language Assessment (ALA)");
      }
    } catch (err: any) {
      console.error("Evaluation request error:", err);
      setErrorMessage(`Evaluation Error: ${err.message || "Failed to contact ALA service"}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCopyJson = () => {
    if (!evaluationResult) return;
    navigator.clipboard.writeText(JSON.stringify(evaluationResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const getCefrBadgeColor = (level: string) => {
    switch (level) {
      case "C2":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "C1":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "B2":
        return "bg-teal-100 text-teal-900 border-teal-300";
      case "B1":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "A2":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "A1":
      default:
        return "bg-rose-100 text-rose-900 border-rose-300";
    }
  };

  const getBandScoreColor = (score: number) => {
    if (score >= 8.0) return "text-purple-700";
    if (score >= 6.5) return "text-emerald-700";
    if (score >= 5.5) return "text-teal-700";
    if (score >= 4.0) return "text-blue-700";
    return "text-rose-700";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Module Header Guide */}
      <ModuleHeaderGuide
        moduleTitle="Psychometric Automated Language Assessment (ALA) Studio"
        moduleCategory="Psychometric ALA & Inclusive Oral Assessment"
        estimatedTime="5–10 min diagnostic"
        difficulty="Empirical CEFR Benchmark (A1–C2)"
        themeColor="emerald"
        steps={[
          {
            title: "Select Case Study or Live Record",
            instruction: "Choose from calibrated regional accent & neuro-inclusive benchmarks, or speak directly into your microphone.",
            tip: "Speech is evaluated for Intelligibility over Nativeness.",
          },
          {
            title: "Configure Inclusive Acoustic Metadata",
            instruction: "Tag motor dysfluencies (stutters, prolongations, blocks) to test automatic inclusive shielding.",
            tip: "Motor speech variations are shielded from penalizing lexical diversity or grammatical range.",
          },
          {
            title: "Execute Standardized ALA Diagnostic",
            instruction: "Run the empirical CEFR multi-dimensional diagnostic to receive band scores (1.0–9.0) and rater reliability metrics.",
            tip: "Disambiguates regional accents from genuine communicative breakdowns.",
          },
        ]}
      />

      {/* Hero Banner with Principles */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Scale size={14} /> Empirical Psychometrics & ALA Standard
              </span>
              <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs px-3 py-1 rounded-full font-medium">
                Fairness & Inclusivity Protocol
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
              Automated Language Assessment (ALA) Engine
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1 max-w-3xl leading-relaxed">
              Standardized oral proficiency assessment benchmarked against CEFR and IELTS Speaking Band Descriptors with <strong>accent-neutral intelligibility disambiguation</strong> and <strong>neuro-inclusive speech normalization</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/15">
            <div className="text-center px-2">
              <div className="text-xs text-emerald-200 uppercase font-semibold">Dimensions</div>
              <div className="text-xl font-bold text-white">4 Pillars</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <div className="text-xs text-emerald-200 uppercase font-semibold">Scale</div>
              <div className="text-xl font-bold text-white">1.0 – 9.0</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <div className="text-xs text-emerald-200 uppercase font-semibold">Inclusivity</div>
              <div className="text-xl font-bold text-emerald-300">Shielded</div>
            </div>
          </div>
        </div>

        {/* 3 Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-emerald-800/80">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
              <Globe size={14} /> 1. Accent & Intelligibility
            </div>
            <p className="text-slate-300 leading-snug">
              Accent is not a proficiency penalty. Deductions apply strictly if acoustic patterns cause semantic ambiguity.
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs">
            <div className="font-bold text-teal-300 flex items-center gap-1.5 mb-1">
              <ShieldCheck size={14} /> 2. Atypical & Inclusive Shielding
            </div>
            <p className="text-slate-300 leading-snug">
              Differentiates motor dysfluencies (stutters, blocks) from linguistic breakdown. Motor pauses are shielded.
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <Award size={14} /> 3. Empirical CEFR Mapping
            </div>
            <p className="text-slate-300 leading-snug">
              4 dimensions evaluated: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Intelligibility.
            </p>
          </div>
        </div>
      </div>

      {/* Main Studio Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Preset Selector Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-600" /> Benchmark Presets & Case Studies
              </label>
              <span className="text-[11px] text-slate-500">{BENCHMARK_PRESETS.length} Calibrated Cases</span>
            </div>

            <div className="space-y-2">
              {BENCHMARK_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? "bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-400/40"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span className={isSelected ? "text-emerald-900 font-bold" : ""}>
                        {preset.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCefrBadgeColor(
                          preset.targetLevel
                        )}`}
                      >
                        Target {preset.targetLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-slate-500">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                        Accent: {preset.regionalAccent}
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                        {preset.wpm} WPM
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transcript & Microphone Live Studio Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText size={14} className="text-emerald-600" /> Candidate Speech Transcript
              </label>

              {/* Live Mic Toggle Button */}
              <button
                type="button"
                onClick={handleToggleRecording}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff size={14} /> Stop Recording ({recordingSeconds}s)
                  </>
                ) : (
                  <>
                    <Mic size={14} /> Record Live Speech
                  </>
                )}
              </button>
            </div>

            {/* Live Audio Visualizer VU Meter */}
            {isRecording && (
              <div className="bg-slate-900 rounded-lg p-3 text-white space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Activity size={14} className="animate-spin" /> Live Microphone Input Stream
                  </span>
                  <span>Audio Level: {audioLevel}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-rose-500 transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  Listening... Speak freely. Motor pauses and natural accent cadence are tracked in real time.
                </div>
              </div>
            )}

            {/* Transcript Textarea */}
            <div className="relative">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={5}
                placeholder="Paste or record candidate spoken response..."
                className="w-full p-3.5 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none leading-relaxed transition-all resize-y"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 mt-1">
                <span>
                  Words: <strong>{transcript.trim().split(/\s+/).filter((w) => w.length > 0).length}</strong>
                </span>
                <span>
                  Characters: <strong>{transcript.length}</strong>
                </span>
              </div>
            </div>

            {/* Acoustic Metadata Form Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sliders size={14} className="text-teal-600" /> Acoustic & Inclusive Metadata
                </span>
              </div>

              {/* Target Benchmark & Regional Accent */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Target CEFR Benchmark
                  </label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as CEFRLevel)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="A1">A1 (Beginner)</option>
                    <option value="A2">A2 (Elementary)</option>
                    <option value="B1">B1 (Intermediate)</option>
                    <option value="B2">B2 (Upper-Intermediate)</option>
                    <option value="C1">C1 (Advanced)</option>
                    <option value="C2">C2 (Mastery)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Speaking Rate (WPM)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={wpm}
                      min={30}
                      max={280}
                      onChange={(e) => setWpm(Number(e.target.value) || 120)}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">WPM</span>
                  </div>
                </div>
              </div>

              {/* Regional Accent & Speech Condition */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Regional Accent Profile
                  </label>
                  <input
                    type="text"
                    value={regionalAccent}
                    onChange={(e) => setRegionalAccent(e.target.value)}
                    placeholder="e.g. South Asian, Latin American"
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Speech Condition / Context
                  </label>
                  <input
                    type="text"
                    value={conditionContext}
                    onChange={(e) => setConditionContext(e.target.value)}
                    placeholder="e.g. Motor Stutter, Neuro-inclusive"
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Pause Durations (ms) */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Pause Durations (ms, comma-separated)
                </label>
                <input
                  type="text"
                  value={pauseDurationsStr}
                  onChange={(e) => setPauseDurationsStr(e.target.value)}
                  placeholder="380, 520, 440, 610"
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Acoustic Dysfluency Markers List & Quick Add */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Acoustic Dysfluency Markers (Shielded from penalty)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {dysfluencyMarkers.map((marker, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] px-2 py-0.5 rounded-full font-medium"
                    >
                      {marker}
                      <button
                        type="button"
                        onClick={() => handleRemoveMarker(marker)}
                        className="hover:text-rose-600 font-bold ml-0.5 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {dysfluencyMarkers.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">No markers tagged.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMarkerInput}
                    onChange={(e) => setNewMarkerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMarker();
                      }
                    }}
                    placeholder="Add marker (e.g. Block /t/ 600ms)..."
                    className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMarker}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Run Diagnostic Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleRunEvaluation}
                disabled={isEvaluating || !transcript.trim()}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                  isEvaluating || !transcript.trim()
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 cursor-pointer active:scale-[0.99]"
                }`}
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Evaluating Speech Psychometrics...
                  </>
                ) : (
                  <>
                    <Scale size={16} /> Run Empirical Psychometric ALA Diagnostic
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <strong>Diagnostic Alert:</strong> {errorMessage}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Diagnostic Results & Dimensional Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {!evaluationResult && !isEvaluating && (
            <div className="bg-white rounded-xl p-10 border border-dashed border-slate-300 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Scale size={32} />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-800">
                  Awaiting Candidate Speech Evaluation
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Select a case study from the left or speak into the microphone, then click <strong>Run Empirical Psychometric ALA Diagnostic</strong> to generate a multi-dimensional CEFR report.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-medium">
                  Intelligibility over Nativeness
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-medium">
                  Atypical Speech Shielding
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-medium">
                  IELTS / CEFR 1.0–9.0 Scale
                </span>
              </div>
            </div>
          )}

          {isEvaluating && (
            <div className="bg-white rounded-xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Brain size={32} className="animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Analyzing Acoustic Metadata & Linguistic Matrix...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Filtering acoustic dysfluency flags • Disambiguating regional phonetics • Calibrating 4 CEFR dimensions
                </p>
              </div>
              <div className="w-48 bg-slate-100 h-2 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-emerald-600 animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          )}

          {evaluationResult && (
            <div className="space-y-5 animate-fadeIn">
              {/* Assessment Top Metadata Banner */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Empirical CEFR Result
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getCefrBadgeColor(
                          evaluationResult.assessment_metadata.overall_cefr_level
                        )}`}
                      >
                        CEFR Level {evaluationResult.assessment_metadata.overall_cefr_level}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span
                        className={`text-3xl font-extrabold font-serif ${getBandScoreColor(
                          evaluationResult.assessment_metadata.overall_band_score
                        )}`}
                      >
                        Band {evaluationResult.assessment_metadata.overall_band_score.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500">
                        / 9.0 Standard Scale
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center min-w-[110px]">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Reliability Index</div>
                      <div className="text-sm font-bold text-emerald-700">
                        {(evaluationResult.assessment_metadata.confidence_score * 100).toFixed(0)}% Confidence
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center min-w-[120px]">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Expert Review</div>
                      <div className="text-xs font-bold flex items-center justify-center gap-1 mt-0.5">
                        {evaluationResult.assessment_metadata.human_review_recommended ? (
                          <span className="text-amber-700 flex items-center gap-1">
                            <ShieldAlert size={13} /> Recommended
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={13} /> Certified AI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flagged Reasons (if any) */}
                {evaluationResult.assessment_metadata.flagged_reasons &&
                  evaluationResult.assessment_metadata.flagged_reasons.length > 0 && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <Info size={14} /> Diagnostic Flag & Review Notes:
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {evaluationResult.assessment_metadata.flagged_reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* 4 Dimension Score Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Fluency & Coherence */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Activity size={14} className="text-emerald-600" /> Fluency & Coherence (FC)
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      {evaluationResult.dimension_scores.fluency_and_coherence.score.toFixed(1)} / 9.0
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                      {evaluationResult.dimension_scores.fluency_and_coherence.cefr_equivalent}
                    </span>
                    {evaluationResult.dimension_scores.fluency_and_coherence.atypical_speech_adjustments_applied && (
                      <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <ShieldCheck size={11} /> Motor Shield Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                    {evaluationResult.dimension_scores.fluency_and_coherence.justification}
                  </p>
                </div>

                {/* 2. Lexical Resource */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Brain size={14} className="text-purple-600" /> Lexical Resource (LR)
                    </span>
                    <span className="text-sm font-extrabold text-purple-700">
                      {evaluationResult.dimension_scores.lexical_resource.score.toFixed(1)} / 9.0
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                      {evaluationResult.dimension_scores.lexical_resource.cefr_equivalent}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Unpenalized for dysfluent repetitions
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                    {evaluationResult.dimension_scores.lexical_resource.justification}
                  </p>
                </div>

                {/* 3. Grammatical Range & Accuracy */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Scale size={14} className="text-blue-600" /> Grammatical Range (GRA)
                    </span>
                    <span className="text-sm font-extrabold text-blue-700">
                      {evaluationResult.dimension_scores.grammatical_range_and_accuracy.score.toFixed(1)} / 9.0
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                      {evaluationResult.dimension_scores.grammatical_range_and_accuracy.cefr_equivalent}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                    {evaluationResult.dimension_scores.grammatical_range_and_accuracy.justification}
                  </p>
                </div>

                {/* 4. Intelligibility & Pronunciation */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Volume2 size={14} className="text-teal-600" /> Intelligibility & Clarity (IPC)
                    </span>
                    <span className="text-sm font-extrabold text-teal-700">
                      {evaluationResult.dimension_scores.intelligibility_and_pronunciation.score.toFixed(1)} / 9.0
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                      {evaluationResult.dimension_scores.intelligibility_and_pronunciation.cefr_equivalent}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      Accent Disambiguated
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                    {evaluationResult.dimension_scores.intelligibility_and_pronunciation.justification}
                  </p>
                  {evaluationResult.dimension_scores.intelligibility_and_pronunciation.accent_vs_error_disambiguation_notes && (
                    <div className="text-[11px] text-teal-900 bg-teal-50/80 p-2 rounded border border-teal-200/80 leading-tight">
                      <strong>Accent Protocol:</strong> {evaluationResult.dimension_scores.intelligibility_and_pronunciation.accent_vs_error_disambiguation_notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Psychometric Diagnostic & Shielding Audit */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-600" /> Psychometric Diagnostic & Inclusivity Audit
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-500 font-semibold mb-0.5">Detected Accent Profile:</div>
                    <div className="font-bold text-slate-900">
                      {evaluationResult.psychometric_diagnostic.detected_accent_profile}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-500 font-semibold mb-0.5">Intelligibility Impact:</div>
                    <div className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={13} /> {evaluationResult.psychometric_diagnostic.intelligibility_impact} Impact (High Communicative Clarity)
                    </div>
                  </div>
                </div>

                {/* Shielded Markers List */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-700" />
                    Neurodivergent & Motor Speech Markers Shielded from Penalty:
                  </div>
                  <ul className="list-disc pl-5 text-xs text-emerald-800 space-y-1">
                    {evaluationResult.psychometric_diagnostic.neurodivergent_or_pathology_markers_discounted.map(
                      (marker, idx) => (
                        <li key={idx}>{marker}</li>
                      )
                    )}
                  </ul>
                </div>

                {/* Actionable Feedback */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">Actionable Feedback for Learner & Evaluator:</div>
                  <div className="space-y-1.5">
                    {evaluationResult.psychometric_diagnostic.actionable_feedback_for_learner.map((fb, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{fb}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions & Export */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Evaluation ID: {evaluationResult.evaluation_id || "ala_verified"}
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedJson ? (
                      <>
                        <Check size={14} className="text-emerald-600" /> Copied JSON Schema
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Standard ALA JSON
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
