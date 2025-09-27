import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInterviewStore, type Candidate } from '@/stores/interview';
import { Clock, ArrowRight, RotateCcw } from 'lucide-react';

interface WelcomeBackModalProps {
  candidate: Candidate;
  onClose: () => void;
}

export const WelcomeBackModal = ({ candidate, onClose }: WelcomeBackModalProps) => {
  const { updateCandidate, startInterview } = useInterviewStore();

  const handleResume = () => {
    startInterview(candidate.id);
    onClose();
  };

  const handleStartOver = () => {
    updateCandidate(candidate.id, {
      status: 'uploading',
      currentQuestion: 0,
      timeRemaining: 0,
      answers: [],
    });
    onClose();
  };

  const progress = Math.round((candidate.currentQuestion / 6) * 100);
  const questionsCompleted = candidate.answers.length;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            Welcome Back, {candidate.name}!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-muted-foreground">
            We found your previous interview session. Would you like to continue where you left off?
          </p>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Interview Progress</span>
                <Badge variant="outline">{progress}% Complete</Badge>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span>{questionsCompleted}/6</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Question:</span>
                  <span>#{candidate.currentQuestion + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Saved:</span>
                  <span>{new Date(candidate.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button onClick={handleResume} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Resume Interview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleStartOver}
              className="w-full"
            >
              Start Over
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your progress is automatically saved. You can safely close this window and return later.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};