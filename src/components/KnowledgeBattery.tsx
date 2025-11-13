import { Battery, Zap, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

interface KnowledgeBatteryProps {
  level: number;
  tier: string;
  learningRate?: number;
}

export default function KnowledgeBattery({ level, tier, learningRate = 0.1 }: KnowledgeBatteryProps) {
  const getChargeClass = (lvl: number) => {
    if (lvl > 90) return "from-cyan-400 via-blue-500 to-purple-600";
    if (lvl > 70) return "from-emerald-400 to-cyan-500";
    if (lvl > 40) return "from-yellow-400 to-orange-400";
    return "from-red-500 to-pink-600";
  };

  const getStatusText = (lvl: number) => {
    if (lvl > 90) return "Quantum-ready";
    if (lvl > 70) return "Highly optimized";
    if (lvl > 40) return "Growing steadily";
    return "Bootstrapping";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card/50 via-card/30 to-background/50 backdrop-blur border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full bg-gradient-to-br ${getChargeClass(level)} animate-pulse`}>
            <Battery className="w-6 h-6 text-background" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Knowledge Battery</h3>
            <p className="text-sm text-muted-foreground">{getStatusText(level)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {Math.round(level)}%
          </p>
          <p className="text-xs text-muted-foreground">Tier: {tier}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Progress value={level} className="h-4" />
          <div 
            className={`absolute inset-0 h-4 rounded-full bg-gradient-to-r ${getChargeClass(level)} opacity-50 animate-pulse`}
            style={{ width: `${Math.min(100, level)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-background/40 backdrop-blur border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Learning Rate</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{learningRate.toFixed(3)}</p>
          </div>
          
          <div className="p-3 rounded-lg bg-background/40 backdrop-blur border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">Evolution</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{tier}</p>
          </div>
          
          <div className="p-3 rounded-lg bg-background/40 backdrop-blur border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Battery className="w-4 h-4 text-emerald-500" />
              <p className="text-xs text-muted-foreground">Health</p>
            </div>
            <p className="text-lg font-semibold text-foreground">Optimal</p>
          </div>
        </div>
      </div>
    </Card>
  );
}