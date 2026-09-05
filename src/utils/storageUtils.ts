import {
  UserProgress,
  Achievement,
  CEFRLevel,
  PlacementAssessmentResult,
  DailyActivityDay,
  SpokenAssessmentEvaluationResponse,
  ErrorMemoryItem,
  AfterActionAuditReport,
  ErrorSlipCategory,
  LevelAssessmentReport,
} from "../types";

const STORAGE_KEY = "english_mastery_lms_progress_v1";

export const CEFR_LEVEL_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function getCEFRLevelIndex(level: CEFRLevel): number {
  return CEFR_LEVEL_ORDER.indexOf(level);
}

export function getNextCEFRLevel(level: CEFRLevel): CEFRLevel | null {
  const idx = getCEFRLevelIndex(level);
  if (idx < 0 || idx >= CEFR_LEVEL_ORDER.length - 1) return null;
  return CEFR_LEVEL_ORDER[idx + 1];
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_lesson",
    title: "First Step",
    description: "Complete your first English grammar or vocabulary lesson.",
    icon: "GraduationCap",
    conditionType: "lessons",
    threshold: 1,
  },
  {
    id: "scholar_5",
    title: "Dedicated Scholar",
    description: "Complete 5 curriculum lessons.",
    icon: "BookOpen",
    conditionType: "lessons",
    threshold: 5,
  },
  {
    id: "quiz_master_1",
    title: "Quiz Whiz",
    description: "Complete your first interactive quiz with 80%+ score.",
    icon: "Award",
    conditionType: "quizzes",
    threshold: 1,
  },
  {
    id: "streak_3",
    title: "Consistency Champion",
    description: "Maintain a 3-day learning streak.",
    icon: "Flame",
    conditionType: "streak",
    threshold: 3,
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day continuous learning streak.",
    icon: "Flame",
    conditionType: "streak",
    threshold: 7,
  },
  {
    id: "streak_14",
    title: "Habit Master",
    description: "Maintain a 14-day continuous learning streak.",
    icon: "Flame",
    conditionType: "streak",
    threshold: 14,
  },
  {
    id: "streak_30",
    title: "Unstoppable Momentum",
    description: "Reach an incredible 30-day streak milestone.",
    icon: "Flame",
    conditionType: "streak",
    threshold: 30,
  },
  {
    id: "goal_crusher",
    title: "Daily Goal Crusher",
    description: "Hit your daily study target of minutes or lessons.",
    icon: "Target",
    conditionType: "streak",
    threshold: 1,
  },
  {
    id: "xp_500",
    title: "XP Powerhouse",
    description: "Earn 500 total Learning XP.",
    icon: "Zap",
    conditionType: "xp",
    threshold: 500,
  },
  {
    id: "pronounce_ace",
    title: "Vocal Maestro",
    description: "Practice speech & pronunciation with 90%+ clarity.",
    icon: "Mic",
    conditionType: "pronounce",
    threshold: 1,
  },
  {
    id: "chat_conversationalist",
    title: "Fluent Speaker",
    description: "Complete 10 conversational exchanges with AI tutor.",
    icon: "MessageSquare",
    conditionType: "chat",
    threshold: 10,
  },
  {
    id: "stress_survivor_1",
    title: "Iron Nerves",
    description: "Successfully complete your first Speaking Stress Test under pressure.",
    icon: "ShieldAlert",
    conditionType: "stress",
    threshold: 1,
  },
  {
    id: "stress_master_85",
    title: "Crisis Commander",
    description: "Score 85%+ on a high-stakes speaking stress scenario.",
    icon: "Flame",
    conditionType: "stress",
    threshold: 85,
  },
  {
    id: "assessment_done",
    title: "Diagnostic Pioneer",
    description: "Complete the initial CEFR language placement assessment.",
    icon: "Sparkles",
    conditionType: "lessons",
    threshold: 1,
  },
];

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function getOffsetDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

