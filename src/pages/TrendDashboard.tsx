import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, Sparkles, Brain, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";

interface Trend {
  id: string;
  trend_topic: string;
  score: number;
  source: string;
  frequency: number;
  timestamp: string;
}

interface PredictiveContent {
  id: string;
  modality: string;
  content: string;
  predicted_trend: string;
  timestamp: string;
  user_feedback: number | null;
}

export default function TrendDashboard() {
  const navigate = useNavigate();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [predictiveContent, setPredictiveContent] = useState<PredictiveContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModality, setSelectedModality] = useState('text');
  const [harvestUrl, setHarvestUrl] = useState('');
  const [harvestSource, setHarvestSource] = useState('article');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: trendsData } = await supabase
      .from('trend_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    const { data: contentData } = await supabase
      .from('predictive_content_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (trendsData) setTrends(trendsData);
    if (contentData) setPredictiveContent(contentData);
  };

  const detectTrends = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('carolina-detect-trends');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(`Detected ${data.count} new trends!`);
        loadData();
      }
    } catch (error) {
      toast.error('Failed to detect trends');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictive = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('carolina-generate-predictive', {
        body: { modality: selectedModality }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Generated predictive content!');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to generate content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const harvestContent = async () => {
    if (!harvestUrl) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('carolina-harvest', {
        body: {
          source_type: harvestSource,
          url: harvestUrl,
          title: `Content from ${harvestUrl}`,
          content: 'Content will be fetched and analyzed automatically'
        }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Content harvested and analyzed!');
        setHarvestUrl('');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to harvest content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const provideFeedback = async (contentId: string, rating: number) => {
    const { error } = await supabase
      .from('predictive_content_log')
      .update({ user_feedback: rating })
      .eq('id', contentId);

    if (!error) {
      toast.success('Feedback recorded!');
      loadData();
    }
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
              <h1 className="text-xl font-bold text-foreground">Autonomous Trend Detection</h1>
              <p className="text-xs text-muted-foreground">Phase 14 - Predictive Intelligence</p>
            </div>
          </div>
          <Button onClick={detectTrends} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Detect Trends
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Content Harvesting */}
        <Card className="p-6 bg-card/50 backdrop-blur mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Harvest Content
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Select value={harvestSource} onValueChange={setHarvestSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="blog">Blog Post</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="forum">Forum</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Enter URL to harvest" 
              value={harvestUrl}
              onChange={(e) => setHarvestUrl(e.target.value)}
              className="md:col-span-2"
            />
          </div>
          <Button onClick={harvestContent} disabled={loading} className="mt-4 gap-2">
            <Brain className="w-4 h-4" />
            Harvest & Analyze
          </Button>
        </Card>

        {/* Trending Topics */}
        <Card className="p-6 bg-card/50 backdrop-blur mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Detected Trends
          </h3>
          <div className="space-y-4">
            {trends.map((trend) => (
              <Card key={trend.id} className="p-4 bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-foreground">{trend.trend_topic}</div>
                  <div className="text-sm text-muted-foreground">{trend.source}</div>
                </div>
                <Progress value={trend.score * 100} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Score: {(trend.score * 100).toFixed(1)}%</span>
                  <span>Frequency: {trend.frequency}</span>
                  <span>{new Date(trend.timestamp).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Predictive Content Generation */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Predictive Content Generation
          </h3>
          <div className="flex gap-3 mb-6">
            <Select value={selectedModality} onValueChange={setSelectedModality}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generatePredictive} disabled={loading} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Content
            </Button>
          </div>

          <div className="space-y-4">
            {predictiveContent.map((content) => (
              <Card key={content.id} className="p-4 bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-primary">{content.modality}</div>
                  <div className="text-xs text-muted-foreground">{content.predicted_trend}</div>
                </div>
                <div className="text-sm text-muted-foreground mb-3 line-clamp-3">{content.content}</div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {new Date(content.timestamp).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={content.user_feedback === 1 ? "default" : "outline"}
                      onClick={() => provideFeedback(content.id, 1)}
                    >
                      👍
                    </Button>
                    <Button 
                      size="sm" 
                      variant={content.user_feedback === -1 ? "destructive" : "outline"}
                      onClick={() => provideFeedback(content.id, -1)}
                    >
                      👎
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
