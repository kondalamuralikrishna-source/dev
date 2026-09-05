import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Activity,
  Sparkles,
  Play,
  RotateCcw,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Music,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Globe,
  Sliders,
  Maximize2,
  Flame,
  VolumeX,
} from "lucide-react";
import {
  UserProgress,
  SuprasegmentalEvaluationReport,
  SentenceStressHierarchyItem,
  ClauseToneUnitItem,
  PitchVariationDrillItem,
  RhythmicIsochronyDrillItem,
} from "../types";

interface SuprasegmentalProsodyTutorProps {
  progress?: UserProgress;
  onGrantXp?: (amount: number, reason: string) => void;
  standalone?: boolean;
}

interface ProsodyChallengePreset {
  id: string;
  title: string;
  category: "Isochrony & Stress-Timing" | "Information Focus & Accent Shift" | "Diplomatic Intonation" | "Compound Noun vs Phrase" | "Parenthetical Resets";
  targetSentence: string;
  targetStressPatterns: string;
  targetToneType: string;
  l1RiskWarning: string;
  recommendedBpm: number;
}

const SUPRASEGMENTAL_PRESETS: ProsodyChallengePreset[] = [
  {
    id: "preset-1",
    title: "1. Stress-Timed Isochrony vs Syllable-Timed Staccato",
    category: "Isochrony & Stress-Timing",
    targetSentence: "I'd really appreciate your feedback on the project.",
    targetStressPatterns: "Nuclear Fall-Rise (↘↗) on 'ap-PRE-ciate'; full vowel reduction to /ə/ on 'I'd', 'your', 'on the'; isochronous beat intervals.",
    targetToneType: "Fall-Rise Diplomatic ↘↗",
    l1RiskWarning: "High risk of syllable-timing equalization (giving 'on the' equal duration as 'project').",
    recommendedBpm: 108,
  },
  {
    id: "preset-2",
    title: "2. Contrastive Focus & Nuclear Pitch Accent Shift",
    category: "Information Focus & Accent Shift",
    targetSentence: "I didn't say we should BUY the company, I said we should LEASE it.",
    targetStressPatterns: "Steep High-Fall (↘) on 'BUY' (contrast 1) and 'LEASE' (contrast 2); severe de-accenting and low pitch register on given information 'the company' and 'it'.",
    targetToneType: "Contrastive High-Fall ↘",
    l1RiskWarning: "Tendency to stress repeated given noun 'company', which confuses native listeners' information tracking.",
    recommendedBpm: 116,
  },
  {
    id: "preset-3",
    title: "3. Parenthetical Pitch Reset & Lower Register Shift",
    category: "Parenthetical Resets",
    targetSentence: "The quarterly revenue, which exceeded expectations, grew by fifteen percent.",
    targetStressPatterns: "Tone Unit 1 high anchor on 'RE-venue'; parenthetical clause 'which exceeded expectations' delivered in compressed low pitch register (30Hz down); pitch reset and final fall on 'FIF-teen per-CENT'.",
    targetToneType: "Parenthetical Register Reset ↘→↘",
    l1RiskWarning: "Monotone failure to lower pitch on non-restrictive relative clause.",
    recommendedBpm: 120,
  },
  {
    id: "preset-4",
    title: "4. Tag Question Politeness & Certainty Modulation",
    category: "Diplomatic Intonation",
    targetSentence: "We're meeting the deadline on Friday, aren't we?",
    targetStressPatterns: "Statement body leads with standard high head to nuclear fall on 'FRI-day'; tag 'aren't we?' takes rising pitch glide (↗) for genuine inquiry, or falling glide (↘) for executive confirmation.",
    targetToneType: "Modulated Tag Glide ↗ / ↘",
    l1RiskWarning: "Using flat or abrupt tag pitch that sounds accusatory instead of consultative.",
    recommendedBpm: 104,
  },
  {
    id: "preset-5",
    title: "5. Compound Noun vs Adjective-Noun Rhythmic Stress",
    category: "Compound Noun vs Phrase",
    targetSentence: "We installed the new SOFTWARE update in the WHITE house.",
    targetStressPatterns: "Initial primary stress on compound 'SOFT-ware' (de-accenting 'update'); contrastive final stress on adjective-noun 'white HOUSE' (nuclear accent on head noun).",
    targetToneType: "Lexical Rhythm Contrast ˈ●○ vs ○ˈ●",
    l1RiskWarning: "Over-stressing the second element of compound nouns (e.g. 'soft-WARE').",
    recommendedBpm: 112,
  },
  {
    id: "preset-6",
    title: "6. Executive Crisis Assertion & Steep Downstep",
    category: "Diplomatic Intonation",
    targetSentence: "We must mitigate this critical risk immediately before the launch.",
    targetStressPatterns: "Strong downstepping pitch cascade; compression of modal 'must'; nuclear pitch excursion on 'im-ME-diately' with definitive terminal plunge.",
    targetToneType: "Steep Assertion Plunge ↘",
    l1RiskWarning: "Rising intonation on terminal clause which sounds hesitant or insecure.",
    recommendedBpm: 125,
  },
];

