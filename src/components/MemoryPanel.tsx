import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MemoryEntry {
  id: string;
  content: string;
  domain: string;
  timestamp: string;
  type: "short-term" | "long-term";
}

export const MemoryPanel = () => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);

  useEffect(() => {
    loadMemories();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('memory_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'memory_entries'
        },
        () => loadMemories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMemories = async () => {
    const { data, error } = await supabase
      .from('memory_entries')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading memories:', error);
      return;
    }

    if (data) {
      setMemories(data.map(entry => ({
        id: entry.id,
        content: entry.content,
        domain: entry.domain,
        timestamp: formatTimestamp(entry.timestamp),
        type: entry.type as 'short-term' | 'long-term'
      })));
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Memory System</h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {memories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No memories yet. Start chatting to build memory!
            </p>
          ) : (
            memories.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-secondary/50 rounded-lg border border-border/30 hover:border-primary/50 transition-colors"
              >
              <div className="flex items-start justify-between mb-2">
                <Badge variant={entry.type === "short-term" ? "default" : "secondary"}>
                  {entry.type}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {entry.timestamp}
                </div>
              </div>
              <p className="text-sm text-foreground mb-1">{entry.content}</p>
              <span className="text-xs text-primary">{entry.domain}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
