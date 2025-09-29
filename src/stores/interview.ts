import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Gemini API Setup ---
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

// --- Fetch interview question with dynamic fallback ---
async function fetchInterviewQuestion(
  difficulty: "easy" | "medium" | "hard"
): Promise<string> {
  try {
    // Use free-tier Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5" });

    const prompt = `Generate one ${difficulty} level interview question for a frontend developer. Only return the question text, nothing else.`;

    const result = await model.generateContent(prompt);
    const text = result.response?.text?.()?.trim() || result.output?.[0]?.content?.trim();
    if (!text) throw new Error("Empty response from Gemini");

    return text;
  } catch (err) {
    console.error("Gemini API error (fetchInterviewQuestion):", err);

    // Random fallback questions
    const easyFallbacks = [
      "Explain the React reconciliation process.",
      "What is the Virtual DOM in React?",
      "How does event handling work in JavaScript?",
    ];
    const mediumFallbacks = [
      "Explain React hooks and their use cases.",
      "How would you optimize a slow React app?",
      "Difference between controlled and uncontrolled components.",
    ];
    const hardFallbacks = [
      "Explain closure in JavaScript with examples.",
      "How does React fiber architecture work?",
      "Implement a debounce function in JS and explain.",
    ];

    const fallbackList =
      difficulty === "easy"
        ? easyFallbacks
        : difficulty === "medium"
        ? mediumFallbacks
        : hardFallbacks;

    return fallbackList[Math.floor(Math.random() * fallbackList.length)];
  }
}

// --- Generate questions from resume ---
export async function generateQuestionsFromResume(
  resumeText: string,
  numQuestions: number = 5
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5" });
    const prompt = `Read this resume:\n${resumeText}\nGenerate ${numQuestions} interview questions relevant to this candidate. Only return the questions as a numbered list.`;
    const result = await model.generateContent(prompt);
    const text = result.response?.text?.()?.trim() || result.output?.[0]?.content?.trim();

    return text
      .split(/\n\d+\.\s*/)
      .filter((q) => q.trim())
      .map((q) => q.trim());
  } catch (err) {
    console.error("Gemini API error (generateQuestionsFromResume):", err);
    return [
      "What are your key technical strengths?",
      "Explain a challenging project you worked on.",
      "How do you handle debugging complex issues?",
      "What frameworks are you most comfortable with?",
      "Where do you see yourself improving technically?",
    ];
  }
}

// --- Candidate Model ---
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  resumeText?: string;
  status:
    | "uploading"
    | "collecting-info"
    | "interviewing"
    | "completed"
    | "paused";
  currentQuestion: number;
  timeRemaining: number;
  answers: Array<{
    question: string;
    answer: string;
    timeSpent: number;
    difficulty: "easy" | "medium" | "hard";
    score?: number;
  }>;
  questions?: string[];
  finalScore?: number;
  summary?: string;
  createdAt: Date;
  completedAt?: Date;
}

// --- Store Shape ---
interface InterviewState {
  candidates: Candidate[];
  activeTab: "interviewee" | "interviewer";
  currentCandidateId: string | null;
  isInterviewActive: boolean;

  setActiveTab: (tab: "interviewee" | "interviewer") => void;
  addCandidate: (candidate: Omit<Candidate, "id" | "createdAt">) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  setCurrentCandidate: (id: string | null) => void;
  startInterview: (candidateId: string) => Promise<void>;
  pauseInterview: () => void;
  submitAnswer: (candidateId: string, answer: string) => Promise<void>;
  nextQuestion: (candidateId: string) => Promise<void>;
  completeInterview: (
    candidateId: string,
    finalScore: number,
    summary: string
  ) => void;
  deleteCandidate: (id: string) => void;
}

