import { GrammarLesson } from "../types";

export interface ClassicalModuleMeta {
  moduleNumber: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  description: string;
  classicalFocus: string;
  cefrSpan: string;
  icon: string;
  color: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

export const CLASSICAL_GRAMMAR_MODULES: ClassicalModuleMeta[] = [
  {
    moduleNumber: 1,
    title: "Module 1: Parts of Speech & Sentence Architecture",
    subtitle: "Book I: The Sentence, Nouns, Adjectives, Pronouns & Connectives",
    description:
      "Master the fundamental grammatical units that constitute English syntax. Deep-dive into subject-predicate division, case inflections, degrees of comparison, article mechanics, and relational prepositions.",
    classicalFocus: "Wren & Martin Book I: Chapters 1–17",
    cefrSpan: "A1 – B1",
    icon: "Layers",
    color: "from-blue-950 via-indigo-900 to-slate-900",
    borderColor: "border-blue-200",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
  },
  {
    moduleNumber: 2,
    title: "Module 2: The Verb System, Concord & Non-Finites",
    subtitle: "Book I: Verbs, Active/Passive Voice, Concord, Mood & Infinitives",
    description:
      "Understand transitivity, subject-verb concord, indicative and subjunctive moods, non-finite verbals (infinitives, participles, gerunds), and modal auxiliary mechanics.",
    classicalFocus: "Wren & Martin Book I: Chapters 18–34",
    cefrSpan: "A2 – B2",
    icon: "Cpu",
    color: "from-purple-950 via-indigo-900 to-slate-900",
    borderColor: "border-purple-200",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
  },
  {
    moduleNumber: 3,
    title: "Module 3: Sentence Analysis & Complex Clauses",
    subtitle: "Book II: Simple, Compound & Complex Sentences, Clauses Analysis",
    description:
      "Dissect sentence structures into principal and subordinate clauses. Master noun clauses, restrictive/non-restrictive adjective clauses, and all 9 classifications of adverbial clauses.",
    classicalFocus: "Wren & Martin Book II: Chapters 1–11",
    cefrSpan: "B1 – C1",
    icon: "Network",
    color: "from-teal-950 via-slate-900 to-slate-950",
    borderColor: "border-teal-200",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-700",
  },
  {
    moduleNumber: 4,
    title: "Module 4: Synthesis & Transformation of Sentences",
    subtitle: "Book II: Synthesis, Interchange of Degrees, Voice & Clause Forms",
    description:
      "Synthesize multiple simple sentences using participles, absolute phrases, and apposition. Transform sentences across affirmative/negative, interrogative, degrees of comparison, and simple/complex conversions without altering semantic meaning.",
    classicalFocus: "Wren & Martin Book II: Chapters 12–20",
    cefrSpan: "B2 – C1",
    icon: "GitFork",
    color: "from-amber-950 via-stone-900 to-slate-950",
    borderColor: "border-amber-200",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
  },
  {
    moduleNumber: 5,
    title: "Module 5: Direct/Indirect Narration & Rhetorical Precision",
    subtitle: "Book II: Reported Speech, Punctuation, Idioms & Error Prevention",
    description:
      "Master the classical sequence of tenses in reported speech across assertions, interrogations, and exclamations. Perfect classical punctuation rules and eliminate dangling modifiers, split infinitives, and faulty parallelism.",
    classicalFocus: "Wren & Martin Book II: Chapters 21–28 & Appendices",
    cefrSpan: "B2 – C1",
    icon: "Sparkles",
    color: "from-rose-950 via-slate-900 to-slate-950",
    borderColor: "border-rose-200",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
  },
];

export const CLASSICAL_GRAMMAR_LESSONS: GrammarLesson[] = [
  // ==========================================
  // MODULE 1: PARTS OF SPEECH & SENTENCE ARCHITECTURE
  // ==========================================
  {
    id: "wm_m1_sentence_structure",
    title: "The Sentence: Subject, Predicate & Sentence Classification",
    category: "Sentence Architecture",
    level: "A1",
    icon: "FileText",
    durationMins: 12,
    xpReward: 50,
    moduleNumber: 1,
    moduleTitle: "Module 1: Parts of Speech & Building Blocks",
    classicalChapterRef: "Wren & Martin: Chapters 1–3",
    summary:
      "Understand the primary constituent division of every English thought: the Subject and the Predicate, and differentiate between Assertive, Interrogative, Imperative, and Exclamatory sentences.",
    keyRule:
      "Every complete sentence must possess both a Subject (who or what the sentence is about) and a Predicate (what is said concerning that subject).",
    formula: "Sentence = Complete Subject [Noun / Pronoun + Modifiers] + Complete Predicate [Finite Verb + Complements / Objects]",
    sections: [
      {
        heading: "1. The Anatomy of Subject and Predicate",
        content:
          "When we form a complete sentence, we name some person or thing (Subject) and say something about that person or thing (Predicate). In standard declarative word order, the subject usually precedes the predicate, though in poetry or for emphatic inversion, it may follow it.",
        examples: [
          {
            sentence: "The courageous explorer carefully mapped the uncharted river.",
            highlight: "The courageous explorer (Subject) | carefully mapped the uncharted river (Predicate)",
            translationOrMeaning: "The subject denotes the agent; the predicate conveys the verbal action, manner, and target.",
          },
          {
            sentence: "Down into the deep ravine fell the heavy boulder.",
            highlight: "the heavy boulder (Subject inverted)",
            translationOrMeaning: "Inverted word order where the predicate phrase begins the sentence for dramatic emphasis.",
          },
        ],
        notes: [
          "In Imperative sentences ('Sit down.', 'Be quiet.'), the subject 'You' is grammatically understood and omitted.",
        ],
      },
      {
        heading: "2. The Four Classical Types of Sentences",
        content:
          "Sentences are classified according to their rhetorical purpose:\n" +
          "1. Declarative / Assertive: Makes a statement or assertion (e.g., 'The Earth revolves around the Sun.')\n" +
          "2. Interrogative: Inquires or asks a question (e.g., 'Have you reviewed the thesis?')\n" +
          "3. Imperative: Expresses a command, entreaty, request, or piece of advice (e.g., 'Please examine this clause.')\n" +
          "4. Exclamatory: Expresses strong emotional enthusiasm or shock (e.g., 'How splendid this architecture is!')",
        examples: [
          {
            sentence: "What a profound discovery the research team made!",
            highlight: "Exclamatory structure with 'What a'",
            translationOrMeaning: "Exclamatory sentence ending with an exclamation point.",
          },
          {
            sentence: "Verify the experimental calculations prior to publishing.",
            highlight: "Imperative (Subject 'You' omitted)",
            translationOrMeaning: "Command requiring standard base-form verb.",
          },
        ],
      },
      {
        heading: "3. Phrase vs. Clause: The Distinction",
        content:
          "A Phrase is a group of words that makes partial sense, but not complete sense, and contains NO finite verb (e.g., 'in the garden', 'at sunset'). A Clause is a group of words that forms part of a sentence and contains its own Subject and Predicate.",
        examples: [
          {
            sentence: "He arrived at the break of day (Phrase).",
            highlight: "at the break of day (Prepositional Phrase without verb)",
          },
          {
            sentence: "He arrived when the sun broke across the horizon (Clause).",
            highlight: "when the sun broke across the horizon (Subordinate Adverbial Clause with subject 'the sun' and verb 'broke')",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "Running down the crowded street.",
        correct: "The student was running down the crowded street.",
        explanation: "A participle phrase alone is a sentence fragment because it lacks a finite verb and a stated subject.",
      },
      {
        incorrect: "Where he went yesterday?",
        correct: "Where did he go yesterday?",
        explanation: "Standard English interrogatives require inversion or an auxiliary verb ('did') preceding the subject.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_1_1",
        type: "multiple-choice",
        question: "Identify the Complete Subject in: 'The ancient stone lighthouse on the rocky cliff warned sailors of danger.'",
        options: [
          "The ancient stone lighthouse on the rocky cliff",
          "The ancient stone lighthouse",
          "warned sailors of danger",
          "sailors of danger",
        ],
        correctAnswer: "The ancient stone lighthouse on the rocky cliff",
        explanation: "The complete subject includes the head noun ('lighthouse') plus all of its preceding and subsequent modifiers.",
      },
      {
        id: "qc_wm_1_2",
        type: "multiple-choice",
        question: "What type of sentence is: 'May good fortune accompany you on your journey!'",
        options: ["Optative / Exclamatory", "Assertive", "Interrogative", "Imperative"],
        correctAnswer: "Optative / Exclamatory",
        explanation: "In classical grammar, sentences expressing a solemn wish, blessing, or deep emotion are Optative/Exclamatory.",
      },
    ],
  },
  {
    id: "wm_m1_nouns_case",
    title: "Nouns: Taxonomy, Gender, Number & Case Inflections",
    category: "Parts of Speech",
    level: "A1",
    icon: "Layers",
    durationMins: 14,
    xpReward: 55,
    moduleNumber: 1,
    moduleTitle: "Module 1: Parts of Speech & Building Blocks",
    classicalChapterRef: "Wren & Martin: Chapters 4–8",
    summary:
      "Master the five classical classifications of nouns, pluralization anomalies, grammatical gender, and the syntactic roles of Nominative, Accusative (Objective), Dative, and Possessive (Genitive) cases.",
    keyRule:
      "A noun changes form or position depending on its syntactic case: Nominative (Subject), Objective/Accusative (Direct Object), Dative (Indirect Object), or Genitive/Possessive (Ownership).",
    formula: "Possessive Singular: Noun + 's | Plural ending in -s: Noun + ' | Irregular Plural: Plural Noun + 's (e.g., children's)",
    sections: [
      {
        heading: "1. The Five Classes of Nouns",
        content:
          "1. Proper Nouns: Names of specific persons, places, or institutions (capitalized).\n" +
          "2. Common Nouns: Names shared by all entities of a class (e.g., 'river', 'city').\n" +
          "3. Collective Nouns: Names designating a collection or group viewed as a single whole (e.g., 'jury', 'committee', 'fleet').\n" +
          "4. Material Nouns: Names of raw substances or matter (e.g., 'iron', 'copper', 'wheat').\n" +
          "5. Abstract Nouns: Names of qualities, states, or actions (e.g., 'integrity', 'valour', 'liberty', 'childhood').",
        examples: [
          {
            sentence: "The jury delivered its unanimous verdict with great solemnity.",
            highlight: "jury (Collective), verdict (Common), solemnity (Abstract)",
            translationOrMeaning: "Shows the coexistence of different noun classifications.",
          },
        ],
      },
      {
        heading: "2. The Four Grammatical Cases",
        content:
          "• Nominative Case: Noun functions as the Subject of a finite verb.\n" +
          "• Objective / Accusative Case: Noun functions as the Direct Object of a transitive verb or object of a preposition.\n" +
          "• Dative Case: Noun functions as the Indirect Object (the entity to/for whom the action is performed).\n" +
          "• Possessive / Genitive Case: Denotes origin, authorship, or ownership.",
        examples: [
          {
            sentence: "The teacher (Nominative) awarded the student (Dative) the gold medal (Accusative).",
            highlight: "teacher (Nom) -> student (Dat) -> medal (Acc)",
            translationOrMeaning: "Classic ditransitive sentence demonstrating three distinct cases.",
          },
          {
            sentence: "Keats's poetry exhibits sublime lyricism.",
            highlight: "Keats's (Genitive of authorship)",
            translationOrMeaning: "Classical genitive indicating authorial origin.",
          },
        ],
      },
      {
        heading: "3. Formation of the Possessive Case",
        content:
          "When a singular noun ends in an 's' or hissing sound, classical grammar allows either apostrophe-s or just an apostrophe if pronunciation becomes too harsh (e.g., 'for conscience' sake', 'Moses' laws'). With compound nouns or joint ownership, apply the apostrophe to the final element only.",
        examples: [
          {
            sentence: "William and Mary's reign transformed the British constitution.",
            highlight: "William and Mary's (Joint ownership/reign)",
          },
          {
            sentence: "William's and Mary's laptops were both stolen.",
            highlight: "William's and Mary's (Separate individual ownership)",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "The table's leg was broken.",
        correct: "The leg of the table was broken.",
        explanation: "In classical grammar, the possessive 's is strictly reserved for living entities, personified objects, or standard expressions of time/space ('a day's journey'). For inanimate objects, use the 'of' construction.",
      },
      {
        incorrect: "These furnitures are very elegant.",
        correct: "This furniture is very elegant.",
        explanation: "'Furniture', 'information', 'scenery', and 'advice' are uncountable abstract or aggregate nouns that never take plural -s.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_2_1",
        type: "multiple-choice",
        question: "Which of the following contains an Abstract Noun formed from an Adjective?",
        options: [
          "Bravery (from Brave)",
          "Growth (from Grow)",
          "Kinghood (from King)",
          "Robbery (from Rob)",
        ],
        correctAnswer: "Bravery (from Brave)",
        explanation: "'Brave' is an adjective that yields the abstract quality noun 'Bravery'. ('Growth' is from a verb; 'Kinghood' is from a noun).",
      },
      {
        id: "qc_wm_2_2",
        type: "fill-in-the-blank",
        question: "Complete with the correct possessive form: 'The ladies collected donations for the _______ (children) hospital.'",
        correctAnswer: "children's",
        explanation: "'Children' is an irregular plural that does not end in -s, so its possessive is formed by appending 's.",
      },
    ],
  },
  {
    id: "wm_m1_adjectives_comparison",
    title: "Adjectives: Classifications, Formation & Degrees of Comparison",
    category: "Parts of Speech",
    level: "A2",
    icon: "Sliders",
    durationMins: 14,
    xpReward: 60,
    moduleNumber: 1,
    moduleTitle: "Module 1: Parts of Speech & Building Blocks",
    classicalChapterRef: "Wren & Martin: Chapters 9–11",
    summary:
      "Explore the 8 classes of adjectives, attributive vs. predicative positioning, and master Positive, Comparative, and Superlative degrees including classical Latin comparatives.",
    keyRule:
      "When comparing two entities, use the Comparative degree with 'than'. When comparing three or more entities, use the Superlative degree preceded by the definite article 'the'.",
    formula: "Positive: as + Adj + as | Comparative: Adj-er / more + Adj + than | Superlative: the + Adj-est / most + Adj + of/in",
    sections: [
      {
        heading: "1. The Degrees of Comparison Hierarchy",
        content:
          "• Positive Degree: Denotes the simple existence of the quality without comparison (e.g., 'Lead is heavy.').\n" +
          "• Comparative Degree: Denotes a higher degree of the quality when two things or sets of things are compared (e.g., 'Lead is heavier than tin.').\n" +
          "• Superlative Degree: Denotes the highest degree of the quality when more than two things are compared (e.g., 'Lead is the heaviest of all common metals.').",
        examples: [
          {
            sentence: "No other dramatist in England is as celebrated as Shakespeare.",
            highlight: "as celebrated as (Positive Degree)",
          },
          {
            sentence: "Shakespeare is more celebrated than any other dramatist in England.",
            highlight: "more celebrated than any other (Comparative Degree)",
          },
          {
            sentence: "Shakespeare is the most celebrated dramatist in England.",
            highlight: "the most celebrated (Superlative Degree)",
          },
        ],
      },
      {
        heading: "2. Irregular and Latin Comparatives",
        content:
          "Certain adjectives borrowed directly from Latin have no positive or superlative forms and end in '-or'. In standard English, they are followed by 'to' instead of 'than':\n" +
          "• Senior to, Junior to, Superior to, Inferior to, Prior to, Anterior to, Posterior to.",
        examples: [
          {
            sentence: "His administrative knowledge is vastly superior to mine.",
            highlight: "superior to (NOT superior than)",
            translationOrMeaning: "Latin comparative requiring preposition 'to'.",
          },
          {
            sentence: "She was appointed prior to the formal board meeting.",
            highlight: "prior to",
            translationOrMeaning: "Temporal precedence requiring 'to'.",
          },
        ],
      },
      {
        heading: "3. 'Elder / Eldest' vs. 'Older / Oldest'",
        content:
          "• 'Elder' and 'Eldest' are confined strictly to persons (usually members of the same immediate family) and 'elder' is never followed by 'than'.\n" +
          "• 'Older' and 'Oldest' apply to both persons and inanimate objects, and 'older' takes 'than'.",
        examples: [
          {
            sentence: "My elder brother is an architect in Manchester.",
            highlight: "elder brother (family member, attributive only)",
          },
          {
            sentence: "He is older than his cousin by three years.",
            highlight: "older than (requires 'older' because 'than' follows)",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "He is more superior than all of his peers.",
        correct: "He is superior to all of his peers.",
        explanation: "'Superior' already embodies a comparative sense (no 'more') and requires the preposition 'to', never 'than'.",
      },
      {
        incorrect: "Iron is more useful than any metal.",
        correct: "Iron is more useful than any other metal.",
        explanation: "When comparing an entity with its own class, 'other' must be inserted so iron is not compared with itself.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_3_1",
        type: "multiple-choice",
        question: "Select the grammatically correct classical comparative sentence:",
        options: [
          "This proposal is preferable than that one.",
          "This proposal is more preferable than that one.",
          "This proposal is preferable to that one.",
          "This proposal is most preferable to that one.",
        ],
        correctAnswer: "This proposal is preferable to that one.",
        explanation: "'Preferable' has a comparative force and takes 'to', never 'than' or 'more'.",
      },
    ],
  },
  {
    id: "wm_m1_pronouns_syntax",
    title: "Pronouns: Personal, Relative, Demonstrative & Distributive",
    category: "Parts of Speech",
    level: "B1",
    icon: "UserCheck",
    durationMins: 15,
    xpReward: 65,
    moduleNumber: 1,
    moduleTitle: "Module 1: Parts of Speech & Building Blocks",
    classicalChapterRef: "Wren & Martin: Chapters 14–17",
    summary:
      "Deep-dive into the syntactic rules of Relative Pronouns (who, whom, whose, which, that), the order of personal pronouns (231 rule), and distributive concord (each, neither, either).",
    keyRule:
      "A Relative Pronoun must agree with its Antecedent in number, gender, and person, but its case is determined solely by its grammatical role within its own subordinate clause.",
    formula: "Order of Persons (Polite): 2nd Person (You) -> 3rd Person (He/She/They) -> 1st Person (I)",
    sections: [
      {
        heading: "1. The Protocol for Personal Pronouns: The '231' Rule",
        content:
          "Good manners in classical English require that when speaking of pleasant or neutral matters involving multiple persons, the second person ('you') comes first, the third person ('he/she') second, and the first person ('I') last.\n" +
          "However, when confessing a fault, error, or crime, the order is reversed: 1st person ('I'), 2nd person ('you'), and 3rd person ('he').",
        examples: [
          {
            sentence: "You, he, and I shall share the scholarship award equally.",
            highlight: "You (2nd), he (3rd), and I (1st)",
            translationOrMeaning: "Standard polite formula 2-3-1.",
          },
          {
            sentence: "I, you, and he are to blame for this administrative oversight.",
            highlight: "I (1st), you (2nd), and he (3rd)",
            translationOrMeaning: "Confession of error follows 1-2-3.",
          },
        ],
      },
      {
        heading: "2. The Relative Pronoun: 'Who' vs. 'Whom' vs. 'That'",
        content:
          "• 'Who' is used in the Nominative Case (as subject of the relative clause verb).\n" +
          "• 'Whom' is used in the Objective Case (as object of the verb or preposition).\n" +
          "• 'That' is preferred over 'who' or 'which' after superlative adjectives, after words like 'all', 'any', 'none', 'nothing', 'the only', and after two antecedents (one person and one animal/thing).",
        examples: [
          {
            sentence: "The scholar whom the university honoured gave a magnificent address.",
            highlight: "whom (Object of 'honoured')",
          },
          {
            sentence: "Man is the only animal that can speak articulate language.",
            highlight: "that (follows 'the only')",
          },
        ],
      },
      {
        heading: "3. Distributive Pronouns and Singular Concord",
        content:
          "'Each', 'either', and 'neither' refer to individuals taken one by one. Consequently, they always take a singular verb and singular personal pronouns.",
        examples: [
          {
            sentence: "Each of the participants must submit his or her research portfolio.",
            highlight: "Each ... must submit his or her (Singular antecedent)",
          },
          {
            sentence: "Neither of the two candidates was qualified for the position.",
            highlight: "Neither ... was (Singular verb)",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "Between you and I, the decision is final.",
        correct: "Between you and me, the decision is final.",
        explanation: "'Between' is a preposition requiring the objective case pronoun ('me', not the subjective 'I').",
      },
      {
        incorrect: "The man who I saw yesterday was a diplomat.",
        correct: "The man whom I saw yesterday was a diplomat.",
        explanation: "The relative pronoun is the direct object of the transitive verb 'saw' ('I saw him'), so 'whom' is required.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_4_1",
        type: "fill-in-the-blank",
        question: "Fill in the blank with 'who' or 'whom': 'He is a diplomat _______ everyone believes will be the next ambassador.'",
        correctAnswer: "who",
        explanation: "'Who' is the subject of the clause verb 'will be' (the clause 'everyone believes' is a parenthetical insertion).",
      },
    ],
  },

  // ==========================================
  // MODULE 2: THE VERB SYSTEM, CONCORD & NON-FINITES
  // ==========================================
  {
    id: "wm_m2_verb_transitivity_concord",
    title: "Verb Transitivity, Incomplete Predication & Subject-Verb Concord",
    category: "Verbs & Concord",
    level: "A2",
    icon: "CheckCircle",
    durationMins: 16,
    xpReward: 65,
    moduleNumber: 2,
    moduleTitle: "Module 2: The Verb System, Concord & Non-Finites",
    classicalChapterRef: "Wren & Martin: Chapters 18–21",
    summary:
      "Master transitive and intransitive verbs, verbs of incomplete predication (linking verbs requiring subjective/objective complements), and the definitive rules of subject-verb agreement.",
    keyRule:
      "A verb agrees with its grammatical Subject in number and person. Two or more singular subjects connected by 'and' require a plural verb, unless they represent a single collective idea.",
    formula: "Two singular subjects expressing one idea = Singular Verb (e.g., 'Bread and butter is his staple food.')",
    sections: [
      {
        heading: "1. Transitive vs. Intransitive Verbs",
        content:
          "A Transitive verb denotes an action that passes over from the doer (Subject) to an object. An Intransitive verb denotes an action which does not pass over to an object, or denotes a state of being.\n" +
          "Some intransitive verbs can become transitive when used in a causative sense ('The boy flies a kite') or when followed by a cognate object ('He lived a noble life').",
        examples: [
          {
            sentence: "The clock stopped (Intransitive).",
            highlight: "stopped (action does not pass to an object)",
          },
          {
            sentence: "The driver stopped the vehicle (Transitive).",
            highlight: "stopped the vehicle (transitive action targeting 'vehicle')",
          },
        ],
      },
      {
        heading: "2. Verbs of Incomplete Predication & Complements",
        content:
          "Verbs such as 'be', 'seem', 'appear', 'become' require a word or phrase to make a complete sense. This word is called the Complement of the verb. If the complement describes the subject, it is a Subjective Complement; if it describes the object, it is an Objective Complement.",
        examples: [
          {
            sentence: "The magistrate appeared lenient.",
            highlight: "lenient (Subjective Complement describing 'magistrate')",
          },
          {
            sentence: "The committee appointed him chairman.",
            highlight: "chairman (Objective Complement describing 'him')",
          },
        ],
      },
      {
        heading: "3. Classical Rules of Concord (Agreement)",
        content:
          "1. As well as / In addition to: When a subject is joined to another noun by 'with', 'together with', 'as well as', the verb agrees strictly with the FIRST subject.\n" +
          "2. Either...or / Neither...nor: When subjects connected by 'or'/'nor' differ in number or person, the verb agrees with the NEARER subject.\n" +
          "3. Plural in form, singular in meaning: 'Mathematics', 'physics', 'politics', 'measles' take singular verbs.",
        examples: [
          {
            sentence: "The captain, as well as his crewmen, was honoured at court.",
            highlight: "captain (singular) -> was honoured",
          },
          {
            sentence: "Either the director or the actors are responsible for the delay.",
            highlight: "actors (nearer subject is plural) -> are",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "Politics are a difficult subject for novice students.",
        correct: "Politics is a difficult subject for novice students.",
        explanation: "'Politics' names a singular academic branch of knowledge and takes a singular verb.",
      },
      {
        incorrect: "Neither of the statements are accurate.",
        correct: "Neither of the statements is accurate.",
        explanation: "'Neither' is distributive and singular, commanding the singular verb 'is'.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_5_1",
        type: "multiple-choice",
        question: "Choose the correct verb: 'Ten thousand dollars _______ a handsome donation to the hospital.'",
        options: ["is", "are", "were", "have been"],
        correctAnswer: "is",
        explanation: "When a plural noun represents a specific collective sum, quantity, or distance considered as a single unit, the verb is singular.",
      },
    ],
  },
  {
    id: "wm_m2_non_finites",
    title: "Non-Finite Verbs: The Infinitive, Participle & Gerund",
    category: "Advanced Verbs",
    level: "B2",
    icon: "Cpu",
    durationMins: 18,
    xpReward: 75,
    moduleNumber: 2,
    moduleTitle: "Module 2: The Verb System, Concord & Non-Finites",
    classicalChapterRef: "Wren & Martin: Chapters 25–28",
    summary:
      "Distinguish between finite verbs and the three great non-finites: Infinitives (Simple and Gerundial), Participles (Present, Past, Perfect), and Gerunds (Verbal Nouns). Eliminate the dreaded dangling participle.",
    keyRule:
      "A participle is a verbal adjective: it partakes of both the nature of a verb and an adjective. It must always have a logical subject of reference to avoid becoming a 'dangling participle'.",
    formula: "Gerund = Verb-ing behaving as a Noun | Participle = Verb-ing / V3 behaving as an Adjective",
    sections: [
      {
        heading: "1. The Infinitive: Bare vs. 'To' Infinitive",
        content:
          "The Infinitive is the base form of the verb. It can be used with 'to' (e.g., 'To err is human') or without 'to' (the Bare Infinitive).\n" +
          "The bare infinitive is used after modals ('can', 'must'), after verbs of perception ('see', 'hear', 'feel'), and after 'make', 'let', 'bid', 'help', and phrases like 'had better', 'would rather'.",
        examples: [
          {
            sentence: "I saw him cross the boulevard.",
            highlight: "cross (bare infinitive after perception verb 'saw')",
          },
          {
            sentence: "You had better leave before the storm begins.",
            highlight: "leave (bare infinitive after 'had better')",
          },
        ],
      },
      {
        heading: "2. The Gerund vs. The Present Participle",
        content:
          "Both end in '-ing', but their syntactic function differs fundamentally:\n" +
          "• Gerund: Has the force of a Noun and a Verb (e.g., 'Reading expands the intellect.'). Because it is a noun, a noun or pronoun preceding a gerund should be in the Possessive Case!\n" +
          "• Participle: Has the force of an Adjective and a Verb (e.g., 'He saw a child playing in the garden.').",
        examples: [
          {
            sentence: "I insisted on his accompanying me to the consulate.",
            highlight: "his accompanying (Possessive 'his' preceding Gerund 'accompanying')",
            translationOrMeaning: "Classical rule: possessive case before gerund.",
          },
          {
            sentence: "Hearing a sudden clamour, the watchman unlocked the gates.",
            highlight: "Hearing (Present Participle modifying 'the watchman')",
          },
        ],
      },
      {
        heading: "3. The Dangling (Misrelated) Participle Error",
        content:
          "A participle must have a clear noun or pronoun in the sentence to modify. If it does not, it is called an 'unattached' or 'dangling' participle, which produces nonsensical syntax.",
        examples: [
          {
            sentence: "Incorrect: Walking across the lawn, a snake bit him. (Implies the snake was walking across the lawn!)",
            highlight: "Walking across the lawn (dangling)",
          },
          {
            sentence: "Correct: While he was walking across the lawn, a snake bit him.",
            highlight: "While he was walking (proper clause)",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "I don't mind him coming to the conference.",
        correct: "I don't mind his coming to the conference.",
        explanation: "In classical grammar, the noun or pronoun modifying a gerund must be in the possessive case ('his coming').",
      },
      {
        incorrect: "Being a rainy day, I decided to stay indoors.",
        correct: "It being a rainy day, I decided to stay indoors.",
        explanation: "'Being a rainy day' has no subject; without 'It', the participle 'being' grammatically attaches to 'I', saying 'I was a rainy day'.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_6_1",
        type: "multiple-choice",
        question: "In the sentence: 'Swimming in the mountain stream is refreshing', what is the grammatical role of 'Swimming'?",
        options: [
          "Gerund acting as Subject of the sentence",
          "Present Participle modifying 'stream'",
          "Infinitive without 'to'",
          "Finite verb of the predicate",
        ],
        correctAnswer: "Gerund acting as Subject of the sentence",
        explanation: "'Swimming' functions as a verbal noun and the subject of the sentence, making it a Gerund.",
      },
    ],
  },
  {
    id: "wm_m2_passive_voice_classical",
    title: "Active & Passive Voice: Classical Mechanics & Imperative Passives",
    category: "Style & Professional English",
    level: "B2",
    icon: "RefreshCw",
    durationMins: 16,
    xpReward: 70,
    moduleNumber: 2,
    moduleTitle: "Module 2: The Verb System, Concord & Non-Finites",
    classicalChapterRef: "Wren & Martin: Chapters 22–24",
    summary:
      "Master the conversion of active voice into passive voice across all tenses, including sentences with two objects, prepositional verbs, and imperative commands using 'Let + Object + be + V3'.",
    keyRule:
      "Only Transitive Verbs can be used in the Passive Voice. When an active verb takes two objects, either the indirect or direct object can become the passive subject.",
    formula: "Imperative Active: Do this! ===> Imperative Passive: Let this be done!",
    sections: [
      {
        heading: "1. Ditransitive Verbs (Two Objects)",
        content:
          "When a verb takes both an Indirect Object (person) and a Direct Object (thing), either may become the subject of the passive construction. In classical English, making the person the subject is usually preferred.",
        examples: [
          {
            sentence: "Active: The academy awarded him the medal.",
            highlight: "him (Indirect Object), the medal (Direct Object)",
          },
          {
            sentence: "Passive 1: He was awarded the medal by the academy (Preferred).",
            highlight: "He was awarded (Person made subject)",
          },
          {
            sentence: "Passive 2: The medal was awarded to him by the academy.",
            highlight: "The medal was awarded to him",
          },
        ],
      },
      {
        heading: "2. Imperative Sentence Passives",
        content:
          "Commands and requests in the active voice are transformed into the passive using 'Let + Object + be + Past Participle'. If an advice is conveyed, use 'should be + V3'.",
        examples: [
          {
            sentence: "Active: Close the heavy oak door immediately.",
            highlight: "Close (imperative verb)",
          },
          {
            sentence: "Passive: Let the heavy oak door be closed immediately.",
            highlight: "Let ... be closed",
          },
          {
            sentence: "Active: Obey your parents.",
            highlight: "Passive: Your parents should be obeyed.",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "Active: He laughed at the beggar. -> Passive: The beggar was laughed by him.",
        correct: "The beggar was laughed at by him.",
        explanation: "Prepositional verbs ('laughed at', 'looked after') must retain their preposition in the passive.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_7_1",
        type: "multiple-choice",
        question: "Transform into Passive: 'Post this letter without delay.'",
        options: [
          "Let this letter be posted without delay.",
          "This letter was posted without delay.",
          "You must have posted this letter without delay.",
          "Let this letter post without delay.",
        ],
        correctAnswer: "Let this letter be posted without delay.",
        explanation: "Imperative commands convert to: 'Let + Object + be + V3'.",
      },
    ],
  },

  // ==========================================
  // MODULE 3: SENTENCE ANALYSIS & CLAUSES
  // ==========================================
  {
    id: "wm_m3_analysis_simple_sentences",
    title: "Analysis of Simple Sentences: Subject Enlargement & Predicate Extension",
    category: "Sentence Analysis",
    level: "B1",
    icon: "Network",
    durationMins: 14,
    xpReward: 65,
    moduleNumber: 3,
    moduleTitle: "Module 3: Sentence Analysis & Complex Clauses",
    classicalChapterRef: "Wren & Martin Book II: Chapters 1–4",
    summary:
      "Dissect simple sentences into grammatical constituents: the Subject-Word, its Attributes/Enlargements, the Verb, the Object, its Attributes, and Adverbial Extensions of the Predicate.",
    keyRule:
      "A Simple Sentence has only one independent Subject and one Finite Verb, no matter how extensively its constituents are enlarged with phrases.",
    formula: "Simple Sentence = Subject [Subject-Word + Attributes] + Predicate [Finite Verb + Object(s) + Adverbial Extension]",
    sections: [
      {
        heading: "1. Enlargement of the Subject (Attribute)",
        content:
          "The Subject-Word may be enlarged by:\n" +
          "1. An Adjective (e.g., 'Brave soldiers fell.')\n" +
          "2. A Participle or Participial Phrase (e.g., 'Barking dogs seldom bite.')\n" +
          "3. A Noun in Apposition (e.g., 'Milton, the poet, was blind.')\n" +
          "4. A Prepositional Phrase (e.g., 'A bird in the hand is worth two in the bush.')\n" +
          "5. An Infinitive (e.g., 'A desire to succeed spurred him on.')",
        examples: [
          {
            sentence: "Alexander, the king of Macedon, invaded Persia.",
            highlight: "Alexander (Subject-Word) | the king of Macedon (Noun phrase in apposition enlarging Subject)",
          },
        ],
      },
      {
        heading: "2. Extension of the Predicate (Adverbial Qualification)",
        content:
          "Any word or phrase that qualifies the verb in the predicate is called an Extension of the Predicate. It conveys Time, Place, Manner, Cause, or Degree.",
        examples: [
          {
            sentence: "The train arrived at the station precisely on schedule.",
            highlight: "at the station (Extension of Place) | precisely on schedule (Extension of Time)",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "Confusing a long phrase with a subordinate clause.",
        correct: "A phrase contains no finite verb, whereas a clause always has its own subject and finite verb.",
        explanation: "Simple sentences can be quite long if they contain multiple prepositional or participial phrases.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_8_1",
        type: "multiple-choice",
        question: "In: 'The tired travellers, having lost their way, rested beneath the oak tree', what is 'having lost their way'?",
        options: [
          "Participial phrase enlarging the Subject",
          "Subordinate noun clause",
          "Adverbial extension of place",
          "Compound predicate",
        ],
        correctAnswer: "Participial phrase enlarging the Subject",
        explanation: "'Having lost their way' is a participial phrase modifying the subject-word 'travellers'.",
      },
    ],
  },
  {
    id: "wm_m3_compound_complex_clauses",
    title: "Analysis of Compound & Complex Sentences: The 3 Subordinate Clauses",
    category: "Complex Syntax",
    level: "C1",
    icon: "GitBranch",
    durationMins: 18,
    xpReward: 80,
    moduleNumber: 3,
    moduleTitle: "Module 3: Sentence Analysis & Complex Clauses",
    classicalChapterRef: "Wren & Martin Book II: Chapters 5–11",
    summary:
      "Master the distinction between Coordinate Clauses in Compound Sentences and Principal vs. Subordinate Clauses in Complex Sentences. Deep-dive into Noun, Adjective, and Adverbial Clauses.",
    keyRule:
      "A Subordinate Clause cannot stand alone; it performs the work of a single part of speech (Noun, Adjective, or Adverb) within the larger Complex Sentence.",
    formula: "Complex = Principal Clause + Subordinate Clause (Noun, Adjective, or Adverbial)",
    sections: [
      {
        heading: "1. Noun Clauses",
        content:
          "A Noun Clause is a subordinate clause that does the work of a noun. It can be:\n" +
          "• Subject of a verb (e.g., 'That he is honest is well known.')\n" +
          "• Object of a transitive verb (e.g., 'I know that he will succeed.')\n" +
          "• Object of a preposition (e.g., 'Pay careful attention to what I say.')\n" +
          "• In apposition to a noun (e.g., 'The rumour that the castle fell was false.')\n" +
          "• Complement of a verb of incomplete predication (e.g., 'My fear was that we might lose.')",
        examples: [
          {
            sentence: "What you have accomplished will inspire generations.",
            highlight: "What you have accomplished (Noun clause functioning as Subject)",
          },
        ],
      },
      {
        heading: "2. Adjective Clauses",
        content:
          "An Adjective Clause qualifies a noun or pronoun in the principal clause, introduced by relative pronouns ('who', 'which', 'that') or relative adverbs ('where', 'when', 'why').",
        examples: [
          {
            sentence: "The house where the poet lived is preserved as a museum.",
            highlight: "where the poet lived (Adjective clause qualifying 'house')",
          },
        ],
      },
      {
        heading: "3. The 9 Classes of Adverbial Clauses",
        content:
          "Adverbial clauses modify a verb, adjective, or adverb in the principal clause, classified by relationship:\n" +
          "1. Time (when, while, before, since)\n" +
          "2. Place (where, wherever)\n" +
          "3. Cause or Reason (because, as, since)\n" +
          "4. Purpose (so that, in order that, lest)\n" +
          "5. Result / Consequence (so...that)\n" +
          "6. Condition (if, unless, whether)\n" +
          "7. Concession (though, although, even if)\n" +
          "8. Comparison / Degree (as...as, than)\n" +
          "9. Manner (as, as if)",
        examples: [
          {
            sentence: "Walk quietly lest you should disturb the sleeping infant.",
            highlight: "lest you should disturb... (Adverbial clause of Purpose)",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "Study hard lest you will fail the examination.",
        correct: "Study hard lest you should fail the examination.",
        explanation: "Classical rule: 'lest' is always followed by 'should' (or the subjunctive base verb), never 'will' or 'may'.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_9_1",
        type: "multiple-choice",
        question: "Identify the clause type of 'that you have deceived me' in: 'My belief that you have deceived me is unshakable.'",
        options: [
          "Noun clause in apposition to 'belief'",
          "Adjective clause qualifying 'belief'",
          "Adverbial clause of reason",
          "Coordinate principal clause",
        ],
        correctAnswer: "Noun clause in apposition to 'belief'",
        explanation: "The clause defines the content of the abstract noun 'belief' without using a relative pronoun, making it a Noun Clause in apposition.",
      },
    ],
  },

  // ==========================================
  // MODULE 4: SYNTHESIS & TRANSFORMATION
  // ==========================================
  {
    id: "wm_m4_transformation_sentences",
    title: "Transformation of Sentences: Degrees of Comparison, Affirmative/Negative & Forms",
    category: "Rhetorical Syntax",
    level: "B2",
    icon: "Sliders",
    durationMins: 16,
    xpReward: 75,
    moduleNumber: 4,
    moduleTitle: "Module 4: Synthesis & Transformation of Sentences",
    classicalChapterRef: "Wren & Martin Book II: Chapters 12–16",
    summary:
      "Transform the structural form of sentences without altering their underlying semantic meaning. Master conversions across Affirmative/Negative, Interrogative/Assertive, Exclamatory/Assertive, and Degrees of Comparison.",
    keyRule:
      "Transformation is the art of varying the grammatical form of a sentence without changing its sense, providing rhetorical versatility and literary elegance.",
    formula: "Positive: No other X is as...as Y ===> Comparative: Y is more...than any other X ===> Superlative: Y is the most...",
    sections: [
      {
        heading: "1. Interchange of the Degrees of Comparison",
        content:
          "Transforming degrees allows one to alter emphasis without losing propositional truth:\n" +
          "• Superlative: 'London is the largest city in the United Kingdom.'\n" +
          "• Comparative: 'London is larger than any other city in the United Kingdom.'\n" +
          "• Positive: 'No other city in the United Kingdom is as large as London.'",
        examples: [
          {
            sentence: "Very few conquerors were as ruthless as Genghis Khan (Positive).",
            highlight: "as ruthless as",
          },
          {
            sentence: "Genghis Khan was more ruthless than most other conquerors (Comparative).",
            highlight: "more ruthless than most other",
          },
          {
            sentence: "Genghis Khan was one of the most ruthless conquerors (Superlative).",
            highlight: "one of the most ruthless",
          },
        ],
      },
      {
        heading: "2. Removing 'Too...to' into 'So...that...cannot'",
        content:
          "A classic transformation removes the adverb 'too' followed by an infinitive, converting a simple sentence into a complex sentence containing an adverb clause of consequence.",
        examples: [
          {
            sentence: "Simple: The news is too good to be true.",
            highlight: "too good to be true",
          },
          {
            sentence: "Complex: The news is so good that it cannot be true.",
            highlight: "so good that it cannot be true",
          },
        ],
      },
      {
        heading: "3. Interchange of Affirmative and Negative",
        content:
          "An affirmative can be converted into a negative by employing antonyms with a negative particle, or by using 'not fail to' or double negatives.",
        examples: [
          {
            sentence: "Affirmative: I shall always remember your kindness.",
            highlight: "always remember",
          },
          {
            sentence: "Negative: I shall never forget your kindness.",
            highlight: "never forget",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "Transforming 'Who can touch pitch and not be defiled?' to 'Anyone can touch pitch and be defiled.'",
        correct: "'No one can touch pitch and not be defiled.'",
        explanation: "A rhetorical question expecting a negative answer must be converted into a strong negative assertion.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_10_1",
        type: "multiple-choice",
        question: "Convert to an Assertive sentence: 'What though the field be lost?'",
        options: [
          "It matters little though the field be lost.",
          "The field must never be lost.",
          "Is the field truly lost?",
          "We have definitely lost the field.",
        ],
        correctAnswer: "It matters little though the field be lost.",
        explanation: "In classical rhetoric, 'What though...' asserts that the circumstance matters very little.",
      },
    ],
  },
  {
    id: "wm_m4_synthesis_sentences",
    title: "Synthesis of Sentences: Compounding, Complexing & Participle Fusion",
    category: "Advanced Composition",
    level: "C1",
    icon: "GitMerge",
    durationMins: 18,
    xpReward: 85,
    moduleNumber: 4,
    moduleTitle: "Module 4: Synthesis & Transformation of Sentences",
    classicalChapterRef: "Wren & Martin Book II: Chapters 17–20",
    summary:
      "Synthesis is the opposite of analysis: the art of combining several simple sentences into one elegant Simple, Compound, or Complex sentence using participles, absolute phrases, apposition, and connectives.",
    keyRule:
      "To combine multiple simple sentences into ONE simple sentence, you must retain only ONE finite verb, converting all other predicates into participles, infinitives, or prepositional phrases.",
    formula: "Sentence A + Sentence B + Sentence C ===> Single Unified Sentence with One Finite Verb",
    sections: [
      {
        heading: "1. Combining into a Simple Sentence using a Participle",
        content:
          "When the same subject performs two sequential actions, the earlier action can be transformed into a present or perfect participle.",
        examples: [
          {
            sentence: "Separate: He drew his sword. He rushed upon the enemy.",
            highlight: "Two simple sentences",
          },
          {
            sentence: "Synthesized: Drawing his sword, he rushed upon the enemy.",
            highlight: "Drawing his sword (Participle reducing first verb)",
          },
          {
            sentence: "Synthesized (Perfect): Having drawn his sword, he rushed upon the enemy.",
            highlight: "Having drawn (Emphasizes completion before rushing)",
          },
        ],
      },
      {
        heading: "2. Synthesis using the Nominative Absolute Phrase",
        content:
          "A Nominative Absolute consists of a noun or pronoun followed by a participle, independent of the main predicate, used when the two sentences have DIFFERENT subjects.",
        examples: [
          {
            sentence: "Separate: The weather was stormy. The fleet remained in the harbour.",
            highlight: "Different subjects: 'weather' and 'fleet'",
          },
          {
            sentence: "Synthesized: The weather being stormy, the fleet remained in the harbour.",
            highlight: "The weather being stormy (Nominative Absolute)",
          },
        ],
      },
      {
        heading: "3. Synthesis using Nouns in Apposition or Infinitives",
        content:
          "Significant biographical or descriptive facts can be placed in apposition, or purpose can be expressed with an infinitive.",
        examples: [
          {
            sentence: "Separate: Alexander was a Greek monarch. He conquered Persia. Persia was a vast empire.",
            highlight: "Three fragmented sentences",
          },
          {
            sentence: "Synthesized: Alexander, a Greek monarch, conquered Persia, a vast empire.",
            highlight: "Appositives replace two finite verbs, creating an elegant simple sentence",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "Combining into a simple sentence while leaving two finite verbs connected with 'and'.",
        correct: "That creates a Compound sentence, not a Simple sentence.",
        explanation: "A simple sentence must strictly possess exactly one finite verb.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_11_1",
        type: "multiple-choice",
        question: "Combine into a single Simple sentence: 'He had failed in his first attempt. He resolved to try again.'",
        options: [
          "Having failed in his first attempt, he resolved to try again.",
          "He had failed in his first attempt and he resolved to try again.",
          "Although he had failed in his first attempt, he resolved to try again.",
          "He had failed in his first attempt; therefore, he resolved to try again.",
        ],
        correctAnswer: "Having failed in his first attempt, he resolved to try again.",
        explanation: "The perfect participle 'Having failed' reduces the first finite verb, leaving only 'resolved' as the single finite verb.",
      },
    ],
  },

  // ==========================================
  // MODULE 5: DIRECT/INDIRECT SPEECH & RHETORICAL PRECISION
  // ==========================================
  {
    id: "wm_m5_direct_indirect_speech",
    title: "Direct & Indirect Speech: The Sequence of Tenses & Narration Rules",
    category: "Reported Speech",
    level: "B2",
    icon: "MessageSquare",
    durationMins: 18,
    xpReward: 80,
    moduleNumber: 5,
    moduleTitle: "Module 5: Direct/Indirect Narration & Rhetorical Precision",
    classicalChapterRef: "Wren & Martin Book II: Chapters 21–23",
    summary:
      "Master the conversion of Direct Speech to Indirect Narration across statements, questions, commands, and exclamations. Master the classical Sequence of Tenses and adverbial shifts.",
    keyRule:
      "When the reporting verb is in the Past Tense, all present tenses of the direct speech must be backshifted to the corresponding past tenses, unless expressing a universal scientific truth.",
    formula: "Direct: Said, 'I am busy today.' ===> Indirect: Said that he was busy that day.",
    sections: [
      {
        heading: "1. The Tense Backshift Rules",
        content:
          "When the reporting verb is in the Past Tense:\n" +
          "• Simple Present -> Simple Past ('writes' -> 'wrote')\n" +
          "• Present Continuous -> Past Continuous ('is writing' -> 'was writing')\n" +
          "• Present Perfect -> Past Perfect ('has written' -> 'had written')\n" +
          "• Simple Past -> Past Perfect ('wrote' -> 'had written')\n" +
          "• Shall / Will -> Should / Would ('will write' -> 'would write')",
        examples: [
          {
            sentence: "Direct: The philosopher said, 'Virtue is its own reward.'",
            highlight: "Universal moral truth does NOT backshift",
          },
          {
            sentence: "Indirect: The philosopher said that virtue is its own reward.",
            highlight: "Remains in Present Tense ('is', not 'was')",
          },
        ],
      },
      {
        heading: "2. Interrogatives in Indirect Speech",
        content:
          "In reporting questions:\n" +
          "1. The reporting verb is changed to 'asked', 'inquired', or 'demanded'.\n" +
          "2. The sentence order changes from interrogative (Aux + Subject) to assertive (Subject + Verb).\n" +
          "3. If the question begins with an auxiliary verb (yes/no), use 'if' or 'whether'. If it begins with a wh-word, retain the wh-word.",
        examples: [
          {
            sentence: "Direct: He said to me, 'Where are you proceeding?'",
            highlight: "Interrogative word order",
          },
          {
            sentence: "Indirect: He asked me where I was proceeding.",
            highlight: "where I was proceeding (Assertive word order, question mark removed)",
          },
        ],
      },
      {
        heading: "3. Imperatives & Exclamations in Indirect Speech",
        content:
          "Imperatives convert to an infinitive ('ordered to...', 'advised not to...'). Exclamations convert with appropriate adverbial phrases ('exclaimed with sorrow', 'applauded him saying...').",
        examples: [
          {
            sentence: "Direct: The general said, 'Soldiers, fire!'",
            highlight: "Imperative command",
          },
          {
            sentence: "Indirect: The general commanded the soldiers to fire.",
            highlight: "commanded ... to fire",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "He asked me where did I live.",
        correct: "He asked me where I lived.",
        explanation: "Indirect questions adopt standard declarative/assertive word order without auxiliary inversion.",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_12_1",
        type: "multiple-choice",
        question: "Convert to Indirect Speech: 'He said, 'Alas! I am undone.''",
        options: [
          "He exclaimed sadly that he was undone.",
          "He said alas that he was undone.",
          "He asked if he was undone.",
          "He told that he had undone.",
        ],
        correctAnswer: "He exclaimed sadly that he was undone.",
        explanation: "The interjection 'Alas!' converts into 'exclaimed with sorrow / exclaimed sadly', with the present 'am' backshifted to 'was'.",
      },
    ],
  },
  {
    id: "wm_m5_punctuation_faulty_parallelism",
    title: "Punctuation Mechanics, Faulty Parallelism & Syntactic Pitfalls",
    category: "Rhetorical Precision",
    level: "C1",
    icon: "AlertTriangle",
    durationMins: 16,
    xpReward: 85,
    moduleNumber: 5,
    moduleTitle: "Module 5: Direct/Indirect Narration & Rhetorical Precision",
    classicalChapterRef: "Wren & Martin Book II: Chapters 24–28",
    summary:
      "Master the subtle punctuation rules of the semicolon, colon, and em-dash. Eliminate faulty parallelism across correlative conjunctions, misplaced modifiers, and split infinitives.",
    keyRule:
      "Parallel ideas must be presented in parallel grammatical forms. Balance nouns with nouns, infinitives with infinitives, prepositional phrases with prepositional phrases, and clauses with clauses.",
    formula: "Correlative Parallelism: Not only [Grammatical Form X] ... but also [Exact Same Form X]",
    sections: [
      {
        heading: "1. The Semicolon vs. The Colon",
        content:
          "• Semicolon (;): Connects two independent clauses that are closely linked in thought without a coordinating conjunction, or separates items in a list that already contain commas.\n" +
          "• Colon (:): Introduces an explanation, an elaboration, a list of items, or a formal quotation.",
        examples: [
          {
            sentence: "To err is human; to forgive, divine.",
            highlight: "Semicolon balancing antithetical clauses",
          },
          {
            sentence: "The expedition lacked one vital asset: experienced alpine navigators.",
            highlight: "Colon introducing an elaboration",
          },
        ],
      },
      {
        heading: "2. Faulty Parallelism with Correlatives",
        content:
          "Correlative conjunctions ('not only...but also', 'either...or', 'neither...nor') must precede elements of the identical grammatical category.",
        examples: [
          {
            sentence: "Incorrect: He not only lost his ticket, but also his passport.",
            highlight: "not only [Verb + Noun] ... but also [Noun]",
          },
          {
            sentence: "Correct: He lost not only his ticket but also his passport.",
            highlight: "lost not only [Noun] but also [Noun]",
          },
        ],
      },
      {
        heading: "3. Misplaced Modifiers and the Adverb 'Only'",
        content:
          "The adverb 'only' should be positioned immediately adjacent to the word it is intended to qualify. Shifting its position completely alters the semantic meaning of the sentence.",
        examples: [
          {
            sentence: "He only had ten dollars. (Implies he possessed them and did nothing else with them)",
            highlight: "only had",
          },
          {
            sentence: "He had only ten dollars. (Correctly limits the amount of money)",
            highlight: "only ten dollars",
          },
        ],
      },
    ],
    commonMistakes: [
      {
        incorrect: "She likes swimming, to jog, and reading books.",
        correct: "She likes swimming, jogging, and reading books.",
        explanation: "All elements in a coordinate series must share identical grammatical form (all gerunds).",
      },
    ],
    quickCheckQuestions: [
      {
        id: "qc_wm_13_1",
        type: "multiple-choice",
        question: "Select the sentence exhibiting flawless grammatical parallelism:",
        options: [
          "The professor was admired for his intellect, his humility, and his eloquence.",
          "The professor was admired for his intellect, being humble, and eloquence.",
          "The professor was admired for having intellect, his humility, and because he was eloquent.",
          "The professor was admired for his intellect, to be humble, and eloquence.",
        ],
        correctAnswer: "The professor was admired for his intellect, his humility, and his eloquence.",
        explanation: "All three elements in the series are parallel possessive noun phrases ('his intellect', 'his humility', 'his eloquence').",
      },
    ],
  },
];