export const INITIAL_ERROR_MEMORY_BANK: ErrorMemoryItem[] = [
  {
    id: "err_subj_verb_1",
    category: "Grammar & Syntax",
    errorSnippet: "She don't like the proposal",
    correction: "She doesn't like the proposal",
    explanation: "Subject-verb agreement: third-person singular (she/he/it) requires 'doesn't' in the negative simple present tense.",
    sourceContext: "Executive Boardroom Simulation",
    frequency: 3,
    detectedAt: Date.now() - 86400000 * 2,
    lastRetestedAt: Date.now() - 3600000 * 5,
    status: "retesting_under_pressure",
    masteryScore: 65,
    retestAttempts: [
      {
        timestamp: Date.now() - 3600000 * 5,
        passed: true,
        contextSnippet: "Handling surprise timeline dispute",
        userSpeech: "She doesn't believe the current deadline is feasible.",
        feedback: "Perfect 3rd-person singular agreement under time pressure!",
      },
    ],
  },
  {
    id: "err_pron_comf_2",
    category: "Pronunciation & Phonetics",
    errorSnippet: "com-for-TA-ble (4 syllables with hard 'T')",
    correction: "/ˈkʌmf.tə.bəl/ (3 syllables: COMF-ter-ble)",
    explanation: "In standard native English, the middle 'or' is elided into a 3-syllable unit with primary stress on the first syllable.",
    sourceContext: "Pronunciation Acoustic Lab",
    frequency: 2,
    detectedAt: Date.now() - 86400000 * 3,
    status: "in_drill",
    masteryScore: 45,
    retestAttempts: [],
  },
  {
    id: "err_prag_diplomat_3",
    category: "Pragmatics & Register",
    errorSnippet: "You must change this design immediately",
    correction: "Could we perhaps explore adjusting the design to better align with the brief?",
    explanation: "In professional corporate discourse, avoid blunt imperative commands ('You must...'). Use modal softening ('Could we perhaps...') for face-saving diplomacy.",
    sourceContext: "Crisis & Conflict Management",
    frequency: 4,
    detectedAt: Date.now() - 86400000 * 1,
    status: "retesting_under_pressure",
    masteryScore: 78,
    retestAttempts: [
      {
        timestamp: Date.now() - 3600000 * 12,
        passed: true,
        contextSnippet: "Pushback on scope creep",
        userSpeech: "It might be advantageous to revisit the milestone parameters first.",
        feedback: "Exceptional diplomatic stance marker usage.",
      },
    ],
  },
  {
    id: "err_jargon_scale_4",
    category: "Vocabulary & Jargon",
    errorSnippet: "We need to make it bigger fast",
    correction: "We need to optimize unit economics and accelerate operational throughput",
    explanation: "Elevate colloquial phrasing to domain-specific executive terminology during investor pitches and technical reviews.",
    sourceContext: "Investor Pitch & Q&A",
    frequency: 2,
    detectedAt: Date.now() - 86400000 * 4,
    status: "in_drill",
    masteryScore: 55,
    retestAttempts: [],
  },
  {
    id: "err_filler_cluster_5",
    category: "Fluency & Fillers",
    errorSnippet: "Like, basically, um, our team did, you know...",
    correction: "Our team executed the multi-stage rollout seamlessly.",
    explanation: "Hesitation cluster detected (4 fillers in 8 words). Anchor vocal resonance and substitute silent syntactic pauses for filler words.",
    sourceContext: "Hot Seat Speaking Stress Test",
    frequency: 5,
    detectedAt: Date.now() - 86400000 * 2,
    status: "retesting_under_pressure",
    masteryScore: 70,
    retestAttempts: [],
  },
];

