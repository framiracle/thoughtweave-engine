import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, Database, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unicorn = () => {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<{
    summary?: string;
    intelligence?: string;
    patterns?: string[];
    insights?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please enter text or data to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Call Carolina analyze function for sentiment/emotion analysis
      const { data, error } = await supabase.functions.invoke("carolina-analyze", {
        body: { message: input },
      });

      if (error) throw error;

      // Create mock analysis based on the sentiment analysis
      setAnalysis({
        summary: `Analysis of ${input.split(" ").length} words completed`,
        intelligence: `Detected ${data.emotion} emotion with ${data.sentiment} sentiment`,
        patterns: [
          `Emotional tone: ${data.emotion}`,
          `Overall sentiment: ${data.sentiment}`,
          "Text complexity: Medium",
        ],
        insights: `The text exhibits ${data.emotion} characteristics with a ${data.sentiment} outlook. This suggests an emotional state that Carolina can learn from and integrate into her knowledge base.`,
      });

      toast({
        title: "Analysis complete",
        description: "Unicorn AI has processed your input",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze input",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendToCarolina = async () => {
    if (!analysis) return;

    try {
      const { error } = await supabase.functions.invoke("carolina-interlink", {
        body: {
          type: "analysis_update",
          topic: "unicorn_analysis",
          content: JSON.stringify(analysis),
        },
      });

      if (error) throw error;

      toast({
        title: "Sent to Carolina",
        description: "Analysis has been shared with Carolina AI",
      });
    } catch (error: any) {
      console.error("Interlink error:", error);
      toast({
        title: "Communication failed",
        description: error.message || "Failed to send to Carolina",
        variant: "destructive",
      });
    }
  };

  const handleStoreInKnowledge = async () => {
    if (!analysis || !input) return;

    try {
      const { error } = await supabase.from("knowledge_sources").insert({
        source_type: "unicorn_analysis",
        title: "Unicorn AI Analysis",
        content: input,
        sentiment: analysis.intelligence?.includes("positive") ? "positive" : 
                   analysis.intelligence?.includes("negative") ? "negative" : "neutral",
        emotion: analysis.intelligence?.split(" ")[1] || "neutral",
      });

      if (error) throw error;

      toast({
        title: "Stored in knowledge base",
        description: "Analysis saved to Carolina's knowledge sources",
      });
    } catch (error: any) {
      console.error("Storage error:", error);
      toast({
        title: "Storage failed",
        description: error.message || "Failed to store in knowledge base",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Unicorn AI Hub
            </h1>
            <p className="text-muted-foreground">Deep analysis and intelligence extraction</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Input Analysis
            </CardTitle>
            <CardDescription>
              Enter text or data for Unicorn AI to analyze and extract intelligence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter text, data, or question to analyze..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-muted-foreground">{analysis.summary}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Intelligence Extraction</h3>
                  <p className="text-muted-foreground">{analysis.intelligence}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Patterns Detected</h3>
                  <ul className="space-y-1">
                    {analysis.patterns?.map((pattern, idx) => (
                      <li key={idx} className="text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Interlink Insights</h3>
                  <p className="text-muted-foreground">{analysis.insights}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleSendToCarolina} variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Send to Carolina
              </Button>
              <Button onClick={handleStoreInKnowledge} variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Store in Knowledge DB
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Unicorn;
