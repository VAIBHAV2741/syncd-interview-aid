import { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { useInterviewStore, type Candidate } from '@/stores/interview';
import { cn } from '@/lib/utils';

interface QuestionTimerProps {
  candidate: Candidate;
  onTimeUp: () => void;
}

export const QuestionTimer = ({ candidate, onTimeUp }: QuestionTimerProps) => {
  const { updateCandidate } = useInterviewStore();

  const getDifficultyTime = (questionIndex: number) => {
    return questionIndex < 2 ? 20 : questionIndex < 4 ? 60 : 120;
  };

  const totalTime = getDifficultyTime(candidate.currentQuestion);
  const progressPercentage = ((totalTime - candidate.timeRemaining) / totalTime) * 100;
  const isWarning = candidate.timeRemaining <= totalTime * 0.25; // Last 25%
  const isCritical = candidate.timeRemaining <= 10; // Last 10 seconds

  useEffect(() => {
    if (candidate.timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      updateCandidate(candidate.id, {
        timeRemaining: Math.max(0, candidate.timeRemaining - 1)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [candidate.timeRemaining, candidate.id, updateCandidate, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = () => {
    const index = candidate.currentQuestion;
    return index < 2 ? 'Easy' : index < 4 ? 'Medium' : 'Hard';
  };

  const getTimerColor = () => {
    if (isCritical) return 'text-destructive';
    if (isWarning) return 'text-warning';
    return 'text-primary';
  };

  const getProgressColor = () => {
    if (isCritical) return 'bg-destructive';
    if (isWarning) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={cn("w-4 h-4", getTimerColor())} />
          <span className="text-sm font-medium">Question Timer</span>
          <Badge 
            variant={
              getDifficultyLabel() === 'Easy' ? 'secondary' :
              getDifficultyLabel() === 'Medium' ? 'default' : 'destructive'
            }
            className="text-xs"
          >
            {getDifficultyLabel()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {isWarning && (
            <AlertTriangle className={cn("w-4 h-4", getTimerColor())} />
          )}
          <span className={cn("text-lg font-bold tabular-nums", getTimerColor())}>
            {formatTime(candidate.timeRemaining)}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <Progress 
          value={progressPercentage} 
          className={cn(
            "h-2 transition-all duration-300",
            isCritical && "animate-pulse"
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Time used: {formatTime(totalTime - candidate.timeRemaining)}</span>
          <span>Total: {formatTime(totalTime)}</span>
        </div>
      </div>

      {candidate.timeRemaining === 0 && (
        <div className="text-center p-2 bg-destructive/10 border border-destructive/20 rounded">
          <span className="text-sm font-medium text-destructive">
            Time's up! Your answer will be submitted automatically.
          </span>
        </div>
      )}
    </div>
  );
};