export const INITIAL_AFTER_ACTION_AUDIT: AfterActionAuditReport = {
  sessionId: "audit_init_demo_1",
  sessionTitle: "Series A Investor Pitch & Hostile Q&A",
  sessionType: "domain_scenario",
  completedAt: Date.now() - 3600000 * 3,
  durationSeconds: 195,
  totalWordsSpoken: 342,
  overallFluencyScore: 88,
  lexicalReach: {
    cefrDistribution: {
      a1_a2: 42,
      b1_b2: 38,
      c1_c2: 20,
    },
    uniqueVocabularyCount: 168,
    typeTokenRatio: 0.49,
    sophisticatedWordsUsed: [
      "trajectory",
      "frictionless",
      "amortization",
      "scalable",
      "countermeasure",
      "defensible",
      "retention",
    ],
    repetitiveWords: ["really", "actually", "thing"],
  },
  fillerWordAnalysis: {
    totalFillers: 6,
    fillerRatioPercent: 1.75,
    fillerBreakdown: [
      { word: "um", count: 3 },
      { word: "like", count: 2 },
      { word: "you know", count: 1 },
    ],
    rating: "Elite Articulation (<2%)",
  },
  syntacticCrutches: [
    {
      crutchPattern: "Over-reliance on 'I think that...'",
      occurrences: 4,
      exampleQuotes: [
        "I think that our CAC is defensible.",
        "I think that the market is expanding.",
      ],
      alternativeStructures: [
        "Our data confirms that...",
        "The empirical evidence indicates that...",
        "From an operational standpoint...",
      ],
    },
  ],
  fluencyVelocity: {
    avgWpm: 138,
    targetWpmBand: "Optimal Conversational (120-160 WPM)",
    turnTakingLatencyMs: 380,
    longPausesCount: 2,
  },
  pragmaticImpact: {
    diplomacyScore: 92,
    assertivenessScore: 88,
    registerConsistency: "Executive / Boardroom Pitch",
  },
  lineByLineRevisions: [
    {
      userSpoken: "We have very big growth and our clients love us.",
      executivePolishRewrite:
        "We have achieved exponential quarter-over-quarter expansion driven by high Net Promoter Scores and net revenue retention.",
      rationale: "Replaces vague qualitative claims with concrete executive metrics.",
      audioPlayable: true,
    },
    {
      userSpoken: "If competitors copy us, we can do it faster.",
      executivePolishRewrite:
        "Our multi-sided proprietary data moat and high switching costs insulate us effectively against copycats.",
      rationale: "Articulates competitive defensibility using authoritative domain terminology.",
      audioPlayable: true,
    },
    {
      userSpoken: "I think we need 2 million dollars for hire more people.",
      executivePolishRewrite:
        "We are seeking a $2M capital infusion to scale strategic engineering headcount and accelerate go-to-market distribution.",
      rationale: "Elevates informal phrasing into standard venture capital funding language.",
      audioPlayable: true,
    },
  ],
  executiveSummary:
    "Strong, confident delivery with an optimal 138 WPM cadence and elite <2% filler ratio. High lexical reach with 20% C1-C2 vocabulary. Growth area: reduce reliance on subjective openers like 'I think that' in favor of objective empirical assertions.",
  roiGainsSummary: [
    "+18% increase in executive domain jargon density compared to baseline",
    "Turn-taking response latency decreased to 380ms under hostile investor interruption",
    "Filler word count reduced from 14 in prior session down to 6",
  ],
};

