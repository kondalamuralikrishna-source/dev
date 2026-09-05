import { SpokenTaskPrompt, CEFRLevel } from "../types";

export const SPOKEN_ASSESSMENT_TASKS: SpokenTaskPrompt[] = [
  {
    id: "spk_task_1",
    taskNumber: 1,
    title: "Personal Experience & Narrative",
    category: "Narrative Fluency & Chronological Tenses",
    prompt: "Describe a memorable personal experience, journey, or milestone that made a strong impression on you. Explain what happened, where you were, and why this event remains meaningful to you today.",
    contextHint: "Focus on using past narrative tenses (Past Simple, Past Continuous, Past Perfect) and time linkers (such as 'initially', 'subsequently', 'in hindsight').",
    suggestedDurationSeconds: 45,
    suggestedTargetVocabulary: ["unforgettable", "unexpectedly", "transformative", "milestone", "in retrospect", "vividly"],
    focusAreas: ["Past tense accuracy", "Chronological coherence", "Descriptive adjectives", "Natural conversational flow"],
  },
  {
    id: "spk_task_2",
    taskNumber: 2,
    title: "Technology's Impact on Human Communication",
    category: "Opinion & Argumentative Discourse",
    prompt: "Explain your opinion on how modern digital technology and artificial intelligence are transforming human communication. Do you believe these changes strengthen our connections or make us more isolated? Support your view with clear reasons and examples.",
    contextHint: "Structure your argument with opinion markers ('from my perspective', 'it is undeniable that'), contrast connectors ('conversely', 'on the other hand'), and concrete illustrations.",
    suggestedDurationSeconds: 60,
    suggestedTargetVocabulary: ["instantaneous", "superficial", "foster connection", "double-edged sword", "algorithmic", "nuance"],
    focusAreas: ["Lexical precision", "Argumentative coherence", "Hedging & stance markers", "Sentence variation"],
  },
  {
    id: "spk_task_3",
    taskNumber: 3,
    title: "Professional Problem Solving & Conflict Resolution",
    category: "Executive & Workplace Discourse",
    prompt: "Discuss a challenging problem, high-pressure deadline, or disagreement you encountered at work, school, or in a project. Explain how you analyzed the situation, collaborated with others, and resolved the challenge successfully.",
    contextHint: "Use cause-and-effect structures ('consequently', 'owing to'), modal verbs of deduction or recommendation ('should have', 'needed to be addressed'), and resolution vocabulary.",
    suggestedDurationSeconds: 60,
    suggestedTargetVocabulary: ["navigate", "bottleneck", "reconcile", "consensus", "proactive", "outcome", "contingency"],
    focusAreas: ["Complex syntax", "Diplomatic phrasing", "Logical problem-solution flow", "Professional collocations"],
  },
  {
    id: "spk_task_4",
    taskNumber: 4,
    title: "Visionary Architecture & Sustainable City Systems",
    category: "Abstract & High-Register Oratory",
    prompt: "If you were appointed to design an ideal future city for the next generation, what environmental, urban, and community systems would you prioritize? Justify how your vision balances ecological sustainability with human well-being.",
    contextHint: "Utilize hypothetical conditionals ('were we to implement', 'this would facilitate'), passive constructions, and sophisticated abstract nouns.",
    suggestedDurationSeconds: 60,
    suggestedTargetVocabulary: ["infrastructure", "resilience", "carbon-neutral", "holistic", "interconnectivity", "livability", "paradigm"],
    focusAreas: ["Subjunctive & hypothetical grammar", "Advanced CEFR C1/C2 vocabulary", "Rhetorical cadence", "Synthesis"],
  },
];

export interface CEFRModuleDescriptor {
  level: CEFRLevel;
  name: string;
  badge: string;
  tagline: string;
  cefrDescriptor: string;
  color: string;
  borderAccent: string;
  accentBg: string;
  focusSkills: string[];
  sampleLessons: {
    id: string;
    title: string;
    type: "spoken_drill" | "grammar_mastery" | "roleplay" | "pronunciation";
    duration: string;
    summary: string;
  }[];
}

