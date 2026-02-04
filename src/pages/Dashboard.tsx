import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Settings, FlaskConical, Home } from "lucide-react";
import CoreControls from "@/components/CoreControls";
import EmotionTracker from "@/components/EmotionTracker";
import { useCore } from "@/core/CoreContext";

interface AIGrowth {
  knowledge_level: number;
  evolution_tier: string;
  learning_rate: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { version, schemaVersion, emotionalState, memory, snapshotEmotions } = useCore();
  const [aiGrowth, setAiGrowth] = useState<AIGrowth>({
    knowledge_level: 12,
    evolution_tier: 'Bronze',
    learning_rate: 0.1
  });
  const [stats, setStats] = useState({
    totalKnowledge: 0,
    totalLogs: 0,
    labExperiments: 0,
    totalMemories: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  // Snapshot emotions periodically when there are emotions to track
  useEffect(() => {
    if (Object.keys(emotionalState).length > 0) {
      const interval = setInterval(() => {
        snapshotEmotions();
      }, 60000); // Snapshot every minute if emotions exist
      return () => clearInterval(interval);
    }
  }, [emotionalState, snapshotEmotions]);

  const loadData = async () => {
    // Load AI growth
    const { data: growthData } = await supabase
      .from('ai_growth')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (growthData) {
      setAiGrowth({
        knowledge_level: growthData.knowledge_level,
        evolution_tier: growthData.evolution_tier,
        learning_rate: growthData.learning_rate
      });
    }

    // Load stats
    const { count: knowledgeCount } = await supabase
      .from('carolina_knowledge')
      .select('*', { count: 'exact', head: true });

    const { count: logsCount } = await supabase
      .from('interaction_logs')
      .select('*', { count: 'exact', head: true });

    const { count: labExperimentsCount } = await supabase
      .from('ai_lab_logs')
      .select('*', { count: 'exact', head: true });

    const { count: totalMemoriesCount } = await supabase
      .from('memory_log')
      .select('*', { count: 'exact', head: true });

    setStats({
      totalKnowledge: knowledgeCount || 0,
      totalLogs: logsCount || 0,
      labExperiments: labExperimentsCount || 0,
      totalMemories: totalMemoriesCount || 0
    });
  };

  const getBatteryColor = (level: number) => {
    if (level > 70) return 'from-emerald-500 to-cyan-500';
    if (level > 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-orange-500';
  };

  // Calculate dominant emotion
  const dominantEmotion = Object.entries(emotionalState)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Top Bar */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Carolina AI</h1>
              <p className="text-xs text-muted-foreground">v{version} • Schema v{schemaVersion}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <Home className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Brain Battery */}
        <Card className="p-8 bg-card/50 backdrop-blur mb-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Carolina Brain Battery</h2>
                <p className="text-sm text-muted-foreground">Current intelligence level and tier</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">{Math.round(aiGrowth.knowledge_level)}%</div>
                <div className="text-sm text-muted-foreground">{aiGrowth.evolution_tier} Tier</div>
              </div>
            </div>
            <div className="w-full bg-secondary/20 rounded-full h-6 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getBatteryColor(aiGrowth.knowledge_level)} transition-all duration-500`}
                style={{ width: `${Math.min(100, aiGrowth.knowledge_level)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{aiGrowth.learning_rate.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Learning Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">{Object.keys(memory).length}</div>
                <div className="text-xs text-muted-foreground">Core Memories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-500">
                  {dominantEmotion ? dominantEmotion[0] : 'Neutral'}
                </div>
                <div className="text-xs text-muted-foreground">Dominant Emotion</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/50 backdrop-blur hover:bg-card/70 transition-all cursor-pointer" onClick={() => navigate("/admin")}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.totalKnowledge}</div>
                    <div className="text-xs text-muted-foreground">Knowledge Nodes</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur hover:bg-card/70 transition-all cursor-pointer" onClick={() => navigate("/admin")}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.totalLogs}</div>
                    <div className="text-xs text-muted-foreground">Interaction Logs</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur hover:bg-card/70 transition-all cursor-pointer" onClick={() => navigate("/knowledge-lab")}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.labExperiments}</div>
                    <div className="text-xs text-muted-foreground">Lab Experiments</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur hover:bg-card/70 transition-all cursor-pointer" onClick={() => navigate("/trends")}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.totalMemories}</div>
                    <div className="text-xs text-muted-foreground">Memory Entries</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Emotion Tracker Panel */}
            <EmotionTracker />
          </div>

          {/* Core Controls Sidebar */}
          <div>
            <CoreControls />
          </div>
        </div>
      </div>
    </div>
  );
}