export function getDefaultProgress(): UserProgress {
  const today = getTodayDateString();
  return {
    xp: 120, // Starter XP
    streakDays: 3,
    lastActiveDate: today,
    dailyGoalType: "minutes",
    dailyGoalMinutes: 15,
    dailyGoalLessons: 2,
    dailyGoalTargetStreak: 14, // 14-day streak habit goal
    minutesToday: 5,
    lessonsToday: 1,
    todayGoalCompleted: false,
    dailyActivityHistory: [
      { date: getOffsetDateString(-3), minutes: 15, lessons: 2, goalMet: true },
      { date: getOffsetDateString(-2), minutes: 20, lessons: 3, goalMet: true },
      { date: getOffsetDateString(-1), minutes: 15, lessons: 2, goalMet: true },
      { date: today, minutes: 5, lessons: 1, goalMet: false },
    ],
    completedLessonIds: ["grammar_1"],
    completedQuizIds: [],
    quizScores: {},
    savedVocabIds: ["v_greeting_1", "v_business_1"],
    masteredVocabIds: [],
    weakTopics: [],
    achievements: ["first_lesson", "streak_3"],
    selectedLevel: "A1",
    unlockedLevels: ["A1"], // Default to A1 unlocked; placement assessment updates this
    assessmentCompleted: false,
    completedBenchmarkExams: [],
    speechSpeed: 0.9,
    stressTestsCompleted: [],
    errorMemoryBank: INITIAL_ERROR_MEMORY_BANK,
    afterActionAudits: [INITIAL_AFTER_ACTION_AUDIT],
  };
}

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const defaults = getDefaultProgress();
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);

    const today = getTodayDateString();
    let streakDays = parsed.streakDays || 1;
    let minutesToday = parsed.minutesToday ?? 0;
    let lessonsToday = parsed.lessonsToday ?? 0;
    let todayGoalCompleted = parsed.todayGoalCompleted ?? false;

    // Check if new day
    if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
      const lastDate = new Date(parsed.lastActiveDate);
      const currDate = new Date(today);
      const diffDays = Math.floor((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        // Consecutive day
        // Streak remains active
      } else if (diffDays > 1) {
        // Streak broken
        streakDays = 1;
      }

      // Reset daily counters for new day
      minutesToday = 0;
      lessonsToday = 0;
      todayGoalCompleted = false;
    }

    const progress: UserProgress = {
      ...defaults,
      ...parsed,
      streakDays,
      lastActiveDate: today,
      dailyGoalType: parsed.dailyGoalType || "minutes",
      dailyGoalMinutes: parsed.dailyGoalMinutes || 15,
      dailyGoalLessons: parsed.dailyGoalLessons || 2,
      dailyGoalTargetStreak: parsed.dailyGoalTargetStreak || 14,
      minutesToday,
      lessonsToday,
      todayGoalCompleted,
      dailyActivityHistory: Array.isArray(parsed.dailyActivityHistory) && parsed.dailyActivityHistory.length > 0
        ? parsed.dailyActivityHistory
        : defaults.dailyActivityHistory,
      unlockedLevels: Array.isArray(parsed.unlockedLevels) && parsed.unlockedLevels.length > 0
        ? parsed.unlockedLevels
        : [parsed.selectedLevel || "A1"],
      assessmentCompleted: parsed.assessmentCompleted ?? false,
      completedBenchmarkExams: parsed.completedBenchmarkExams || [],
    };

    checkAndUpdateDailyGoal(progress);
    return progress;
  } catch (e) {
    console.error("Failed to load progress from localStorage:", e);
    return getDefaultProgress();
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save progress to localStorage:", e);
  }
}

export function checkAndUpdateDailyGoal(progress: UserProgress): { goalNewlyCompleted: boolean } {
  const goalType = progress.dailyGoalType || "minutes";
  const target = goalType === "minutes" ? (progress.dailyGoalMinutes || 15) : (progress.dailyGoalLessons || 2);
  const current = goalType === "minutes" ? (progress.minutesToday || 0) : (progress.lessonsToday || 0);

  const isMet = current >= target;
  let goalNewlyCompleted = false;

  if (isMet && !progress.todayGoalCompleted) {
    progress.todayGoalCompleted = true;
    goalNewlyCompleted = true;
    // Award 30 bonus XP for daily goal completion!
    progress.xp = (progress.xp || 0) + 30;
  }

  // Update today's entry in dailyActivityHistory
  const today = getTodayDateString();
  const history: DailyActivityDay[] = progress.dailyActivityHistory || [];
  const existingIdx = history.findIndex((h) => h.date === today);

  if (existingIdx >= 0) {
    history[existingIdx] = {
      date: today,
      minutes: progress.minutesToday || 0,
      lessons: progress.lessonsToday || 0,
      goalMet: progress.todayGoalCompleted || false,
    };
  } else {
    history.push({
      date: today,
      minutes: progress.minutesToday || 0,
      lessons: progress.lessonsToday || 0,
      goalMet: progress.todayGoalCompleted || false,
    });
  }

  progress.dailyActivityHistory = history.slice(-14); // Keep last 14 days
  checkAndGrantAchievements(progress);
  return { goalNewlyCompleted };
}

