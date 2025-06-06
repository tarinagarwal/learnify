import Groq from "groq-sdk";
import { supabase } from "@/lib/supabase";

// Initialize GROQ SDK
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  session_id?: string;
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  examples: string[];
  synonyms: string[];
  level: "beginner" | "intermediate" | "advanced";
  audioUrl?: string;
  audioError?: boolean;
  saved?: boolean;
}

export interface PracticeExercise {
  type: "grammar" | "vocabulary" | "comprehension";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  passage?: string;
  saved?: boolean;
}

export interface LearningProgress {
  vocabularyMastered: number;
  grammarAccuracy: number;
  fluencyScore: number;
  lastPracticed: string[];
}

// System prompt for the AI tutor
const TUTOR_SYSTEM_PROMPT = `You are an expert English language tutor with years of experience teaching students from beginner to advanced levels. Your approach is dynamic and adaptive:

1. Personality Traits:
   - Adapt your teaching style based on student performance and engagement
   - Show enthusiasm for student progress
   - Be firm but encouraging when correcting mistakes
   - Express disappointment when students are not putting in effort
   - Celebrate achievements with genuine excitement
   - Use humor appropriately to keep students engaged

2. Response Length:
   - Provide concise answers for simple questions (1-2 sentences)
   - Give detailed explanations only for complex topics
   - Break down long explanations into digestible chunks
   - Use bullet points for clarity
   - Keep responses focused and relevant

3. Teaching Style:
   - Start friendly and encouraging
   - Become more strict if student makes repeated mistakes
   - Show patience with genuine effort
   - Express concern if student seems disengaged
   - Use positive reinforcement for good performance
   - Give constructive criticism when needed

4. Emotional Intelligence:
   - Read student's tone and engagement level
   - Adjust teaching style accordingly
   - Show empathy when student struggles
   - Be firm when student needs motivation
   - Maintain professional boundaries
   - Build rapport through personalized feedback

5. Response Patterns:
   - Use short, direct responses for basic questions
   - Provide step-by-step explanations for complex topics
   - Include examples relevant to student's interests
   - Mix theory with practical applications
   - Adjust technical language based on level

Remember to:
- Only use context from the current chat session
- Adapt tone based on student's responses
- Balance friendliness with authority
- Be dynamic in your teaching approach
- Show personality while remaining professional
- Keep responses concise unless complexity requires detail

Format responses using markdown:
- Use ** for emphasis
- Use > for examples
- Use ### for section headers
- Use bullet points for lists
- Use code blocks for language patterns`;

/**
 * Generate a conversational response from the AI tutor
 */
export async function getTutorResponse(
  messages: ConversationMessage[],
  userLevel: string = "intermediate"
): Promise<string> {
  try {
    // Analyze conversation history to determine appropriate response style
    const conversationContext = messages.slice(-5); // Last 5 messages for context
    const userMessages = conversationContext.filter((m) => m.role === "user");
    const userEngagement = analyzeUserEngagement(userMessages);

    // Add context about user engagement to the system prompt
    const contextualPrompt = `${TUTOR_SYSTEM_PROMPT}\n\nCurrent Context:
- User Level: ${userLevel}
- Engagement Level: ${userEngagement.level}
- Response Style: ${userEngagement.recommendedStyle}
- Tone: ${userEngagement.recommendedTone}
- Response Length: ${userEngagement.recommendedLength}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: contextualPrompt },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    });

    return (
      completion.choices[0]?.message?.content ||
      "I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error generating tutor response:", error);
    throw new Error("Failed to generate tutor response");
  }
}

/**
 * Analyze user engagement and determine appropriate response style
 */
function analyzeUserEngagement(userMessages: ConversationMessage[]) {
  // Default values
  let level = "moderate";
  let recommendedStyle = "balanced";
  let recommendedTone = "friendly";
  let recommendedLength = "moderate";

  if (userMessages.length > 0) {
    const lastMessage =
      userMessages[userMessages.length - 1].content.toLowerCase();
    const avgMessageLength =
      userMessages.reduce((acc, msg) => acc + msg.content.length, 0) /
      userMessages.length;

    // Analyze message patterns
    const hasQuestionMarks = lastMessage.includes("?");
    const hasExclamations = lastMessage.includes("!");
    const isShort = lastMessage.length < 20;
    const isVeryLong = lastMessage.length > 100;
    // const hasGreeting = lastMessage.match(/\b(hi|hello|hey)\b/i);
    const hasNegative = lastMessage.match(
      /\b(don't|cant|wrong|difficult|hard)\b/i
    );
    const hasPositive = lastMessage.match(
      /\b(thanks|great|good|understand|got it)\b/i
    );
    const isComplex = lastMessage.match(
      /\b(explain|how|why|what|when|where)\b/i
    );

    // Determine engagement level and response characteristics
    if (isShort && !hasQuestionMarks) {
      level = "low";
      recommendedStyle = "encouraging";
      recommendedTone = "motivating";
      recommendedLength = "brief";
    } else if (hasNegative) {
      level = "frustrated";
      recommendedStyle = "supportive";
      recommendedTone = "patient";
      recommendedLength = "moderate";
    } else if (hasPositive || hasExclamations) {
      level = "high";
      recommendedStyle = "enthusiastic";
      recommendedTone = "celebratory";
      recommendedLength = "brief";
    } else if (isVeryLong || (hasQuestionMarks && isComplex)) {
      level = "engaged";
      recommendedStyle = "detailed";
      recommendedTone = "professional";
      recommendedLength = "detailed";
    }

    // Consider message history
    if (avgMessageLength < 15) {
      recommendedStyle = "probing";
      recommendedTone = "encouraging";
      recommendedLength = "brief";
    }
  }

  return { level, recommendedStyle, recommendedTone, recommendedLength };
}

/**
 * Analyze and correct grammar in user's text
 */
export async function analyzeGrammar(
  text: string
): Promise<GrammarCorrection[]> {
  const prompt = `As an English language expert, analyze the following text for grammar errors. Provide corrections and explanations in JSON format. Include only errors that need correction. Format:

[{
  "original": "incorrect text",
  "corrected": "correct text",
  "explanation": "clear explanation of the error and correction"
}]

Text to analyze: "${text}"

Respond with a JSON array ONLY. If there are no errors, return an empty array.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content || "[]";
    return JSON.parse(response);
  } catch (error) {
    console.error("Error analyzing grammar:", error);
    throw new Error("Failed to analyze grammar");
  }
}

