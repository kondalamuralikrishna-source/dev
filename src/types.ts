export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface SpokenTaskPrompt {
  id: string;
  taskNumber: number;
  title: string;
  category: string;
  prompt: string;
  contextHint: string;
  suggestedDurationSeconds: number;
  suggestedTargetVocabulary: string[];
  focusAreas: string[];
}

export interface CEFRParameterScore {
  score: CEFRLevel;
  observations: string;
  percentage?: number;
}

export interface CEFRParameterScores {
  fluency_and_temporal: CEFRParameterScore;
  pronunciation_and_phonetics: CEFRParameterScore;
  lexical_resource: CEFRParameterScore;
  grammatical_accuracy: CEFRParameterScore;
  coherence_and_cohesion: CEFRParameterScore;
}

export interface AudioMetrics {
  speech_rate_wpm: number;
  pause_rate_per_min: number;
  filler_ratio_percent: number;
  phoneme_accuracy_score: number;
  detected_hesitations?: number;
  articulation_rate?: number;
}

export interface C2CourseMilestone {
  level: CEFRLevel;
  levelName: string;
  tagline: string;
  status: "completed" | "current" | "next_target" | "mastery_goal";
  estimatedHours: number;
  readinessPercentage: number;
  keyGrammarFocus: string[];
  keyVocabularyFocus: string[];
  spokenDrills: {
    id: string;
    title: string;
    type: "spoken_drill" | "pressure_simulation" | "full_duplex" | "grammar_mastery";
    durationMinutes: number;
    description: string;
  }[];
  benchmarkExamRequirement: string;
}

export interface PersonalizedC2Course {
  candidateName?: string;
  diagnosedBand: CEFRLevel;
  targetMasteryBand: "C2";
  totalEstimatedHours: number;
  totalModules: number;
  summaryPitch: string;
  milestones: C2CourseMilestone[];
  generatedAt: number;
}

export interface AnonymousAttemptRecord {
  id: string;
  timestamp: string;
  test_type: "spoken_assessment" | "writing_diagnostic" | "grammar_diagnostic" | "integrity_studio_scan" | "fluidconvo_roleplay" | "speech_coaching";
  target_cefr_level?: string;
  achieved_cefr_or_score: string;
  score_numeric: number;
  plagiarism_risk: "LOW" | "MEDIUM" | "HIGH";
  similarity_percentage?: number;
  flagged_passages_count?: number;
  word_count?: number;
  integrity_status: "passed" | "flagged" | "review_needed";
  client_session_hash: string;
}

export interface AnonymousTelemetryStats {
  total_attempts_all_time: number;
  attempts_last_24h: number;
  breakdown_by_type: {
    spoken_assessments: number;
    writing_diagnostics: number;
    grammar_diagnostics: number;
    integrity_studio_scans: number;
    fluidconvo_roleplay: number;
    speech_coaching: number;
  };
  cefr_distribution: Record<string, number>;
  plagiarism_risk_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  average_score: number;
  latest_attempt_timestamp: string;
  recent_attempts: AnonymousAttemptRecord[];
  api_endpoints: {
    json_stats_url: string;
    csv_export_url: string;
  };
}

export interface FlaggedPassage {
  text_snippet: string;
  reason: string;
  improvement_tip?: string;
  suggested_revision?: string;
  category?: "ai_pattern" | "published_source" | "cliche" | "unattributed_quote" | "repetitive_syntax";
}

export interface PlagiarismAnalysis {
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  estimated_similarity_score: string;
  flagged_passages: FlaggedPassage[];
  ai_generated_probability: "LOW" | "MEDIUM" | "HIGH";
  integrity_verdict: string;
}

export interface AssessmentPayload {
  status: "evaluated" | "generated";
  score: number | null;
  feedback: string;
}

export interface IntegrityAssessmentResponse {
  assessment: AssessmentPayload;
  plagiarism_analysis: PlagiarismAnalysis;
}

export interface AuthenticityAudit {
  is_relevant_to_prompt: boolean;
  is_read_aloud_detected: boolean;
  relevancy_score_out_of_10: number;
  audit_flags: string[];
  cap_applied?: boolean;
  cap_reason?: string;
  plagiarism_analysis?: PlagiarismAnalysis;
}

export interface LanguageImprovementSlip {
  originalSentence: string;
  correctedSentence: string;
  grammarRule: string;
  errorType: "Sentence Structure" | "Tense & Aspect" | "Subject-Verb Agreement" | "Preposition / Particle" | "Vocabulary Choice" | "Fragmented Syntax";
  explanation: string;
}

export interface TaskQuestionEvaluation {
  task_id: string;
  task_prompt: string;
  transcript: string;
  task_score?: CEFRLevel;
  fluency_rating: string;
  grammar_rating: string;
  vocabulary_rating: string;
  sentence_structure_rating?: string;
  positive_feedback?: string;
  area_for_improvement?: string;
  model_upgraded_response?: string;
  detailed_critique: string;
}

export interface SpokenAssessmentEvaluationResponse {
  cefr_rating: CEFRLevel;
  cefr_band: CEFRLevel; // backward compatibility
  confidence_score: number;
  fluency_score: number;
  grammar_score: number;
  vocabulary_score: number;
  feedback_summary: string;
  overall_feedback: string;
  active_start_module: CEFRLevel;
  authenticity_audit?: AuthenticityAudit;
  plagiarism_analysis?: PlagiarismAnalysis;
  sub_scores?: {
    task_fulfillment: number;
    lexical_resource: number;
    syntactic_accuracy: number;
    pronunciation_and_fluency: number;
  };
  audio_metrics?: AudioMetrics;
  parameter_scores?: CEFRParameterScores;
  strengths?: string[];
  areas_for_growth?: string[];
  positive_highlights?: string[];
  sentence_corrections?: LanguageImprovementSlip[];
  personalized_c2_course?: PersonalizedC2Course;
  question_evaluations?: TaskQuestionEvaluation[];
  timestamp?: number;
}

export interface GrammarLesson {
  id: string;
  title: string;
  category: string;
  level: CEFRLevel;
  icon: string;
  durationMins: number;
  xpReward: number;
  summary: string;
  keyRule: string;
  formula?: string;
  moduleNumber?: 1 | 2 | 3 | 4 | 5;
  moduleTitle?: string;
  classicalChapterRef?: string;
  sections: {
    heading: string;
    content: string;
    examples: {
      sentence: string;
      highlight?: string;
      translationOrMeaning?: string;
      audioText?: string;
    }[];
    notes?: string[];
  }[];
  commonMistakes: {
    incorrect: string;
    correct: string;
    explanation: string;
  }[];
  quickCheckQuestions: QuizQuestion[];
}

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  level: CEFRLevel;
  definition: string;
  exampleSentence: string;
  collocations?: string[];
  synonyms?: string[];
  category: string;
}

export type QuizType =
  | "multiple-choice"
  | "fill-in-the-blank"
  | "sentence-scramble"
  | "error-identification"
  | "listening-match";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation: string;
  scrambledWords?: string[];
  correctSentence?: string;
  audioPrompt?: string;
  hint?: string;
}