export function updateDailyGoalSettings(settings: {
  dailyGoalType: "minutes" | "lessons";
  dailyGoalMinutes: number;
  dailyGoalLessons: number;
  dailyGoalTargetStreak: number;
}): UserProgress {
  const current = loadUserProgress();
  const updated: UserProgress = {
    ...current,
    dailyGoalType: settings.dailyGoalType,
    dailyGoalMinutes: settings.dailyGoalMinutes,
    dailyGoalLessons: settings.dailyGoalLessons,
    dailyGoalTargetStreak: settings.dailyGoalTargetStreak,
  };
  checkAndUpdateDailyGoal(updated);
  saveUserProgress(updated);
  return updated;
}

export function logStudyTime(minutes: number, xpBonus = 0): { progress: UserProgress; goalCompleted: boolean } {
  const current = loadUserProgress();
  current.minutesToday = (current.minutesToday || 0) + minutes;
  if (xpBonus > 0) {
    current.xp = (current.xp || 0) + xpBonus;
  }
  const { goalNewlyCompleted } = checkAndUpdateDailyGoal(current);
  saveUserProgress(current);
  return { progress: current, goalCompleted: goalNewlyCompleted };
}

export function isLevelUnlocked(level: CEFRLevel, progress: UserProgress): boolean {
  if (!progress.unlockedLevels || progress.unlockedLevels.length === 0) {
    return level === "A1";
  }
  return progress.unlockedLevels.includes(level);
}

export function unlockLevel(levelToUnlock: CEFRLevel, xpEarned = 100): UserProgress {
  const current = loadUserProgress();
  const unlockedSet = new Set<CEFRLevel>(current.unlockedLevels || ["A1"]);
  unlockedSet.add(levelToUnlock);

  // Also unlock all lower levels up to this level
  const targetIdx = getCEFRLevelIndex(levelToUnlock);
  for (let i = 0; i <= targetIdx; i++) {
    unlockedSet.add(CEFR_LEVEL_ORDER[i]);
  }

  const updated: UserProgress = {
    ...current,
    unlockedLevels: Array.from(unlockedSet),
    selectedLevel: levelToUnlock,
    xp: (current.xp || 0) + xpEarned,
    minutesToday: (current.minutesToday || 0) + 5,
    lessonsToday: (current.lessonsToday || 0) + 1,
  };
  checkAndUpdateDailyGoal(updated);
  checkAndGrantAchievements(updated);
  saveUserProgress(updated);
  return updated;
}

export function saveAssessmentResult(result: PlacementAssessmentResult): UserProgress {
  const current = loadUserProgress();
  const targetLevel = result.diagnosedLevel;
  const targetIdx = getCEFRLevelIndex(targetLevel);

  // Unlock all levels from A1 up to diagnosed level
  const unlocked = new Set<CEFRLevel>(["A1"]);
  for (let i = 0; i <= targetIdx; i++) {
    unlocked.add(CEFR_LEVEL_ORDER[i]);
  }

  const updated: UserProgress = {
    ...current,
    selectedLevel: targetLevel,
    unlockedLevels: Array.from(unlocked),
    assessmentCompleted: true,
    assessmentResult: result,
    xp: (current.xp || 0) + 150, // Assessment completion bonus XP
    minutesToday: (current.minutesToday || 0) + 10,
    lessonsToday: (current.lessonsToday || 0) + 1,
  };

  checkAndUpdateDailyGoal(updated);
  checkAndGrantAchievements(updated);
  saveUserProgress(updated);
  return updated;
}

