import { DomainWeights } from "@/components/DomainWeights";
import { MemoryPanel } from "@/components/MemoryPanel";
import { ReasoningProcess } from "@/components/ReasoningProcess";
import { ActionButtons } from "@/components/ActionButtons";
import { ChatInterface } from "@/components/ChatInterface";
import { Brain } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">CoThink AI</h1>
              <p className="text-sm text-muted-foreground">Multi-Domain Reasoning System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chat Interface */}
          <div className="lg:col-span-2 h-[calc(100vh-180px)]">
            <ChatInterface />
          </div>

          {/* Right Column - Analysis Panels */}
          <div className="space-y-6">
            <DomainWeights />
            <ReasoningProcess />
            <MemoryPanel />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6">
          <ActionButtons />
        </div>
      </main>
    </div>
  );
};

export default Index;