export interface QuizSet {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  category: string;
  questions: QuizQuestion[];
}

export interface RoleplayScenario {
  id: string;
  title: string;
  category: string;
  level: CEFRLevel;
  icon: string;
  description: string;
  tutorRole: string;
  userRole: string;
  learningGoal: string;
  initialMessage: string;
  suggestedStarters: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  corrections?: {
    original: string;
    correction: string;
    explanation: string;
  }[];
  suggestedReplies?: string[];
  vocabularyHighlights?: {
    word: string;
    definition: string;
    phonetic?: string;
  }[];
  pronunciationTips?: string[];
}

export interface PronunciationItem {
  id: string;
  phrase: string;
  ipa: string;
  level: CEFRLevel;
  category: "Everyday" | "Vowels & Consonants" | "Connected Speech" | "Tongue Twisters" | "Business";
  focusSound: string;
  tips: string;
}

export interface PronunciationFeedbackResult {
  score: number;
  targetIPA: string;
  wordBreakdown: {
    word: string;
    ipa: string;
    syllables: string;
    status: "perfect" | "needs-work" | "missed";
    tip?: string;
  }[];
  intonationNotes: string;
  commonPitfall: string;
  coachingAdvice: string;
}

export interface PlacementAssessmentResult {
  completedAt: string;
  diagnosedLevel: CEFRLevel;
  totalScorePercentage: number;
  grammarScore: number;
  vocabularyScore: number;
  practicalScore: number;
  totalPoints: number;
  maxPoints: number;
  summaryFeedback: string;
  recommendedNextSteps: string[];
}

export interface DailyActivityDay {
  date: string; // YYYY-MM-DD
  minutes: number;
  lessons: number;
  goalMet: boolean;
}

export interface UserProgress {
  xp: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyGoalType: "minutes" | "lessons";
  dailyGoalMinutes: number;
  dailyGoalLessons: number;
  dailyGoalTargetStreak: number; // e.g. 7, 14, 30, 60, 100 days
  minutesToday: number;
  lessonsToday: number;
  todayGoalCompleted?: boolean;
  dailyActivityHistory?: DailyActivityDay[];
  completedLessonIds: string[];
  completedQuizIds: string[];
  quizScores: { [quizId: string]: number }; // percentage
  savedVocabIds: string[];
  masteredVocabIds: string[];
  weakTopics: string[];
  achievements: string[];
  selectedLevel: CEFRLevel;
  unlockedLevels: CEFRLevel[]; // e.g. ["A1"] or ["A1", "A2", "B1"]
  assessmentCompleted: boolean;
  assessmentResult?: PlacementAssessmentResult;
  spokenAssessmentResult?: SpokenAssessmentEvaluationResponse;
  completedBenchmarkExams?: CEFRLevel[]; // e.g. ["A1", "A2"]
  levelAssessmentReports?: LevelAssessmentReport[];
  speechSpeed: number; // 0.7 to 1.2
  stressTestsCompleted?: StressTestHistoryItem[];
  errorMemoryBank?: ErrorMemoryItem[];
  afterActionAudits?: AfterActionAuditReport[];
  // Free-tier AI voice usage metering (Board Strategy Sept 2026: 3 min/day cap on Free).
  // Resets daily; unlimited tiers (Plus/Pro/Sachet) never check this.
  voiceUsageDate?: string; // YYYY-MM-DD
  voiceSecondsUsedToday?: number;
}

export type SubscriptionTier = "free" | "plus" | "pro" | "sachet";

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: "active" | "expired" | "none";
  startedAt?: string;
  expiresAt?: string;
  planId?: string;
}

export interface EndLevelSpeakingTask {
  level: CEFRLevel;
  nextLevel: CEFRLevel;
  taskTitle: string;
  scenarioContext: string;
  speakingPrompt: string;
  keyQuestionsToAddress: string[];
  targetLinguisticFeatures: string[];
  targetKeywords: string[];
  minimumSpeakingDurationSeconds: number;
  targetWordCount: number;
  passSpeakingScore: number;
  modelSpokenSample: string;
  modelSampleIPA?: string;
  audioModelNotes?: string;
}

export interface EndLevelSpeakingEvaluation {
  spokenScore: number; // 0 to 100
  passedSpeaking: boolean;
  measuredCefrBand: CEFRLevel;
  metrics: {
    pronunciationScore: number;
    fluencyScore: number;
    grammarAccuracyScore: number;
    lexicalRichnessScore: number;
    taskCoherenceScore: number;
    speechRateWpm: number;
    pauseCount: number;
    fillerRatio: number;
  };
  improvementVsBaseline: {
    baselineBand: string;
    previousLevelScore?: number;
    overallGrowthDelta: number; // e.g. +14%
    fluencyGain: number;
    syntacticExpansion: string;
    lexicalGrowthNotes: string;
    keyGainsDemonstrated: string[];
  };
  strengths: string[];
  growthAreas: string[];
  detailedExaminerFeedback: string;
  phoneticAndProsodyNotes: string;
  transcript: string;
  durationSeconds: number;
  evaluatedAt: string;
}

export interface LevelAssessmentReport {
  level: CEFRLevel;
  nextLevel: CEFRLevel | null;
  completedAt: string;
  scorePercentage: number;
  writtenScorePercentage?: number;
  speakingEvaluation?: EndLevelSpeakingEvaluation;
  compositeScore?: number;
  unlockedNextLevel?: boolean;
  passThresholdPercent: number;
  passed: boolean;
  xpEarned: number;
  competencyBreakdown: {
    grammarAccuracy: number;
    vocabularyDepth: number;
    practicalDialogue: number;
    situationalFluency: number;
  };
  improvementAnalysis: {
    baselineComparison: string;
    keyGainsAchieved: string[];
    strengthsIdentified: string[];
    weakAreasForRevision: string[];
    nextLevelReadinessNotes: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  conditionType: "xp" | "streak" | "lessons" | "quizzes" | "chat" | "pronounce" | "stress";
  threshold: number;
}

export interface StressScenario {
  id: string;
  title: string;
  category: "Emergency & Medical" | "Workplace & Executive Crisis" | "Travel & Border Control" | "High-Stakes Negotiation" | "Public Speaking & Media" | "Customer Conflict";
  level: CEFRLevel;
  icon: string;
  urgencyLevel: "High" | "Extreme" | "Critical";
  timeLimitSeconds: number; // e.g. 20, 30, 45, 60
  stressorType: string; // e.g. "Hostile Interruptor", "Ticking Clock", "Emergency Stakes"
  briefing: string;
  interlocutorRole: string;
  interlocutorVoicePrompt: string;
  surpriseInterruption?: {
    triggerAtSecondsRemaining: number;
    message: string;
  };
  requiredTargetStructures: string[];
  evaluationCriteria: string[];
}

export interface StressEvaluationSlip {
  original: string;
  correction: string;
  reason: string;
  stressFactor: string; // e.g. "Rushed articulation caused dropped plural ending"
}

export interface StressPronunciationIssue {
  word: string;
  ipa: string;
  spokenIssue: string;
  coachingTip: string;
}

export interface StressSpeakingEvaluation {
  overallScore: number; // 0 - 100
  stressGrade: string; // e.g., "Crisis Commander (A+)", "Composed Diplomat (A)", "Shaky but Resolute (B)", "Panic Overload (C)"
  composureBadge: string;
  wpm: number; // Words Per Minute
  wpmStatus: "Too Slow / Frozen" | "Optimal & Composed" | "Rushed / Panic Pace";
  fillerWords: { word: string; count: number }[];
  fillerWordTotal: number;
  