export function saveSpokenAssessmentResult(result: SpokenAssessmentEvaluationResponse): UserProgress {
  const current = loadUserProgress();
  const targetLevel = result.active_start_module || result.cefr_band || "B1";
  const targetIdx = getCEFRLevelIndex(targetLevel);

  // Mark all levels below target level as unlocked/tested out
  const unlocked = new Set<CEFRLevel>(["A1"]);
  for (let i = 0; i <= targetIdx; i++) {
    unlocked.add(CEFR_LEVEL_ORDER[i]);
  }

  const updated: UserProgress = {
    ...current,
    selectedLevel: targetLevel,
    unlockedLevels: Array.from(unlocked),
    assessmentCompleted: true,
    spokenAssessmentResult: result,
    xp: (current.xp || 0) + 200, // Spoken assessment bonus XP
    minutesToday: (current.minutesToday || 0) + 15,
    lessonsToday: (current.lessonsToday || 0) + 1,
  };

  checkAndUpdateDailyGoal(updated);
  checkAndGrantAchievements(updated);
  saveUserProgress(updated);
  return updated;
}

export function recordBenchmarkExamPassed(
  level: CEFRLevel,
  xpEarned = 200,
  report?: LevelAssessmentReport
): UserProgress {
  const current = loadUserProgress();
  const passedExams = new Set<CEFRLevel>(current.completedBenchmarkExams || []);
  passedExams.add(level);

  const nextLvl = getNextCEFRLevel(level);
  const unlockedSet = new Set<CEFRLevel>(current.unlockedLevels || ["A1"]);
  if (nextLvl) {
    unlockedSet.add(nextLvl);
  }

  const existingReports = current.levelAssessmentReports || [];
  const updatedReports = report ? [report, ...existingReports] : existingReports;

  const updated: UserProgress = {
    ...current,
    completedBenchmarkExams: Array.from(passedExams),
    unlockedLevels: Array.from(unlockedSet),
    selectedLevel: nextLvl || level,
    levelAssessmentReports: updatedReports,
    xp: (current.xp || 0) + xpEarned,
    minutesToday: (current.minutesToday || 0) + 15,
    lessonsToday: (current.lessonsToday || 0) + 1,
  };

  checkAndUpdateDailyGoal(updated);
  checkAndGrantAchievements(updated);
  saveUserProgress(updated);
  return updated;
}

export function saveLevelAssessmentReport(report: LevelAssessmentReport): UserProgress {
  const current = loadUserProgress();
  const existingReports = current.levelAssessmentReports || [];
  const updatedReports = [report, ...existingReports.filter((r) => r.completedAt !== report.completedAt)];

  const updated: UserProgress = {
    ...current,
    levelAssessmentReports: updatedReports,
  };

  saveUserProgress(updated);
  return updated;
}

