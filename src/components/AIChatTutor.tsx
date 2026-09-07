import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  RefreshCw,
  HelpCircle,
  Layers,
  Zap,
} from "lucide-react";
import { ChatMessage, RoleplayScenario, UserProgress } from "../types";
import { ROLEPLAY_SCENARIOS } from "../data/roleplayData";
import { AudioButton } from "./AudioButton";
import { AccentSelector } from "./AccentSelector";
import { createSpeechRecognizer, stopSpeaking, EnglishAccent, getSavedAccent } from "../utils/speechUtils";
import { ModuleHeaderGuide } from "./ModuleHeaderGuide";
import { AutoText, useAutoText } from "./AutoText";
import { useTranslation } from "../context/TranslationContext";

interface AIChatTutorProps {
  progress: UserProgress;
  onGrantXp: (amount: number) => void;
}

export const AIChatTutor: React.FC<AIChatTutorProps> = ({
  progress,
  onGrantXp,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario>(
    ROLEPLAY_SCENARIOS[0]
  );
  const [tutorPersonality, setTutorPersonality] = useState("Encouraging & Detail-Oriented");
  const [currentAccent, setCurrentAccent] = useState<EnglishAccent>(getSavedAccent());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init_1",
      role: "assistant",
      content: ROLEPLAY_SCENARIOS[0].initialMessage,
      timestamp: Date.now(),
      suggestedReplies: ROLEPLAY_SCENARIOS[0].suggestedStarters,
      vocabularyHighlights: [
        { word: "croissant", definition: "A flaky, buttery, crescent-shaped French pastry made of laminated yeast dough.", phonetic: "/kwæˈsɒ̃/" },
        { word: "pour-over", definition: "A specialty method of brewing coffee by slowly pouring hot water through freshly ground beans in a filter cone.", phonetic: "/ˈpɔːrˌoʊvər/" }
      ],
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechInterim, setSpeechInterim] = useState("");
  const [micNotice, setMicNotice] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognizerRef = useRef<any>(null);
  const { t } = useTranslation();
  const translatedUserRole = useAutoText(selectedScenario.userRole, "chat_user_role");
  const translatedTutorRole = useAutoText(selectedScenario.tutorRole, "chat_tutor_role");
  const translatedLearningGoal = useAutoText(selectedScenario.learningGoal, "chat_learning_goal");

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, speechInterim]);

  const handleSelectScenario = (scenario: RoleplayScenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        id: `sc_init_${Date.now()}`,
        role: "assistant",
        content: scenario.initialMessage,
        timestamp: Date.now(),
        suggestedReplies: scenario.suggestedStarters,
      },
    ]);
    stopSpeaking();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputVal).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal("");
    setSpeechInterim("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          history: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          scenario: `${selectedScenario.title}: ${selectedScenario.description}`,
          level: progress.selectedLevel,
          tutorPersonality,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: "assistant",
        content: data.reply || "Thank you for sharing. Could you tell me more about that?",
        timestamp: Date.now(),
        corrections: data.grammarCorrections || [],
        suggestedReplies: data.suggestedReplies || [],
        vocabularyHighlights: data.vocabularyHighlights || [],
        pronunciationTips: data.pronunciationTips || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onGrantXp(15);
    } catch (err) {
      console.error("Chat error:", err);
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `ast_err_${Date.now()}`,
          role: "assistant",
          content: "That's a very natural sentence! What other details would you like to explore next in our conversation?",
          timestamp: Date.now(),
          suggestedReplies: [
            "Could you explain the difference between 'say' and 'tell'?",
            "What is a more formal way to phrase this?",
          ],
          vocabularyHighlights: [
            { word: "perspective", definition: "A particular attitude toward or way of regarding something; a point of view.", phonetic: "/pərˈspek.tɪv/" },
            { word: "fluency", definition: "The ability to speak or write a foreign language easily and accurately.", phonetic: "/ˈfluː.ən.si/" }
          ]
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Speech Recognition
  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        if (isFinal) {
          setInputVal(transcript);
          setSpeechInterim("");
          setIsRecording(false);
        } else {
          setSpeechInterim(transcript);
        }
      },
      (err) => {
        console.error("STT error:", err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      },
      currentAccent
    );

    if (!recognizer) {
      setMicNotice(t("chat.mic_unsupported", "Voice recognition isn't supported in this browser. You can type your message below."));
      setTimeout(() => setMicNotice(null), 5000);
      return;
    }

    recognizerRef.current = recognizer;
    recognizer.start();
    setIsRecording(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Module Header Guide */}
      <ModuleHeaderGuide
        moduleTitle="AI Conversational Practice & Roleplay"
        moduleCategory="Conversational Chat"
        estimatedTime="5–10 min per chat"
        difficulty="All CEFR Levels"
        themeColor="amber"
        steps={[
          {
            title: "Choose Scenario & Persona",
            instruction: "Select a topic (e.g. Coffee Shop, Job Interview, Airport, Tech Support) and pick your tutor persona.",
            tip: "Switch personas from 'Encouraging' to 'Strict Cambridge Examiner' for varied challenge.",
          },
          {
            title: "Send Voice or Text Messages",
            instruction: "Speak your response using the microphone or type directly into the chat input.",
            tip: "Use the suggested starter chips if you're unsure how to phrase your opening.",
          },
          {
            title: "Study Vocabulary & Audio Cues",
            instruction: "Click on highlighted vocabulary words for definitions and IPA phonetic breakdowns.",
            tip: "Tap the audio speaker icon to listen to the tutor's exact phrasing.",
          },
          {
            title: "Earn XP on Active Dialogue",
            instruction: "Exchange 3+ conversational turns with the tutor to earn XP toward your daily goal.",
            tip: "Each substantial message awards +5 to +20 XP.",
          },
        ]}
        completionGoal="Participate in an interactive dialogue exchange of 3+ turns to strengthen conversational fluency."
        xpReward={35}
      />

      {/* Top Banner & Scenario Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t("chat.tutor_title", "AI Conversational Practice & Roleplay")}
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold rounded-md border border-amber-200">
                {t("chat.live_grammar_coach", "Live Grammar Coach")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t("chat.tutor_subtitle", "Practice real-time dialogue with live pronunciation audio, contextual vocabulary highlights, and instant feedback.")}
            </p>
          </div>

          {/* Accent & Personality Selectors */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <AccentSelector
              currentAccent={currentAccent}
              onAccentChange={setCurrentAccent}
              size="sm"
            />

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 pl-2 whitespace-nowrap">{t("chat.persona_label", "Persona:")}</span>
              <select
                value={tutorPersonality}
                onChange={(e) => setTutorPersonality(e.target.value)}
                className="text-xs font-bold bg-white text-slate-800 py-1 px-2.5 rounded-lg border-0 shadow-xs focus:outline-none cursor-pointer"
              >
                <option value="Encouraging & Detail-Oriented">{t("chat.persona_encouraging", "Encouraging & Supportive")}</option>
                <option value="Strict Cambridge Examiner">{t("chat.persona_examiner", "Strict Cambridge Examiner")}</option>
                <option value="Casual Native Friend">{t("chat.persona_casual", "Casual Native Friend")}</option>
                <option value="Executive Business Mentor">{t("chat.persona_executive", "Executive Business Mentor")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scenarios Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          {ROLEPLAY_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleSelectScenario(sc)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                selectedScenario.id === sc.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <AutoText as="span" text={sc.title} context="chat_scenario_title" />
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                selectedScenario.id === sc.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {sc.level}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Briefing Card */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <p className="text-indigo-950 font-bold">
            🎭 <span className="font-semibold text-slate-600">{t("chat.your_role_label", "Your Role:")}</span> {translatedUserRole} •{" "}
            <span className="font-semibold text-slate-600">{t("chat.tutor_role_label", "Tutor's Role:")}</span> {translatedTutorRole}
          </p>
          <p className="text-indigo-800">
            🎯 <span className="font-bold">{t("chat.goal_label", "Goal:")}</span> {translatedLearningGoal}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSelectScenario(selectedScenario)}
          className="px-3 py-1.5 bg-white text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 hover:bg-indigo-50 shadow-xs flex items-center gap-1.5 transition-colors self-end sm:self-auto cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>{t("chat.reset_chat", "Reset Chat")}</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[540px] overflow-hidden">
        {/* Scrollable messages list */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot size={18} />
                  </div>
                )}

                <div className={`max-w-2xl space-y-2.5 ${isUser ? "items-end" : "items-start"}`}>
                  {/* Speech Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-xs shadow-xs"
                        : "bg-slate-100 text-slate-900 rounded-tl-xs border border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
                      {!isUser && (
                        <AudioButton
                          text={msg.content}
                          accent={currentAccent}
                          size="sm"
                          variant="ghost"
                          className="text-slate-500 hover:text-indigo-600 shrink-0"
                          title="Listen to full tutor response"
                        />
                      )}
                    </div>
                  </div>

                  {/* Real-time Grammar Feedback / Corrections */}
                  {msg.corrections && msg.corrections.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                        <AlertCircle size={14} className="text-amber-600" />
                        <span>{t("chat.grammar_coaching_label", "Grammar & Natural Phrasing Coaching:")}</span>
                      </div>
                      {msg.corrections.map((cor, cIdx) => (
                        <div key={cIdx} className="space-y-0.5 pt-1">
                          <p className="text-slate-800 flex items-center gap-2 flex-wrap">
                            <span className="line-through text-rose-600">"{cor.original}"</span>
                            <span>➔</span>
                            <span className="font-bold text-emerald-700">"{cor.correction}"</span>
                            <AudioButton
                              text={cor.correction}
                              accent={currentAccent}
                              size="sm"
                              variant="ghost"
                              className="p-1"
                            />
                          </p>
                          <p className="text-slate-600 italic">💡 <AutoText as="span" text={cor.explanation} context="chat_correction_explanation" /></p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vocabulary in Context with Audio Pronunciation */}
                  {msg.vocabularyHighlights && msg.vocabularyHighlights.length > 0 && (
                    <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-indigo-600" />
                          <span>{t("chat.vocab_in_context", "Vocabulary in Context:")}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {t("chat.click_speaker_prefix", "Click speaker to pronounce in")} {currentAccent === "en-GB" ? "British 🇬🇧" : currentAccent === "en-AU" ? "Australian 🇦🇺" : "American 🇺🇸"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {msg.vocabularyHighlights.map((v, vIdx) => (
                          <div
                            key={vIdx}
                            className="bg-white p-3 rounded-xl border border-indigo-100/90 shadow-2xs flex items-start justify-between gap-2.5 hover:border-indigo-300 transition-colors"
                          >
                            <div className="space-y-0.5 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-slate-900 text-sm">{v.word}</span>
                                {v.phonetic && (
                                  <span className="font-mono text-indigo-600 text-[11px] bg-indigo-50 px-1.5 py-0.2 rounded font-medium">
                                    {v.phonetic}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                                <AutoText as="span" text={v.definition} context="chat_vocab_definition" />
                              </p>
                            </div>
                            <AudioButton
                              text={v.word}
                              accent={currentAccent}
                              size="sm"
                              variant="secondary"
                              className="shrink-0"
                              title={`Listen to pronunciation of "${v.word}"`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pronunciation tips */}
                  {msg.pronunciationTips && msg.pronunciationTips.length > 0 && (
                    <div className="px-3.5 py-2 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-900 flex items-center gap-2">
                      <span className="text-base">🗣️</span>
                      <div>
                        <strong>{t("chat.pronunciation_tip_label", "Pronunciation Tip:")}</strong>{" "}
                        {msg.pronunciationTips.map((tip, tIdx) => (
                          <React.Fragment key={tIdx}>
                            {tIdx > 0 && " • "}
                            <AutoText as="span" text={tip} context="chat_pronunciation_tip" />
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Quick Replies */}
                  {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {t("chat.suggested_replies_label", "Suggested Replies (Click to speak):")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedReplies.map((reply, rIdx) => (
                          <button
                            key={rIdx}
                            type="button"
                            onClick={() => handleSendMessage(reply)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 text-left transition-colors active:scale-95 cursor-pointer"
                          >
                            "{reply}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <span className="italic font-medium">{t("chat.analyzing_message", "Tutor is analyzing your sentence and drafting feedback...")}</span>
            </div>
          )}

          {speechInterim && (
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-700 italic flex items-center gap-2 animate-pulse">
              <Mic size={14} className="text-rose-500 animate-bounce" />
              <span>{t("chat.listening_label", "Listening:")} "{speechInterim}..."</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Notice if mic isn't supported */}
        {micNotice && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{micNotice}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              id="btn-toggle-mic"
              type="button"
              onClick={handleToggleRecord}
              title={isRecording ? t("chat.stop_recording_title", "Stop recording") : t("chat.speak_message_title", "Speak your message")}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isRecording
                  ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
              }`}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              id="input-chat-message"
              type="text"
              placeholder={isRecording ? t("chat.listening_placeholder", "Listening to your voice...") : t("chat.type_message_placeholder", "Type your English message or question...")}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              id="btn-send-message"
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
