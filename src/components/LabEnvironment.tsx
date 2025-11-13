import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { FlaskConical, Play, Trash2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LabLog {
  id: string;
  experiment_name: string;
  result_summary: string;
  success: boolean;
  timestamp: string;
}

interface LabEnvironmentProps {
  logs: LabLog[];
  onRefresh: () => void;
}

export default function LabEnvironment({ logs, onRefresh }: LabEnvironmentProps) {
  const [experimentName, setExperimentName] = useState("");
  const [experimentCode, setExperimentCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const runExperiment = async () => {
    if (!experimentName.trim()) {
      toast.error("Please enter an experiment name");
      return;
    }

    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('carolina-admin', {
        body: { 
          command: 'run_experiment',
          data: { name: experimentName }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Experiment "${experimentName}" completed!`);
        setExperimentName("");
        setExperimentCode("");
        onRefresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to run experiment");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card/50 via-purple-900/10 to-background/50 backdrop-blur border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Lab</h3>
            <p className="text-sm text-muted-foreground">Run experiments and simulations</p>
          </div>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Open Lab Console
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>AI Lab Console</DialogTitle>
              <DialogDescription>
                Create and run experiments to test Carolina's capabilities
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Textarea
                rows={10}
                value={experimentCode}
                onChange={(e) => setExperimentCode(e.target.value)}
                placeholder="Write experiment notes, pseudo-code, or test scenarios here..."
                className="font-mono"
              />
              <div className="flex gap-3">
                <Button onClick={() => setExperimentCode("")} variant="outline">
                  Clear
                </Button>
                <Button onClick={() => setExperimentCode(experimentCode + "\n# Analyze AI memory...")} variant="secondary">
                  Add Helper
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            value={experimentName}
            onChange={(e) => setExperimentName(e.target.value)}
            placeholder="Experiment name"
            className="flex-1"
          />
          <Button 
            onClick={runExperiment} 
            disabled={isRunning}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>

        <div className="max-h-60 overflow-auto space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No experiments yet</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-background/60 backdrop-blur border border-border/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <p className="font-semibold text-sm text-foreground">{log.experiment_name}</p>
                  </div>
                  <Badge variant={log.success ? "default" : "destructive"} className="text-xs">
                    {log.success ? "Success" : "Failed"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{log.result_summary}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}