export const CEFR_MODULE_TIERS: Record<CEFRLevel, CEFRModuleDescriptor> = {
  A1: {
    level: "A1",
    name: "A1: Breakthrough Foundations",
    badge: "Beginner",
    tagline: "Core sentence mechanics, personal introductions, and essential daily needs.",
    cefrDescriptor: "Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type.",
    color: "from-blue-500 to-cyan-500",
    borderAccent: "border-blue-300",
    accentBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200",
    focusSkills: ["Subject-Verb Agreement", "High-frequency 500 words", "Phonetic Vowels & Consonants", "Basic Self-Introductions"],
    sampleLessons: [
      { id: "a1_drill_1", title: "Daily Greetings & Self-Introduction Spoken Drill", type: "spoken_drill", duration: "8 mins", summary: "Practice clear vowel articulation and standard greeting formulas." },
      { id: "a1_drill_2", title: "Parts of Speech & Sentence Building", type: "grammar_mastery", duration: "10 mins", summary: "Master Subject + Verb + Object word ordering." },
      { id: "a1_drill_3", title: "Ordering Food & Basic Requests", type: "roleplay", duration: "12 mins", summary: "Simulate café and grocery store polite interactions." },
    ],
  },
  A2: {
    level: "A2",
    name: "A2: Waystage & Daily Routine",
    badge: "Elementary",
    tagline: "Past routines, simple directions, shopping, and everyday social exchanges.",
    cefrDescriptor: "Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar matters.",
    color: "from-emerald-500 to-teal-500",
    borderAccent: "border-emerald-300",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200",
    focusSkills: ["Past Simple vs Past Continuous", "Comparatives & Superlatives", "Phrasal Verbs of Movement", "Travel & Asking Directions"],
    sampleLessons: [
      { id: "a2_drill_1", title: "Narrating Your Weekend Routine Drill", type: "spoken_drill", duration: "10 mins", summary: "Fluently connect chronological past actions with regular/irregular verbs." },
      { id: "a2_drill_2", title: "Airport & Hotel Check-in Roleplay", type: "roleplay", duration: "12 mins", summary: "Handle common travel logistics and clarify schedules." },
      { id: "a2_drill_3", title: "Word Stress & Syllable Timing Practice", type: "pronunciation", duration: "10 mins", summary: "Master strong vs weak vowel reduction in multi-syllable words." },
    ],
  },
  B1: {
    level: "B1",
    name: "B1: Threshold & Workplace Fluency",
    badge: "Intermediate",
    tagline: "Fluency & workplace discussions, expressing opinions, conditionals, and spontaneous dialogue.",
    cefrDescriptor: "Can enter unprepared into conversation on familiar topics, express opinions, give reasons, and describe experiences and events.",
    color: "from-amber-500 to-orange-500",
    borderAccent: "border-amber-400",
    accentBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200",
    focusSkills: ["Second & Third Conditionals", "Modal Verbs of Obligation & Advice", "Connected Speech & Liaison", "Workplace Updates & Email Tone"],
    sampleLessons: [
      { id: "b1_drill_1", title: "Stand-Up Meeting & Sprint Progress Spoken Drill", type: "spoken_drill", duration: "12 mins", summary: "Deliver a structured 90-second project status update." },
      { id: "b1_drill_2", title: "Expressing Nuanced Opinions & Polite Disagreement", type: "roleplay", duration: "15 mins", summary: "Diplomatic debate with constructive pushback phrases." },
      { id: "b1_drill_3", title: "Conditionals & Hypothetical Thinking", type: "grammar_mastery", duration: "14 mins", summary: "Navigate real vs unreal conditions smoothly in real-time." },
    ],
  },
  B2: {
    level: "B2",
    name: "B2: Vantage & High-Stakes Discourse",
    badge: "Upper Intermediate",
    tagline: "Complex technical debates, passive reporting, diplomatic hedging, and idiomatic precision.",
    cefrDescriptor: "Can interact with a degree of fluency and spontaneity with native speakers and explain a viewpoint on a topical issue giving pros and cons.",
    color: "from-indigo-500 to-violet-500",
    borderAccent: "border-indigo-400",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200",
    focusSkills: ["Passive Voice Transformations", "Hedging & Stance Adverbs", "Crisis & Conflict Management", "Advanced Phrasal Collocations"],
    sampleLessons: [
      { id: "b2_drill_1", title: "Crisis Resolution & Executive Pitch Spoken Drill", type: "spoken_drill", duration: "15 mins", summary: "Respond calmly to unexpected interruptions and stakeholder questions." },
      { id: "b2_drill_2", title: "Active vs Passive Register Transformations", type: "grammar_mastery", duration: "15 mins", summary: "Craft objective, formal journalistic and executive summaries." },
      { id: "b2_drill_3", title: "Full-Duplex Dialect-Agnostic Conversation", type: "roleplay", duration: "18 mins", summary: "Live low-latency discussion with unscripted topical pivots." },
    ],
  },
  C1: {
    level: "C1",
    name: "C1: Effective Operational Proficiency",
    badge: "Advanced",
    tagline: "Complex rhetoric, stylistic inversions, implicit meaning, and executive synthesis.",
    cefrDescriptor: "Can express ideas fluently and spontaneously without much obvious searching for expressions, using language flexibly for social and academic purposes.",
    color: "from-purple-500 to-pink-500",
    borderAccent: "border-purple-400",
    accentBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200",
    focusSkills: ["Negative Inversion & Cleft Sentences", "Subtle Irony & Idiomatic Nuance", "Keynote Oratory & Cadence", "Academic Discourse Analysis"],
    sampleLessons: [
      { id: "c1_drill_1", title: "Executive Boardroom Rhetorical Synthesis Drill", type: "spoken_drill", duration: "15 mins", summary: "Summarize conflicting proposals into an actionable strategic vision." },
      { id: "c1_drill_2", title: "Negative Inversions & Emphatic Stylistics", type: "grammar_mastery", duration: "15 mins", summary: "Master structures like 'Not only did...', 'Rarely have we seen...'." },
      { id: "c1_drill_3", title: "High-Stakes Contract & Cross-Cultural Negotiation", type: "roleplay", duration: "20 mins", summary: "Navigate subtle cultural subtext and implicit bargaining cues." },
    ],
  },
  C2: {
    level: "C2",
    name: "C2: Mastery & Oratorical Eminence",
    badge: "Mastery",
    tagline: "Effortless nuance, spontaneous idiomatic mastery, and high-register oratorical delivery.",
    cefrDescriptor: "Can understand with ease virtually everything heard or read. Can reconstruct arguments and accounts in a coherent presentation.",
    color: "from-rose-500 to-amber-600",
    borderAccent: "border-rose-400",
    accentBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200",
    focusSkills: ["Spontaneous Idiomatic Synthesis", "Subtle Phonetic Intelligibility in Noise", "Oratorical Cadence & Pitch Accents", "Epistemic Hedging & Persuasion"],
    sampleLessons: [
      { id: "c2_drill_1", title: "Keynote Address & Spontaneous Press Conference", type: "spoken_drill", duration: "20 mins", summary: "Deliver an impromptu 2-minute keynote followed by hostile journalist Q&A." },
      { id: "c2_drill_2", title: "Nuanced Sociolinguistic Pragmatics", type: "grammar_mastery", duration: "18 mins", summary: "Deconstruct multi-layered double entendres, satire, and dialectal registers." },
      { id: "c2_drill_3", title: "Full-Duplex High-Friction Debate Challenge", type: "roleplay", duration: "25 mins", summary: "Rapid-fire debate simulation with real-time backchannels and interruption handling." },
    ],
  },
};
