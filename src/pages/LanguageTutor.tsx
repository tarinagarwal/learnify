"use client";

import { useState, useEffect, useRef } from "react";
//import { useNavigate } from "react-router-dom"; currently un used hence commeneted
import {
  getTutorResponse,
  analyzeGrammar,
  generateVocabularyExercises,
  generatePracticeExercises,
  saveVocabularyItem,
  savePracticeExercise,
  getSavedVocabulary,
  getSavedExercises,
  type ConversationMessage,
  type GrammarCorrection,
  type VocabularyItem,
  type PracticeExercise,
} from "@/services/languageTutor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Book,
  GraduationCap,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  History,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Brain,
  Sparkles,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { NewChatDialog } from "@/components/NewChatDialog";
import ReactMarkdown from "react-markdown";

export default function LanguageTutor() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLevel, setUserLevel] = useState("intermediate");
  const [activeTab, setActiveTab] = useState("chat");
  const [grammarText, setGrammarText] = useState("");
  const [grammarCorrections, setGrammarCorrections] = useState<
    GrammarCorrection[]
  >([]);
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [practiceExercises, setPracticeExercises] = useState<
    PracticeExercise[]
  >([]);
  const [topic, setTopic] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<unknown[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savedVocabulary, setSavedVocabulary] = useState<VocabularyItem[]>([]);
  const [savedExercises, setSavedExercises] = useState<PracticeExercise[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
//  const navigate = useNavigate(); navigate is not used currently so commenting it temporary

  
  useEffect(() => {
    fetchChatSessions();
    if (activeTab === "saved") {
      fetchSavedItems();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  
  useEffect(() => {
    if (currentSessionId) {
      fetchMessages();
    }
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId]);

  const fetchSavedItems = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const vocabulary = await getSavedVocabulary();
      const exercises = await getSavedExercises();
      setSavedVocabulary(vocabulary);
      setSavedExercises(exercises);
    } catch (error) {
      console.error("Error fetching saved items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch saved items",
        variant: "destructive",
      });
    }
  };

  const handleSaveVocabulary = async (item: VocabularyItem) => {
    try {
      await saveVocabularyItem(item);
      setVocabularyItems((items) =>
        items.map((i) => (i.word === item.word ? { ...i, saved: true } : i))
      );
      toast({
        title: "Success",
        description: "Vocabulary item saved successfully",
      });
    } catch (error) {
      console.error("Failed to save vocabulary item:", error);
      toast({
        title: "Error",
        description: "Failed to save vocabulary item",
        variant: "destructive",
      });
    }
  };

  const handleSaveExercise = async (exercise: PracticeExercise) => {
    try {
      await savePracticeExercise(exercise);
      setPracticeExercises((exercises) =>
        exercises.map((e) =>
          e.question === exercise.question ? { ...e, saved: true } : e
        )
      );
      toast({
        title: "Success",
        description: "Exercise saved successfully",
      });
    } catch (error) {
      console.error("Failed to save exercise item:", error);
      toast({
        title: "Error",
        description: "Failed to save exercise",
        variant: "destructive",
      });
    }
  };

  const fetchChatSessions = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChatSessions(sessions || []);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch chat history",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async () => {
    if (!currentSessionId) return;

    try {
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", currentSessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(
        messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch chat messages",
        variant: "destructive",
      });
    }
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!currentSessionId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("chat_messages").insert([
        {
          session_id: currentSessionId,
          user_id: user.id,
          role,
          content,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving message:", error);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSessionId) return;

    try {
      setIsLoading(true);
      const userMessage = { role: "user" as const, content: inputMessage };
      setMessages((prev) => [...prev, userMessage]);
      await saveMessage("user", inputMessage);
      setInputMessage("");

      const response = await getTutorResponse(
        [...messages, userMessage],
        userLevel
      );
      const assistantMessage = {
        role: "assistant" as const,
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage("assistant", response);
    } catch (error) {
      console.error("Failed to get response:", error);
      toast({
        title: "Error",
        description: "Failed to get tutor response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrammarCheck = async () => {
    if (!grammarText.trim()) return;

    try {
      setIsLoading(true);
      const corrections = await analyzeGrammar(grammarText);
      setGrammarCorrections(corrections);
    } catch (error) {
      console.error("Failed to analyze grammer:", error);
      toast({
        title: "Error",
        description: "Failed to analyze grammar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVocabulary = async () => {
    if (!topic.trim()) return;

    try {
      setIsLoading(true);
      const exercises = await generateVocabularyExercises(userLevel, topic, 5);
      setVocabularyItems(exercises);
    } catch (error) {
      console.error("Failed to generate exercises:", error);
      toast({
        title: "Error",
        description:
          "Failed to generate vocabulary exercises. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePractice = async () => {
    try {
      setIsLoading(true);
      const exercises = await generatePracticeExercises(
        userLevel,
        ["grammar", "vocabulary"],
        [],
        5
      );
      setPracticeExercises(exercises);
    } catch (error) {
      console.error("Failed to generate exercises:", error);
      toast({
        title: "Error",
        description: "Failed to generate practice exercises. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowHistory(false);
  };

  const playWordAudio = async (word: string, audioUrl: string) => {
    try {
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error("Audio play failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Animated grid background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 z-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `rgba(${Math.random() * 100 + 155}, ${
                Math.random() * 100 + 155
              }, 255, ${Math.random() * 0.5 + 0.5})`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${
                Math.random() * 100 + 155
              }, ${Math.random() * 100 + 155}, 255, ${
                Math.random() * 0.5 + 0.5
              })`,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto py-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-purple-500/20 backdrop-blur-sm mb-4">
              <Globe className="w-4 h-4 mr-2" />
              Powered by AI Language Learning
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 pb-4">
              AI English Tutor
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your personal language learning assistant to help you master
              English through conversation, practice, and feedback
            </p>
          </div>

          <div className="mb-6 flex justify-center">
            <Select value={userLevel} onValueChange={setUserLevel}>
              <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 focus:ring-purple-500 focus:border-purple-500">
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6 grid grid-cols-4 bg-gray-800 p-1 rounded-full">
              <TabsTrigger
                value="chat"
                className="flex items-center gap-2 rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="grammar"
                className="flex items-center gap-2 rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Book className="w-4 h-4" />
                Grammar Check
              </TabsTrigger>
              <TabsTrigger
                value="practice"
                className="flex items-center gap-2 rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <GraduationCap className="w-4 h-4" />
                Practice
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="flex items-center gap-2 rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Bookmark className="w-4 h-4" />
                Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <Card className="bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      Chat with Your Tutor
                    </CardTitle>
                    <div className="mt-4 md:mt-0 flex gap-2 ">
                      <Button
                        variant="outline"
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-2 border-purple-400 text-purple-400 hover:bg-purple-400/10 rounded-full"
                      >
                        <History className="w-4 h-4" />
                        History
                      </Button>
                      <NewChatDialog
                        onChatCreated={(sessionId) => {
                          setCurrentSessionId(sessionId);
                          setMessages([]);
                          fetchChatSessions();
                        }}
                      />
                    </div>
                  </div>

                  <CardDescription className="text-gray-400">
                    Practice conversation and get instant feedback from your AI
                    language tutor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showHistory ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-4 text-white">
                        Chat History
                      </h3>
                      {chatSessions.length > 0 ? (
                        chatSessions.map((session) => (
                          <div
                            key={session.id}
                            className="p-4 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer border border-gray-600 hover:border-purple-500 transition-all duration-200"
                            onClick={() => handleSelectSession(session.id)}
                          >
                            <h4 className="font-medium text-white">
                              {session.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {new Date(
                                session.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No chat history found</p>
                          <p className="text-gray-500 text-sm mt-2">
                            Start a new conversation to begin learning
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="h-[400px] overflow-y-auto mb-4 space-y-4 p-4 bg-gray-900 rounded-lg">
                        {messages.length > 0 ? (
                          messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${
                                message.role === "user"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  message.role === "user"
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-700 text-gray-100"
                                }`}
                              >
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <Sparkles className="h-12 w-12 text-purple-400 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                              Start Chatting with Your AI Tutor
                            </h3>
                            <p className="text-gray-400 max-w-md">
                              Ask questions, practice conversations, or get help
                              with English grammar and vocabulary
                            </p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          disabled={isLoading || !currentSessionId}
                          className="bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={isLoading || !currentSessionId}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-[100px]"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grammar">
              <Card className="bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Book className="h-5 w-5 text-purple-400" />
                    Grammar Check
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Get instant feedback on your writing and improve your
                    grammar skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={grammarText}
                    onChange={(e) => setGrammarText(e.target.value)}
                    placeholder="Enter your text for grammar checking..."
                    className="mb-4 bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500 min-h-[150px]"
                    rows={6}
                  />
                  <Button
                    onClick={handleGrammarCheck}
                    disabled={isLoading}
                    className="w-full mb-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      "Check Grammar"
                    )}
                  </Button>
                  {grammarCorrections.length > 0 ? (
                    <div className="space-y-4">
                      {grammarCorrections.map((correction, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <span className="text-red-400">
                              {correction.original}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                            <span className="text-green-400">
                              {correction.corrected}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm pl-6">
                            {correction.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : grammarText.length > 0 && !isLoading ? (
                    <div className="text-center py-4 bg-gray-700 rounded-lg">
                      <p className="text-gray-300">No grammar errors found</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice">
              <Card className="bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-400" />
                    Practice Exercises
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Improve your skills with targeted exercises and vocabulary
                    practice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                      <Book className="h-4 w-4 text-purple-400" />
                      Vocabulary Practice
                    </h3>
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a topic (e.g., travel, business, food)..."
                        className="bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Button
                        onClick={handleGenerateVocabulary}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full whitespace-nowrap"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          "Generate Vocabulary"
                        )}
                      </Button>
                    </div>
                    {vocabularyItems.length > 0 && (
                      <div className="space-y-4">
                        {vocabularyItems.map((item, index) => (
                          <div
                            key={index}
                            className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-purple-400">
                                {item.word}
                              </h4>
                              <div className="flex gap-2">
                                {item.audioError ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 cursor-not-allowed"
                                    disabled
                                  >
                                    <VolumeX className="w-5 h-5" />
                                    <span className="sr-only">
                                      Audio not available
                                    </span>
                                  </Button>
                                ) : (
                                  item.audioUrl && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                                      onClick={async () => {
                                        try {
                                          await playWordAudio(
                                            item.word,
                                            item.audioUrl
                                          );
                                        } catch (error) {
                                          console.error("Audio play failed:", error);
                                          toast({
                                            title: "Error",
                                            description: "Failed to play audio",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      <Volume2 className="w-5 h-5" />
                                      <span className="sr-only">
                                        Play pronunciation
                                      </span>
                                    </Button>
                                  )
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={
                                    item.saved
                                      ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                                      : "text-gray-400 hover:text-gray-300 hover:bg-gray-400/10"
                                  }
                                  onClick={() => handleSaveVocabulary(item)}
                                  disabled={item.saved}
                                >
                                  {item.saved ? (
                                    <BookmarkCheck className="w-5 h-5" />
                                  ) : (
                                    <Bookmark className="w-5 h-5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-200 mb-2">
                              {item.definition}
                            </p>
                            <div className="space-y-2">
                              <p className="text-sm text-purple-400 font-medium">
                                Examples:
                              </p>
                              <ul className="list-disc list-inside space-y-1 pl-2">
                                {item.examples.map((example, i) => (
                                  <li key={i} className="text-gray-300">
                                    {example}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-purple-400 font-medium">
                                Synonyms:
                              </p>
                              <p className="text-gray-300">
                                {item.synonyms.join(", ")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-purple-400" />
                      Practice Exercises
                    </h3>
                    <Button
                      onClick={handleGeneratePractice}
                      disabled={isLoading}
                      className="w-full mb-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        "Generate Exercises"
                      )}
                    </Button>
                    {practiceExercises.length > 0 && (
                      <div className="space-y-4">
                        {practiceExercises.map((exercise, index) => (
                          <div
                            key={index}
                            className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                                {exercise.type}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={
                                  exercise.saved
                                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-400/10"
                                }
                                onClick={() => handleSaveExercise(exercise)}
                                disabled={exercise.saved}
                              >
                                {exercise.saved ? (
                                  <BookmarkCheck className="w-5 h-5" />
                                ) : (
                                  <Bookmark className="w-5 h-5" />
                                )}
                              </Button>
                            </div>
                            {exercise.passage && (
                              <div className="mb-4 p-4 bg-gray-400 rounded-lg">
                                <ReactMarkdown>
                                  {exercise.passage}
                                </ReactMarkdown>
                              </div>
                            )}
                            <p className="text-gray-100 mb-4">
                              {exercise.question}
                            </p>
                            {exercise.options && (
                              <div className="space-y-2 mb-4">
                                {exercise.options.map((option, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 p-3 rounded-lg bg-gray-400 hover:bg-gray-600 cursor-pointer border border-gray-700 hover:border-purple-500 transition-all duration-200"
                                  >
                                    <span>{option}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                              <p className="text-sm text-gray-300">
                                {exercise.explanation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved">
              <Card className="bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookmarkCheck className="h-5 w-5 text-purple-400" />
                    Saved Items
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Review your saved vocabulary and exercises for continued
                    learning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                        <Book className="h-4 w-4 text-purple-400" />
                        Saved Vocabulary
                      </h3>
                      {savedVocabulary.length > 0 ? (
                        <div className="space-y-4">
                          {savedVocabulary.map((item, index) => (
                            <div
                              key={index}
                              className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-all duration-200"
                            >
                              <h4 className="text-lg font-semibold text-purple-400 mb-2">
                                {item.word}
                              </h4>
                              <p className="text-gray-200 mb-2">
                                {item.definition}
                              </p>
                              <div className="space-y-2">
                                <p className="text-sm text-purple-400 font-medium">
                                  Examples:
                                </p>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                  {item.examples.map((example, i) => (
                                    <li key={i} className="text-gray-300">
                                      {example}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-purple-400 font-medium">
                                  Synonyms:
                                </p>
                                <p className="text-gray-300">
                                  {item.synonyms.join(", ")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-700 rounded-lg border border-gray-600">
                          <BookmarkCheck className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-400">
                            No saved vocabulary items
                          </p>
                          <p className="text-gray-500 text-sm mt-2">
                            Save vocabulary items to review them later
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-400" />
                        Saved Exercises
                      </h3>
                      {savedExercises.length > 0 ? (
                        <div className="space-y-4">
                          {savedExercises.map((exercise, index) => (
                            <div
                              key={index}
                              className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-all duration-200"
                            >
                              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                                {exercise.type}
                              </span>
                              {exercise.passage && (
                                <div className="mt-4 p-4 bg-gray-400 rounded-lg">
                                  <ReactMarkdown>
                                    {exercise.passage}
                                  </ReactMarkdown>
                                </div>
                              )}
                              <p className="text-gray-100 my-4">
                                {exercise.question}
                              </p>
                              {exercise.options && (
                                <div className="space-y-2 mb-4">
                                  {exercise.options.map((option, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2 p-3 rounded-lg bg-gray-400 border border-gray-700"
                                    >
                                      <span>{option}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <p className="text-sm text-gray-300">
                                  {exercise.explanation}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-700 rounded-lg border border-gray-600">
                          <BookmarkCheck className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-400">No saved exercises</p>
                          <p className="text-gray-500 text-sm mt-2">
                            Save exercises to practice them later
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add keyframes for floating animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(10px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
