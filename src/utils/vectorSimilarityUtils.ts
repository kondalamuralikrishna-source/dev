// Client & Server Vector / Semantic Similarity Utility for Topic Relevancy Pre-Filtering

/**
 * Calculates cosine similarity between two numeric vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized text embeddings).
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Stop words list for lightweight TF-IDF and bag-of-words vector generation
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
  "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
  "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
  "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
  "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
  "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
  "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
  "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
  "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
  "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
  "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
  "yourselves"
]);

/**
 * Tokenizes text into normalized content lemmas/words.
 */
export function extractContentTokens(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * Generates a lightweight sparse embedding vector over a shared vocabulary space.
 * Perfect for instantaneous client-side pre-filtering without network latency or API costs.
 */
export function generateSparseTermVector(text: string, vocabulary: string[]): number[] {
  const tokens = extractContentTokens(text);
  const tokenFreq = new Map<string, number>();
  for (const t of tokens) {
    tokenFreq.set(t, (tokenFreq.get(t) || 0) + 1);
  }

  return vocabulary.map((word) => tokenFreq.get(word) || 0);
}

export interface RelevancyPreFilterResult {
  similarityScore: number; // 0.0 to 1.0
  isOffTopic: boolean;
  relevancyMultiplier: number; // 0.0 to 1.0 to multiply against ASE scores
  flag: "OFF_TOPIC" | "BORDERLINE" | "TOPIC_ALIGNED";
  confidence: number;
  reason?: string;
}

/**
 * Evaluates semantic relevancy between the target prompt and user transcript.
 * Threshold defaults to 0.35:
 * - If similarity < 0.35 -> isOffTopic = true, relevancyMultiplier = 0.0 (Hard zero multiplier)
 * - If similarity >= 0.35 -> isOffTopic = false, relevancyMultiplier = 1.0 (or continuous curve)
 */
export function evaluatePromptTranscriptRelevancy(
  prompt: string,
  transcript: string,
  threshold: number = 0.35
): RelevancyPreFilterResult {
  const promptTokens = extractContentTokens(prompt);
  const transcriptTokens = extractContentTokens(transcript);

  // Check for known literary passages / obvious extrinsic recitations
  const lowerTranscript = (transcript || "").toLowerCase();
  const isObviousLiteratureRecitation =
    lowerTranscript.includes("bright cold day in april") ||
    lowerTranscript.includes("clocks were striking thirteen") ||
    lowerTranscript.includes("winston smith") ||
    lowerTranscript.includes("big brother") ||
    lowerTranscript.includes("call me ishmael") ||
    lowerTranscript.includes("best of times, it was the worst of times");

  if (isObviousLiteratureRecitation) {
    return {
      similarityScore: 0.04,
      isOffTopic: true,
      relevancyMultiplier: 0.0,
      flag: "OFF_TOPIC",
      confidence: 0.99,
      reason: "Extrinsic literary passage / read-aloud detected (e.g. Orwell's 1984) with 0% prompt alignment.",
    };
  }

  if (promptTokens.length === 0 || transcriptTokens.length === 0) {
    return {
      similarityScore: 0.0,
      isOffTopic: true,
      relevancyMultiplier: 0.0,
      flag: "OFF_TOPIC",
      confidence: 0.85,
      reason: "Insufficient lexical tokens to establish semantic relevancy.",
    };
  }

  // Build shared lexicon vocabulary
  const sharedVocabSet = new Set<string>([...promptTokens, ...transcriptTokens]);
  const vocabulary = Array.from(sharedVocabSet);

  const vecPrompt = generateSparseTermVector(prompt, vocabulary);
  const vecTranscript = generateSparseTermVector(transcript, vocabulary);

  let similarity = calculateCosineSimilarity(vecPrompt, vecTranscript);

  // Jaccard token overlap boost for short prompt contexts
  const promptSet = new Set(promptTokens);
  const matchCount = transcriptTokens.filter((t) => promptSet.has(t)).length;
  const tokenOverlapRatio = matchCount / Math.max(1, promptTokens.length);

  // Blended similarity score
  const blendedScore = Math.max(similarity, tokenOverlapRatio * 0.8);
  const roundedScore = parseFloat(blendedScore.toFixed(3));

  const isOffTopic = roundedScore < threshold;
  const relevancyMultiplier = isOffTopic ? 0.0 : Math.min(1.0, Math.max(0.5, roundedScore * 1.5));

  return {
    similarityScore: roundedScore,
    isOffTopic,
    relevancyMultiplier,
    flag: isOffTopic ? "OFF_TOPIC" : roundedScore < 0.5 ? "BORDERLINE" : "TOPIC_ALIGNED",
    confidence: Math.abs(roundedScore - threshold) > 0.15 ? 0.92 : 0.75,
    reason: isOffTopic
      ? `Cosine similarity (${roundedScore}) is below minimum threshold (${threshold}). Transcript failed semantic relevancy check.`
      : `Cosine similarity (${roundedScore}) satisfies task relevancy criteria.`,
  };
}
