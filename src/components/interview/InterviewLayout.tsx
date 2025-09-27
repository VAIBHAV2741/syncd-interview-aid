import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useInterviewStore } from "@/stores/interview";
import { IntervieweeChat } from "./IntervieweeChat";
import { InterviewerDashboard } from "./InterviewerDashboard";
import { MessageSquare, Users } from "lucide-react";

export const InterviewLayout = () => {
  const { activeTab, setActiveTab } = useInterviewStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Crisp Interview Assistant
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="overflow-hidden shadow-elegant">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'interviewee' | 'interviewer')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="interviewee" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Interviewee Chat
              </TabsTrigger>
              <TabsTrigger value="interviewer" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Interviewer Dashboard
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="interviewee" className="mt-0">
              <IntervieweeChat />
            </TabsContent>
            
            <TabsContent value="interviewer" className="mt-0">
              <InterviewerDashboard />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};