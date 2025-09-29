import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, Eye } from 'lucide-react';
import { useInterviewStore } from '@/stores/interview';
import { useToast } from '@/hooks/use-toast';
import { generateQuestionsFromResume } from '@/stores/interview';

export const InterviewerDashboard = () => {
  const { addCandidate, candidates } = useInterviewStore();
  const { toast } = useToast();

  // Search, sort, and modal state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Resume upload logic
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive"
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }
    try {
      const resumeText = 'Mock extracted resume text...';
      const questions = await generateQuestionsFromResume(resumeText, 5);
      const mockExtractedData = {
        name: '',
        email: '',
        phone: '',
        resumeFile: file,
        resumeText,
        status: 'collecting-info' as const,
        currentQuestion: 0,
        timeRemaining: 0,
        answers: [],
        questions,
        finalScore: null,
        summary: '',
      };
      addCandidate(mockExtractedData);
      toast({
        title: "Resume uploaded successfully",
        description: "Questions have been generated from your resume.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error processing your resume. Please try again.",
        variant: "destructive"
      });
    }
  }, [addCandidate, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: false,
  });

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(c =>
      (c.name ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === 'score'
        ? (b.finalScore ?? 0) - (a.finalScore ?? 0)
        : (a.name ?? '').localeCompare(b.name ?? '')
    );

  return (
    <div className="space-y-8">
      {/* Resume upload UI */}
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {isDragActive ? (
                  <Upload className="w-6 h-6 text-primary" />
                ) : (
                  <FileText className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop or click to select your PDF or DOCX resume
                </p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              <span>Supported formats: PDF, DOCX</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              <span>Maximum file size: 10MB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and sort controls */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search candidates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="score">Sort by Score</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Candidate list */}
      <div>
        {filteredCandidates.length === 0 ? (
          <div>No candidates found.</div>
        ) : (
          <table className="w-full border mt-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Score</th>
                <th>Summary</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map(c => (
                <tr key={c.email}>
                  <td>{c.name || '-'}</td>
                  <td>{c.finalScore ?? '-'}</td>
                  <td>{c.summary ?? '-'}</td>
                  <td>
                    <button onClick={() => setSelectedCandidate(c)}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Candidate detail modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-2">{selectedCandidate.name || '-'}</h2>
            <div className="mb-2">Score: {selectedCandidate.finalScore ?? '-'}</div>
            <div className="mb-2">Summary: {selectedCandidate.summary ?? '-'}</div>
            <h3 className="font-semibold mt-4 mb-2">Questions & Answers</h3>
            <ul>
              {(selectedCandidate.questions ?? []).map((q, i) => (
                <li key={i} className="mb-2">
                  <div className="font-medium">{q.text ?? '-'}</div>
                  <div>Answer: {selectedCandidate.answers?.[i]?.text ?? '-'}</div>
                  <div>AI Score: {selectedCandidate.answers?.[i]?.score ?? '-'}</div>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
              onClick={() => setSelectedCandidate(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};