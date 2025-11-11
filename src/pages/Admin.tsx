import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, Plus, Trash2, LogOut, Brain, TrendingUp, Zap, FileText } from "lucide-react";
import PersonalityTraits from "@/components/PersonalityTraits";
import LearningProgress from "@/components/LearningProgress";

interface KnowledgeItem {
  id: string;
  domain: string;
  details: string;
  last_updated: string;
}

interface InteractionLog {
  id: string;
  user_message: string;
  ai_response: string;
  timestamp: string;
  sentiment: string | null;
  emotion?: string | null;
}

interface Stats {
  totalKnowledge: number;
  totalLogs: number;
  totalLearningSources: number;
  totalLearningLogs: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [logs, setLogs] = useState<InteractionLog[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalKnowledge: 0,
    totalLogs: 0,
    totalLearningSources: 0,
    totalLearningLogs: 0
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!adminData) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadData();
    } catch (error) {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    // Load knowledge
    const { data: knowledgeData, count: knowledgeCount } = await supabase
      .from('carolina_knowledge')
      .select('*', { count: 'exact' })
      .order('domain');
    
    if (knowledgeData) setKnowledge(knowledgeData);

    // Load recent logs
    const { data: logsData, count: logsCount } = await supabase
      .from('interaction_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (logsData) setLogs(logsData as InteractionLog[]);

    // Load stats
    const { count: learningSourcesCount } = await supabase
      .from('knowledge_sources' as any)
      .select('*', { count: 'exact', head: true });

    const { count: learningLogsCount } = await supabase
      .from('continuous_learning_log' as any)
      .select('*', { count: 'exact', head: true });

    setStats({
      totalKnowledge: knowledgeCount || 0,
      totalLogs: logsCount || 0,
      totalLearningSources: learningSourcesCount || 0,
      totalLearningLogs: learningLogsCount || 0
    });
  };

  const addKnowledge = async () => {
    if (!newDomain || !newDetails) {
      toast.error("Please fill in both fields");
      return;
    }

    const { error } = await supabase
      .from('carolina_knowledge')
      .insert({ domain: newDomain, details: newDetails });

    if (error) {
      toast.error("Failed to add knowledge");
    } else {
      toast.success("Knowledge added successfully");
      setNewDomain("");
      setNewDetails("");
      loadData();
    }
  };

  const deleteKnowledge = async (id: string) => {
    const { error } = await supabase
      .from('carolina_knowledge')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete knowledge");
    } else {
      toast.success("Knowledge deleted");
      loadData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Carolina Olivia - Multi-Phase AI System</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Knowledge Entries</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalKnowledge}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Interaction Logs</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalLogs}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Learning Sources</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalLearningSources}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Learning Actions</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalLearningLogs}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="personality">Personality Traits</TabsTrigger>
            <TabsTrigger value="learning">Learning Progress</TabsTrigger>
            <TabsTrigger value="logs">Interaction Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge">
            <Card className="p-6 mb-6 bg-card/50 backdrop-blur">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Add New Knowledge</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Domain (e.g., Programming, Emotions)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
                <Textarea
                  placeholder="Details and expertise in this domain..."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  rows={4}
                />
                <Button onClick={addKnowledge}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Knowledge
                </Button>
              </div>
            </Card>

            <div className="grid gap-4">
              {knowledge.map((item) => (
                <Card key={item.id} className="p-6 bg-card/50 backdrop-blur">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {item.domain}
                      </h3>
                      <p className="text-muted-foreground">{item.details}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last updated: {new Date(item.last_updated).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteKnowledge(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personality">
            <PersonalityTraits />
          </TabsContent>

          <TabsContent value="learning">
            <LearningProgress />
          </TabsContent>

          <TabsContent value="logs">
            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id} className="p-4 bg-card/50 backdrop-blur">
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-primary font-semibold">User:</span>
                      <p className="text-sm text-foreground">{log.user_message}</p>
                    </div>
                    <div>
                      <span className="text-xs text-secondary font-semibold">Carolina:</span>
                      <p className="text-sm text-muted-foreground">{log.ai_response}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      {log.sentiment && (
                        <>
                          <span>•</span>
                          <span className="capitalize">Sentiment: {log.sentiment}</span>
                        </>
                      )}
                      {log.emotion && (
                        <>
                          <span>•</span>
                          <span className="capitalize">Emotion: {log.emotion}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
