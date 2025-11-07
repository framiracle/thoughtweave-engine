import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";

interface MemoryEntry {
  content: string;
  domain: string;
  timestamp: string;
  type: "short-term" | "long-term";
}

const sampleMemory: MemoryEntry[] = [
  {
    content: "Neural network optimization query",
    domain: "Computer Science",
    timestamp: "2 min ago",
    type: "short-term",
  },
  {
    content: "Spacecraft navigation calculations",
    domain: "Physics",
    timestamp: "5 min ago",
    type: "long-term",
  },
  {
    content: "Warp drive theoretical framework",
    domain: "Sci-Fi",
    timestamp: "10 min ago",
    type: "long-term",
  },
];

export const MemoryPanel = () => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Memory System</h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {sampleMemory.map((entry, index) => (
            <div
              key={index}
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
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
