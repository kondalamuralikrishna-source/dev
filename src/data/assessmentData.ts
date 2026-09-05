import { CEFRLevel } from "../types";

export interface AssessmentQuestion {
  id: string;
  category: "grammar" | "vocabulary" | "reading" | "practical" | "situational";
  targetLevel: CEFRLevel;
  difficultyLabel: string;
  question: string;
  context?: string;
  audioPrompt?: string;
  options: {
    id: string;
    text: string;
    levelScore: number; // 1 = A1, 2 = A2, 3 = B1, 4 = B2, 5 = C1
    isCorrect: boolean;
    explanation?: string;
  }[];
  explanation: string;
}

export const INITIAL_PLACEMENT_QUESTIONS: AssessmentQuestion[] = [
  // A1 Questions (Foundational)
  {
    id: "pq_a1_1",
    category: "grammar",
    targetLevel: "A1",
    difficultyLabel: "Basic Grammar",
    question: "Choose the correct form of the verb to complete the sentence: 'Sarah _______ an English class every Tuesday evening.'",
    options: [
      { id: "a", text: "attend", levelScore: 0, isCorrect: false, explanation: "Singular subject 'Sarah' needs third-person 's'." },
      { id: "b", text: "attends", levelScore: 1, isCorrect: true, explanation: "Correct! Third-person singular present simple adds '-s'." },
      { id: "c", text: "attending", levelScore: 0, isCorrect: false, explanation: "Needs auxiliary verb 'is attending' for continuous." },
      { id: "d", text: "is attend", levelScore: 0, isCorrect: false, explanation: "Grammatically invalid verb construction." },
    ],
    explanation: "In Present Simple, third-person singular subjects (he/she/it/Sarah) require the verb ending in -s or -es.",
  },
  {
    id: "pq_a1_2",
    category: "vocabulary",
    targetLevel: "A1",
    difficultyLabel: "Daily Vocabulary",
    question: "Which word best completes the sentence? 'I need to buy some fresh bread, so I am going to the _______.'",
    options: [
      { id: "a", text: "bakery", levelScore: 1, isCorrect: true, explanation: "A bakery is a place where bread and pastries are made and sold." },
      { id: "b", text: "library", levelScore: 0, isCorrect: false, explanation: "A library is for borrowing books." },
      { id: "c", text: "pharmacy", levelScore: 0, isCorrect: false, explanation: "A pharmacy sells medicine." },
      { id: "d", text: "station", levelScore: 0, isCorrect: false, explanation: "A station is for trains or buses." },
    ],
    explanation: "'Bakery' is the correct store for purchasing fresh bread.",
  },

  // A2 Questions (Elementary)
  {
    id: "pq_a2_1",
    category: "grammar",
    targetLevel: "A2",
    difficultyLabel: "Past Tenses",
    question: "Select the sentence with the correct past tense usage:",
    options: [
      { id: "a", text: "While I was walking to work yesterday, it started to rain.", levelScore: 2, isCorrect: true, explanation: "Past continuous ('was walking') interrupted by past simple ('started')." },
      { id: "b", text: "While I walked to work yesterday, it was starting raining.", levelScore: 0, isCorrect: false, explanation: "Incorrect continuous aspect." },
      { id: "c", text: "While I am walking to work, it started to rain yesterday.", levelScore: 0, isCorrect: false, explanation: "Mixed present and past time frames." },
      { id: "d", text: "While I was walked to work, it started rain.", levelScore: 0, isCorrect: false, explanation: "Grammatically malformed verb phrase." },
    ],
    explanation: "Past continuous describes an ongoing background action, while Past simple describes the interrupting event.",
  },
  {
    id: "pq_a2_2",
    category: "practical",
    targetLevel: "A2",
    difficultyLabel: "Comparatives & Travel",
    question: "Complete the statement: 'Taking the high-speed bullet train is _______ travelling by standard bus.'",
    options: [
      { id: "a", text: "more faster as", levelScore: 0, isCorrect: false, explanation: "'More faster' is a double comparative error." },
      { id: "b", text: "much faster than", levelScore: 2, isCorrect: true, explanation: "'Much faster than' correctly uses comparative modifier 'much' with adjective + -er + 'than'." },
      { id: "c", text: "fastest that", levelScore: 0, isCorrect: false, explanation: "'Fastest' is superlative and takes 'of' or 'in'." },
      { id: "d", text: "as fast than", levelScore: 0, isCorrect: false, explanation: "The structure is 'as... as', not 'as... than'." },
    ],
    explanation: "Short adjectives take '-er' + 'than' for comparisons. Intensifiers like 'much' or 'far' can modify the comparative.",
  },

  // B1 Questions (Intermediate)
  {
    id: "pq_b1_1",
    category: "grammar",
    targetLevel: "B1",
    difficultyLabel: "Conditionals & Modals",
    question: "Choose the correct Second Conditional sentence:",
    context: "Talking about an imaginary hypothetical situation in the present/future.",
    options: [
      { id: "a", text: "If I will have more free time, I would learn Spanish.", levelScore: 0, isCorrect: false, explanation: "'Will' is not used in the if-clause of conditionals." },
      { id: "b", text: "If I had more free time, I would learn Spanish.", levelScore: 3, isCorrect: true, explanation: "Second Conditional: If + Past Simple, would + base verb." },
      { id: "c", text: "If I have more free time, I would have learned Spanish.", levelScore: 0, isCorrect: false, explanation: "Mixed conditional without proper temporal sequence." },
      { id: "d", text: "If I had had more free time, I learn Spanish.", levelScore: 0, isCorrect: false, explanation: "Third conditional clause with present main clause." },
    ],
    explanation: "The Second Conditional uses 'If + Past Simple' for the condition, and 'would + Infinitive' for the hypothetical result.",
  },
  {
    id: "pq_b1_2",
    category: "vocabulary",
    targetLevel: "B1",
    difficultyLabel: "Collocations & Work",
    question: "Which phrasal verb correctly means 'to cancel an arranged meeting'?",
    options: [
      { id: "a", text: "call off", levelScore: 3, isCorrect: true, explanation: "'Call off' means to cancel an event or meeting." },
      { id: "b", text: "put off", levelScore: 0, isCorrect: false, explanation: "'Put off' means to postpone or delay, not cancel." },
      { id: "c", text: "take off", levelScore: 0, isCorrect: false, explanation: "'Take off' means for an aircraft to leave the ground or to remove clothing." },
      { id: "d", text: "turn off", levelScore: 0, isCorrect: false, explanation: "'Turn off' means to deactivate a device." },
    ],
    explanation: "'Call off' is a standard B1 phrasal verb meaning to cancel an appointment or event entirely.",
  },

  // B2 Questions (Upper-Intermediate)
  {
    id: "pq_b2_1",
    category: "grammar",
    targetLevel: "B2",
    difficultyLabel: "Passive & Reported Speech",
    question: "Identify the correct formal passive reporting structure:",
    options: [
      { id: "a", text: "The new renewable energy project is believed to create over 5,000 engineering jobs.", levelScore: 4, isCorrect: true, explanation: "Subject + passive reporting verb ('is believed') + to-infinitive." },
      { id: "b", text: "It is believing that the project will create jobs.", levelScore: 0, isCorrect: false, explanation: "Continuous aspect is incorrect for reporting verbs." },
      { id: "c", text: "The project believes to be creating jobs.", levelScore: 0, isCorrect: false, explanation: "The project cannot perform the action of believing." },
      { id: "d", text: "They are believed the project will create jobs.", levelScore: 0, isCorrect: false, explanation: "Mismatched subject and passive agent." },
    ],
    explanation: "Advanced passive reporting utilizes: Subject + be + past participle of reporting verb (thought/believed/claimed) + to-infinitive.",
  },
  {
    id: "pq_b2_2",
    category: "situational",
    targetLevel: "B2",
    difficultyLabel: "Professional Diplomacy",
    question: "In an executive meeting, what is the most diplomatic way to express disagreement with a colleague's proposal?",
    options: [
      { id: "a", text: "You are completely wrong about the budget calculations.", levelScore: 0, isCorrect: false, explanation: "Too blunt and confrontational." },
      { id: "b", text: "I see your point regarding market expansion; however, I have some reservations about the projected timeline.", levelScore: 4, isCorrect: true, explanation: "Diplomatic hedging using concessions ('I see your point') followed by gentle contrast ('however, reservations')." },
      { id: "c", text: "That proposal makes no sense at all in our current crisis.", levelScore: 0, isCorrect: false, explanation: "Unprofessional and aggressive." },
      { id: "d", text: "I agree with everything you say.", levelScore: 0, isCorrect: false, explanation: "Fails to express disagreement." },
    ],
    explanation: "B2 professional English requires hedging, softening language, and diplomatic transitions when challenging viewpoints.",
  },

  // C1 Questions (Advanced Mastery)
  {
    id: "pq_c1_1",
    category: "grammar",
    targetLevel: "C1",
    difficultyLabel: "Negative Inversion & Nuance",
    question: "Choose the sentence with correct Negative Inversion for emphasis:",
    options: [
      { id: "a", text: "Seldom we have witnessed such remarkable dedication across the entire team.", levelScore: 0, isCorrect: false, explanation: "Inversion requires auxiliary verb before the subject." },
      { id: "b", text: "Seldom have we witnessed such remarkable dedication across the entire team.", levelScore: 5, isCorrect: true, explanation: "Negative adverb ('Seldom') triggers inverted word order: Seldom + have (auxiliary) + we (subject) + witnessed (verb)." },
      { id: "c", text: "Seldom did we witnessed such remarkable dedication.", levelScore: 0, isCorrect: false, explanation: "Double past tense error ('did' + 'witnessed')." },
      { id: "d", text: "Seldom we witnessed such remarkable dedication.", levelScore: 0, isCorrect: false, explanation: "Lacks auxiliary verb inversion." },
    ],
    explanation: "In formal C1 English, placing negative or limiting adverbs (Seldom, Rarely, Scarcely, Never) at the start of a sentence requires subject-auxiliary inversion.",
  },
  {
    id: "pq_c1_2",
    category: "vocabulary",
    targetLevel: "C1",
    difficultyLabel: "Advanced Idiomatic Precision",
    question: "Which word best completes the sophisticated sentence? 'The diplomat's _______ response managed to defuse the geopolitical crisis without making any binding concessions.'",
    options: [
      { id: "a", text: "equivocal", levelScore: 5, isCorrect: true, explanation: "'Equivocal' means ambiguous, open to multiple interpretations, deliberately vague to avoid conflict." },
      { id: "b", text: "reckless", levelScore: 0, isCorrect: false, explanation: "'Reckless' means careless and dangerously rash." },
      { id: "c", text: "rudimentary", levelScore: 0, isCorrect: false, explanation: "'Rudimentary' means basic or underdeveloped." },
      { id: "d", text: "superficial", levelScore: 0, isCorrect: false, explanation: "'Superficial' has a negative connotation of lacking substance." },
    ],
    explanation: "'Equivocal' precisely describes language that allows room for interpretation while avoiding immediate escalation.",
  },
];

