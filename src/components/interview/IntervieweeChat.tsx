import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useInterviewStore, getQuestionForCandidate } from "@/stores/interview";
import { ResumeUpload } from "./ResumeUpload";
import { ChatMessage } from "./ChatMessage";
import { QuestionTimer } from "./QuestionTimer";
import { CollectInfoForm } from "./CollectInfoForm";
import { WelcomeBackModal } from "./WelcomeBackModal";
import { Clock, FileText, User } from "lucide-react";

export const IntervieweeChat = () => {
  const { 
    candidates, 
    currentCandidateId, 
    isInterviewActive,
    startInterview,
    submitAnswer 
  } = useInterviewStore();
  
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState<Array<{
    type: 'bot' | 'user' | 'system';
    content: string;
    timestamp: Date;
  }>>([]);

  const currentCandidate = candidates.find(c => c.id === currentCandidateId);

  // Welcome back modal
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  
  useEffect(() => {
    if (currentCandidate && currentCandidate.status === 'paused') {
      setShowWelcomeBack(true);
    }
  }, [currentCandidate]);

  // Initialize chat messages
  useEffect(() => {
    if (!currentCandidate) {
      setMessages([{
        type: 'bot',
        content: 'Hello! Welcome to Crisp AI Interview Assistant. Please upload your resume to get started.',
        timestamp: new Date()
      }]);
    } else if (currentCandidate.status === 'collecting-info') {
      setMessages([{
        type: 'bot',
        content: 'I need some additional information from you before we can start the interview.',
        timestamp: new Date()
      }]);
    } else if (currentCandidate.status === 'interviewing') {
      const questionData = getQuestionForCandidate(currentCandidate);
      setMessages([
        {
          type: 'bot',
          content: `Great! Let's start your technical interview. This will consist of 6 questions: 2 Easy, 2 Medium, and 2 Hard.`,
          timestamp: new Date()
        },
        {
          type: 'bot',
          content: `Question ${questionData.questionNumber}/${questionData.totalQuestions} (${questionData.difficulty.toUpperCase()}): ${questionData.question}`,
          timestamp: new Date()
        }
      ]);
    } else if (currentCandidate.status === 'completed') {
      setMessages([
        {
          type: 'system',
          content: 'Interview completed! Thank you for your time. Your responses have been recorded and will be reviewed by our team.',
          timestamp: new Date()
        }
      ]);
    }
  }, [currentCandidate?.status, currentCandidate?.currentQuestion]);

  const handleSubmitAnswer = () => {
    if (!currentCandidate || !answer.trim()) return;

    // Add user message
    const newMessages = [...messages, {
      type: 'user' as const,
      content: answer,
      timestamp: new Date()
    }];

    submitAnswer(currentCandidate.id, answer);
    setAnswer("");

    // Add next question or completion message
    const updatedCandidate = candidates.find(c => c.id === currentCandidate.id);
    if (updatedCandidate?.status === 'completed') {
      newMessages.push({
        type: 'system',
        content: `Interview completed! Your final score: ${updatedCandidate.finalScore}/10. ${updatedCandidate.summary}`,
        timestamp: new Date()
      });
    } else if (updatedCandidate && updatedCandidate.currentQuestion < 6) {
      const questionData = getQuestionForCandidate(updatedCandidate);
      newMessages.push({
        type: 'bot',
        content: `Question ${questionData.questionNumber}/${questionData.totalQuestions} (${questionData.difficulty.toUpperCase()}): ${questionData.question}`,
        timestamp: new Date()
      });
    }

    setMessages(newMessages);
  };

  const handleStartInterview = () => {
    if (!currentCandidate) return;
    startInterview(currentCandidate.id);
  };

  // Show welcome back modal
  if (showWelcomeBack && currentCandidate) {
    return <WelcomeBackModal candidate={currentCandidate} onClose={() => setShowWelcomeBack(false)} />;
  }

  // No candidate - show resume upload
  if (!currentCandidate) {
    return (
      <div className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Start Your Interview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <ResumeUpload />
        </CardContent>
      </div>
    );
  }

  // Collecting additional info
  if (currentCandidate.status === 'collecting-info') {
    return (
      <div className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Complete Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <CollectInfoForm candidate={currentCandidate} />
        </CardContent>
      </div>
    );
  }

  // Ready to start interview
  if (currentCandidate.status === 'uploading' && currentCandidate.name && currentCandidate.email && currentCandidate.phone) {
    return (
      <div className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>Ready to Start Interview</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Candidate: {currentCandidate.name}</span>
            <span>Email: {currentCandidate.email}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Full Stack Developer Interview</h3>
              <p className="text-muted-foreground mb-6">
                You'll be asked 6 questions covering React and Node.js concepts.
                Each question has a time limit, so be prepared!
              </p>
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span>Easy Questions (2):</span>
                  <Badge variant="outline">20s each</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Medium Questions (2):</span>
                  <Badge variant="outline">60s each</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Hard Questions (2):</span>
                  <Badge variant="outline">120s each</Badge>
                </div>
              </div>
              <Button onClick={handleStartInterview} className="w-full">
                Start Interview
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </div>
    );
  }

  // Interview in progress or completed
  return (
    <div className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Interview: {currentCandidate.name}
          </CardTitle>
          {currentCandidate.status === 'interviewing' && (
            <Badge variant="secondary">
              Question {currentCandidate.currentQuestion + 1}/6
            </Badge>
          )}
        </div>
        {currentCandidate.status === 'interviewing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round((currentCandidate.currentQuestion / 6) * 100)}%</span>
            </div>
            <Progress value={(currentCandidate.currentQuestion / 6) * 100} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>

        {/* Timer and Input */}
        {currentCandidate.status === 'interviewing' && (
          <div className="border-t p-4 space-y-4">
            <QuestionTimer 
              candidate={currentCandidate}
              onTimeUp={() => handleSubmitAnswer()}
            />
            
            <div className="flex gap-2">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="flex-1 min-h-[80px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={currentCandidate.timeRemaining === 0}
              />
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || currentCandidate.timeRemaining === 0}
                className="self-end"
              >
                Submit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
};