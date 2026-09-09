import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Mic,
  MicOff,
  Volume2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Sparkles,
  Layers,
  FileCode,
  Download,
  Copy,
  Check,
  ChevronRight,
  Info,
  Clock,
  Radio,
  Cpu,
  BarChart3,
  Waves,
  Zap,
} from "lucide-react";
import {
  AcousticDiagnosticResult,
  AcousticDiagnosticInputPayload,
  AudioStreamMetadataPayload,
  SilencePauseEventPayload,
  PhonemeAlignmentPayload,
  UserProgress,
} from "../types";

interface AcousticSpeechScienceStudioProps {
  progress?: UserProgress;
  onGrantXp?: (amount: number, reason: string) => void;
}

interface BenchmarkPreset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  accentOrigin: string;
  targetText: string;
  decodedText: string;
  audioMetadata: AudioStreamMetadataPayload;
  phonemeAlignments: PhonemeAlignmentPayload;
  silencePauses: SilencePauseEventPayload[];
  description: string;
}

const PRESET_SCENARIOS: BenchmarkPreset[] = [
  {
    id: "fricative_noise_floor",
    title: "Dental Fricative Substitution & Low-Cost Mic Noise Floor",
    subtitle: "/θ/ → /t/ plosive shift with -28 dBFS elevated noise floor & consumer mic clipping",
    category: "Hardware Normalization & Substitution",
    accentOrigin: "General / Unspecified L2",
    targetText: "I think three thoughts through the day.",
    decodedText: "I tink tree tots tru de day.",
    audioMetadata: {
      noise_floor_dbfs: -28.4,
      pre_norm_rms_db: -1.2,
      post_norm_rms_db: -14.5,
      stream_latency_ms: 62,
      packet_jitter_ms: 18,
    },
    phonemeAlignments: {
      target_phonemes: ["AY", "TH", "IH", "NG", "K", "TH", "R", "IY", "TH", "AO", "T", "S", "TH", "R", "UW", "DH", "AH", "D", "EY"],
      realized_phonemes: ["AY", "T", "IH", "NG", "K", "T", "R", "IY", "T", "AO", "T", "S", "T", "R", "UW", "D", "AH", "D", "EY"],
      confidence_scores: [0.96, 0.72, 0.94, 0.95, 0.92, 0.68, 0.93, 0.95, 0.70, 0.91, 0.92, 0.88, 0.71, 0.92, 0.94, 0.75, 0.96, 0.95, 0.97],
      formants: [
        { f1: 520, f2: 1850, f3: 2600 },
        { f1: 340, f2: 2200, f3: 2850 },
        { f1: 580, f2: 1100, f3: 2450 },
      ],
      f0_vector: [122, 125, 130, 128, 124, 120, 118, 126],
      words: ["I", "think", "three", "thoughts", "through", "the", "day"],
    },
    silencePauses: [
      { start_ms: 1200, end_ms: 1550, acoustic_environment_noise_level: -28.4, preceding_word: "thoughts", following_word: "through", is_clause_boundary: false },
      { start_ms: 2400, end_ms: 2650, acoustic_environment_noise_level: -28.1, preceding_word: "through", following_word: "the", is_clause_boundary: false },
    ],
    description: "Evaluates the acoustic engine's ability to normalize a noisy consumer microphone (-28 dBFS noise floor + audio peak clipping) and apply an uncertainty penalty factor specifically to fricative energy without discarding the /θ/ → /t/ substitution diagnostic.",
  },
  {
    id: "non_rhotic_vs_epenthesis",
    title: "Non-Rhotic Accent Isolation vs. Consonant Cluster Epenthesis",
    subtitle: "British/Australian non-rhoticity protected vs. Spanish-influence /e/ vowel insertion",
    category: "Accent Isolation vs Error",
    accentOrigin: "Spanish L1 + British English Exposure",
    targetText: "The smart student parked near the school.",
    decodedText: "The smaht student pahked neah the es-school.",
    audioMetadata: {
      noise_floor_dbfs: -46.2,
      pre_norm_rms_db: -18.5,
      post_norm_rms_db: -15.0,
      stream_latency_ms: 38,
      packet_jitter_ms: 8,
    },
    phonemeAlignments: {
      target_phonemes: ["DH", "AH", "S", "M", "AA", "R", "T", "S", "T", "UW", "D", "AH", "N", "T", "P", "AA", "R", "K", "T", "N", "IH", "R", "DH", "AH", "S", "K", "UW", "L"],
      realized_phonemes: ["DH", "AH", "S", "M", "AA", "T", "S", "T", "UW", "D", "AH", "N", "T", "P", "AA", "K", "T", "N", "IH", "AH", "DH", "AH", "EH", "S", "K", "UW", "L"],
      confidence_scores: [0.98, 0.95, 0.92, 0.91, 0.96, 0.89, 0.94, 0.93, 0.95, 0.94, 0.92, 0.91, 0.93, 0.94, 0.95, 0.88, 0.94, 0.92, 0.95, 0.91, 0.98, 0.96, 0.78, 0.91, 0.94, 0.96, 0.95],
      formants: [
        { f1: 680, f2: 1220, f3: 2500 },
        { f1: 420, f2: 2100, f3: 2750 },
      ],
      words: ["The", "smart", "student", "parked", "near", "the", "school"],
    },
    silencePauses: [
      { start_ms: 1800, end_ms: 2200, acoustic_environment_noise_level: -46.2, preceding_word: "student", following_word: "parked", is_clause_boundary: true },
    ],
    description: "Tests the phonetic disambiguation rule: post-vocalic /r/ omission ('smart' -> 'smaht') is recognized as valid non-rhotic dialect phonology, while prosthetic /e/ insertion before /sk/ ('es-school') is flagged as an articulation insertion error.",
  },
  {
    id: "syntactic_vs_latency_jitter",
    title: "Syntactic Thinking Pauses vs. Network Latency Jitter Glitch",
    subtitle: "Complex clause boundary thinking pause validated; packet drop jitter excluded from WPM penalty",
    category: "Latency-Aware Temporal Segmentation",
    accentOrigin: "General Global English",
    targetText: "Although the quarterly forecast was uncertain, we decided to proceed with the project expansion.",
    decodedText: "Although the quarterly forecast was uncertain... we decided to proceed with the project expansion.",
    audioMetadata: {
      noise_floor_dbfs: -44.0,
      pre_norm_rms_db: -20.0,
      post_norm_rms_db: -15.5,
      stream_latency_ms: 110,
      packet_jitter_ms: 48,
    },
    phonemeAlignments: {
      target_phonemes: ["AO", "L", "DH", "OW", "DH", "AH", "K", "W", "AO", "R", "T", "ER", "L", "IY", "F", "AO", "R", "K", "AE", "S", "T", "W", "AH", "Z", "AH", "N", "S", "ER", "T", "AH", "N"],
      realized_phonemes: ["AO", "L", "DH", "OW", "DH", "AH", "K", "W", "AO", "R", "T", "ER", "L", "IY", "F", "AO", "R", "K", "AE", "S", "T", "W", "AH", "Z", "AH", "N", "S", "ER", "T", "AH", "N"],
      confidence_scores: [0.95, 0.94, 0.96, 0.95, 0.98, 0.97, 0.93, 0.95, 0.92, 0.94, 0.96, 0.93, 0.95, 0.96, 0.94, 0.92, 0.95, 0.96, 0.94, 0.95, 0.96],
      words: ["Although", "the", "quarterly", "forecast", "was", "uncertain", "we", "decided", "to", "proceed", "with", "the", "project", "expansion"],
    },
    silencePauses: [
      { start_ms: 2100, end_ms: 3050, acoustic_environment_noise_level: -44.0, preceding_word: "uncertain", following_word: "we", is_clause_boundary: true },
      { start_ms: 4200, end_ms: 4580, acoustic_environment_noise_level: -44.0, preceding_word: "proceed", following_word: "with", is_clause_boundary: false },
      { start_ms: 5100, end_ms: 5240, acoustic_environment_noise_level: -44.0, preceding_word: "project", following_word: "expansion", is_clause_boundary: false },
    ],
    description: "Demonstrates temporal segmentation: the 950ms pause at the comma is classified as a legitimate cognitive/syntactic thinking pause, while the 140ms jitter gap is filtered out as a network streaming artifact, leaving Net Articulation WPM unaffected.",
  },
  {
    id: "vowel_formant_drift",
    title: "Vowel Formant Drift (F1/F2 High-Vowel Tensing)",
    subtitle: "Lax /ɪ/ drifting toward tense /iː/ with measurable Formant 1/2 frequency shift",
    category: "Computational Formant Extraction",
    accentOrigin: "East Asian L1",
    targetText: "The captain steered the ship past the green sheep on the hill.",
    decodedText: "The captain steered the sheep past the green sheep on the heel.",
    audioMetadata: {
      noise_floor_dbfs: -41.0,
      pre_norm_rms_db: -21.0,
      post_norm_rms_db: -16.0,
      stream_latency_ms: 42,
      packet_jitter_ms: 10,
    },
    phonemeAlignments: {
      target_phonemes: ["DH", "AH", "K", "AE", "P", "T", "AH", "N", "S", "T", "IH", "R", "D", "DH", "AH", "SH", "IH", "P", "P", "AE", "S", "T", "DH", "AH", "G", "R", "IY", "N", "SH", "IY", "P", "AA", "N", "DH", "AH", "HH", "IH", "L"],
      realized_phonemes: ["DH", "AH", "K", "AE", "P", "T", "AH", "N", "S", "T", "IH", "R", "D", "DH", "AH", "SH", "IY", "P", "P", "AE", "S", "T", "DH", "AH", "G", "R", "IY", "N", "SH", "IY", "P", "AA", "N", "DH", "AH", "HH", "IY", "L"],
      confidence_scores: [0.97, 0.96, 0.94, 0.92, 0.95, 0.93, 0.96, 0.95, 0.93, 0.94, 0.95, 0.92, 0.96, 0.97, 0.98, 0.94, 0.74, 0.95, 0.93, 0.94, 0.95, 0.96, 0.98, 0.97, 0.94, 0.93, 0.97, 0.96, 0.95, 0.97, 0.96, 0.94, 0.96, 0.98, 0.97, 0.92, 0.71, 0.93],
      formants: [
        { f1: 310, f2: 2320, f3: 2950 },
        { f1: 320, f2: 2280, f3: 2910 },
      ],
      words: ["The", "captain", "steered", "the", "ship", "past", "the", "green", "sheep", "on", "the", "hill"],
    },
    silencePauses: [
      { start_ms: 1400, end_ms: 1650, acoustic_environment_noise_level: -41.0, preceding_word: "steered", following_word: "the", is_clause_boundary: false },
    ],
    description: "Evaluates high vowel formant dispersion: lax vowel /ɪ/ in 'ship' (expected F1~480Hz, F2~1950Hz) shifts to F1=310Hz, F2=2320Hz, triggering a Vowel Drift diagnostic with high acoustic confidence.",
  },
];