  // Grammar under pressure
  grammarScore: number;
  grammarMistakes: StressEvaluationSlip[];
  
  // Pronunciation under pressure
  pronunciationScore: number;
  pronunciationIssues: StressPronunciationIssue[];
  intonationFeedback: string;
  
  // Tactical resolution
  crisisResolutionScore: number;
  tacticalStrengths: string[];
  tacticalWeaknesses: string[];
  
  // Target structures check
  targetStructuresUsed: { structure: string; used: boolean; quote?: string }[];
  
  // Model calm response
  calmModelResponse: string;
  calmModelExplanation: string;
  
  // Tactical hacks
  survivalHacks: string[];
}

export interface StressTestHistoryItem {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  timestamp: number;
  score: number;
  stressGrade: string;
  wpm: number;
  fillerCount: number;
}

export type UserRole = "student" | "admin" | "owner";

export type AuthMethod = "google_sso" | "apple_sso" | "native_email" | "guest_bypass";
export type AuthIntent = "login" | "signup";

export interface AuthTelemetryEvent {
  id: string;
  eventName: "auth_page_viewed" | "auth_method_selected" | "auth_completed" | "auth_failed" | "password_reset_requested";
  method?: AuthMethod;
  intent?: AuthIntent;
  email?: string;
  isNewUser?: boolean;
  migratedGuestXp?: number;
  durationMs?: number;
  errorCode?: "invalid_credentials" | "rate_limited" | "user_canceled" | "network_error" | "account_exists";
  attemptCount?: number;
  timestamp: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
  status: "active" | "suspended";
  progress: UserProgress;
  googleId?: string;
  appleId?: string;
  authProvider?: "google" | "apple" | "email" | "phone" | "guest";
  emailVerified?: boolean;
  isGuest?: boolean;
  consent?: {
    ageAndTermsAcceptedAt?: string;
    aiTrainingOptIn?: boolean;
    marketingOptIn?: boolean;
  };
  subscription?: SubscriptionInfo;
  // Owner-managed, admin-only access control: which admin-panel sections this account may use.
  // undefined/null = full access (the default for every admin until an owner restricts them, so
  // existing admins are never silently locked out by this field's introduction). Never applies
  // to role "owner" or "student".
  allowedSections?: string[] | null;
}

export interface GoogleAuthStatus {
  isLive: boolean;
  hasClientId: boolean;
  clientIdMasked?: string;
  callbackUrl: string;
  statusMessage: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  avatarUrl?: string;
  type: "quiz" | "lesson" | "stress" | "chat" | "vocab" | "login";
  title: string;
  detail: string;
  score?: number;
  timestamp: number;
}

export interface AdminAnalyticsSummary {
  totalLearners: number;
  activeToday: number;
  totalLearningMinutes: number;
  totalXpEarned: number;
  avgQuizScore: number;
  avgStressScore: number;
  totalStressDrillsCompleted: number;
  totalLessonsCompleted: number;
  levelDistribution: Record<CEFRLevel, number>;
  activityTrends: {
    date: string;
    activeUsers: number;
    lessonsFinished: number;
    stressDrills: number;
    quizzesCompleted: number;
  }[];
  pillarUsage: {
    pillar: string;
    count: number;
    percentage: number;
  }[];
  recentActivityFeed: ActivityFeedItem[];
  hardestGrammarTopics: {
    topic: string;
    level: CEFRLevel;
    failureRate: number;
    attempts: number;
  }[];
  topStressScenarios: {
    scenarioTitle: string;
    attempts: number;
    avgComposure: number;
  }[];
}

// ============================================================================
// FLUIDCONVO AI - ACCENT-AGNOSTIC & FULL-DUPLEX ENGINE TYPES
// ============================================================================

export type GlobalDialectCode =
  | "standard_us_uk"
  | "indian_english"
  | "latam_english"
  | "east_asian_english"
  | "european_english"
  | "west_african_english";

export interface GlobalDialectProfile {
  id: GlobalDialectCode;
  name: string;
  region: string;
  flag: string;
  description: string;
  preservedCharacteristics: string[];
  acceptedVariations: string[];
  strictMeaningAlteringChecks: string[];
  falsePenaltyTolerance: number; // e.g. 0.03 (< 5%)
}

export type ConversationalFrictionLevel = "low" | "moderate" | "high" | "hostile";
export type AmbientSoundType = "none" | "coffee_shop" | "busy_airport" | "boardroom" | "city_street" | "emergency_dispatch";

export interface SagittalDiagramConfig {
  key: string;
  targetSound: string;
  contrastSound: string;
  title: string;
  articulatorFocus: "tongue_tip" | "tongue_blade" | "tongue_dorsum" | "lips" | "teeth" | "glottis";
  vocalTractState: {
    jawOpening: number; // 0 (closed) to 10 (wide)
    tongueHeight: number; // 0 (low) to 10 (high)
    tongueBackness: number; // 0 (front) to 10 (back)
    lipRounding: number; // 0 (spread) to 10 (rounded)
    voicingActive: boolean;
    airflowPath: string; // SVG path description or hint
  };
  contrastVocalTractState: {
    jawOpening: number;
    tongueHeight: number;
    tongueBackness: number;
    lipRounding: number;
    voicingActive: boolean;
  };
  articulatoryStepByStep: string[];
  commonConfusionPair: string;
  acousticDistinction: string;
}

export interface MeaningAlteringPhonemeShift {
  spokenWord: string;
  intendedWord: string;
  phonemicContrast: string; // e.g. "/ɪ/ vs /iː/ (ship vs sheep)"
  severity: "meaning-altering" | "acceptable-dialect-variation";
  sagittalKey?: string;
  explanation: string;
  articulatoryFix: string;
}

export interface FluidConvoTurnAnalysis {
  turnIndex: number;
  userSpokenText: string;
  modelReply: string;
  semanticIntelligibilityScore: number; // 0-100 (Primary Pass)
  phoneticFidelityScore: number; // 0-100 (Secondary Pass)
  dialectPreservedBonus: boolean;
  falsePenaltyAvoided: boolean;
  turnTakingLatencyMs: number; // Measured in ms (e.g. 340ms)
  backchannelCuesGenerated: string[]; // ["mm-hmm", "I see", "go on"]
  interruptionOccurred: boolean;
  interruptionHandledGracefully?: boolean;
  frictionLevel: ConversationalFrictionLevel;
  frictionType?: "ambient_spike" | "topic_pivot" | "interlocutor_interruption" | "unscripted_challenge";
  meaningAlteringShifts: MeaningAlteringPhonemeShift[];
  pragmaticHeatmapScore: "green" | "amber" | "rose"; // Heatmap color coding
}

export interface FluidConvoScenario {
  id: string;
  title: string;
  category: "Business & Negotiation" | "Travel & Transit" | "Tech & Engineering" | "Medical & Emergency" | "Customer Service" | "Casual Social";
  level: CEFRLevel;
  icon: string;
  interlocutorName: string;
  interlocutorRole: string;
  interlocutorAvatar: string;
  interlocutorVoiceGender: "female" | "male";
  briefing: string;
  initialMessage: string;
  defaultFriction: ConversationalFrictionLevel;
  defaultAmbient: AmbientSoundType;
  semanticObjectives: string[];
  minimalPairsToWatch: {
    pair: [string, string];
    ipa: [string, string];
    contextSentence: string;
    sagittalKey: string;
  }[];
  unscriptedPivots: string[];
}

export interface FluidConvoSessionReport {
  sessionId: string;
  scenarioId: string;
  scenarioTitle: string;
  dialectUsed: GlobalDialectCode;
  overallIntelligibilityScore: number; // 0-100
  accentPenaltyFreeScore: number; // 0-100 (> 95%)
  avgTurnTakingLatencyMs: number; // Target < 450ms
  totalTurns: number;
  interruptionHandlingRate: number; // Percentage (> 95%)
  frictionResistanceScore: number; // 0-100
  xpEarned: number;
  turns: FluidConvoTurnAnalysis[];
  keyPhoneticBreakdowns: MeaningAlteringPhonemeShift[];
  pedagogicalAdvice: string[];
  dialectPreservationPraise: string;
  timestamp: number;
}

// ============================================================================
// 1. DYNAMIC ERROR MEMORY & CONTEXTUAL RE-TESTING
// ============================================================================
export type ErrorSlipCategory =
  | "Grammar & Syntax"
  | "Pronunciation & Phonetics"
  | "Pragmatics & Register"
  | "Vocabulary & Jargon"
  | "Fluency & Fillers";

export type ErrorMemoryStatus = "detected" | "in_drill" | "retesting_under_pressure" | "mastered";

export interface ErrorRetestAttempt {
  timestamp: number;
  passed: boolean;
  contextSnippet: string;
  userSpeech: string;
  feedback: string;
}

export interface ErrorMemoryItem {
  id: string;
  category: ErrorSlipCategory;
  errorSnippet: string;
  correction: string;
  explanation: string;
  sourceContext: string; // e.g. "Job Interview Simulation", "Hot Seat Drill"
  frequency: number;
  detectedAt: number;
  lastRetestedAt?: number;
  status: ErrorMemoryStatus;
  masteryScore: number; // 0 to 100
  retestAttempts: ErrorRetestAttempt[];
}

export interface ContextualRetestScenario {
  scenarioId: string;
  title: string;
  pressureStakes: string;
  briefing: string;
  interlocutorPrompt: string;
  targetErrorsEmbedded: {
    errorId: string;
    targetCorrectForm: string;
    trapContext: string;
  }[];
  timeLimitSeconds: number;
}

// ============================================================================
// 2. GRANULAR PROSODY & PHONETIC FEEDBACK
// ============================================================================
export interface SyllableStressItem {
  syllable: string;
  isStressed: boolean;
  isSecondary?: boolean;
  pitchLevel: "high" | "mid" | "low";
  relativeDurationMs: number;
  ipa: string;
}

export type PitchContourType = "falling" | "rising" | "fall_rise" | "rise_fall" | "level_flat";

export interface PitchContourPoint {
  timePercent: number; // 0 to 100
  pitchHz: number; // normalized 80 - 320 Hz
  label?: string;
}

export interface BreathPauseSegment {
  text: string;
  isSyntacticBoundary: boolean;
  isDisruptivePause: boolean;
  pauseDurationSeconds?: number;
}

export interface ConnectedSpeechFeature {
  type: "flap_t" | "linking_r" | "intrusive_glide" | "elision" | "weak_form" | "assimilation";
  textSnippet: string;
  standardIpa: string;
  connectedIpa: string;
  explanation: string;
}

export interface GranularProsodyReport {
  targetPhrase: string;
  spokenTranscript: string;
  overallProsodyScore: number; // 0-100
  syllableStressScore: number;
  intonationContourScore: number;
  speechRateWpm: number;
  speechRateBand: "Too Slow / Hesitant" | "Optimal Conversational" | "Rushed / Panic Pace";
  syllablesPerSecond: number;
  breathControlScore: number;
  syllableStressBreakdown: {
    word: string;
    syllables: SyllableStressItem[];
  }[];
  pitchContour: {
    curveType: PitchContourType;
    curveDescription: string;
    pragmaticEffect: string;
    points: PitchContourPoint[];
  };
  breathSegments: BreathPauseSegment[];
  connectedSpeechFeatures: ConnectedSpeechFeature[];
  actionableMechanicsTips: string[];
}

// ============================================================================
// 2.5 EXPERT SUPRASEGMENTAL & PROSODY LANGUAGE TUTOR
// ============================================================================
export interface SentenceStressHierarchyItem {
  word: string;
  ipa: string;
  stressLevel: "nuclear_primary" | "secondary_lexical" | "unstressed_reduced" | "deaccented_given";
  isContentWord: boolean;
  vowelReductionAchieved: boolean;
  userAccuracy: "perfect_prominence" | "over_stressed_staccato" | "under_stressed_flat" | "misplaced_nuclear";
  coachingNote: string;
}

export interface PauseEventItem {
  locationAfterWord: string;
  durationMs: number;
  category: "grammatical_syntactic_boundary" | "rhetorical_emphasis_pause" | "disruptive_hesitation_gasp" | "isochronous_foot_boundary";
  isAppropriate: boolean;
  feedback: string;
}

export interface TimingDisruptionItem {
  syllableCluster: string;
  issueType: "syllable_timing_equalization" | "failure_to_reduce_weak_forms" | "unnatural_syllable_lengthening" | "misplaced_beat_rhythm" | "intrusive_glottal_stop";
  explanation: string;
  remedyInstruction: string;
}

export interface ClauseToneUnitItem {
  clauseSnippet: string;
  nuclearWord: string;
  nuclearTone: "↘ Fall (Definitive Assertion)" | "↗ Rise (Inquiry / Non-finality)" | "↘↗ Fall-Rise (Diplomatic Reservation / Hedging)" | "↗↘ Rise-Fall (Surprise / Disapproval)" | "→ Level (Parenthetical / Unfinished)";
  expectedEmphasisRationale: string;
  userEmphasisAlignment: "Matched" | "Weak Pitch Excursion" | "Wrong Nuclear Word" | "Robotic Flat";
  prosodicNotationMarkup: string;
}

export interface PitchVariationDrillItem {
  drillTitle: string;
  targetContourType: string;
  instruction: string;
  exaggerationTechnique: string;
  audioPromptText: string;
}

export interface RhythmicIsochronyDrillItem {
  footPattern: string;
  metronomeBpm: number;
  clappingBeats: string;
  practiceSentenceWithBeats: string;
  instruction: string;
}

export interface SuprasegmentalEvaluationReport {
  inputSpeechText: string;
  targetSentence: string;
  targetStressPatterns: string;
  overallProsodicCompetenceScore: number; // 0-100
  timingRhythmClassScore: number; // 0-100 (Stress-timed vs Syllable-timed index)
  f0PitchMovementScore: number; // 0-100
  clauseLevelEmphasisScore: number; // 0-100
  pauseDistributionScore: number; // 0-100
  pitchContourEvaluation: {
    tonicSyllable: string;
    f0ContourShape: "high-fall" | "low-fall" | "fall-rise" | "rise-fall" | "high-rise" | "low-rise" | "level";
    f0MovementDescription: string;
    targetF0Trajectory: Array<{ timePct: number; hz: number; label: string; toneMark: string }>;
    actualF0Trajectory: Array<{ timePct: number; hz: number; label: string }>;
    pitchRangeSemitones: number;
    pitchRangeQuality: "Natural Wide Dynamic" | "Somewhat Constricted" | "Monotone / Compressed Flat";
    pitchResetAtBoundaries: boolean;
  };
  sentenceStressHierarchy: SentenceStressHierarchyItem[];
  speechRateAndPauseDistribution: {
    articulationRateWpm: number;
    syllablesPerSec: number;
    phonationTimeRatioPercent: number;
    rateAssessment: "Ideal Natural Cadence" | "Rushed / Insufficient Reduction" | "Hesitant / Staccato";
    pauseEvents: PauseEventItem[];
  };
  languageTimingMismatch: {
    timingDeliveryDetected: "stress_timed" | "syllable_timed" | "mora_timed" | "hybrid_staccato";
    mismatchIdentified: boolean;
    isochronyViolationSummary: string;
    staccatoTransferRisk: "Severe" | "Moderate" | "Minor" | "Native-like Stress Timing";
    syllableDurationVarianceScore: number;
    specificTimingDisruptions: TimingDisruptionItem[];
    l1ProsodicInterferenceProfile?: string;
  };
  clauseLevelFeedback: {
    clauseToneUnits: ClauseToneUnitItem[];
    pitchVariationDrills: PitchVariationDrillItem[];
    rhythmicIsochronyDrills: RhythmicIsochronyDrillItem[];
    suprasegmentalActionPlan: string[];
  };
}

// ============================================================================
// 3. PRAGMATIC & CULTURAL REGISTER TRAINING
// ============================================================================
export type RegisterLevel = 1 | 2 | 3 | 4 | 5;

export interface RegisterShiftTransformation {
  level: RegisterLevel;
  levelName: string;
  phrasing: string;
  politenessStrategy: string;
  hedgingTechniques: string[];
  culturalContextNote: string;
  riskOfOffense: "High" | "Medium" | "Low" | "Zero";
}

export type RegisterShiftOption = RegisterShiftTransformation;

export interface PragmaticAnalysisResult {
  originalText: string;
  detectedRegister: RegisterLevel;
  detectedRegisterName: string;
  tacticalBreakdown: {
    directnessScore: number; // 0-100
    diplomacyScore: number;
    powerDistanceScore: number;
    faceSavingScore: number;
  };
  hedgingMarkersIdentified: string[];
  stanceMarkersIdentified: string[];
  transformations: RegisterShiftTransformation[];
  culturalGuidance: {
    northAmericanBusiness: string;
    britishUnderstatement: string;
    globalEnterprise: string;
  };
}

// ============================================================================
// 4. GOAL & DOMAIN-SPECIFIC CUSTOMIZATION
// ============================================================================
export type DomainTrack =
  | "Tech Leadership"
  | "Investor Pitch"
  | "Executive Negotiation"
  | "Crisis & Risk"
  | "job_interview"
  | "investor_pitch"
  | "salary_negotiation"
  | "crisis_resolution"
  | "academic_keynote";

export interface DomainScenarioData {
  id: string;
  track: DomainTrack | string;
  title: string;
  role?: string;
  interlocutor: string;
  interlocutorRole?: string;
  briefing: string;
  pressureStakes?: string;
  domainVocabularyTarget?: string[];
  frictionLevel?: "low" | "medium" | "high" | "extreme";
  initialPrompt?: string;
  stakes?: "Medium" | "High" | "Critical";
  keyJargonToDemonstrate?: string[];
  tabooVaguePhrases?: string[];
  starterPrompt?: string;
}

export interface JargonAuditReport {
  jargonDensityPercentage: number;
  precisionIndex: number; // 0-100
  domainTermsUsedCorrectly: {
    term: string;
    contextQuote: string;
    impact: string;
  }[];
  missedOpportunities: {
    vaguePhrase: string;
    suggestedExecutiveTerm: string;
    why: string;
  }[];
  domainMasteryRating: "Novice" | "Practitioner" | "Senior Specialist" | "Executive Authority";
}

// ============================================================================
// 5. CONVERSATIONAL FRICTION & UNPREDICTABILITY ENGINE
// ============================================================================
export interface FrictionEvent {
  type: "interruption" | "ambient_spike" | "cadence_surge" | "curveball_pushback";
  message: string;
  timestampMs: number;
  learnerRecoveryLatencyMs?: number;
  recoveredSuccessfully?: boolean;
}

// ============================================================================
// 6. DETAILED AFTER-ACTION AUDITS (COMPREHENSIVE POST-SESSION REPORT)
// ============================================================================
export interface AfterActionAuditReport {
  sessionId: string;
  sessionTitle: string;
  sessionType: "domain_scenario" | "fluid_convo" | "stress_speaking" | "roleplay_chat" | "prosody_workout";
  completedAt: number;
  durationSeconds: number;
  totalWordsSpoken: number;
  overallFluencyScore: number; // 0-100
  lexicalReach: {
    cefrDistribution: {
      a1_a2: number; // percentage
      b1_b2: number;
      c1_c2: number;
    };
    uniqueVocabularyCount: number;
    typeTokenRatio: number; // 0.0 - 1.0
    sophisticatedWordsUsed: string[];
    repetitiveWords: string[];
  };
  fillerWordAnalysis: {
    totalFillers: number;
    fillerRatioPercent: number;
    fillerBreakdown: { word: string; count: number }[];
    rating: "Elite Articulation (<2%)" | "Standard Conversational (2-5%)" | "Hesitation Prone (5-8%)" | "High Disfluency (>8%)";
  };
  syntacticCrutches: {
    crutchPattern: string;
    occurrences: number;
    exampleQuotes: string[];
    alternativeStructures: string[];
  }[];
  fluencyVelocity: {
    avgWpm: number;
    targetWpmBand: string;
    turnTakingLatencyMs: number;
    longPausesCount: number;
  };
  pragmaticImpact: {
    diplomacyScore: number;
    assertivenessScore: number;
    registerConsistency: string;
  };
  lineByLineRevisions: {
    userSpoken: string;
    executivePolishRewrite: string;
    rationale: string;
    audioPlayable?: boolean;
  }[];
  executiveSummary: string;
  roiGainsSummary: string[];
}

// ============================================================================
// 7. NEXTGEN SPOKEN LANGUAGE EVALUATOR & PEDAGOGY ENGINE (SLA RESEARCH COMPLIANT)
// ============================================================================

export interface SegmentalFeedbackItem {
  target_sound: string; // e.g. "/θ/"
  produced_sound: string; // e.g. "[s]"
  location: string; // word or phrase location e.g. "thought", "methodology"
  articulatory_correction: string; // Exact physical instruction: tongue height/position, lip rounding, jaw drop, vocal fold vibration
}

export interface SuprasegmentalFeedback {
  pitch_and_intonation: string; // Analysis of $F_0$ movement and clause-level emphasis
  rhythm_and_timing: string; // Feedback on stress-timed delivery, pausing, and rate
  prosodic_gaming_detected: boolean | string; // true/false with brief note if user attempted rapid/robotic delivery
}

export interface PedagogicalScaffolding {
  actionable_drills: string; // 1 contextual, high-transfer practice prompt
  visual_cue_description: string; // Description of 3D vocal tract movement required for UI rendering
}

export interface SpokenEvaluation {
  functional_intelligibility_score: number | string; // 1-10 rating based on clarity of meaning
  spontaneous_grammar_and_syntax: string; // Analysis of morphosyntactic accuracy in context
  segmental_feedback: SegmentalFeedbackItem[];
  suprasegmental_feedback: SuprasegmentalFeedback;
}

export interface NextGenSpeechEvaluatorResponse {
  conversational_response: string; // Natural, contextual response continuing the roleplay
  evaluation: SpokenEvaluation;
  pedagogical_scaffolding: PedagogicalScaffolding;
}

export interface EvaluatorConversationTurn {
  id: string;
  speaker: "user" | "evaluator";
  text: string;
  audioDurationSec?: number;
  timestamp: number;
  evaluationResponse?: NextGenSpeechEvaluatorResponse;
  acousticMetrics?: {
    avgF0Hz: number;
    pitchContour: { timeMs: number; f0Hz: number }[];
    wpm: number;
    pauseCount: number;
    stressTimedRatio: number;
    prosodicAntiGamingFlag: boolean;
  };
}

export interface EvaluatorScenario {
  id: string;
  title: string;
  category: "Leadership & Architecture" | "Medical & Emergency" | "Cross-Border Commercial" | "Academic & Research" | "Crisis Negotiation" | "Executive Strategy";
  interlocutorName: string;
  interlocutorTitle: string;
  interlocutorAvatar: string;
  difficulty: CEFRLevel;
  communicativeGoal: string;
  scenarioBrief: string;
  interlocutorOpeningLine: string;
  suggestedFocusPhonemes: string[];
  suprasegmentalFocus: string;
}

// ============================================================================
// 8. OPEN-ENDED L2 SPEAKING COACH & SPONTANEOUS ROLEPLAY
// ============================================================================

export type L2CoachDifficulty = "friendly" | "standard" | "firm" | "high_friction";

export interface L2CoachScenario {
  id: string;
  title: string;
  category: "Retail & Consumer" | "Workplace & Engineering" | "Negotiation & Leases" | "Travel & Transit" | "Emergency & Healthcare" | "Social & Hospitality" | "Executive & Leadership";
  level: CEFRLevel;
  icon: string;
  userRole: string;
  interlocutorName: string;
  interlocutorRole: string;
  interlocutorAvatar: string;
  difficulty: L2CoachDifficulty;
  contextDescription: string;
  communicativeObjectives: string[];
  pragmaticFocus: string;
  initialInterlocutorUtterance: string;
  suggestedOpeningIntent: string;
  isCustom?: boolean;
}

export interface L2GrammarSlip {
  error: string;
  correction: string;
  explanation: string;
  ruleType: string;
}

export interface L2LexicalUpgrade {
  original: string;
  upgrade: string;
  why: string;
}

export interface L2MilestoneProgress {
  objective: string;
  status: "completed" | "in_progress" | "pending";
  evidenceQuote?: string;
}

export interface L2TurnAnalysis {
  turnId: string;
  turnNumber: number;
  userSpokenText: string;
  interlocutorReply: string;
  timestamp: number;
  audioDurationSeconds?: number;
  