// Level Graduation / Benchmark Exams (For moving up from A1->A2, A2->B1, B1->B2, B2->C1)
export interface LevelBenchmarkExam {
  level: CEFRLevel;
  nextLevel: CEFRLevel;
  title: string;
  passThresholdPercent: number; // e.g. 75
  xpReward: number;
  questions: AssessmentQuestion[];
}

export const LEVEL_BENCHMARK_EXAMS: Record<CEFRLevel, LevelBenchmarkExam> = {
  A1: {
    level: "A1",
    nextLevel: "A2",
    title: "A1 to A2 Foundation Benchmark & Skill Advancement Assessment",
    passThresholdPercent: 70,
    xpReward: 150,
    questions: [
      {
        id: "bm_a1_1",
        category: "grammar",
        targetLevel: "A1",
        difficultyLabel: "Subject-Verb Agreement",
        question: "Select the sentence with no grammatical errors:",
        options: [
          { id: "a", text: "They doesn't have time to study.", levelScore: 0, isCorrect: false },
          { id: "b", text: "They don't have time to study.", levelScore: 1, isCorrect: true },
          { id: "c", text: "They not have time to study.", levelScore: 0, isCorrect: false },
          { id: "d", text: "They aren't have time to study.", levelScore: 0, isCorrect: false },
        ],
        explanation: "Plural subject 'They' pairs with auxiliary 'do not' ('don't') in present simple negative.",
      },
      {
        id: "bm_a1_2",
        category: "vocabulary",
        targetLevel: "A1",
        difficultyLabel: "Time Prepositions",
        question: "Fill in the blank: 'Our weekly team standup meeting starts _______ 9:30 AM.'",
        options: [
          { id: "a", text: "in", levelScore: 0, isCorrect: false },
          { id: "b", text: "on", levelScore: 0, isCorrect: false },
          { id: "c", text: "at", levelScore: 1, isCorrect: true },
          { id: "d", text: "by the", levelScore: 0, isCorrect: false },
        ],
        explanation: "Use 'at' for precise clock times (at 9:30 AM, at noon).",
      },
      {
        id: "bm_a1_3",
        category: "practical",
        targetLevel: "A1",
        difficultyLabel: "Question Formation",
        question: "Which question is formed correctly in standard English?",
        options: [
          { id: "a", text: "Where does she lives?", levelScore: 0, isCorrect: false },
          { id: "b", text: "Where does she live?", levelScore: 1, isCorrect: true },
          { id: "c", text: "Where she lives?", levelScore: 0, isCorrect: false },
          { id: "d", text: "Where is she live?", levelScore: 0, isCorrect: false },
        ],
        explanation: "In questions with 'does', the main verb remains in the base infinitive form ('live').",
      },
      {
        id: "bm_a1_4",
        category: "practical",
        targetLevel: "A1",
        difficultyLabel: "Polite Request in Daily Routine",
        question: "In a cafe, what is the natural, polite way to order coffee?",
        options: [
          { id: "a", text: "Give me coffee now.", levelScore: 0, isCorrect: false },
          { id: "b", text: "I would like a cappuccino, please.", levelScore: 1, isCorrect: true },
          { id: "c", text: "I want cappuccino rapidly.", levelScore: 0, isCorrect: false },
          { id: "d", text: "You must bring coffee.", levelScore: 0, isCorrect: false },
        ],
        explanation: "'I would like..., please' is the universal polite standard formula for service requests.",
      },
      {
        id: "bm_a1_5",
        category: "vocabulary",
        targetLevel: "A1",
        difficultyLabel: "Basic Opposites & Adjectives",
        question: "Choose the correct antonym: 'The library is very quiet, but the train station is _______.'",
        options: [
          { id: "a", text: "noisy", levelScore: 1, isCorrect: true },
          { id: "b", text: "silent", levelScore: 0, isCorrect: false },
          { id: "c", text: "calm", levelScore: 0, isCorrect: false },
          { id: "d", text: "polite", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Noisy' is the direct opposite of 'quiet'.",
      },
    ],
  },
  A2: {
    level: "A2",
    nextLevel: "B1",
    title: "A2 to B1 Intermediate Gateway & Skill Advancement Assessment",
    passThresholdPercent: 75,
    xpReward: 200,
    questions: [
      {
        id: "bm_a2_1",
        category: "grammar",
        targetLevel: "A2",
        difficultyLabel: "Present Perfect vs Past Simple",
        question: "'I _______ to London three times, but I _______ there last summer.'",
        options: [
          { id: "a", text: "have been / didn't go", levelScore: 2, isCorrect: true },
          { id: "b", text: "was / haven't gone", levelScore: 0, isCorrect: false },
          { id: "c", text: "have gone / was not going", levelScore: 0, isCorrect: false },
          { id: "d", text: "am / didn't go", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Have been' expresses life experience (present perfect); 'didn't go' references a specific finished past time ('last summer').",
      },
      {
        id: "bm_a2_2",
        category: "grammar",
        targetLevel: "A2",
        difficultyLabel: "Modals of Obligation",
        question: "'You _______ wear a seatbelt while driving; it is strictly required by the law.'",
        options: [
          { id: "a", text: "might", levelScore: 0, isCorrect: false },
          { id: "b", text: "must", levelScore: 2, isCorrect: true },
          { id: "c", text: "could", levelScore: 0, isCorrect: false },
          { id: "d", text: "shall not", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Must' indicates strong legal obligation.",
      },
      {
        id: "bm_a2_3",
        category: "practical",
        targetLevel: "A2",
        difficultyLabel: "Future Intentions with Evidence",
        question: "'Look at those dark clouds! It _______ rain very soon.'",
        options: [
          { id: "a", text: "is going to", levelScore: 2, isCorrect: true },
          { id: "b", text: "will to", levelScore: 0, isCorrect: false },
          { id: "c", text: "shall", levelScore: 0, isCorrect: false },
          { id: "d", text: "is raining", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Be going to' is used for predictions based on clear present evidence (dark clouds).",
      },
      {
        id: "bm_a2_4",
        category: "vocabulary",
        targetLevel: "A2",
        difficultyLabel: "Everyday Phrasal Verbs",
        question: "'Can you please _______ your shoes before entering the clean carpet area?'",
        options: [
          { id: "a", text: "take off", levelScore: 2, isCorrect: true },
          { id: "b", text: "turn off", levelScore: 0, isCorrect: false },
          { id: "c", text: "put on", levelScore: 0, isCorrect: false },
          { id: "d", text: "give up", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Take off' means to remove clothing or footwear.",
      },
      {
        id: "bm_a2_5",
        category: "practical",
        targetLevel: "A2",
        difficultyLabel: "Comparative & Superlative Sentences",
        question: "'This laptop is _______ than my old one, but it is also much _______.'",
        options: [
          { id: "a", text: "faster / lighter", levelScore: 2, isCorrect: true },
          { id: "b", text: "more fast / more light", levelScore: 0, isCorrect: false },
          { id: "c", text: "fastest / lightest", levelScore: 0, isCorrect: false },
          { id: "d", text: "faster / more lighter", levelScore: 0, isCorrect: false },
        ],
        explanation: "Short one-syllable adjectives take '-er' for comparative forms: faster, lighter.",
      },
    ],
  },
  B1: {
    level: "B1",
    nextLevel: "B2",
    title: "B1 to B2 Upper-Intermediate Gateway & Skill Advancement Assessment",
    passThresholdPercent: 75,
    xpReward: 250,
    questions: [
      {
        id: "bm_b1_1",
        category: "grammar",
        targetLevel: "B1",
        difficultyLabel: "Relative Clauses",
        question: "Select the sentence with the correct defining relative pronoun:",
        options: [
          { id: "a", text: "The software engineer whose code fixed the bug received an award.", levelScore: 3, isCorrect: true },
          { id: "b", text: "The software engineer which code fixed the bug received an award.", levelScore: 0, isCorrect: false },
          { id: "c", text: "The software engineer whom code fixed the bug received an award.", levelScore: 0, isCorrect: false },
          { id: "d", text: "The software engineer who code fixed the bug received an award.", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Whose' is the possessive relative pronoun used for persons.",
      },
      {
        id: "bm_b1_2",
        category: "grammar",
        targetLevel: "B1",
        difficultyLabel: "Third Conditional",
        question: "'If we _______ the earlier train, we _______ on time for the presentation.'",
        options: [
          { id: "a", text: "had caught / would have arrived", levelScore: 3, isCorrect: true },
          { id: "b", text: "caught / would arrive", levelScore: 0, isCorrect: false },
          { id: "c", text: "would catch / had arrived", levelScore: 0, isCorrect: false },
          { id: "d", text: "had catch / would arrived", levelScore: 0, isCorrect: false },
        ],
        explanation: "Third conditional describes an unreal past event: If + had + V3, would have + V3.",
      },
      {
        id: "bm_b1_3",
        category: "vocabulary",
        targetLevel: "B1",
        difficultyLabel: "Business Phrasal Verbs",
        question: "'Our project manager asked us to _______ with a creative solution by tomorrow morning.'",
        options: [
          { id: "a", text: "come up", levelScore: 3, isCorrect: true },
          { id: "b", text: "look forward", levelScore: 0, isCorrect: false },
          { id: "c", text: "catch on", levelScore: 0, isCorrect: false },
          { id: "d", text: "run out", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Come up with' means to produce or suggest an idea/plan.",
      },
      {
        id: "bm_b1_4",
        category: "grammar",
        targetLevel: "B1",
        difficultyLabel: "Passive Voice in Reporting",
        question: "Transform to passive: 'The auditors are reviewing the financial statements.'",
        options: [
          { id: "a", text: "The financial statements are being reviewed by the auditors.", levelScore: 3, isCorrect: true },
          { id: "b", text: "The financial statements were reviewed by the auditors.", levelScore: 0, isCorrect: false },
          { id: "c", text: "The financial statements are reviewed by the auditors.", levelScore: 0, isCorrect: false },
          { id: "d", text: "The financial statements have been reviewing by the auditors.", levelScore: 0, isCorrect: false },
        ],
        explanation: "Present continuous passive formula: S + am/is/are + being + V3.",
      },
      {
        id: "bm_b1_5",
        category: "practical",
        targetLevel: "B1",
        difficultyLabel: "Diplomatic Disagreement",
        question: "Which response demonstrates professional, diplomatic disagreement?",
        options: [
          { id: "a", text: "You are totally wrong and this plan makes zero sense.", levelScore: 0, isCorrect: false },
          { id: "b", text: "I see your perspective, but we might want to consider the budget constraints.", levelScore: 3, isCorrect: true },
          { id: "c", text: "No way, I refuse to accept that conclusion.", levelScore: 0, isCorrect: false },
          { id: "d", text: "Whatever, do whatever you want.", levelScore: 0, isCorrect: false },
        ],
        explanation: "Diplomatic hedging ('I see your perspective, but we might want to...') maintains rapport while offering counter-proposals.",
      },
    ],
  },
  B2: {
    level: "B2",
    nextLevel: "C1",
    title: "B2 to C1 Advanced Fluency Gateway & Skill Advancement Assessment",
    passThresholdPercent: 80,
    xpReward: 350,
    questions: [
      {
        id: "bm_b2_1",
        category: "grammar",
        targetLevel: "B2",
        difficultyLabel: "Mixed Conditionals",
        question: "'If I had studied harder in college, I _______ a senior director today.'",
        options: [
          { id: "a", text: "would be", levelScore: 4, isCorrect: true },
          { id: "b", text: "would have been", levelScore: 0, isCorrect: false },
          { id: "c", text: "will be", levelScore: 0, isCorrect: false },
          { id: "d", text: "am being", levelScore: 0, isCorrect: false },
        ],
        explanation: "Mixed conditional (Past condition + Present result): 'had studied' (past) -> 'would be' (present state today).",
      },
      {
        id: "bm_b2_2",
        category: "grammar",
        targetLevel: "B2",
        difficultyLabel: "Inversion with 'Not only'",
        question: "'Not only _______ the quarterly sales targets, but they also expanded into three new markets.'",
        options: [
          { id: "a", text: "did they surpass", levelScore: 4, isCorrect: true },
          { id: "b", text: "they surpassed", levelScore: 0, isCorrect: false },
          { id: "c", text: "they did surpass", levelScore: 0, isCorrect: false },
          { id: "d", text: "surpassed they", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Not only' at sentence opening requires auxiliary inversion: 'did they surpass'.",
      },
      {
        id: "bm_b2_3",
        category: "vocabulary",
        targetLevel: "B2",
        difficultyLabel: "Nuanced Idioms",
        question: "'We need to take our competitor's bold claims with a grain of _______.'",
        options: [
          { id: "a", text: "salt", levelScore: 4, isCorrect: true },
          { id: "b", text: "sugar", levelScore: 0, isCorrect: false },
          { id: "c", text: "sand", levelScore: 0, isCorrect: false },
          { id: "d", text: "pepper", levelScore: 0, isCorrect: false },
        ],
        explanation: "The idiom 'take with a grain of salt' means to maintain skepticism.",
      },
      {
        id: "bm_b2_4",
        category: "grammar",
        targetLevel: "B2",
        difficultyLabel: "Participle Clauses",
        question: "Combine into a participle clause: 'Because she felt exhausted after the flight, she went straight to bed.'",
        options: [
          { id: "a", text: "Feeling exhausted after the flight, she went straight to bed.", levelScore: 4, isCorrect: true },
          { id: "b", text: "Felt exhausted after the flight, she went straight to bed.", levelScore: 0, isCorrect: false },
          { id: "c", text: "Having feeling exhausted, she went to bed.", levelScore: 0, isCorrect: false },
          { id: "d", text: "To feel exhausted, she went straight to bed.", levelScore: 0, isCorrect: false },
        ],
        explanation: "Present participle clauses ('Feeling exhausted...') concisely express reason or cause when both clauses share the same subject.",
      },
      {
        id: "bm_b2_5",
        category: "practical",
        targetLevel: "B2",
        difficultyLabel: "Executive Negotiation & Hedging",
        question: "Which statement exemplifies executive-level diplomatic hedging in a contract dispute?",
        options: [
          { id: "a", text: "It appears there may have been a minor discrepancy in the interpretation of Clause 4.", levelScore: 4, isCorrect: true },
          { id: "b", text: "You broke Clause 4 and we are going to sue immediately.", levelScore: 0, isCorrect: false },
          { id: "c", text: "Clause 4 is terrible and you made a huge mistake.", levelScore: 0, isCorrect: false },
          { id: "d", text: "We do not care about Clause 4 anymore.", levelScore: 0, isCorrect: false },
        ],
        explanation: "Epistemic modal hedging ('It appears there may have been...') de-escalates conflict while highlighting issues effectively.",
      },
    ],
  },
  C1: {
    level: "C1",
    nextLevel: "C2",
    title: "C1 Master Proficiency & Native-Equivalent Gateway Assessment",
    passThresholdPercent: 85,
    xpReward: 500,
    questions: [
      {
        id: "bm_c1_1",
        category: "grammar",
        targetLevel: "C1",
        difficultyLabel: "Subjunctive Mood",
        question: "'The executive board insisted that the lead architect _______ present at the global summit.'",
        options: [
          { id: "a", text: "be", levelScore: 5, isCorrect: true },
          { id: "b", text: "is", levelScore: 0, isCorrect: false },
          { id: "c", text: "was", levelScore: 0, isCorrect: false },
          { id: "d", text: "must be", levelScore: 0, isCorrect: false },
        ],
        explanation: "Mandative subjunctive uses base verb 'be' after verbs of demand/insistence.",
      },
      {
        id: "bm_c1_2",
        category: "vocabulary",
        targetLevel: "C1",
        difficultyLabel: "Rhetorical Devices & Register",
        question: "'The spokesperson's address was characterized by deliberate _______, leaving all parties wondering where he truly stood.'",
        options: [
          { id: "a", text: "obfuscation", levelScore: 5, isCorrect: true },
          { id: "b", text: "lucidity", levelScore: 0, isCorrect: false },
          { id: "c", text: "candor", levelScore: 0, isCorrect: false },
          { id: "d", text: "succinctness", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Obfuscation' means the act of making something obscure, unclear, or unintelligible.",
      },
      {
        id: "bm_c1_3",
        category: "grammar",
        targetLevel: "C1",
        difficultyLabel: "Inversion with Negative Adverbials",
        question: "'Rarely _______ such extraordinary consensus among international policy makers.'",
        options: [
          { id: "a", text: "has there been", levelScore: 5, isCorrect: true },
          { id: "b", text: "there has been", levelScore: 0, isCorrect: false },
          { id: "c", text: "was there", levelScore: 0, isCorrect: false },
          { id: "d", text: "there was", levelScore: 0, isCorrect: false },
        ],
        explanation: "Negative/limiting adverbials at sentence head ('Rarely') invert auxiliary and subject.",
      },
      {
        id: "bm_c1_4",
        category: "vocabulary",
        targetLevel: "C1",
        difficultyLabel: "Sophisticated Collocations",
        question: "'The startup's novel approach will likely _______ conventional thinking in enterprise software.'",
        options: [
          { id: "a", text: "upend", levelScore: 5, isCorrect: true },
          { id: "b", text: "overput", levelScore: 0, isCorrect: false },
          { id: "c", text: "backfall", levelScore: 0, isCorrect: false },
          { id: "d", text: "underdrop", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Upend' is a precise verb meaning to set or turn on its end, overturn, or disrupt completely.",
      },
      {
        id: "bm_c1_5",
        category: "practical",
        targetLevel: "C1",
        difficultyLabel: "Crisis Framing & Nuance",
        question: "Which formulation best conveys measured urgency without inciting panic during an earnings call?",
        options: [
          { id: "a", text: "While near-term headwinds persist, our disciplined cost structure positions us to weather volatility effectively.", levelScore: 5, isCorrect: true },
          { id: "b", text: "We are losing money and everyone should worry about our bankruptcy risk.", levelScore: 0, isCorrect: false },
          { id: "c", text: "Everything is 100% fine and there are zero problems whatsoever.", levelScore: 0, isCorrect: false },
          { id: "d", text: "Markets are falling apart so we cannot predict anything at all.", levelScore: 0, isCorrect: false },
        ],
        explanation: "Sophisticated corporate communications balance risk acknowledgment ('near-term headwinds') with strategic confidence.",
      },
    ],
  },
  C2: {
    level: "C2",
    nextLevel: "C2",
    title: "C2 Mastery & Native-Equivalent Oratorical Fluency Exam",
    passThresholdPercent: 90,
    xpReward: 1000,
    questions: [
      {
        id: "bm_c2_1",
        category: "grammar",
        targetLevel: "C2",
        difficultyLabel: "Inversion with Negative Adverbials",
        question: "'Seldom _______ such nuanced eloquence in an impromptu keynote debate.'",
        options: [
          { id: "a", text: "has one witnessed", levelScore: 6, isCorrect: true },
          { id: "b", text: "one has witnessed", levelScore: 0, isCorrect: false },
          { id: "c", text: "one witnessed", levelScore: 0, isCorrect: false },
          { id: "d", text: "did one witnessed", levelScore: 0, isCorrect: false },
        ],
        explanation: "Negative adverbials like 'seldom' at the head of a sentence trigger subject-auxiliary inversion.",
      },
      {
        id: "bm_c2_2",
        category: "vocabulary",
        targetLevel: "C2",
        difficultyLabel: "High-Register Lexicon",
        question: "'The treaty was rendered virtually _______ by subsequent unilateral military escalations.'",
        options: [
          { id: "a", text: "nugatory", levelScore: 6, isCorrect: true },
          { id: "b", text: "salubrious", levelScore: 0, isCorrect: false },
          { id: "c", text: "trenchant", levelScore: 0, isCorrect: false },
          { id: "d", text: "ebullient", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Nugatory' means of no value or importance, vain, or useless.",
      },
      {
        id: "bm_c2_3",
        category: "grammar",
        targetLevel: "C2",
        difficultyLabel: "Ellipsis & Syntactic Parallelism",
        question: "Select the sentence exhibiting flawless literary parallelism and ellipsis:",
        options: [
          { id: "a", text: "To err is human; to forgive, divine.", levelScore: 6, isCorrect: true },
          { id: "b", text: "To err is human; to forgiving is divine.", levelScore: 0, isCorrect: false },
          { id: "c", text: "To error is human; and forgiving divine.", levelScore: 0, isCorrect: false },
          { id: "d", text: "Erring is human; but to forgive divine.", levelScore: 0, isCorrect: false },
        ],
        explanation: "Alexander Pope's classic epigram omits the second 'is' through gapping/ellipsis while maintaining balanced antithesis.",
      },
      {
        id: "bm_c2_4",
        category: "vocabulary",
        targetLevel: "C2",
        difficultyLabel: "Literary Idioms & Epigrams",
        question: "'His rebuttal was razor-sharp and _______, dissecting each opposing argument with surgical accuracy.'",
        options: [
          { id: "a", text: "incisive", levelScore: 6, isCorrect: true },
          { id: "b", text: "insipid", levelScore: 0, isCorrect: false },
          { id: "c", text: "indolent", levelScore: 0, isCorrect: false },
          { id: "d", text: "invidious", levelScore: 0, isCorrect: false },
        ],
        explanation: "'Incisive' means intelligently analytical and clear-thinking; cutting directly to the core.",
      },
      {
        id: "bm_c2_5",
        category: "practical",
        targetLevel: "C2",
        difficultyLabel: "Supreme Rhetorical Mastery",
        question: "'He possessed that rare oratorical gift of stating profound truths with effortless _______.'",
        options: [
          { id: "a", text: "simplicity", levelScore: 6, isCorrect: true },
          { id: "b", text: "grandiosity", levelScore: 0, isCorrect: false },
          { id: "c", text: "bombast", levelScore: 0, isCorrect: false },
          { id: "d", text: "verbosity", levelScore: 0, isCorrect: false },
        ],
        explanation: "C2 rhetorical mastery emphasizes conveying profound complexity with unadorned, crystalline clarity.",
      },
    ],
  },
};
