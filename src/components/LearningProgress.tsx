import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Globe, Code, Shield, Heart } from "lucide-react";

interface KnowledgeSource {
  id: string;
  source_type: string;
  title: string;
  content: string;
  sentiment: string;
  emotion: string;
  added_at: string;
}

const sourceIcons: Record<string, React.ReactNode> = {
  social: <Heart className="w-4 h-4" />,
  literature: <BookOpen className="w-4 h-4" />,
  technical: <Code className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  culture: <Globe className="w-4 h-4" />
};

const sentimentColors: Record<string, string> = {
  positive: "bg-green-500/20 text-green-600",
  negative: "bg-red-500/20 text-red-600",
  neutral: "bg-blue-500/20 text-blue-600"
};

export default function LearningProgress() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    const { data, error } = await supabase
      .from('knowledge_sources' as any)
      .select('*')
      .order('added_at', { ascending: false })
      .limit(20);

    if (data) setSources(data as any as KnowledgeSource[]);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading learning sources...</div>;
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Learning Sources</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {sources.map((source) => (
            <Card key={source.id} className="p-4 bg-secondary/30">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {sourceIcons[source.source_type] || <BookOpen className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {source.title}
                    </h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {source.source_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {source.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    {source.sentiment && (
                      <Badge className={sentimentColors[source.sentiment] || ""}>
                        {source.sentiment}
                      </Badge>
                    )}
                    {source.emotion && (
                      <Badge variant="secondary" className="capitalize">
                        {source.emotion}
                      </Badge>
                    )}
                    <span className="text-muted-foreground">
                      {new Date(source.added_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