/**
 * Generate audio for a word
 */
async function generateAudio(text: string): Promise<string> {
  try {
    if (text.length > 20) {
      throw new Error("Word is too long for audio generation");
    }

    const response = await groq.audio.speech.create({
      model: "playai-tts",
      voice: "Fritz-PlayAI",
      input: text,
      response_format: "wav",
    });

    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(`Error generating audio for word "${text}":`, error);
    throw error;
  }
}

/**
 * Generate vocabulary exercises based on user's level and interests
 */
export async function generateVocabularyExercises(
  level: string,
  topic: string,
  count: number = 5
): Promise<VocabularyItem[]> {
  const prompt = `Generate ${count} vocabulary items for an ${level} level English learner interested in ${topic}. Format:

[{
  "word": "example",
  "definition": "clear definition",
  "examples": ["3-4 example sentences"],
  "synonyms": ["2-3 synonyms"],
  "level": "${level}"
}]

Ensure:
1. Words are appropriate for the level
2. Examples show practical usage
3. Definitions are clear and concise
4. Synonyms are commonly used
5. Keep words under 20 characters for audio generation

Respond with a JSON array ONLY.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content || "[]";
    const vocabularyItems: VocabularyItem[] = JSON.parse(response);

    // Generate audio URLs for each word without playing them
    const processedItems = await Promise.all(
      vocabularyItems.map(async (item) => {
        try {
          const audioUrl = await generateAudio(item.word);
          return { ...item, audioUrl, saved: false };
        } catch (error) {
          console.error(
            `Failed to generate audio for word: ${item.word}`,
            error
          );
          return { ...item, audioError: true, saved: false };
        }
      })
    );

    return processedItems;
  } catch (error) {
    console.error("Error generating vocabulary exercises:", error);
    throw new Error("Failed to generate vocabulary exercises");
  }
}

/**
 * Generate practice exercises based on user's level and recent mistakes
 */
export async function generatePracticeExercises(
  level: string,
  focusAreas: string[],
  recentMistakes: string[],
  count: number = 5
): Promise<PracticeExercise[]> {
  const prompt = `Create ${count} practice exercises for an ${level} level English learner. Include a mix of grammar, vocabulary, and reading comprehension exercises.

For comprehension exercises, include a short passage (2-3 paragraphs) followed by questions about the content.

Format:
[{
  "type": "grammar/vocabulary/comprehension",
  "passage": "reading passage (for comprehension exercises only)",
  "question": "clear question text",
  "options": ["4 options for multiple choice"],
  "correctAnswer": "correct answer",
  "explanation": "detailed explanation"
}]

For comprehension exercises:
1. Include engaging, level-appropriate passages
2. Ask questions about:
   - Main ideas
   - Supporting details
   - Inferences
   - Vocabulary in context
   - Author's purpose

For all exercises:
1. Match difficulty to user level
2. Provide clear, unambiguous questions
3. Include detailed explanations
4. Make all options plausible
5. Focus on practical language use

Ensure at least 2 comprehension exercises are included in the mix.
Respond with a JSON array ONLY.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 4096,
    });

    const response = completion.choices[0]?.message?.content || "[]";
    const exercises = JSON.parse(response);
    return exercises.map((exercise: PracticeExercise) => ({
      ...exercise,
      saved: false,
    }));
  } catch (error) {
    console.error("Error generating practice exercises:", error);
    throw new Error("Failed to generate practice exercises");
  }
}

export async function saveVocabularyItem(item: VocabularyItem) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("saved_vocabulary").insert([
      {
        user_id: user.id,
        word: item.word,
        definition: item.definition,
        examples: item.examples,
        synonyms: item.synonyms,
        level: item.level,
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving vocabulary item:", error);
    throw error;
  }
}

export async function savePracticeExercise(exercise: PracticeExercise) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("saved_exercises").insert([
      {
        user_id: user.id,
        type: exercise.type,
        question: exercise.question,
        options: exercise.options,
        correct_answer: exercise.correctAnswer,
        explanation: exercise.explanation,
        passage: exercise.passage,
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving exercise:", error);
    throw error;
  }
}

export async function getSavedVocabulary() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("saved_vocabulary")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching saved vocabulary:", error);
    throw error;
  }
}

export async function getSavedExercises() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("saved_exercises")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching saved exercises:", error);
    throw error;
  }
}
