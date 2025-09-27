import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useInterviewStore } from '@/stores/interview';
import { useToast } from '@/hooks/use-toast';

export const ResumeUpload = () => {
  const { addCandidate } = useInterviewStore();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mock resume parsing - in real app, would use document parsing API
      const mockExtractedData = {
        name: '',
        email: '',
        phone: '',
        resumeFile: file,
        resumeText: 'Mock extracted resume text...',
        status: 'collecting-info' as const,
        currentQuestion: 0,
        timeRemaining: 0,
        answers: [],
      };

      addCandidate(mockExtractedData);
      
      toast({
        title: "Resume uploaded successfully",
        description: "Please provide any missing information to continue.",
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

  return (
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
  );
};