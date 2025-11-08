import { Card } from "@/components/ui/card";
import { Brain, Code, Shield, Heart, BookOpen, Globe, Atom, Calculator } from "lucide-react";

const DOMAINS = {
  "Programming": { weight: 10000, icon: Code, color: "text-cyan-400" },
  "Ethical Hacking": { weight: 10000, icon: Shield, color: "text-red-400" },
  "Emotions & Sentiment": { weight: 10000, icon: Heart, color: "text-pink-400" },
  "Literature & Culture": { weight: 10000, icon: BookOpen, color: "text-purple-400" },
  "Computer Science": { weight: 10000, icon: Brain, color: "text-blue-400" },
  "Mathematics": { weight: 5000, icon: Calculator, color: "text-green-400" },
  "Physics": { weight: 1000, icon: Atom, color: "text-yellow-400" },
  "Internet & Web": { weight: 100000, icon: Globe, color: "text-orange-400" },
};

export const DomainWeights = () => {
  const maxWeight = Math.max(...Object.values(DOMAINS).map(d => d.weight));

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Knowledge Domains</h3>
      <div className="space-y-3">
        {Object.entries(DOMAINS).map(([name, { weight, icon: Icon, color }]) => {
          const percentage = (weight / maxWeight) * 100;
          return (
            <div key={name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-foreground">{name}</span>
                </div>
                <span className="text-muted-foreground">{weight.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