  grammaticalAccuracy: {
    score: number; // 0-100
    slips: L2GrammarSlip[];
    strengths: string[];
  };
  
  functionalFluency: {
    score: number; // 0-100
    coherenceRating: "Seamless" | "Adequate" | "Fragmented";
    wpmEstimated: number;
    hesitationObservation: string;
  };
  
  pragmaticAppropriateness: {
    score: number; // 0-100
    registerRating: "Overly Blunt" | "Appropriately Polished" | "Overly Formal" | "Ideal Pragmatic Fit";
    politenessAndHedgingNotes: string;
    toneAssessment: string;
  };
  
  lexicalRetrieval: {
    score: number; // 0-100
    retrievedCollocations: string[];
    suggestedUpgrades: L2LexicalUpgrade[];
  };
  
  scaffoldingAndRecovery: {
    stumbledDetected: boolean;
    subtleHint: string; // Subtle scaffolding phrase or recovery hint (NO written script to read)
    recommendedStrategy: string;
  };
  
  milestones: L2MilestoneProgress[];
}

export interface L2SpeakingSessionReport {
  sessionId: string;
  scenarioId: string;
  scenarioTitle: string;
  totalTurns: number;
  durationSeconds: number;
  overallCommunicativeScore: number;
  grammarAccuracyAvg: number;
  functionalFluencyAvg: number;
  pragmaticScoreAvg: number;
  lexicalRetrievalAvg: number;
  milestonesCompleted: number;
  totalMilestones: number;
  detailedFeedbackSummary: string;
  keyGrammarTakeaways: string[];
  keyLexicalTakeaways: string[];
  pragmaticGrowthPoints: string[];
  xpEarned: number;
  timestamp: number;
}

// ============================================================================
// 9. AUTOMATED SPEECH EVALUATION (ASE) & ANTI-GAMING METRIC ENGINE
// ============================================================================

export type AseGamingViolationType =
  | "RAPID_GIBBERISH_RUSHING"
  | "ROBOTIC_MONOTONE_GAMING"
  | "EXAGGERATED_PITCH_GYMNASTICS"
  | "OVER_PAUSING_LATENCY_STALL"
  | "TEMPLATE_MEMORIZATION_HOLLOW_FILLER"
  | "CHOPPY_DISCONNECTED_SYNTAX"
  | "ENERGY_COMPRESSION_FLATLINE"
  | "OFF_TOPIC_RECITATION"
  | "READ_ALOUD_GAMING";

export type AseGamingRiskLevel =
  | "AUTHENTIC_NATURAL"
  | "SUSPECTED_METRIC_IMBALANCE"
  | "FLAGGED_STRUCTURAL_GAMING";

export interface AsePitchDynamicsInput {
  f0StdDevHz: number; // Normal range: 20-55 Hz. <10 is robotic, >85 is exaggerated
  pitchRangeSemitones: number; // Normal conversational: 4-12 st
  artificialFlatnessIndex: number; // 0-100% flatness
  unnaturalJumpsCount: number; // Count of erratic pitch resets
  contourDescription: string;
}

export interface AseMetricInput {
  speechRateWpm: number; // Words/Min (Normal: 120-160 WPM. >210 with low grammar = rushing)
  pauseRatio: number; // 0.0 to 1.0 (Normal: 0.15 - 0.30)
  spectralEnergyDb: number; // Normal conversational: -22 to -14 dB
  semanticCoherenceScore: number; // 0-100
  grammarScore: number; // 0-100
  pitchContourDynamics: AsePitchDynamicsInput;
  transcribedText?: string;
  topicPrompt?: string;
}

export interface AseGamingViolation {
  id: string;
  type: AseGamingViolationType;
  severity: "CRITICAL" | "MODERATE" | "LOW";
  penaltyWeight: number; // e.g. 15 points off joint score
  metricImbalanceFactor: string; // e.g. "Speed (235 WPM) contradicts low Semantic Coherence (38%)"
  explanation: string;
  evidence: string;
  remediationGuidance: string;
}

export interface JointMetricDependency {
  id: string;
  pairName: string; // e.g., "Speech Rate vs. Semantic Validity"
  metricA: { name: string; value: string | number; expectedNorm: string };
  metricB: { name: string; value: string | number; expectedNorm: string };
  correlationStatus: "BALANCED_AUTHENTIC" | "MOCK_SUPERFICIAL" | "PATHOLOGICAL_DIVERGENCE";
  healthScore: number; // 0-100
  diagnosis: string;
}

export interface AseSubScores {
  naturalnessScore: number; // Flow, organic pause distribution, authentic rhythm (0-100)
  expressivenessScore: number; // Pitch variation, nuclear stress contrast, emotional resonance (0-100)
  communicativeAccuracyScore: number; // Grammatical integrity, semantic validity, relevance (0-100)
  structuralIntegrityScore: number; // Resistance to gaming, balanced multi-metric coupling (0-100)
}

export interface AseEvaluationResult {
  evaluationId: string;
  timestamp: number;
  inputMetrics: AseMetricInput;
  jointCommunicativeScore: number; // Weighted final score (0-100)
  rawUnpenalizedScore: number; // Before anti-gaming penalty
  antiGamingPenaltyTotal: number; // Points deducted
  gamingRiskLevel: AseGamingRiskLevel;
  authenticityAudit?: AuthenticityAudit;
  subScores: AseSubScores;
  detectedViolations: AseGamingViolation[];
  jointDependencies: JointMetricDependency[];
  synthesisReport: string;
  radarBreakdown: {
    metric: string;
    learnerValue: number; // 0-100
    humanNativeNorm: number; // 0-100
    gamingThresholdAlert: number; // 0-100
  }[];
  actionableRemediation: string[];
}

export interface AseBenchmarkPreset {
  id: string;
  name: string;
  category: "Natural Authentic" | "Metric Gaming" | "Pathological Imbalance" | "Learner Profile";
  description: string;
  metrics: AseMetricInput;
  expectedFlag: AseGamingRiskLevel;
}

// ============================================================================
// PSYCHOMETRIC AUTOMATED LANGUAGE ASSESSMENT (ALA) & INCLUSIVE SPEECH TYPES
// ============================================================================

export interface PsychometricAlaMetadata {
  overall_cefr_level: CEFRLevel;
  overall_band_score: number;
  confidence_score: number;
  human_review_recommended: boolean;
  flagged_reasons: string[];
}

export interface PsychometricAlaDimensionScores {
  fluency_and_coherence: {
    score: number;
    cefr_equivalent: string;
    justification: string;
    atypical_speech_adjustments_applied: boolean;
  };
  lexical_resource: {
    score: number;
    cefr_equivalent: string;
    justification: string;
  };
  grammatical_range_and_accuracy: {
    score: number;
    cefr_equivalent: string;
    justification: string;
  };
  intelligibility_and_pronunciation: {
    score: number;
    cefr_equivalent: string;
    justification: string;
    accent_vs_error_disambiguation_notes: string;
  };
}

export interface PsychometricAlaDiagnostic {
  detected_accent_profile: string;
  intelligibility_impact: "None" | "Minor" | "Moderate" | "Severe";
  neurodivergent_or_pathology_markers_discounted: string[];
  actionable_feedback_for_learner: string[];
}

export interface PsychometricAlaEvaluationResult {
  assessment_metadata: PsychometricAlaMetadata;
  dimension_scores: PsychometricAlaDimensionScores;
  psychometric_diagnostic: PsychometricAlaDiagnostic;
  // Metadata fields for UI rendering & historical tracking
  evaluation_id?: string;
  evaluated_at?: number;
  raw_transcript?: string;
  audio_metadata_used?: {
    pause_durations_ms?: number[];
    acoustic_dysfluency_markers?: string[];
    estimated_speaking_rate_wpm?: number;
    regional_accent_hint?: string;
  };
}

export interface PsychometricAlaInput {
  candidate_transcript: string;
  acoustic_metadata: {
    pause_durations_ms: number[];
    acoustic_dysfluency_markers: string[];
    estimated_speaking_rate_wpm: number;
    regional_accent_hint?: string;
    speech_condition_context?: string;
  };
  target_cefr_benchmark: CEFRLevel;
}

// ============================================================================
// ACOUSTIC SIGNAL PROCESSING, COMPUTATIONAL PHONETICS & SPEECH SCIENCE TYPES
// ============================================================================

export interface SignalIntegrityAudit {
  snr_rating: "Poor" | "Acceptable" | "Optimal";
  clipping_detected: boolean;
  hardware_normalization_applied: boolean;
  confidence_degradation_factor: number;
}

export interface PauseBreakdown {
  syntactic_thinking_pauses_count: number;
  hesitation_pauses_count: number;
  latency_buffer_artifacts_excluded_count: number;
  total_valid_pause_duration_ms: number;
}

export interface FluencyAndTimingMetrics {
  gross_wpm: number;
  net_articulation_wpm: number;
  pause_breakdown: PauseBreakdown;
}

export interface PhonemeDiagnosticItem {
  word: string;
  target_ipa: string;
  realized_ipa: string;
  error_type: "Substitution" | "Deletion" | "Insertion" | "Vowel Drift" | "None";
  acoustic_confidence: number;
  diagnostic_note: string;
  f1_hz?: number;
  f2_hz?: number;
  f3_hz?: number;
  f0_hz?: number;
}

export interface RemediationTarget {
  phoneme: string;
  issue_description: string;
  recommended_drill: string;
}

export interface AcousticDiagnosticResult {
  signal_integrity_audit: SignalIntegrityAudit;
  fluency_and_timing_metrics: FluencyAndTimingMetrics;
  phoneme_diagnostic_layer: PhonemeDiagnosticItem[];
  remediation_targets: RemediationTarget[];
  // Extended diagnostic telemetry
  diagnostic_timestamp?: number;
  sample_duration_ms?: number;
  accent_preservation_notes?: string;
}

export interface AudioStreamMetadataPayload {
  noise_floor_dbfs: number;
  pre_norm_rms_db: number;
  post_norm_rms_db: number;
  stream_latency_ms: number;
  packet_jitter_ms: number;
}

export interface SilencePauseEventPayload {
  start_ms: number;
  end_ms: number;
  acoustic_environment_noise_level: number;
  preceding_word?: string;
  following_word?: string;
  is_clause_boundary?: boolean;
}

export interface PhonemeAlignmentPayload {
  target_phonemes: string[];
  realized_phonemes: string[];
  confidence_scores: number[];
  formants?: { f1: number; f2: number; f3?: number }[];
  f0_vector?: number[];
  words?: string[];
}

export interface AcousticDiagnosticInputPayload {
  audio_stream_metadata: AudioStreamMetadataPayload;
  phoneme_alignments: PhonemeAlignmentPayload;
  silence_pause_events: SilencePauseEventPayload[];
  speaker_accent_origin?: string;
  target_transcript?: string;
  decoded_transcript?: string;
}

// ============================================================================
// ENTERPRISE PROCTORING, MULTI-JURISDICTION PRIVACY & HITL COMPLIANCE TYPES
// ============================================================================

export type AssessmentValidityStatus = "VALID" | "FLAGGED" | "VOID";
export type RegulatoryFrameworkType = "GDPR" | "FERPA" | "DPDP_2023" | "GENERIC";
export type JurisdictionCode = "EU" | "US" | "IN" | "GLOBAL";
export type EducatorActionFlag = "NONE" | "REVIEW_REQUESTED" | "OVERRIDE_SUBMITTED";

export interface ProctoringAudit {
  integrity_risk_index: number;
  assessment_validity: AssessmentValidityStatus;
  detected_violations: string[];
}

export interface PrivacyComplianceStatus {
  regulatory_framework: RegulatoryFrameworkType;
  minor_status_handled: boolean;
  consent_verified: boolean;
  voice_deletion_scheduled: boolean;
  deletion_deadline_timestamp: string | null;
}

export interface ScoringAndHitlReconciliation {
  final_reported_cefr: CEFRLevel;
  raw_llm_score: number;
  effective_score: number;
  hitl_override_applied: boolean;
  human_reviewer_notes: string | null;
  drift_delta: number;
}

export interface SystemActions {
  lock_candidate_progress: boolean;
  notify_administrator: boolean;
  purge_audio_payload_immediately: boolean;
}

export interface EnterpriseComplianceHitlResult {
  proctoring_audit: ProctoringAudit;
  privacy_compliance_status: PrivacyComplianceStatus;
  scoring_and_hitl_reconciliation: ScoringAndHitlReconciliation;
  system_actions: SystemActions;
  // Extended audit trail
  audit_id?: string;
  audit_timestamp?: number;
  reviewer_id?: string;
  candidate_id?: string;
  calibration_recommendation?: string;
}

export interface EnterpriseProctoringTelemetryInput {
  browser_focus_lost_count: number;
  secondary_voice_detected: boolean;
  audio_input_device_switch_count: number;
  identity_match_confidence: number;
}

export interface EnterpriseCandidatePrivacyInput {
  candidate_age: number;
  jurisdiction_code: JurisdictionCode;
  parental_consent_verified: boolean | "N/A";
  voice_retention_opt_in: boolean;
  candidate_id?: string;
  candidate_name?: string;
}

export interface EnterpriseHitlActionInput {
  automated_cefr_metric: CEFRLevel;
  raw_score?: number;
  educator_action_flag: EducatorActionFlag;
  educator_annotation_data?: {
    override_score: number;
    override_cefr?: CEFRLevel;
    reason_code: string;
    reviewer_notes?: string;
    overseer_id?: string;
  };
}

export interface EnterpriseComplianceHitlPayload {
  proctoring_telemetry: EnterpriseProctoringTelemetryInput;
  candidate_privacy_metadata: EnterpriseCandidatePrivacyInput;
  assessment_hitl_action: EnterpriseHitlActionInput;
}

// ============================================================================
// ADAPTIVE REMEDIATION & INSTITUTIONAL AUTHORING TYPES
// ============================================================================

export type PriorityFocusArea =
  | "Acoustic Prosody"
  | "Phonemic Precision"
  | "Lexical Diversity"
  | "Syntactic Structure";

export type MicroLessonFormat =
  | "Minimal Pair Drill"
  | "Shadowing Practice"
  | "Pitch Contour Matching"
  | "Vocabulary Expansion";

export interface MicroLessonExerciseContent {
  instructions: string;
  practice_prompts: string[];
}

export interface AssignedMicroLesson {
  lesson_id: string;
  title: string;
  target_gap: string;
  format: MicroLessonFormat;
  estimated_duration_minutes: number;
  exercise_content: MicroLessonExerciseContent;
}

export interface RemediationPlan {
  priority_focus_area: PriorityFocusArea;
  assigned_microlessons: AssignedMicroLesson[];
}

export interface ScenarioProfile {
  industry: string;
  simulation_title: string;
  persona_prompt: string;
  learning_objectives: string[];
}

export interface DomainVocabularyIntegration {
  term: string;
  expected_context: string;
  mastery_trigger: string;
}

export interface CustomRubricCriterion {
  criterion_name: string;
  weight_percentage: number;
  performance_descriptors: {
    exceeds: string;
    meets: string;
    needs_improvement: string;
  };
}

export interface CustomAuthoringExecution {
  scenario_profile: ScenarioProfile;
  domain_vocabulary_integration: DomainVocabularyIntegration[];
  custom_scoring_rubric: CustomRubricCriterion[];
}

export interface AdaptiveRemediationAuthoringResult {
  remediation_plan: RemediationPlan;
  custom_authoring_execution: CustomAuthoringExecution;
}

export interface DiagnosticInputsPayload {
  acoustic_features: {
    pitch_variation_stdev: number;
    net_wpm: number;
    hesitation_count: number;
  };
  phonetic_diagnostics: Array<{
    target: string;
    realized: string;
    error_type: string;
  }>;
  cefr_metrics: {
    fluency: CEFRLevel;
    lexical: CEFRLevel;
    grammar: CEFRLevel;
    pronunciation: CEFRLevel;
  };
}

export interface InstitutionalAuthoringInputsPayload {
  industry_target: string;
  target_vocabulary_list: string[];
  custom_rubric_criteria: Array<{
    name: string;
    description: string;
    weight: number;
  }>;
  simulation_persona: {
    role: string;
    tone: string;
    objective: string;
  };
}

export interface AdaptiveCurriculumEnginePayload {
  diagnostic_inputs: DiagnosticInputsPayload;
  institutional_authoring_parameters: InstitutionalAuthoringInputsPayload;
}

// Regional Language Translation Types
export type RegionalLanguageCode = "en" | "te" | "hi" | "ta" | "kn" | "bn" | "mr";

export interface RegionalLanguageConfig {
  code: RegionalLanguageCode;
  name: string; // e.g., "Telugu"
  nativeName: string; // e.g., "తెలుగు"
  script: string; // e.g., "తెలుగు లిపి"
  region: string; // e.g., "Andhra Pradesh & Telangana"
  flagBadge: string; // e.g., "🇮🇳 TE"
  welcomeGreeting: string; // e.g., "స్వాగతం"
}

export interface DynamicTranslationResponse {
  translatedText: string;
  transliteration?: string;
  explanation?: string;
  targetLanguage: RegionalLanguageCode;
  cached?: boolean;
}