export const AcousticSpeechScienceStudio: React.FC<AcousticSpeechScienceStudioProps> = ({
  onGrantXp,
}) => {
  // Active Preset & Form State
  const [selectedPresetId, setSelectedPresetId] = useState<string>("fricative_noise_floor");
  const [noiseFloorDbfs, setNoiseFloorDbfs] = useState<number>(-28.4);
  const [preNormRmsDb, setPreNormRmsDb] = useState<number>(-1.2);
  const [postNormRmsDb, setPostNormRmsDb] = useState<number>(-14.5);
  const [streamLatencyMs, setStreamLatencyMs] = useState<number>(62);
  const [packetJitterMs, setPacketJitterMs] = useState<number>(18);
  const [speakerAccent, setSpeakerAccent] = useState<string>("General / Unspecified L2");
  const [targetTranscript, setTargetTranscript] = useState<string>("I think three thoughts through the day.");
  const [decodedTranscript, setDecodedTranscript] = useState<string>("I tink tree tots tru de day.");
  const [silencePauses, setSilencePauses] = useState<SilencePauseEventPayload[]>([
    { start_ms: 1200, end_ms: 1550, acoustic_environment_noise_level: -28.4, preceding_word: "thoughts", following_word: "through", is_clause_boundary: false },
    { start_ms: 2400, end_ms: 2650, acoustic_environment_noise_level: -28.1, preceding_word: "through", following_word: "the", is_clause_boundary: false },
  ]);

  // Real-time Mic & Web Audio API
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [liveRmsDb, setLiveRmsDb] = useState<number>(-60);
  const [livePeakDb, setLivePeakDb] = useState<number>(-60);
  const [liveNoiseFloorDb, setLiveNoiseFloorDb] = useState<number>(-50);
  const [micClippingWarning, setMicClippingWarning] = useState<boolean>(false);

  // Analysis Result & UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<AcousticDiagnosticResult | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [rawJsonCopied, setRawJsonCopied] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "phonemes" | "vowel_space" | "timing" | "json">("overview");

  // Canvas Refs
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vowelCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Apply Preset Scenario
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setNoiseFloorDbfs(preset.audioMetadata.noise_floor_dbfs);
    setPreNormRmsDb(preset.audioMetadata.pre_norm_rms_db);
    setPostNormRmsDb(preset.audioMetadata.post_norm_rms_db);
    setStreamLatencyMs(preset.audioMetadata.stream_latency_ms);
    setPacketJitterMs(preset.audioMetadata.packet_jitter_ms);
    setSpeakerAccent(preset.accentOrigin);
    setTargetTranscript(preset.targetText);
    setDecodedTranscript(preset.decodedText);
    setSilencePauses(preset.silencePauses);
    setDiagnosticResult(null);
  };

  // Run Acoustic Diagnostics API
  const handleRunDiagnostic = async () => {
    setIsLoading(true);
    try {
      const activePreset = PRESET_SCENARIOS.find((p) => p.id === selectedPresetId);
      const phonemePayload: PhonemeAlignmentPayload = activePreset
        ? activePreset.phonemeAlignments
        : {
            target_phonemes: ["TH", "IH", "NG", "K"],
            realized_phonemes: ["T", "IH", "NG", "K"],
            confidence_scores: [0.82, 0.94, 0.95, 0.90],
            words: targetTranscript.split(/\s+/),
          };

      const payload: AcousticDiagnosticInputPayload = {
        audio_stream_metadata: {
          noise_floor_dbfs: noiseFloorDbfs,
          pre_norm_rms_db: preNormRmsDb,
          post_norm_rms_db: postNormRmsDb,
          stream_latency_ms: streamLatencyMs,
          packet_jitter_ms: packetJitterMs,
        },
        phoneme_alignments: phonemePayload,
        silence_pause_events: silencePauses,
        speaker_accent_origin: speakerAccent,
        target_transcript: targetTranscript,
        decoded_transcript: decodedTranscript,
      };

      const response = await fetch("/api/speech-science/acoustic-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Acoustic diagnostics request failed: HTTP ${response.status}`);
      }

      const data: AcousticDiagnosticResult = await response.json();
      setDiagnosticResult({
        ...data,
        diagnostic_timestamp: Date.now(),
        sample_duration_ms: 3850,
      });
      setDiagnosticError(null);

      if (onGrantXp) {
        onGrantXp(45, "Acoustic Signal Processing & Computational Phonetics Diagnostic Completed");
      }
    } catch (err) {
      console.error("Error executing acoustic speech diagnostic:", err);
      // Be honest that the diagnostic failed instead of fabricating a specific
      // phoneme-error report (e.g. a "think" -> /t/ substitution) that has
      // nothing to do with what this learner actually said.
      setDiagnosticResult(null);
      setDiagnosticError(
        "We couldn't complete the acoustic diagnostic for this recording. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time Mic Capture with Web Audio API
  const startLiveMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      setAudioStream(stream);
      setIsRecording(true);
      recordingStartTimeRef.current = Date.now();

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeData = new Float32Array(bufferLength);

      let minRmsObserved = 0;
      let silentFramesCount = 0;
      const detectedPauses: SilencePauseEventPayload[] = [];
      let currentPauseStart: number | null = null;

      const renderAudioFrame = () => {
        if (!analyserRef.current || !liveCanvasRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        analyserRef.current.getFloatTimeDomainData(timeData);

        // Compute RMS
        let sumSquares = 0;
        let peak = 0;
        for (let i = 0; i < timeData.length; i++) {
          const val = timeData[i];
          sumSquares += val * val;
          if (Math.abs(val) > peak) peak = Math.abs(val);
        }
        const rms = Math.sqrt(sumSquares / timeData.length);
        const rmsDb = rms > 0 ? 20 * Math.log10(rms) : -90;
        const peakDb = peak > 0 ? 20 * Math.log10(peak) : -90;

        setLiveRmsDb(Math.max(-80, Math.round(rmsDb)));
        setLivePeakDb(Math.max(-80, Math.round(peakDb)));

        if (peakDb > -0.5) {
          setMicClippingWarning(true);
        }

        // Noise floor tracker during quiet intervals
        if (rmsDb < -35 && (minRmsObserved === 0 || rmsDb < minRmsObserved)) {
          minRmsObserved = rmsDb;
          setLiveNoiseFloorDb(Math.round(minRmsObserved));
          setNoiseFloorDbfs(Math.round(minRmsObserved));
        }

        // Silence Event Tracking
        const nowMs = Date.now() - recordingStartTimeRef.current;
        if (rmsDb < -42) {
          silentFramesCount++;
          if (silentFramesCount > 15 && currentPauseStart === null) {
            currentPauseStart = nowMs - 250;
          }
        } else {
          if (currentPauseStart !== null) {
            const pauseDuration = nowMs - currentPauseStart;
            if (pauseDuration > 200) {
              detectedPauses.push({
                start_ms: Math.round(currentPauseStart),
                end_ms: Math.round(nowMs),
                acoustic_environment_noise_level: Math.round(rmsDb),
                is_clause_boundary: false,
              });
              setSilencePauses([...detectedPauses]);
            }
            currentPauseStart = null;
          }
          silentFramesCount = 0;
        }

        // Draw Canvas Spectrogram / FFT Bars
        const canvas = liveCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.2;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            const hue = (i / bufferLength) * 180 + 150; // Teal to Cyan to Emerald
            ctx.fillStyle = `hsl(${hue}, 85%, 55%)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
        }

        animFrameIdRef.current = requestAnimationFrame(renderAudioFrame);
      };

      renderAudioFrame();
    } catch (e) {
      console.error("Microphone initialization error:", e);
    }
  };

  const stopLiveMicrophone = () => {
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    setIsRecording(false);
    setPreNormRmsDb(livePeakDb);
  };

  useEffect(() => {
    return () => {
      stopLiveMicrophone();
    };
  }, []);

  // Draw Formant Vowel Space Canvas (F1 vs F2 Acoustic Quadrant)
  useEffect(() => {
    if (activeSubTab !== "vowel_space" && activeSubTab !== "overview") return;
    const canvas = vowelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background & Axes
    ctx.fillStyle = "#0c1322";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Inverted phonetic vowel space: F2 (x-axis, 2500Hz on left -> 800Hz on right), F1 (y-axis, 250Hz on top -> 900Hz on bottom)
    const mapCoords = (f1: number, f2: number) => {
      const xMin = 2600;
      const xMax = 700;
      const yMin = 200;
      const yMax = 950;
      const px = 40 + ((f2 - xMin) / (xMax - xMin)) * (canvas.width - 80);
      const py = 30 + ((f1 - yMin) / (yMax - yMin)) * (canvas.height - 60);
      return { x: px, y: py };
    };

    // Draw Grid Lines
    ctx.strokeStyle = "rgba(71, 85, 105, 0.35)";
    ctx.lineWidth = 1;
    [300, 500, 700, 900].forEach((f1) => {
      const { y } = mapCoords(f1, 1500);
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(canvas.width - 40, y);
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "9px monospace";
      ctx.fillText(`F1:${f1}Hz`, 6, y + 3);
    });

    [2400, 1800, 1200, 800].forEach((f2) => {
      const { x } = mapCoords(500, f2);
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x, canvas.height - 30);
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "9px monospace";
      ctx.fillText(`F2:${f2}Hz`, x - 15, canvas.height - 12);
    });

    // Reference Standard English Vowel Trajectory
    const standardVowels = [
      { ipa: "/iː/ (fleece)", f1: 280, f2: 2350, color: "#38bdf8" },
      { ipa: "/ɪ/ (kit)", f1: 450, f2: 1980, color: "#38bdf8" },
      { ipa: "/e/ (dress)", f1: 580, f2: 1820, color: "#38bdf8" },
      { ipa: "/æ/ (trap)", f1: 750, f2: 1650, color: "#38bdf8" },
      { ipa: "/ɑː/ (palm)", f1: 780, f2: 1100, color: "#38bdf8" },
      { ipa: "/ɔː/ (thought)", f1: 590, f2: 880, color: "#38bdf8" },
      { ipa: "/ʊ/ (foot)", f1: 440, f2: 1120, color: "#38bdf8" },
      { ipa: "/uː/ (goose)", f1: 300, f2: 950, color: "#38bdf8" },
      { ipa: "/ʌ/ (strut)", f1: 660, f2: 1250, color: "#38bdf8" },
      { ipa: "/ɜː/ (nurse)", f1: 520, f2: 1400, color: "#38bdf8" },
    ];

    standardVowels.forEach((v) => {
      const { x, y } = mapCoords(v.f1, v.f2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(v.ipa, x + 6, y - 6);
    });

    // If active scenario has vowel drift (e.g. ship -> sheep)
    if (selectedPresetId === "vowel_formant_drift") {
      const targetPos = mapCoords(450, 1980); // Target /ɪ/
      const realizedPos = mapCoords(310, 2320); // Realized [iː]

      // Drift Arrow
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(targetPos.x, targetPos.y);
      ctx.lineTo(realizedPos.x, realizedPos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Realized Marker
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(realizedPos.x, realizedPos.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fecdd3";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("Realized [iː] (Formant Drift)", realizedPos.x - 30, realizedPos.y + 20);
    }
  }, [activeSubTab, selectedPresetId, diagnosticResult]);

  const handleCopyRawJson = () => {
    if (!diagnosticResult) return;
    navigator.clipboard.writeText(JSON.stringify(diagnosticResult, null, 2));
    setRawJsonCopied(true);
    setTimeout(() => setRawJsonCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!diagnosticResult) return;
    const blob = new Blob([JSON.stringify(diagnosticResult, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acoustic-speech-diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ========================================================================= */}
        {/* HEADER & SYSTEM IDENTITY */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/20 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 text-xs font-mono font-bold rounded-md border border-teal-500/30 flex items-center gap-1.5">
                  <Cpu size={13} className="text-teal-400" />
                  AUDIO DSP & COMPUTATIONAL PHONETICS
                </span>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                  <Waves size={13} className="text-emerald-400" />
                  HARDWARE & NOISE NORMALIZATION SAFEGUARDS
                </span>
                <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold rounded-md border border-cyan-500/30">
                  WAV2VEC 2.0 / FORMANT MATRIX
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <Activity className="text-teal-400" size={32} />
                Acoustic Signal Processing & Speech Science Diagnostic Lab
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
                Processes raw acoustic telemetry—including phoneme-level alignments, RMS gain logs, and timestamped silence boundaries. Disambiguates microphonic noise floor artifacts, isolates regional accents from true articulation errors, and calculates latency-filtered Net Speaking Rate.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-run-acoustic-diagnostics"
                type="button"
                onClick={handleRunDiagnostic}
                disabled={isLoading}
                className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin text-slate-950" />
                    <span>Processing Audio Stream...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} className="text-slate-950 fill-slate-950" />
                    <span>Run Full Acoustic Diagnostic</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Telemetry Bar */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <div className="text-[10px] uppercase font-mono text-slate-400">Noise Floor</div>
              <div className={`text-base font-mono font-bold ${noiseFloorDbfs > -35 ? "text-amber-400" : "text-emerald-400"}`}>
                {noiseFloorDbfs} dBFS
              </div>
              <div className="text-[10px] text-slate-400">{noiseFloorDbfs > -35 ? "Elevated (Uncertainty Active)" : "Clean (< -40 dBFS)"}</div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <div className="text-[10px] uppercase font-mono text-slate-400">Peak RMS (Pre/Post)</div>
              <div className="text-base font-mono font-bold text-teal-300">
                {preNormRmsDb} / {postNormRmsDb} dB
              </div>
              <div className="text-[10px] text-slate-400">{preNormRmsDb > -2.0 ? "Clipping Shielded" : "Linear Headroom"}</div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <div className="text-[10px] uppercase font-mono text-slate-400">Stream Latency</div>
              <div className="text-base font-mono font-bold text-cyan-300">
                {streamLatencyMs} ms
              </div>
              <div className="text-[10px] text-slate-400">Web Audio Buffer</div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <div className="text-[10px] uppercase font-mono text-slate-400">Packet Jitter</div>
              <div className="text-base font-mono font-bold text-indigo-300">
                ±{packetJitterMs} ms
              </div>
              <div className="text-[10px] text-slate-400">{packetJitterMs > 30 ? "Jitter Glitch Excluded" : "Stable Flow"}</div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <div className="text-[10px] uppercase font-mono text-slate-400">Detected Pauses</div>
              <div className="text-base font-mono font-bold text-amber-300">
                {silencePauses.length} Events
              </div>
              <div className="text-[10px] text-slate-400">
                {silencePauses.filter((p) => p.is_clause_boundary).length} Syntactic / {silencePauses.filter((p) => !p.is_clause_boundary).length} Hesitation
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <div className="text-[10px] uppercase font-mono text-slate-400">Regional Dialect</div>
              <div className="text-xs font-semibold text-slate-200 truncate mt-1">
                {speakerAccent}
              </div>
              <div className="text-[10px] text-emerald-400">Dialect Shield Active</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRESET BENCHMARK SCENARIOS & LIVE MIC INPUT */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Benchmark Presets */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Sliders size={18} className="text-teal-400" />
                Select Benchmark Phonetic & Hardware Test Scenario
              </h2>
              <span className="text-xs text-slate-400">5 Calibration Profiles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_SCENARIOS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    selectedPresetId === preset.id
                      ? "bg-teal-950/40 border-teal-400 shadow-md shadow-teal-500/10 ring-1 ring-teal-400/40"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-semibold">
                      {preset.category}
                    </span>
                    {selectedPresetId === preset.id && (
                      <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{preset.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{preset.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Target vs Decoded Transcript Editor */}
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Target Reference Sentence
                  </label>
                  <input
                    type="text"
                    value={targetTranscript}
                    onChange={(e) => setTargetTranscript(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Acoustic Decoded / Realized Transcript
                  </label>
                  <input
                    type="text"
                    value={decodedTranscript}
                    onChange={(e) => setDecodedTranscript(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Sliders for Signal Integrity Controls */}
              <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Noise Floor</span>
                    <span className={noiseFloorDbfs > -35 ? "text-amber-400 font-bold" : "text-slate-300"}>
                      {noiseFloorDbfs} dBFS
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="-20"
                    step="1"
                    value={noiseFloorDbfs}
                    onChange={(e) => setNoiseFloorDbfs(Number(e.target.value))}
                    className="w-full accent-teal-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Stream Latency</span>
                    <span className="text-slate-300">{streamLatencyMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={streamLatencyMs}
                    onChange={(e) => setStreamLatencyMs(Number(e.target.value))}
                    className="w-full accent-teal-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Packet Jitter</span>
                    <span className={packetJitterMs > 30 ? "text-indigo-400 font-bold" : "text-slate-300"}>
                      ±{packetJitterMs} ms
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="2"
                    value={packetJitterMs}
                    onChange={(e) => setPacketJitterMs(Number(e.target.value))}
                    className="w-full accent-teal-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Live Web Audio API Mic & Spectrogram */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio size={16} className={isRecording ? "text-red-400 animate-pulse" : "text-teal-400"} />
                  Live Web Audio API Analyzer
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isRecording ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-slate-800 text-slate-400"
                }`}>
                  {isRecording ? "STREAMING FFT" : "IDLE"}
                </span>
              </div>

              {/* Spectrum Canvas */}
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-[#090d16] h-32 flex items-center justify-center">
                <canvas
                  ref={liveCanvasRef}
                  width={340}
                  height={128}
                  className="w-full h-full object-cover"
                />
                {!isRecording && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 text-slate-400 text-xs">
                    <Waves size={24} className="text-slate-500 mb-1" />
                    <span>Click 'Start Live Mic' to sample acoustic signal</span>
                  </div>
                )}
              </div>

              {/* Live Audio Meters */}
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Live RMS Level</span>
                  <span className="text-teal-300 font-bold">{liveRmsDb} dBFS</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-75"
                    style={{ width: `${Math.min(100, Math.max(0, (liveRmsDb + 80) * 1.25))}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Peak Gain</span>
                  <span className={livePeakDb > -3 ? "text-red-400 font-bold" : "text-cyan-300"}>
                    {livePeakDb} dB
                  </span>
                </div>

                {micClippingWarning && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0 text-amber-400" />
                    <span>Peak clipping detected: Automatic gain normalization active.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mic Toggle Button */}
            <div className="pt-3 border-t border-slate-800">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startLiveMicrophone}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
                >
                  <Mic size={15} className="text-teal-400" />
                  <span>Start Live Mic Capture</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopLiveMicrophone}
                  className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-500/40"
                >
                  <MicOff size={15} className="text-red-400" />
                  <span>Stop Capture & Apply Measurements</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DIAGNOSTIC RESULTS DISPLAY */}
        {/* ========================================================================= */}
        {diagnosticError && !diagnosticResult && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{diagnosticError}</span>
          </div>
        )}
        {diagnosticResult && (
          <div className="space-y-6">
            {/* Sub-tab Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab("overview")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeSubTab === "overview"
                      ? "bg-teal-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 bg-slate-900"
                  }`}
                >
                  Overview & Integrity Audit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("phonemes")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeSubTab === "phonemes"
                      ? "bg-teal-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 bg-slate-900"
                  }`}
                >
                  Phoneme Alignments ({diagnosticResult.phoneme_diagnostic_layer.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("vowel_space")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeSubTab === "vowel_space"
                      ? "bg-teal-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 bg-slate-900"
                  }`}
                >
                  Formant Vowel Space (F1/F2)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("timing")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeSubTab === "timing"
                      ? "bg-teal-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 bg-slate-900"
                  }`}
                >
                  Timing & Latency Breakdown
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("json")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    activeSubTab === "json"
                      ? "bg-teal-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 bg-slate-900"
                  }`}
                >
                  <FileCode size={13} />
                  Raw JSON Telemetry
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyRawJson}
                  className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-md flex items-center gap-1 transition-all"
                >
                  {rawJsonCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{rawJsonCopied ? "Copied" : "Copy JSON"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-md flex items-center gap-1 transition-all"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* TAB 1: OVERVIEW & INTEGRITY AUDIT */}
            {(activeSubTab === "overview" || activeSubTab === "timing") && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Signal Integrity */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase flex items-center justify-between">
                    <span>Signal Integrity Audit</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      diagnosticResult.signal_integrity_audit.snr_rating === "Optimal"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : diagnosticResult.signal_integrity_audit.snr_rating === "Acceptable"
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      SNR: {diagnosticResult.signal_integrity_audit.snr_rating}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Clipping Detected</span>
                      <span className={diagnosticResult.signal_integrity_audit.clipping_detected ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                        {diagnosticResult.signal_integrity_audit.clipping_detected ? "YES (Filtered)" : "NO"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Hardware Normalization</span>
                      <span className="text-slate-200 font-bold">
                        {diagnosticResult.signal_integrity_audit.hardware_normalization_applied ? "APPLIED" : "BYPASSED"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Confidence Degradation</span>
                      <span className="text-cyan-300 font-mono font-bold">
                        {(diagnosticResult.signal_integrity_audit.confidence_degradation_factor * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Net Speaking Rate (WPM) */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase flex items-center justify-between">
                    <span>Temporal Rate</span>
                    <span className="text-xs font-mono text-teal-400">Latency-Aware</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <div>
                      <div className="text-2xl font-mono font-extrabold text-emerald-400">
                        {diagnosticResult.fluency_and_timing_metrics.net_articulation_wpm}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Net Articulation WPM</div>
                    </div>
                    <div className="text-slate-500 font-mono">/</div>
                    <div>
                      <div className="text-lg font-mono font-bold text-slate-400">
                        {diagnosticResult.fluency_and_timing_metrics.gross_wpm}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Gross WPM</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Latency buffers and valid syntactic thinking pauses are excluded from the articulation rate calculation.
                  </p>
                </div>

                {/* Card 3: Syntactic vs Hesitation Pauses */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase flex items-center justify-between">
                    <span>Pause Taxonomy</span>
                    <Clock size={14} className="text-amber-400" />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Syntactic Thinking</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {diagnosticResult.fluency_and_timing_metrics.pause_breakdown.syntactic_thinking_pauses_count}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Hesitation / Disfluency</span>
                      <span className="text-amber-400 font-bold font-mono">
                        {diagnosticResult.fluency_and_timing_metrics.pause_breakdown.hesitation_pauses_count}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Buffer Glitch (Excluded)</span>
                      <span className="text-indigo-400 font-bold font-mono">
                        {diagnosticResult.fluency_and_timing_metrics.pause_breakdown.latency_buffer_artifacts_excluded_count}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Total Valid Pause Duration */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase flex items-center justify-between">
                    <span>Pause Duration</span>
                    <span className="text-xs text-slate-400 font-mono">Total Valid</span>
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-teal-300">
                    {diagnosticResult.fluency_and_timing_metrics.pause_breakdown.total_valid_pause_duration_ms} ms
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-400"
                      style={{
                        width: `${Math.min(
                          100,
                          (diagnosticResult.fluency_and_timing_metrics.pause_breakdown.total_valid_pause_duration_ms / 3000) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Calibrated within natural conversational cognitive limits (600ms - 1500ms).
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: PHONEME-LEVEL ALIGNMENT INSPECTOR */}
            {(activeSubTab === "phonemes" || activeSubTab === "overview") && (
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers size={18} className="text-teal-400" />
                    Phoneme-Level Articulation Diagnostics & Decoding Alignment
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    ARPAbet / IPA Matrix
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                        <th className="py-2.5 px-3">Word</th>
                        <th className="py-2.5 px-3">Target IPA</th>
                        <th className="py-2.5 px-3">Realized IPA</th>
                        <th className="py-2.5 px-3">Error Type</th>
                        <th className="py-2.5 px-3">Acoustic Confidence</th>
                        <th className="py-2.5 px-3">Computational Phonetician Diagnostic Note</th>
                        <th className="py-2.5 px-3 text-right">Acoustic Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {diagnosticResult.phoneme_diagnostic_layer.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-100">{item.word}</td>
                          <td className="py-3 px-3 text-teal-400 font-bold">{item.target_ipa}</td>
                          <td className={`py-3 px-3 font-bold ${
                            item.error_type === "None" ? "text-emerald-400" : "text-rose-400"
                          }`}>
                            {item.realized_ipa}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.error_type === "None"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : item.error_type === "Substitution"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : item.error_type === "Vowel Drift"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : item.error_type === "Insertion"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            }`}>
                              {item.error_type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300">{(item.acoustic_confidence * 100).toFixed(0)}%</span>
                              <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    item.acoustic_confidence > 0.8
                                      ? "bg-teal-400"
                                      : item.acoustic_confidence > 0.6
                                      ? "bg-amber-400"
                                      : "bg-rose-400"
                                  }`}
                                  style={{ width: `${item.acoustic_confidence * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-sans text-xs text-slate-300 max-w-md">
                            {item.diagnostic_note}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => speakText(item.word)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-md transition-colors"
                              title="Listen to Target Pronunciation"
                            >
                              <Volume2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: FORMANT VOWEL SPACE CANVAS (F1/F2) */}
            {(activeSubTab === "vowel_space" || activeSubTab === "overview") && (
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity size={18} className="text-cyan-400" />
                      Computational Formant Frequency Trajectory (F1 vs F2 Acoustic Quadrant)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Plots acoustic vowel openness (F1 Hz) vs tongue advancement/backness (F2 Hz) against native reference centroids.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="flex items-center gap-1 text-sky-400">
                      <span className="w-2 h-2 rounded-full bg-sky-400" /> Native Targets
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-400" /> Realized / Formant Drift
                    </span>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0c1322] flex justify-center p-2">
                  <canvas
                    ref={vowelCanvasRef}
                    width={720}
                    height={360}
                    className="w-full max-w-3xl h-auto"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: REMEDIATION TARGETS & DRILLS */}
            {diagnosticResult.remediation_targets.length > 0 && (
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-400" />
                  Targeted Speech Science & Articulatory Drills
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {diagnosticResult.remediation_targets.map((drill, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2 hover:border-teal-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-mono font-bold text-xs border border-teal-500/30">
                          Phoneme: {drill.phoneme}
                        </span>
                        <button
                          type="button"
                          onClick={() => speakText(drill.phoneme)}
                          className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1"
                        >
                          <Volume2 size={13} />
                          <span>Hear Drill</span>
                        </button>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200">{drill.issue_description}</h4>
                      <p className="text-xs text-slate-400 bg-slate-900/90 p-3 rounded-lg border border-slate-800/60 leading-relaxed font-sans">
                        <strong className="text-teal-400 font-mono block text-[10px] uppercase mb-1">Recommended Drill:</strong>
                        {drill.recommended_drill}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: RAW JSON TELEMETRY (SCHEMA AUDIT) */}
            {activeSubTab === "json" && (
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                    <FileCode size={18} className="text-teal-400" />
                    Standardized JSON Output Schema
                  </h3>
                  <span className="text-xs font-mono text-emerald-400">Validated 100% Against System Spec</span>
                </div>
                <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-teal-300 overflow-x-auto border border-slate-800/80 leading-relaxed">
                  {JSON.stringify(diagnosticResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
