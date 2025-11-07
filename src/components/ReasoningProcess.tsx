import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const reasoningSteps = [
  { step: "Parse Input", domain: "Input Analysis", status: "complete" },
  { step: "Domain Detection", domain: "Multi-Domain", status: "complete" },
  { step: "Weight Calculation", domain: "Reasoning Engine", status: "complete" },
  { step: "Knowledge Retrieval", domain: "Internet & Web", status: "processing" },
  { step: "Simulation", domain: "Physics", status: "pending" },
];

export const ReasoningProcess = () => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Reasoning Process</h3>
      <div className="space-y-3">
        {reasoningSteps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.status === "complete"
                  ? "bg-primary/20 text-primary"
                  : step.status === "processing"
                  ? "bg-accent/20 text-accent animate-pulse"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.status === "complete" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{step.step}</span>
                <Badge variant="outline" className="text-xs">
                  {step.domain}
                </Badge>
              </div>
            </div>
            {index < reasoningSteps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
