import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  resumeText?: string;
  status: 'uploading' | 'collecting-info' | 'interviewing' | 'completed' | 'paused';
  currentQuestion: number;
  timeRemaining: number;
  answers: Array<{
    question: string;
    answer: string;
    timeSpent: number;
    difficulty: 'easy' | 'medium' | 'hard';
    score?: number;
  }>;
  finalScore?: number;
  summary?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface InterviewState {
  candidates: Candidate[];
  activeTab: 'interviewee' | 'interviewer';
  currentCandidateId: string | null;
  isInterviewActive: boolean;
  
  // Actions
  setActiveTab: (tab: 'interviewee' | 'interviewer') => void;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'createdAt'>) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  setCurrentCandidate: (id: string | null) => void;
  startInterview: (candidateId: string) => void;
  pauseInterview: () => void;
  submitAnswer: (candidateId: string, answer: string) => void;
  nextQuestion: (candidateId: string) => void;
  completeInterview: (candidateId: string, finalScore: number, summary: string) => void;
  deletCandidate: (id: string) => void;
}

const INTERVIEW_QUESTIONS = {
  easy: [
    "What is the difference between let, const, and var in JavaScript?",
    "Explain what React components are and how they work.",
  ],
  medium: [
    "How do you handle state management in a React application?",
    "Explain the concept of RESTful APIs and HTTP methods.",
  ],
  hard: [
    "Design a scalable system for real-time chat application.",
    "Explain database indexing and when you would use different types of indexes.",
  ],
};

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      candidates: [],
      activeTab: 'interviewee',
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

      startInterview: (candidateId) => {
        set({ isInterviewActive: true });
        get().updateCandidate(candidateId, {
          status: 'interviewing',
          currentQuestion: 0,
          timeRemaining: 20, // Easy question timer
        });
      },

      pauseInterview: () => set({ isInterviewActive: false }),

      submitAnswer: (candidateId, answer) => {
        const state = get();
        const candidate = state.candidates.find((c) => c.id === candidateId);
        if (!candidate) return;

        const questionIndex = candidate.currentQuestion;
        const difficulty = questionIndex < 2 ? 'easy' : questionIndex < 4 ? 'medium' : 'hard';
        const questionSet = INTERVIEW_QUESTIONS[difficulty];
        const question = questionSet[questionIndex < 2 ? questionIndex : questionIndex < 4 ? questionIndex - 2 : questionIndex - 4];
        
        const timeSpent = difficulty === 'easy' ? 20 - candidate.timeRemaining :
                         difficulty === 'medium' ? 60 - candidate.timeRemaining :
                         120 - candidate.timeRemaining;

        const newAnswer = {
          question,
          answer,
          timeSpent,
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
          score: Math.floor(Math.random() * 10) + 1, // Mock AI scoring
        };

        const updatedAnswers = [...candidate.answers, newAnswer];

        get().updateCandidate(candidateId, {
          answers: updatedAnswers,
        });

        // Move to next question or complete
        if (candidate.currentQuestion < 5) {
          get().nextQuestion(candidateId);
        } else {
          const finalScore = Math.floor(
            updatedAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / updatedAnswers.length
          );
          const summary = `Candidate completed ${updatedAnswers.length} questions with an average score of ${finalScore}/10. Strong performance in technical concepts.`;
          get().completeInterview(candidateId, finalScore, summary);
        }
      },

      nextQuestion: (candidateId) => {
        const candidate = get().candidates.find((c) => c.id === candidateId);
        if (!candidate) return;

        const nextQuestionIndex = candidate.currentQuestion + 1;
        const difficulty = nextQuestionIndex < 2 ? 'easy' : nextQuestionIndex < 4 ? 'medium' : 'hard';
        const timeLimit = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 60 : 120;

        get().updateCandidate(candidateId, {
          currentQuestion: nextQuestionIndex,
          timeRemaining: timeLimit,
        });
      },

      completeInterview: (candidateId, finalScore, summary) => {
        get().updateCandidate(candidateId, {
          status: 'completed',
          finalScore,
          summary,
          completedAt: new Date(),
        });
        set({ isInterviewActive: false });
      },

      deletCandidate: (id) =>
        set((state) => ({
          candidates: state.candidates.filter((c) => c.id !== id),
          currentCandidateId: state.currentCandidateId === id ? null : state.currentCandidateId,
        })),
    }),
    {
      name: 'interview-storage',
      version: 1,
    }
  )
);

export const getQuestionForCandidate = (candidate: Candidate) => {
  const questionIndex = candidate.currentQuestion;
  const difficulty = questionIndex < 2 ? 'easy' : questionIndex < 4 ? 'medium' : 'hard';
  const questionSet = INTERVIEW_QUESTIONS[difficulty];
  const setIndex = questionIndex < 2 ? questionIndex : questionIndex < 4 ? questionIndex - 2 : questionIndex - 4;
  
  return {
    question: questionSet[setIndex],
    difficulty,
    questionNumber: questionIndex + 1,
    totalQuestions: 6,
  };
};