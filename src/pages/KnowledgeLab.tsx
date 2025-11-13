import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, Zap, TrendingUp } from "lucide-react";
import { DomainWeights } from "@/components/DomainWeights";

interface Topic {
  domain: string;
  details: string;
  last_updated: string;
}

export default function KnowledgeLab() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [aiGrowth, setAiGrowth] = useState({ knowledge_level: 12, evolution_tier: 'Bronze' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: knowledgeData } = await supabase
      .from('carolina_knowledge')
      .select('*')
      .order('domain');
    
    if (knowledgeData) setTopics(knowledgeData);

    const { data: growthData } = await supabase
      .from('ai_growth')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (growthData) {
      setAiGrowth({
        knowledge_level: growthData.knowledge_level,
        evolution_tier: growthData.evolution_tier
      });
    }
  };

  const expandBrain = async () => {
    const { data } = await supabase.functions.invoke('carolina-admin', {
      body: { command: 'boost_growth', data: { gain: 5 } }
    });
    if (data?.success) loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Brain Simulation Lab</h1>
              <p className="text-xs text-muted-foreground">Knowledge Visualization & Growth</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: 3D Brain Visualization Placeholder */}
          <Card className="md:col-span-2 p-8 bg-card/50 backdrop-blur">
            <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.3),transparent_50%)] animate-pulse" />
              <Brain className="w-32 h-32 text-primary animate-pulse" />
              <div className="absolute top-4 right-4 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-lg">
                <div className="text-sm text-muted-foreground">Energy Flow</div>
                <div className="text-2xl font-bold text-foreground">78%</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button onClick={expandBrain} className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Expand Brain
              </Button>
              <Button variant="outline" className="gap-2">
                <Zap className="w-4 h-4" />
                Sync Knowledge
              </Button>
            </div>
          </Card>

          {/* Right: Stats Panel */}
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur">
              <h3 className="text-lg font-bold text-foreground mb-4">Brain Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Knowledge Level</span>
                    <span className="text-foreground font-semibold">{Math.round(aiGrowth.knowledge_level)}%</span>
                  </div>
                  <Progress value={aiGrowth.knowledge_level} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Evolution Tier</div>
                  <div className="text-2xl font-bold text-foreground">{aiGrowth.evolution_tier}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Active Topics</div>
                  <div className="text-2xl font-bold text-foreground">{topics.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Learning Focus</div>
                  <div className="text-sm font-semibold text-foreground">Cognitive + Creative</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Knowledge Domain Weights */}
        <div className="mt-8">
          <DomainWeights />
        </div>

        {/* Topic List */}
        <Card className="mt-8 p-6 bg-card/50 backdrop-blur">
          <h3 className="text-lg font-bold text-foreground mb-4">Knowledge Topics</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {topics.map((topic) => (
              <Card key={topic.domain} className="p-4 bg-background/50">
                <div className="font-semibold text-foreground mb-2">{topic.domain}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{topic.details}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Updated: {new Date(topic.last_updated).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