export function updateStreak(): UserProgress {
  const current = loadUserProgress();
  const today = getTodayDateString();
  const lastActive = current.lastActiveDate || today;

  const lastDate = new Date(lastActive);
  const currDate = new Date(today);
  const diffDays = Math.floor((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

  let streak = current.streakDays || 1;
  if (diffDays === 1) {
    streak += 1;
  } else if (diffDays > 1) {
    streak = 1;
  }

  const updated: UserProgress = {
    ...current,
    streakDays: streak,
    lastActiveDate: today,
  };
  checkAndUpdateDailyGoal(updated);
  saveUserProgress(updated);
  return updated;
}

export function addXp(amount: number): UserProgress {
  const current = loadUserProgress();
  const updated: UserProgress = {
    ...current,
    xp: (current.xp || 0) + amount,
    minutesToday: (current.minutesToday || 0) + Math.max(1, Math.ceil(amount / 10)),
  };
  checkAndUpdateDailyGoal(updated);
  checkAndGrantAchievements(updated);
  saveUserProgress(updated);
  return updated;
}

export function markLessonCompleted(lessonId: string, xpEarned: number): UserProgress {
  const current = loadUserProgress();
  const completed = new Set(current.completedLessonIds || []);
  completed.add(lessonId);

  const updated: UserProgress = {
    ...current,
    completedLessonIds: Array.from(completed),
    xp: (current.xp || 0) + xpEarned,
    minutesToday: (current.minutesToday || 0) + 5,
    lessonsToday: (current.lessonsToday || 0) + 1,
  };
  checkAndUpdateDailyGoal(updated);
  checkAndGrantAchievements(updated);
  saveUserProgress(updated);
  return updated;
}

export function recordQuizScore(quizId: string, score: number, xpEarned: number): UserProgress {
  const current = loadUserProgress();
  const completed = new Set(current.completedQuizIds || []);
  completed.add(quizId);

  const scores = { ...(current.quizScores || {}), [quizId]: score };

  const updated: UserProgress = {
    ...current,
    completedQuizIds: Array.from(completed),
    quizScores: scores,
    xp: (current.xp || 0) + xpEarned,
    minutesToday: (current.minutesToday || 0) + 5,
    lessonsToday: (current.lessonsToday || 0) + 1,
  };
  checkAndUpdateDailyGoal(updated);
  checkAndGrantAchievements(updated);
  saveUserProgress(updated);
  return updated;
}

export function toggleSavedWord(wordId: string): UserProgress {
  const current = loadUserProgress();
  const saved = new Set(current.savedVocabIds || []);
  if (saved.has(wordId)) {
    saved.delete(wordId);
  } else {
    saved.add(wordId);
  }

  const updated: UserProgress = {
    ...current,
    savedVocabIds: Array.from(saved),
  };
  saveUserProgress(updated);
  return updated;
}

export function markWordMastered(wordId: string): UserProgress {
  const current = loadUserProgress();
  const mastered = new Set(current.masteredVocabIds || []);
  mastered.add(wordId);

  const updated: UserProgress = {
    ...current,
    masteredVocabIds: Array.from(mastered),
    xp: (current.xp || 0) + 20,
    minutesToday: (current.minutesToday || 0) + 2,
  };
  checkAndUpdateDailyGoal(updated);
  checkAndGrantAchievements(updated);
  saveUserProgress(updated);
  return updated;
}

export function recordStressTestResult(item: any, xpEarned: number): UserProgress {
  const current = loadUserProgress();
  const history = current.stressTestsCompleted || [];
  const updatedHistory = [item, ...history];

  const updated: UserProgress = {
    ...current,
    stressTestsCompleted: updatedHistory,
    xp: (current.xp || 0) + xpEarned,
    minutesToday: (current.minutesToday || 0) + 5,
    lessonsToday: (current.lessonsToday || 0) + 1,
  };
  checkAndUpdateDailyGoal(updated);
  checkAndGrantAchievements(updated);
  saveUserProgress(updated);
  return updated;
}

export function checkAndGrantAchievements(progress: UserProgress): void {
  const unlocked = new Set(progress.achievements || []);

  if (progress.completedLessonIds.length >= 1) unlocked.add("first_lesson");
  if (progress.completedLessonIds.length >= 5) unlocked.add("scholar_5");
  if (progress.completedQuizIds.length >= 1) unlocked.add("quiz_master_1");
  if (progress.streakDays >= 3) unlocked.add("streak_3");
  if (progress.streakDays >= 7) unlocked.add("streak_7");
  if (progress.streakDays >= 14) unlocked.add("streak_14");
  if (progress.streakDays >= 30) unlocked.add("streak_30");
  if (progress.todayGoalCompleted) unlocked.add("goal_crusher");
  if (progress.xp >= 500) unlocked.add("xp_500");
  if (progress.assessmentCompleted) unlocked.add("assessment_done");
  
  if ((progress.stressTestsCompleted || []).length >= 1) unlocked.add("stress_survivor_1");
  if ((progress.stressTestsCompleted || []).some((s) => s.score >= 85)) unlocked.add("stress_master_85");

  progress.achievements = Array.from(unlocked);
}

// ============================================================================
// ERROR MEMORY BANK HELPER FUNCTIONS
// ============================================================================
export function trackErrorSlip(
  errorSnippet: string,
  correction: string,
  explanation: string,
  category: ErrorSlipCategory = "Grammar & Syntax",
  sourceContext: string = "Conversational Flow"
): UserProgress {
  const current = loadUserProgress();
  const bank = current.errorMemoryBank || INITIAL_ERROR_MEMORY_BANK;

  // Check if identical or very similar error already exists
  const existingIdx = bank.findIndex(
    (e) =>
      e.errorSnippet.toLowerCase().trim() === errorSnippet.toLowerCase().trim() ||
      e.correction.toLowerCase().trim() === correction.toLowerCase().trim()
  );

  let updatedBank: ErrorMemoryItem[];

  if (existingIdx >= 0) {
    const existing = bank[existingIdx];
    const updatedItem: ErrorMemoryItem = {
      ...existing,
      frequency: existing.frequency + 1,
      lastRetestedAt: Date.now(),
      status: existing.status === "mastered" ? "retesting_under_pressure" : existing.status,
      masteryScore: Math.max(15, existing.masteryScore - 10), // Slip lowers mastery
    };
    updatedBank = [...bank];
    updatedBank[existingIdx] = updatedItem;
  } else {
    const newItem: ErrorMemoryItem = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      category,
      errorSnippet,
      correction,
      explanation,
      sourceContext,
      frequency: 1,
      detectedAt: Date.now(),
      status: "detected",
      masteryScore: 35,
      retestAttempts: [],
    };
    updatedBank = [newItem, ...bank];
  }

  const updatedProgress: UserProgress = {
    ...current,
    errorMemoryBank: updatedBank,
  };
  saveUserProgress(updatedProgress);
  return updatedProgress;
}

export function recordErrorRetestAttempt(
  errorId: string,
  passed: boolean,
  contextSnippet: string,
  userSpeech: string,
  feedback: string
): UserProgress {
  const current = loadUserProgress();
  const bank = current.errorMemoryBank || INITIAL_ERROR_MEMORY_BANK;

  const updatedBank = bank.map((item) => {
    if (item.id !== errorId) return item;

    const newAttempts = [
      ...(item.retestAttempts || []),
      {
        timestamp: Date.now(),
        passed,
        contextSnippet,
        userSpeech,
        feedback,
      },
    ];

    const newScore = passed
      ? Math.min(100, item.masteryScore + 25)
      : Math.max(10, item.masteryScore - 20);

    const newStatus =
      newScore >= 85
        ? ("mastered" as const)
        : passed
        ? ("retesting_under_pressure" as const)
        : ("in_drill" as const);

    return {
      ...item,
      lastRetestedAt: Date.now(),
      masteryScore: newScore,
      status: newStatus,
      retestAttempts: newAttempts,
    };
  });

  const updatedProgress: UserProgress = {
    ...current,
    errorMemoryBank: updatedBank,
    xp: passed ? (current.xp || 0) + 40 : (current.xp || 0) + 15,
  };
  saveUserProgress(updatedProgress);
  return updatedProgress;
}

export function deleteErrorMemoryItem(errorId: string): UserProgress {
  const current = loadUserProgress();
  const bank = (current.errorMemoryBank || INITIAL_ERROR_MEMORY_BANK).filter((e) => e.id !== errorId);
  const updatedProgress: UserProgress = {
    ...current,
    errorMemoryBank: bank,
  };
  saveUserProgress(updatedProgress);
  return updatedProgress;
}

// ============================================================================
// AFTER-ACTION AUDIT SAVER
// ============================================================================
export function saveAfterActionAudit(audit: AfterActionAuditReport): UserProgress {
  const current = loadUserProgress();
  const existingAudits = current.afterActionAudits || [];
  const updatedAudits = [audit, ...existingAudits.filter((a) => a.sessionId !== audit.sessionId)].slice(0, 20);

  const updatedProgress: UserProgress = {
    ...current,
    afterActionAudits: updatedAudits,
    xp: (current.xp || 0) + 50,
  };
  saveUserProgress(updatedProgress);
  return updatedProgress;
}

export function resetProgress(): UserProgress {
  const initial = getDefaultProgress();
  saveUserProgress(initial);
  return initial;
}