const L1_BACKGROUND_OPTIONS = [
  { value: "Romance (Spanish, French, Italian, Portuguese)", label: "Romance L1 (Syllable-Timed transfer bias)" },
  { value: "Sinitic (Mandarin, Cantonese)", label: "Sinitic L1 (Tonal & syllable-isochrony bias)" },
  { value: "Indic (Hindi, Telugu, Tamil, Bengali)", label: "Indic L1 (Syllable-timed retroflex & pitch reset bias)" },
  { value: "Japanese", label: "Japanese L1 (Mora-timed & pitch-accent transfer)" },
  { value: "Slavic (Russian, Polish, Ukrainian)", label: "Slavic L1 (Heavy reduction & pitch boundary bias)" },
  { value: "General Non-Native English Learner", label: "General Multilingual Learner" },
];

export const SuprasegmentalProsodyTutor: React.FC<SuprasegmentalProsodyTutorProps> = ({
  progress,
  onGrantXp,
  standalone = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ProsodyChallengePreset>(SUPRASEGMENTAL_PRESETS[0]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customSentence, setCustomSentence] = useState("");
  const [customStressRules, setCustomStressRules] = useState("");
  const [userL1, setUserL1] = useState(L1_BACKGROUND_OPTIONS[0].value);
  
  // Audio & Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<SuprasegmentalEvaluationReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Web Audio Pitch Tracking
  const [livePitchHz, setLivePitchHz] = useState<number>(0);
  const [liveF0Track, setLiveF0Track] = useState<Array<{ timeSec: number; f0Hz: number }>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const pitchIntervalRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Metronome State
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(108);
  const metronomeTimerRef = useRef<number | null>(null);
  const metronomeBeatRef = useRef<number>(0);
  const [currentBeatHighlight, setCurrentBeatHighlight] = useState<number>(0);

  // Pitch Curve Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeTargetSentence = isCustomMode ? customSentence || "I'd really appreciate your feedback on the project." : selectedPreset.targetSentence;
  const activeStressPatterns = isCustomMode ? customStressRules || "Stress-timed rhythm with nuclear fall-rise intonation" : selectedPreset.targetStressPatterns;

  // Initialize preset BPM when preset changes
  useEffect(() => {
    if (!isCustomMode) {
      setMetronomeBpm(selectedPreset.recommendedBpm);
    }
  }, [selectedPreset, isCustomMode]);

  // Audio Metronome Click Generator
  const playMetronomeTick = (isHigh: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = isHigh ? 880 : 440; // High click on beat 1

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      // Audio context fallback
    }
  };

  const toggleMetronome = () => {
    if (isMetronomePlaying) {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
      setIsMetronomePlaying(false);
      setCurrentBeatHighlight(0);
    } else {
      setIsMetronomePlaying(true);
      metronomeBeatRef.current = 0;
      const intervalMs = (60 / metronomeBpm) * 1000;

      // Play immediate first tick
      playMetronomeTick(true);
      setCurrentBeatHighlight(1);

      metronomeTimerRef.current = window.setInterval(() => {
        metronomeBeatRef.current = (metronomeBeatRef.current + 1) % 4;
        const beatNum = metronomeBeatRef.current + 1;
        setCurrentBeatHighlight(beatNum);
        playMetronomeTick(beatNum === 1);
      }, intervalMs);
    }
  };

  useEffect(() => {
    return () => {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
      if (pitchIntervalRef.current) clearInterval(pitchIntervalRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Autocorrelation Pitch Detector Algorithm for real-time F0 detection
  const autoCorrelate = (buffer: Float32Array, sampleRate: number): number => {
    let SIZE = buffer.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      let val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.015) return -1; // Not enough signal energy

    let r1 = 0,
      r2 = SIZE - 1,
      thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1,
      maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    // Parabolic interpolation for fine sub-sample resolution
    let x1 = c[T0 - 1],
      x2 = c[T0],
      x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    const freq = sampleRate / T0;
    if (freq >= 75 && freq <= 450) {
      return Math.round(freq);
    }
    return -1;
  };

  // Start Real-Time Pitch Tracking & Voice Capture
  const handleToggleVoice = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (pitchIntervalRef.current) clearInterval(pitchIntervalRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      return;
    }

    setErrorMessage(null);
    setLiveF0Track([]);
    setLivePitchHz(0);

    try {
      // Initialize Web Audio API
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);

      const buf = new Float32Array(analyser.fftSize);

      pitchIntervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buf);
        const pitch = autoCorrelate(buf, audioCtx.sampleRate);
        const elapsedSec = (Date.now() - recordingStartTimeRef.current) / 1000;

        if (pitch > 0) {
          setLivePitchHz(pitch);
          setLiveF0Track((prev) => [...prev.slice(-80), { timeSec: elapsedSec, f0Hz: pitch }]);
        }
      }, 50);

      // Start Speech Recognition
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentText = "";
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setSpokenTranscript(currentText);
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (pitchIntervalRef.current) clearInterval(pitchIntervalRef.current);
        };

        recognition.onerror = () => {
          setIsRecording(false);
          if (pitchIntervalRef.current) clearInterval(pitchIntervalRef.current);
        };

        recognition.start();
      }
    } catch (e: any) {
      console.error("Mic or Speech Recognition error:", e);
      setErrorMessage("Microphone access is unavailable. You can enter or edit transcribed speech directly.");
      setIsRecording(false);
    }
  };

  // Trigger Gemini Suprasegmental Analysis
  const handleAnalyzeProsody = async (speechTextToUse?: string) => {
    const textToAnalyze = speechTextToUse || spokenTranscript || activeTargetSentence;
    if (!textToAnalyze.trim()) {
      setErrorMessage("Please speak or enter a sentence to evaluate.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/gemini/suprasegmental-prosody-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputSpeechText: textToAnalyze,
          targetSentence: activeTargetSentence,
          targetStressPatterns: activeStressPatterns,
          userL1Background: userL1,
          f0Track: liveF0Track.length > 0 ? liveF0Track : null,
          timingData: [
            { word: "phrase", startMs: 0, endMs: Math.round(textToAnalyze.split(" ").length * 320) },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Evaluation request failed: ${response.statusText}`);
      }

      const data: SuprasegmentalEvaluationReport = await response.json();
      setReport(data);

      if (onGrantXp) {
        onGrantXp(45, "Suprasegmental Rhythm & Pitch Mastery");
      }
    } catch (err: any) {
      console.error("Error analyzing suprasegmentals:", err);
      setErrorMessage("Analysis failed. Please check network connection and retry.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Text-to-Speech Preview with Intonational Expression
  const handleSpeakPhrase = (text: string, rate: number = 0.9, pitch: number = 1.0) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Render Pitch Contour Visualizer Canvas
  useEffect(() => {
    if (!canvasRef.current || !report?.pitchContourEvaluation) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 30, right: 40, bottom: 40, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Pitch Range (Hz)
    const minHz = 100;
    const maxHz = 300;

    // Background Grid lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    const hzLevels = [
      { hz: 260, label: "High Pitch (Peak Accent)" },
      { hz: 200, label: "Mid Pitch (Normal Head)" },
      { hz: 140, label: "Low Pitch (Terminal Base)" },
    ];

    hzLevels.forEach((level) => {
      const y = padding.top + chartH - ((level.hz - minHz) / (maxHz - minHz)) * chartH;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${level.hz} Hz`, padding.left - 8, y + 3);
      ctx.textAlign = "left";
      ctx.fillText(level.label, padding.left + chartW + 5, y + 3);
    });
    ctx.setLineDash([]);

    const targetPoints = report.pitchContourEvaluation.targetF0Trajectory || [];
    const actualPoints = report.pitchContourEvaluation.actualF0Trajectory || [];

    // Draw Target Ideal Pitch Contour (Teal/Emerald Curve)
    if (targetPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "#0d9488"; // Teal-600
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      targetPoints.forEach((pt, idx) => {
        const x = padding.left + (pt.timePct / 100) * chartW;
        const y = padding.top + chartH - ((Math.min(maxHz, Math.max(minHz, pt.hz)) - minHz) / (maxHz - minHz)) * chartH;

        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Target point badges
      targetPoints.forEach((pt) => {
        const x = padding.left + (pt.timePct / 100) * chartW;
        const y = padding.top + chartH - ((Math.min(maxHz, Math.max(minHz, pt.hz)) - minHz) / (maxHz - minHz)) * chartH;

        ctx.fillStyle = "#0d9488";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f766e";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(pt.label, x, y - 10);
      });
    }

    // Draw Actual Spoken Pitch Contour (Indigo / Purple Curve)
    if (actualPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "#6366f1"; // Indigo-500
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";

      actualPoints.forEach((pt, idx) => {
        const x = padding.left + (pt.timePct / 100) * chartW;
        const y = padding.top + chartH - ((Math.min(maxHz, Math.max(minHz, pt.hz)) - minHz) / (maxHz - minHz)) * chartH;

        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      actualPoints.forEach((pt) => {
        const x = padding.left + (pt.timePct / 100) * chartW;
        const y = padding.top + chartH - ((Math.min(maxHz, Math.max(minHz, pt.hz)) - minHz) / (maxHz - minHz)) * chartH;

        ctx.fillStyle = "#6366f1";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [report]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider rounded-full border border-teal-500/30 flex items-center gap-1.5">
                <Music size={13} className="text-teal-400" />
                Acoustic & Suprasegmental Engine
              </span>
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
                ToBI / Isochrony Model
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
              Expert Prosody & Suprasegmental Language Tutor
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Master English rhythmic isochrony, nuclear pitch contours, and clause-level information packaging.
              Eliminate syllable-timed staccato delivery and command confident vocal intonation.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4 shrink-0">
            <div className="p-3 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Live Pitch Tracker</p>
              <p className="text-2xl font-black text-white flex items-baseline gap-1">
                {livePitchHz > 0 ? livePitchHz : "--"} <span className="text-xs text-teal-300 font-semibold">Hz (F0)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset vs Custom Sentence Control Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                !isCustomMode
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Curated Prosody Presets
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                isCustomMode
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Custom Spoken Text & Rules
            </button>
          </div>

          {/* L1 Background Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="l1-background-select" className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Globe size={14} className="text-indigo-600" />
              L1 Timing Profile:
            </label>
            <select
              id="l1-background-select"
              aria-label="L1 Timing Profile"
              value={userL1}
              onChange={(e) => setUserL1(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {L1_BACKGROUND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!isCustomMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUPRASEGMENTAL_PRESETS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(preset);
                    setSpokenTranscript("");
                    setReport(null);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all relative ${
                    isSelected
                      ? "bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-xs"
                      : "bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full">
                      {preset.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {preset.recommendedBpm} BPM
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1 line-clamp-1">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-slate-600 italic line-clamp-2">
                    "{preset.targetSentence}"
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="custom-sentence-input" className="text-xs font-bold text-slate-700">
                Input Speech Text (or Spoken Sentence with Timing/Pitch Data):
              </label>
              <textarea
                id="custom-sentence-input"
                aria-label="Input Speech Text"
                value={customSentence}
                onChange={(e) => setCustomSentence(e.target.value)}
                placeholder="e.g., I'd really appreciate your feedback on the project."
                rows={3}
                className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="custom-stress-rules-input" className="text-xs font-bold text-slate-700">
                Target Stress Patterns & Rhythm/Timing Rules:
              </label>
              <textarea
                id="custom-stress-rules-input"
                aria-label="Target Stress Patterns and Rhythm Rules"
                value={customStressRules}
                onChange={(e) => setCustomStressRules(e.target.value)}
                placeholder="e.g., Nuclear pitch glide (↘↗) on 'appreciate'; vowel reduction to /ə/ on function words 'I'd', 'your', 'on the'; isochronous stress feet."
                rows={3}
                className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Selected Target Banner & Metronome Bar */}
        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/30">
                Active Target Sentence
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Tone: {!isCustomMode ? selectedPreset.targetToneType : "Custom"}
              </span>
            </div>
            <p className="text-base font-serif font-bold text-white tracking-wide">
              "{activeTargetSentence}"
            </p>
            <p className="text-xs text-slate-300">
              <span className="font-bold text-teal-300">Target Rule:</span> {activeStressPatterns}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSpeakPhrase(activeTargetSentence, 0.9, 1.0)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700"
              title="Listen to Target Audio Pronunciation"
            >
              <Volume2 size={15} />
              <span>Native Audio</span>
            </button>

            {/* Metronome Clapper */}
            <button
              type="button"
              onClick={toggleMetronome}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isMetronomePlaying
                  ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-black"
                  : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
              }`}
              title="Toggle Rhythmic Stress Metronome"
            >
              <Music size={15} />
              <span>
                {isMetronomePlaying ? `Metronome (${metronomeBpm} BPM)` : `Metronome (${metronomeBpm} BPM)`}
              </span>
            </button>
          </div>
        </div>

        {/* Metronome Beat Indicator Visualizer */}
        {isMetronomePlaying && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-900 uppercase">Stress Beats:</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((b) => (
                  <div
                    key={b}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all ${
                      currentBeatHighlight === b
                        ? "bg-amber-600 text-white scale-110 shadow-md ring-2 ring-amber-400"
                        : "bg-amber-200/70 text-amber-900"
                    }`}
                  >
                    {b}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs font-medium text-amber-800 hidden sm:block">
              Tap finger on bracketed content syllables; squeeze unstressed words between beats.
            </p>
          </div>
        )}
      </div>

      {/* Voice Recorder & Submission Stage */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Mic size={16} className="text-indigo-600" />
              Spoken Audio Input & Live Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Record via mic with live fundamental frequency (F0) tracking or type your transcribed speech.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-200"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{isRecording ? "Stop Recording" : "Record Live Voice"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAnalyzeProsody()}
              disabled={isAnalyzing || isRecording}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Sparkles size={16} className={isAnalyzing ? "animate-spin" : "text-amber-300"} />
              <span>{isAnalyzing ? "Analyzing Suprasegmentals..." : "Run Prosody Evaluation"}</span>
            </button>
          </div>
        </div>

        {/* Live Audio Transcript Input Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="transcript-edit-input" className="text-xs font-bold text-slate-700">
              Spoken Transcript (Auto-transcribed or editable):
            </label>
            {spokenTranscript && (
              <button
                type="button"
                onClick={() => setSpokenTranscript("")}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
          <input
            id="transcript-edit-input"
            aria-label="Spoken Transcript Input"
            type="text"
            value={spokenTranscript}
            onChange={(e) => setSpokenTranscript(e.target.value)}
            placeholder={isRecording ? "Listening to your voice..." : `e.g., "${activeTargetSentence}"`}
            className="w-full text-xs font-semibold p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Evaluation Results Section */}
      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Top Score Matrix Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Overall Prosody</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-teal-700">{report.overallProsodicCompetenceScore}</span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] font-semibold text-teal-700">Rhythm & Intonation</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Stress Timing (Isochrony)</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-indigo-600">{report.timingRhythmClassScore}</span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] font-semibold text-indigo-600">
                {report.languageTimingMismatch.staccatoTransferRisk} Staccato Risk
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Pitch F0 Dynamic Range</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-purple-600">{report.f0PitchMovementScore}</span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] font-semibold text-purple-600">
                {report.pitchContourEvaluation.pitchRangeSemitones} Semitones Span
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Clause Emphasis</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-600">{report.clauseLevelEmphasisScore}</span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-600">Nuclear Prominence</p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TASK 1: PITCH CONTOURS (F0 MOVEMENT), SENTENCE STRESS & PAUSE DISTRIBUTION */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Pitch Contours (F0 Movement), Sentence Stress & Pause Distribution
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
                Shape: {report.pitchContourEvaluation.f0ContourShape.toUpperCase()}
              </span>
            </div>

            {/* F0 Pitch Contour Visualizer Canvas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>F0 Fundamental Frequency Trajectory (Target vs Spoken):</span>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 text-teal-700 font-bold">
                    <span className="w-3 h-3 rounded-full bg-teal-600" /> Target Intonation Curve
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
                    <span className="w-3 h-3 rounded-full bg-indigo-500" /> Your Spoken Pitch
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={780}
                  height={220}
                  className="w-full max-w-3xl h-[220px] rounded-lg"
                />
              </div>

              <p className="text-xs text-slate-600 bg-teal-50/50 p-3 rounded-xl border border-teal-100 leading-relaxed">
                <span className="font-bold text-teal-900">Pitch Movement Analysis:</span>{" "}
                {report.pitchContourEvaluation.f0MovementDescription} (Tonic Syllable:{" "}
                <strong className="text-teal-900 uppercase">'{report.pitchContourEvaluation.tonicSyllable}'</strong>, Dynamic Range:{" "}
                {report.pitchContourEvaluation.pitchRangeQuality}).
              </p>
            </div>

            {/* Sentence Stress Hierarchy Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Sentence Stress Hierarchy & Function Word Reduction:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {report.sentenceStressHierarchy.map((item, idx) => {
                  const isNuclear = item.stressLevel === "nuclear_primary";
                  const isSecondary = item.stressLevel === "secondary_lexical";
                  const isReduced = item.stressLevel === "unstressed_reduced";

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        isNuclear
                          ? "bg-purple-50/80 border-purple-300 ring-1 ring-purple-300"
                          : isSecondary
                          ? "bg-blue-50/60 border-blue-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-black text-slate-900 text-sm">{item.word}</span>
                        <span className="font-mono text-[11px] text-slate-500">{item.ipa}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isNuclear
                              ? "bg-purple-600 text-white"
                              : isSecondary
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.stressLevel.replace("_", " ")}
                        </span>
                        {isReduced && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                            {item.vowelReductionAchieved ? "✓ Schwa /ə/ Reduced" : "⚠ Full Vowel Staccato"}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{item.coachingNote}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Speech Rate & Pause Distribution */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-600" />
                  Cadence & Pause Distribution:
                </h4>
                <span className="text-xs font-bold text-slate-700">
                  Rate: {report.speechRateAndPauseDistribution.articulationRateWpm} WPM ({report.speechRateAndPauseDistribution.syllablesPerSec} syl/s) • {report.speechRateAndPauseDistribution.rateAssessment}
                </span>
              </div>

              {report.speechRateAndPauseDistribution.pauseEvents.length > 0 ? (
                <div className="space-y-1.5">
                  {report.speechRateAndPauseDistribution.pauseEvents.map((pause, pIdx) => (
                    <div
                      key={pIdx}
                      className={`text-xs p-2.5 rounded-lg flex items-start gap-2 ${
                        pause.isAppropriate
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                          : "bg-amber-50 text-amber-900 border border-amber-200"
                      }`}
                    >
                      {pause.isAppropriate ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold">
                          Pause after '{pause.locationAfterWord}' ({pause.durationMs} ms) — {pause.category.replace(/_/g, " ")}
                        </p>
                        <p className="text-[11px] text-slate-600">{pause.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No disruptive pauses detected across tone units.</p>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TASK 2: DISRUPTIONS CAUSED BY LANGUAGE TIMING MISMATCHES (SYLLABLE VS STRESS) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Language Timing Mismatch & Rhythm Typology Diagnosis
                </h3>
              </div>
              <span className="text-xs font-black px-2.5 py-1 bg-indigo-50 text-indigo-900 rounded-full border border-indigo-200">
                Delivery: {report.languageTimingMismatch.timingDeliveryDetected.replace("_", "-").toUpperCase()}
              </span>
            </div>

            {/* Isochrony Summary Card */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 uppercase">Isochrony Assessment</span>
                <span className="text-xs font-bold text-slate-600">
                  Variability Score: {report.languageTimingMismatch.syllableDurationVarianceScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {report.languageTimingMismatch.isochronyViolationSummary}
              </p>
              {report.languageTimingMismatch.l1ProsodicInterferenceProfile && (
                <p className="text-[11px] text-indigo-800 font-semibold">
                  <span className="font-bold">L1 Transfer Influence:</span> {report.languageTimingMismatch.l1ProsodicInterferenceProfile}
                </p>
              )}
            </div>

            {/* Specific Timing Disruptions List */}
            {report.languageTimingMismatch.specificTimingDisruptions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Identified Syllable Timing & Staccato Disruptions:
                </h4>
                <div className="space-y-2">
                  {report.languageTimingMismatch.specificTimingDisruptions.map((disrupt, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Syllable Cluster: "{disrupt.syllableCluster}"
                        </span>
                        <span className="text-[10px] font-black uppercase text-slate-500">
                          {disrupt.issueType.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-slate-700">{disrupt.explanation}</p>
                      <p className="text-teal-800 font-semibold bg-teal-50 p-2 rounded-lg border border-teal-100">
                        <span className="font-black text-teal-900">Rhythm Remedy:</span> {disrupt.remedyInstruction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* TASK 3: ACTIONABLE FEEDBACK: CLAUSE-LEVEL EMPHASIS & PITCH VARIATIONS */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Actionable Feedback: Clause-Level Emphasis & Pitch Variations
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                (Suprasegmental only; no consonant/vowel sound corrections)
              </span>
            </div>

            {/* Clause Tone Units Segmentation */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Clause-Level Tone Units & Nuclear Pitch Markers:
              </h4>
              <div className="space-y-2.5">
                {report.clauseLevelFeedback.clauseToneUnits.map((unit, uIdx) => (
                  <div
                    key={uIdx}
                    className="p-4 bg-purple-50/40 rounded-xl border border-purple-200 text-xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-purple-950 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
                        {unit.prosodicNotationMarkup}
                      </span>
                      <span className="font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full text-[11px]">
                        Nuclear Tone: {unit.nuclearTone}
                      </span>
                    </div>
                    <p className="text-slate-700">
                      <span className="font-bold text-slate-900">Emphasis Rationale:</span> {unit.expectedEmphasisRationale}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-600">Your Alignment:</span>
                      <span
                        className={`font-black px-2 py-0.5 rounded ${
                          unit.userEmphasisAlignment === "Matched"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {unit.userEmphasisAlignment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch Variation & Intonation Drills */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-purple-600" />
                Target Pitch Variation Drills:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.clauseLevelFeedback.pitchVariationDrills.map((drill, drIdx) => (
                  <div
                    key={drIdx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900">{drill.drillTitle}</h5>
                      <span className="text-[10px] font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                        {drill.targetContourType}
                      </span>
                    </div>
                    <p className="text-slate-700">{drill.instruction}</p>
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                      <span className="font-black">Exaggeration Technique:</span> {drill.exaggerationTechnique}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeakPhrase(drill.audioPromptText, 0.85, 1.15)}
                      className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Volume2 size={13} />
                      <span>Hear Contour Target: "{drill.audioPromptText}"</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Rhythmic Isochrony Clapping Drills */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Music size={14} className="text-teal-600" />
                Rhythmic Foot Compaction & Metronome Drills:
              </h4>
              <div className="space-y-2">
                {report.clauseLevelFeedback.rhythmicIsochronyDrills.map((rDrill, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                        Pattern: {rDrill.footPattern}
                      </span>
                      <span className="font-bold text-teal-800">Target Tempo: {rDrill.metronomeBpm} BPM</span>
                    </div>
                    <p className="font-serif font-black text-sm text-slate-900 bg-white p-2.5 rounded-lg border border-teal-100">
                      {rDrill.practiceSentenceWithBeats}
                    </p>
                    <p className="text-slate-700">{rDrill.instruction}</p>
                    <p className="text-[11px] text-teal-800 font-semibold">
                      <span className="font-black">Beat Allocation:</span> {rDrill.clappingBeats}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Plan Checklist */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
              <h4 className="text-xs font-black uppercase text-teal-400 tracking-wider">
                Suprasegmental Mastery Action Plan:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.clauseLevelFeedback.suprasegmentalActionPlan.map((planItem, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-teal-400 shrink-0 mt-0.5" />
                    <span>{planItem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