// --- Store Implementation ---
export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      candidates: [],
      activeTab: "interviewee",
      currentCandidateId: null,
      isInterviewActive: false,

      setActiveTab: (tab) => set({ activeTab: tab }),

      addCandidate: (candidateData) => {
        const id = Math.random().toString(36).substring(2, 15);
        const candidate: Candidate = {
          ...candidateData,
          id,
          createdAt: new Date(),
        };
        set((state) => ({
          candidates: [...state.candidates, candidate],
          currentCandidateId: id,
        }));
      },

      updateCandidate: (id, updates) =>
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      setCurrentCandidate: (id) => set({ currentCandidateId: id }),

      // --- Start interview: pre-generate all questions ---
      startInterview: async (candidateId) => {
        set({ isInterviewActive: true });

        const difficulties: Array<"easy" | "medium" | "hard"> = [
          "easy",
          "easy",
          "medium",
          "medium",
          "hard",
          "hard",
        ];

        const questions = await Promise.all(
          difficulties.map((d) => fetchInterviewQuestion(d))
        );

        get().updateCandidate(candidateId, {
          status: "interviewing",
          currentQuestion: 0,
          timeRemaining: 20,
          answers: questions.map((q, idx) => ({
            question: q,
            answer: "",
            timeSpent: 0,
            difficulty: difficulties[idx],
          })),
        });
      },

      pauseInterview: () => set({ isInterviewActive: false }),

      submitAnswer: async (candidateId, answer) => {
        const candidate = get().candidates.find((c) => c.id === candidateId);
        if (!candidate) return;

        const currentIndex = candidate.currentQuestion;
        const currentAnswer = candidate.answers[currentIndex];
        if (!currentAnswer) return;

        const timeSpent =
          currentAnswer.difficulty === "easy"
            ? 20 - candidate.timeRemaining
            : currentAnswer.difficulty === "medium"
            ? 60 - candidate.timeRemaining
            : 120 - candidate.timeRemaining;

        const updatedAnswers = [...candidate.answers];
        updatedAnswers[currentIndex] = {
          ...currentAnswer,
          answer,
          timeSpent,
          score: Math.floor(Math.random() * 10) + 1, // mock scoring
        };

        get().updateCandidate(candidateId, { answers: updatedAnswers });

        // Move to next or complete
        if (currentIndex < candidate.answers.length - 1) {
          get().nextQuestion(candidateId);
        } else {
          const finalScore = Math.floor(
            updatedAnswers.reduce((sum, a) => sum + (a.score || 0), 0) /
              updatedAnswers.length
          );
          const summary = `Candidate completed ${updatedAnswers.length} questions with an average score of ${finalScore}/10.`;
          get().completeInterview(candidateId, finalScore, summary);
        }
      },

      nextQuestion: async (candidateId) => {
        const candidate = get().candidates.find((c) => c.id === candidateId);
        if (!candidate) return;

        const nextIndex = candidate.currentQuestion + 1;
        if (nextIndex >= candidate.answers.length) return;

        const difficulty = candidate.answers[nextIndex].difficulty;
        const timeLimit =
          difficulty === "easy" ? 20 : difficulty === "medium" ? 60 : 120;

        get().updateCandidate(candidateId, {
          currentQuestion: nextIndex,
          timeRemaining: timeLimit,
        });
      },

      completeInterview: (candidateId, finalScore, summary) => {
        get().updateCandidate(candidateId, {
          status: "completed",
          finalScore,
          summary,
          completedAt: new Date(),
        });
        set({ isInterviewActive: false });
      },

      deleteCandidate: (id) =>
        set((state) => ({
          candidates: state.candidates.filter((c) => c.id !== id),
          currentCandidateId:
            state.currentCandidateId === id ? null : state.currentCandidateId,
        })),
    }),
    {
      name: "interview-storage",
      version: 1,
    }
  )
);

// --- Helper: get current question ---
export const getQuestionForCandidate = (candidate: Candidate) => {
  const index = candidate.currentQuestion;
  const current = candidate.answers[index];
  return {
    question: current?.question,
    difficulty: current?.difficulty,
    questionNumber: index + 1,
    totalQuestions: candidate.answers.length,
  };
};
