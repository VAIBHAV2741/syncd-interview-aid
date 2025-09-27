import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInterviewStore } from '@/stores/interview';
import { Search, Users, Trophy, Clock, Eye, Trash2, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export const InterviewerDashboard = () => {
  const { candidates, deletCandidate } = useInterviewStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');

  const filteredCandidates = candidates
    .filter(candidate => 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.finalScore || 0) - (a.finalScore || 0);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const selectedCandidateData = candidates.find(c => c.id === selectedCandidate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-accent text-accent-foreground';
      case 'interviewing': return 'bg-primary text-primary-foreground';
      case 'paused': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'uploading': return 'Ready';
      case 'collecting-info': return 'Info Needed';
      case 'interviewing': return 'In Progress';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      default: return status;
    }
  };

  const completedCandidates = candidates.filter(c => c.status === 'completed');
  const averageScore = completedCandidates.length > 0 
    ? Math.round(completedCandidates.reduce((sum, c) => sum + (c.finalScore || 0), 0) / completedCandidates.length)
    : 0;

  return (
    <div className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Candidate Dashboard
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{candidates.length} Total</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>{averageScore}/10 Avg</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'name')}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="score">Sort by Score</option>
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {filteredCandidates.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div className="space-y-3">
              <Users className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-medium text-lg">No candidates found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Start interviewing candidates to see them here.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{candidate.name}</h4>
                        <Badge className={cn("text-xs", getStatusColor(candidate.status))}>
                          {getStatusLabel(candidate.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {candidate.email}
                        </span>
                        {candidate.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {candidate.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right space-y-1">
                      {candidate.finalScore !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-accent" />
                          <span className="font-bold text-lg">{candidate.finalScore}/10</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {candidate.answers.length}/6 questions
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCandidate(candidate.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletCandidate(candidate.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Candidate Detail Modal */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCandidateData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedCandidateData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedCandidateData.name}
                  <Badge className={cn("ml-2", getStatusColor(selectedCandidateData.status))}>
                    {getStatusLabel(selectedCandidateData.status)}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Candidate Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{selectedCandidateData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{selectedCandidateData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Applied: {new Date(selectedCandidateData.createdAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Interview Results */}
                {selectedCandidateData.answers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Interview Responses
                        {selectedCandidateData.finalScore && (
                          <Badge className="ml-auto bg-accent text-accent-foreground">
                            Final Score: {selectedCandidateData.finalScore}/10
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedCandidateData.answers.map((answer, index) => (
                        <div key={index} className="border-l-4 border-primary/20 pl-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant={
                              answer.difficulty === 'easy' ? 'secondary' :
                              answer.difficulty === 'medium' ? 'default' : 'destructive'
                            }>
                              {answer.difficulty.toUpperCase()} - Q{index + 1}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{Math.floor(answer.timeSpent / 60)}:{(answer.timeSpent % 60).toString().padStart(2, '0')}</span>
                              {answer.score && (
                                <Badge variant="outline" className="ml-2">
                                  {answer.score}/10
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-sm mb-1">Question:</p>
                            <p className="text-sm text-muted-foreground mb-2">{answer.question}</p>
                            <p className="font-medium text-sm mb-1">Answer:</p>
                            <p className="text-sm">{answer.answer || 'No answer provided'}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* AI Summary */}
                {selectedCandidateData.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">AI Assessment Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{selectedCandidateData.summary}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};